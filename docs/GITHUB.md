# GitHub 仓库信息

> 本文件记录本项目的 GitHub 归属与本地工具要求，供维护者参考。
> **不包含任何 Token、密钥或密码，也不记录任何本机绝对路径。**

## 一、仓库信息

| 项目 | 值 |
| :--- | :--- |
| 仓库全名 | `EzRlon/RlonDSP` |
| 仓库地址 | https://github.com/EzRlon/RlonDSP |
| 维护者 | EzRlon（https://github.com/EzRlon） |
| 默认分支 | `main` |
| 可见性 | Public |
| 许可证 | GPL-3.0-only |

## 二、上游项目

| 项目 | 值 |
| :--- | :--- |
| 上游仓库 | https://github.com/hoowhoami/EchoMusic |
| 上游作者 | hoowhoami |
| 上游许可证 | GPL-3.0-only |

上游的版权声明、作者信息与许可证文件在本仓库中完整保留，不得删除或修改。

## 三、提交身份配置

| 配置项 | 建议值 |
| :--- | :--- |
| `user.name` | `EzRlon` |
| `user.email` | GitHub 提供的隐私邮箱 |
| `init.defaultBranch` | `main` |
| 凭据管理 | 由 GitHub CLI 统一管理（`gh auth setup-git`） |

> 提交时建议使用 GitHub 提供的隐私邮箱，避免在提交记录中暴露真实邮箱地址。

## 四、本地工具要求

| 工具 | 版本要求 | 说明 |
| :--- | :--- | :--- |
| Git | 2.40 及以上 | 版本控制 |
| GitHub CLI (`gh`) | 2.40 及以上 | 创建仓库、发布 Release、管理凭据 |
| Node.js | 18 及以上 | 运行项目脚本与测试 |

`git` 与 `gh` 需在终端中可直接调用。若未加入系统 `PATH`，请在命令中使用其完整路径，或先临时加入 `PATH` 再执行。

## 五、常用命令

```bash
# 查看登录状态
gh auth status

# 查看当前登录用户
gh api user --jq .login

# 查看已有仓库列表
gh repo list

# 查看仓库信息
gh repo view EzRlon/RlonDSP
```

详细的推送、删除与发布流程见 [GITHUB_WORKFLOW.md](./GITHUB_WORKFLOW.md)。

---

<div align="center">

最后更新：2026-09-13

</div>
