# 从 sts2.dll 提取卡牌数据

## 方式一：C# 提取工具（需 .NET SDK）

若已安装 .NET 8 SDK：

```bash
cd scripts/extract-dll
dotnet run
```

或指定 DLL 路径：

```bash
dotnet run "D:\SteamLibrary\steamapps\common\Slay the Spire 2\data_sts2_windows_x86_64\sts2.dll"
```

输出：`card_data_from_dll.json`（在 DLL 同目录）

## 方式二：ILSpy 导出 + Node 解析（无需 .NET SDK）

1. 打开 ILSpy，加载 `sts2.dll`
2. 右键 **sts2** 程序集 → **Save Code**
3. 选择导出目录（如 `D:\projects\sts2_decompiled`）
4. 运行：

```bash
node scripts/parse-card-classes.js D:\projects\sts2_decompiled
```

输出：`data/card_data_from_dll.json`
