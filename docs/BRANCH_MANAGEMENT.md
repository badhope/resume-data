# Git 分支管理规范

## 📋 分支策略

本项目采用简化的 Git Flow 分支策略，只保留必要的分支。

## 🌳 分支结构

### 主分支

| 分支名 | 说明 | 保护状态 |
|--------|------|----------|
| `main` | 生产环境代码，始终处于可部署状态 | ✅ 受保护 |

### 临时分支（开发完成后删除）

| 分支前缀 | 说明 | 生命周期 |
|----------|------|----------|
| `feature/` | 新功能开发 | 合并后删除 |
| `fix/` | Bug修复 | 合并后删除 |
| `hotfix/` | 紧急修复 | 合并后删除 |
| `release/` | 发布准备 | 发布后删除 |

## 📝 分支命名规范

```
<type>/<ticket-id>-<short-description>

示例:
feature/RCD-123-add-user-authentication
fix/RCD-456-fix-login-error
hotfix/RCD-789-fix-security-vulnerability
release/v1.1.0
```

## 🔄 工作流程

### 1. 创建功能分支

```bash
# 从main创建新分支
git checkout main
git pull origin main
git checkout -b feature/RCD-123-add-feature
```

### 2. 开发与提交

```bash
# 开发完成后提交
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/RCD-123-add-feature
```

### 3. 创建Pull Request

1. 在GitHub上创建Pull Request
2. 等待CI/CD检查通过
3. 代码审查通过后合并
4. **合并后自动删除分支**

### 4. 清理本地分支

```bash
# 删除已合并的本地分支
git branch -d feature/RCD-123-add-feature

# 清理远程已删除的分支引用
git fetch --prune
```

## 🗑️ 分支清理规则

### 自动清理

- PR合并后自动删除远程分支
- GitHub设置：Settings > Merge button > Automatically delete head branches

### 手动清理

```bash
# 查看已合并但未删除的分支
git branch --merged main

# 删除本地已合并分支
git branch --merged main | grep -v "^\*\|main" | xargs git branch -d

# 删除远程已合并分支
git branch -r --merged main | grep -v "main" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

## ⚠️ 分支保护规则

### main分支保护

- ✅ 禁止直接推送
- ✅ 必须通过PR合并
- ✅ 必须通过CI检查
- ✅ 至少1人审查通过
- ✅ 分支必须是最新的

### 设置方法

GitHub > Settings > Branches > Add rule

```
Branch name pattern: main
☑ Require a pull request before merging
☑ Require status checks to pass before merging
☑ Require branches to be up to date before merging
```

## 📊 分支状态检查

定期执行以下命令检查分支状态：

```bash
# 查看所有分支
git branch -a

# 查看远程分支
git branch -r

# 查看已合并分支
git branch --merged main

# 查看未合并分支
git branch --no-merged main
```

## 🚫 禁止事项

1. ❌ 禁止直接推送到main分支
2. ❌ 禁止创建长期存在的feature分支
3. ❌ 禁止在feature分支上开发多个不相关的功能
4. ❌ 禁止强制推送到受保护分支
5. ❌ 禁止删除main分支

## 📅 定期维护

- **每周**：检查并清理已合并的分支
- **每月**：审查分支保护规则
- **每季度**：更新分支管理规范

---

**最后更新**: 2024-03-25
