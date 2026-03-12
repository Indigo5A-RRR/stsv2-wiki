/**
 * 从 sts2.dll 提取卡牌元数据（费用、类型、稀有度等）
 * 运行: dotnet run
 * 需要将 sts2.dll 路径作为参数传入，或修改下面的 DLL_PATH
 */

using Mono.Cecil;
using Mono.Cecil.Cil;
using System.Text.Json;

const string DLL_PATH = @"D:\SteamLibrary\steamapps\common\Slay the Spire 2\data_sts2_windows_x86_64\sts2.dll";
const string OUTPUT = "card_data_from_dll.json";

var dllPath = args.Length > 0 ? args[0] : DLL_PATH;
if (!File.Exists(dllPath))
{
    Console.WriteLine($"错误: 找不到 {dllPath}");
    Console.WriteLine("用法: dotnet run [sts2.dll路径]");
    return 1;
}

var resolver = new DefaultAssemblyResolver();
var dllDir = Path.GetDirectoryName(dllPath);
if (!string.IsNullOrEmpty(dllDir))
    resolver.AddSearchDirectory(dllDir);

var assembly = AssemblyDefinition.ReadAssembly(dllPath, new ReaderParameters { AssemblyResolver = resolver });
var cardModelRef = assembly.MainModule.Types
    .SelectMany(t => t.NestedTypes.Concat(new[] { t }))
    .FirstOrDefault(t => t.FullName == "MegaCrit.Sts2.Core.Models.CardModel" || t.FullName?.Contains("CardModel") == true);

if (cardModelRef == null)
{
    Console.WriteLine("错误: 找不到 CardModel 类");
    return 1;
}

var cardModelFullName = cardModelRef.FullName;
Console.WriteLine($"CardModel: {cardModelFullName}");

var allTypes = assembly.MainModule.Types.SelectMany(t => t.NestedTypes.Concat(new[] { t })).ToList();
var cardTypes = allTypes
    .Where(t => t.BaseType != null && !t.IsAbstract && IsAssignableFrom(t.BaseType, cardModelFullName))
    .ToList();

Console.WriteLine($"找到 {cardTypes.Count} 个 CardModel 子类");

var results = new List<CardData>();

foreach (var type in cardTypes)
{
    var card = ExtractCardData(type);
    if (card != null)
    {
        results.Add(card);
    }
}

results.Sort((a, b) => string.Compare(a.Id, b.Id, StringComparison.OrdinalIgnoreCase));

var json = JsonSerializer.Serialize(results, new JsonSerializerOptions { WriteIndented = true });
var outPath = Path.Combine(Path.GetDirectoryName(dllPath) ?? ".", OUTPUT);
File.WriteAllText(outPath, json);

Console.WriteLine($"已导出 {results.Count} 张卡牌 -> {outPath}");
return 0;

bool IsAssignableFrom(TypeReference? typeRef, string fullName)
{
    try
    {
        while (typeRef != null)
        {
            var def = typeRef.Resolve();
            if (def == null) break;
            if (def.FullName == fullName || def.FullName?.Replace("/", "+") == fullName?.Replace("/", "+"))
                return true;
            typeRef = def.BaseType;
        }
    }
    catch { }
    return false;
}

CardData? ExtractCardData(TypeDefinition type)
{
    var id = ExtractCardId(type);
    if (string.IsNullOrEmpty(id)) return null;

    var ctor = type.Methods.FirstOrDefault(m => m.IsConstructor && !m.IsStatic);
    int cost = 0;
    string cardType = "skill";
    string rarity = "common";
    string targetType = "none";

    if (ctor != null && ctor.HasBody)
    {
        var (c, ct, r, tt) = ExtractBaseCtorArgs(ctor, type);
        cost = c;
        cardType = ct;
        rarity = r;
        targetType = tt;
    }

    var vars = ExtractCanonicalVars(type);

    return new CardData
    {
        Id = id,
        Cost = cost,
        Type = cardType,
        Rarity = rarity,
        TargetType = targetType,
        Vars = vars.Count > 0 ? vars : null
    };
}

string? ExtractCardId(TypeDefinition type)
{
    // 尝试从静态字段 Id 获取
    var idField = type.Fields.FirstOrDefault(f => f.IsStatic && f.Name == "Id");
    if (idField != null)
    {
        var init = GetStaticFieldInitValue(type, "Id");
        if (!string.IsNullOrEmpty(init))
        {
            var entry = ExtractModelIdEntry(init);
            if (!string.IsNullOrEmpty(entry)) return entry.ToLowerInvariant();
        }
    }

    // 从类名推断: Strike -> strike, Defend -> defend
    var name = type.Name;
    if (name.EndsWith("Card")) name = name[..^4];
    return ToSnakeCase(name);
}

