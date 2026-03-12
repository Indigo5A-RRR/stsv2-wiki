/**
 * 分批部署到 CloudBase，减少单次上传量，降低 ECONNRESET 概率
 * 使用: BASE_PATH=/stsv2-wiki node scripts/deploy-cloudbase-batch.js
 * 或: node scripts/deploy-cloudbase-batch.js  (basePath 为空时用于 CloudBase 根路径)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const envId = process.env.CLOUDBASE_ENV || "stsv2-wiki-4gy0qsp3f3d38a6e";
const outDir = path.join(__dirname, "../out");
const batchSize = 200; // 每批上传约 200 个文件

if (!fs.existsSync(outDir)) {
  console.error("错误：out 目录不存在，请先执行 npm run build");
  process.exit(1);
}

// 获取所有需要上传的文件（相对路径）
function getAllFiles(dir, base = "") {
  const files = [];
  const entries = fs.readdirSync(path.join(dir, base), { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, rel);
    if (e.isDirectory()) {
      files.push(...getAllFiles(dir, rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

const allFiles = getAllFiles(outDir);
console.log(`共 ${allFiles.length} 个文件，将分 ${Math.ceil(allFiles.length / batchSize)} 批上传`);

// 创建临时目录，每批复制部分文件
const tmpBase = path.join(__dirname, "../.deploy-tmp");
if (fs.existsSync(tmpBase)) fs.rmSync(tmpBase, { recursive: true });
fs.mkdirSync(tmpBase, { recursive: true });

async function run() {
  let success = true;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const tmpDir = path.join(tmpBase, `batch${batchNum}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    for (const f of batch) {
      const src = path.join(outDir, f);
      const dest = path.join(tmpDir, f);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }

    console.log(`\n--- 上传第 ${batchNum} 批 (${batch.length} 个文件) ---`);
    try {
      execSync(`tcb hosting deploy "${tmpDir}" / -e ${envId}`, {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
      console.log(`第 ${batchNum} 批完成`);
    } catch (err) {
      console.error(`第 ${batchNum} 批失败:`, err.message);
      success = false;
      break;
    }

    if (i + batchSize < allFiles.length) {
      console.log("等待 3 秒后继续...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  fs.rmSync(tmpBase, { recursive: true, force: true });
  process.exit(success ? 0 : 1);
}

run();
