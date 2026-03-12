# Gitee Pages 部署指南

## 一、在 Gitee 创建仓库

1. 打开 [gitee.com](https://gitee.com)，登录
2. 点击右上角 **+** → **新建仓库**
3. 填写：
   - **仓库名称**：`stsv2-wiki`（或自定义，若不同需修改下方 BASE_PATH）
   - **是否开源**：选择 **开源**
   - 不勾选「使用 Readme 文件初始化」
4. 点击 **创建**

## 二、添加 Gitee 远程并推送

在项目目录执行（将 `你的Gitee用户名` 替换为实际用户名）：

```powershell
cd D:\projects\stsv2-wiki

# 添加 Gitee 远程（若已有 origin 可跳过）
git remote add gitee https://gitee.com/你的Gitee用户名/stsv2-wiki.git

# 首次推送：先推送主分支
git push gitee main
```

## 三、构建并部署

```powershell
# 1. 生成静态站点到 docs 目录
npm run deploy:gitee

# 2. 提交并推送 docs
git add docs
git commit -m "Update Gitee Pages"
git push gitee main
```

## 四、开启 Gitee Pages

1. 打开仓库页面 → **服务** → **Gitee Pages**
2. 选择 **部署分支**：`main`
3. 选择 **部署目录**：`docs`
4. 点击 **启动**
5. 等待部署完成，访问：`https://你的Gitee用户名.gitee.io/stsv2-wiki`

## 五、后续更新

每次修改代码或卡牌数据后：

```powershell
# 若修改了卡牌数据，先重新生成
node scripts/convert-sts2-cards.js

# 构建并部署
npm run deploy:gitee
git add docs
git commit -m "Update Gitee Pages"
git push gitee main
```

## 仓库名不是 stsv2-wiki 时

构建前设置环境变量：

```powershell
# PowerShell
$env:BASE_PATH="/你的仓库名"
npm run deploy:gitee
```