(int cost, string type, string rarity, string targetType) ExtractBaseCtorArgs(MethodDefinition ctor, TypeDefinition type)
{
    int cost = 0;
    string cardType = "skill";
    string rarity = "common";
    string targetType = "none";

    var instructions = ctor.Body.Instructions;
    for (int i = 0; i < instructions.Count; i++)
    {
        var ins = instructions[i];
        if (ins.OpCode.Code != Code.Call && ins.OpCode.Code != Code.Callvirt) continue;

        var methodRef = ins.Operand as MethodReference;
        var declType = methodRef?.DeclaringType?.Resolve() ?? methodRef?.DeclaringType;
        var declName = declType?.FullName ?? "";
        if (declName != "MegaCrit.Sts2.Core.Models.CardModel") continue;
        if (methodRef?.Name != ".ctor") continue;

        // 基类构造函数: CardModel(int cost, CardType, CardRarity, TargetType, bool)
        // 从 call 往前追溯，args[0]=最后入栈(bool), args[4]=最先入栈(cost)
        var prev = GetArgsBeforeCall(instructions, i, 5);
        if (prev.Count >= 5)
        {
            cost = prev[4];
            cardType = MapEnum(prev[3], "CardType", "skill");
            rarity = MapEnum(prev[2], "CardRarity", "common");
            targetType = MapEnum(prev[1], "TargetType", "none");
        }
        break;
    }

    return (cost, cardType, rarity, targetType);
}

string MapEnum(int value, string enumName, string fallback)
{
    return enumName switch
    {
        "CardType" => value switch { 0 => "none", 1 => "attack", 2 => "skill", 3 => "power", 4 => "status", 5 => "curse", 6 => "quest", _ => fallback },
        "CardRarity" => value switch { 0 => "basic", 1 => "common", 2 => "uncommon", 3 => "rare", 4 => "curse", 5 => "status", 6 => "event", 7 => "quest", 8 => "ancient", _ => fallback },
        "TargetType" => value switch { 0 => "none", 1 => "any_enemy", 2 => "any_ally", _ => fallback },
        _ => fallback
    };
}

/// <summary>从 call 指令向前追溯，收集传入的常量参数（跳过 this）</summary>
List<int> GetArgsBeforeCall(IList<Instruction> instructions, int callIndex, int argCount)
{
    var args = new List<int>();
    for (int i = callIndex - 1; i >= 0 && args.Count < argCount; i--)
    {
        var ins = instructions[i];
        int? val = ins.OpCode.Code switch
        {
            Code.Ldc_I4_0 => 0,
            Code.Ldc_I4_1 => 1,
            Code.Ldc_I4_2 => 2,
            Code.Ldc_I4_3 => 3,
            Code.Ldc_I4_4 => 4,
            Code.Ldc_I4_5 => 5,
            Code.Ldc_I4_M1 => -1,
            Code.Ldc_I4_S => ins.Operand is sbyte sb ? sb : null,
            Code.Ldc_I4 => ins.Operand is int n ? n : null,
            _ => null
        };
        if (val.HasValue)
            args.Add(val.Value);
        else if (ins.OpCode.Code is Code.Ldarg_0 or Code.Ldarg_1 or Code.Ldarg_2 or Code.Ldarg or Code.Ldarg_S
                 or Code.Ldsfld or Code.Ldfld or Code.Box)
            args.Add(0); // 非常量，用 0 占位
    }
    return args;
}

Dictionary<string, int> ExtractCanonicalVars(TypeDefinition type)
{
    var vars = new Dictionary<string, int>();
    var method = type.Methods.FirstOrDefault(m => m.Name == "get_CanonicalVars" || m.Name == "CanonicalVars");
    if (method == null) return vars;

    // 简化: 查找 yield return new DynamicVar("Damage", 6) 之类的模式
    // 实际实现需要解析 IL，这里先返回空
    return vars;
}

string? GetStaticFieldInitValue(TypeDefinition type, string fieldName)
{
    var cctor = type.Methods.FirstOrDefault(m => m.IsConstructor && m.IsStatic);
    if (cctor?.HasBody != true) return null;

    foreach (var ins in cctor.Body.Instructions)
    {
        if (ins.OpCode.Code == Code.Ldstr && ins.Operand is string s)
            return s;
    }
    return null;
}

string? ExtractModelIdEntry(string init)
{
    if (init.Contains(".")) return init;
    return init;
}

string ToSnakeCase(string s)
{
    if (string.IsNullOrEmpty(s)) return s;
    var sb = new System.Text.StringBuilder();
    for (int i = 0; i < s.Length; i++)
    {
        if (char.IsUpper(s[i]) && i > 0)
            sb.Append('_');
        sb.Append(char.ToLowerInvariant(s[i]));
    }
    return sb.ToString();
}

record CardData
{
    public string Id { get; set; } = "";
    public int Cost { get; set; }
    public string Type { get; set; } = "";
    public string Rarity { get; set; } = "";
    public string TargetType { get; set; } = "";
    public Dictionary<string, int>? Vars { get; set; }
}
