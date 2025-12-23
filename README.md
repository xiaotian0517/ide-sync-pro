# IDE Sync Pro

<p align="center">
  <img src="./src-tauri/icons/128x128.png" alt="IDE Sync Pro Logo" width="128" height="128">
</p>

<p align="center">
  <strong>跨 IDE 配置同步工具</strong><br>
  一键同步你的编辑器设置、快捷键和扩展插件
</p>

<p align="center">
  <a href="#features">功能特性</a> •
  <a href="#screenshots">截图预览</a> •
  <a href="#supported-ides">支持的 IDE</a> •
  <a href="#installation">安装</a> •
  <a href="#usage">使用</a> •
  <a href="#contributing">贡献</a>
</p>

---

## Features

- **14+ IDE 支持** - 支持 VS Code、Cursor、Windsurf、Kiro 等主流 VSCode 系编辑器
- **本地优先** - 所有数据保存在本地，无需云服务，保护隐私
- **精细控制** - 自由选择同步内容：配置文件、快捷键或扩展插件
- **智能合并** - 合并模式保留目标端独有配置，避免覆盖个性化设置
- **自动备份** - 同步前自动备份，支持一键恢复
- **跨平台** - 支持 macOS 和 Windows

## Screenshots

<p align="center">
  <img src="./docs/screenshots/home.png" alt="同步中心" width="80%">
  <br>
  <em>同步中心 - 选择源和目标 IDE 进行配置同步</em>
</p>

<p align="center">
  <img src="./docs/screenshots/setting.png" alt="软件设置" width="80%">
  <br>
  <em>软件设置 - 配置默认同步策略和备份选项</em>
</p>

## Supported IDEs

| IDE                | 状态 | 配置路径                             |
| ------------------ | ---- | ------------------------------------ |
| Visual Studio Code | ✅   | `Code/User/settings.json`            |
| VS Code Insiders   | ✅   | `Code - Insiders/User/settings.json` |
| VSCodium           | ✅   | `VSCodium/User/settings.json`        |
| Cursor             | ✅   | `Cursor/User/settings.json`          |
| Cursor Nightly     | ✅   | `Cursor Nightly/User/settings.json`  |
| Windsurf           | ✅   | `Windsurf/User/settings.json`        |
| Antigravity        | ✅   | `Antigravity/User/settings.json`     |
| Kiro               | ✅   | `Kiro/User/settings.json`            |
| Lingma (灵码)      | ✅   | `Lingma/User/settings.json`          |
| Trae               | ✅   | `Trae/User/settings.json`            |
| Positron           | ✅   | `Positron/User/settings.json`        |
| Codeium            | ✅   | `Codeium/User/settings.json`         |
| Code - OSS         | ✅   | `Code - OSS/User/settings.json`      |

> 应用会自动检测已安装的 IDE，仅显示本机可用的编辑器。

## Installation

### 从源码构建

**前置要求：**

- Node.js 20.19+ 或 22.12+
- Rust (最新稳定版)
- pnpm / npm / yarn

```bash
# 克隆仓库
git clone https://github.com/xiaotian0517/ide-sync-pro.git
cd ide-sync-pro

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

### 下载预编译版本

前往 [Releases](https://github.com/xiaotian0517/ide-sync-pro/releases) 页面下载对应平台的安装包。

## Usage

### 基本同步流程

1. **选择源和目标** - 从下拉列表选择要复制配置的 IDE（源）和要应用配置的 IDE（目标）
2. **选择同步内容** - 勾选需要同步的项目：
   - 配置文件 (`settings.json`)
   - 快捷键 (`keybindings.json`)
   - 扩展插件（通过 CLI 安装）
3. **选择同步策略**
   - **智能合并** - 保留目标端独有设置，推荐使用
   - **强制覆盖** - 完全替换目标配置
4. **开始同步** - 点击同步按钮，查看日志确认结果

### 备份管理

- 同步前会自动创建带时间戳的备份
- 在设置页可查看、恢复或删除历史备份
- 可配置备份保留数量（3/5/10/20 个）

## Tech Stack

| 层级 | 技术                            |
| ---- | ------------------------------- |
| 框架 | [Tauri 2.0](https://tauri.app/) |
| 前端 | React 18 + TypeScript           |
| 样式 | Tailwind CSS + shadcn/ui        |
| 后端 | Rust                            |
| 构建 | Vite                            |

## Project Structure

```
ide-sync-pro/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── dashboard/      # 主面板
│   │   ├── settings/       # 设置页
│   │   └── ui/             # 基础 UI 组件
│   └── types.ts            # TypeScript 类型定义
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── ide.rs          # IDE 检测逻辑
│       ├── sync.rs         # 同步核心逻辑
│       ├── backup.rs       # 备份管理
│       └── lib.rs          # Tauri 命令导出
└── package.json
```

## Roadmap

- [ ] Linux 支持
- [ ] 代码片段同步
- [ ] 多配置文件管理
- [ ] 导入/导出配置包
- [ ] 命令行界面 (CLI)

## Contributing

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## License

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ for developers who use multiple IDEs
</p>
