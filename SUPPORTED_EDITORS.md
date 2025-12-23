# 支持的编辑器列表

本应用支持以下基于 VSCode 的编辑器配置同步。

**重要说明**: 应用会自动检测系统中已安装的编辑器，只显示实际安装的编辑器。即使下面列出了某个编辑器，如果您没有安装它，也不会在应用中显示。

## 已支持的编辑器（共 14 个）

### 1. Visual Studio Code

- **官方网站**: https://code.visualstudio.com/
- **配置路径**: `~/Library/Application Support/Code/User/settings.json`
- **扩展路径**: `~/.vscode/extensions`
- **命令**: `code`

### 2. VS Code Insiders

- **官方网站**: https://code.visualstudio.com/insiders/
- **配置路径**: `~/Library/Application Support/Code - Insiders/User/settings.json`
- **扩展路径**: `~/.vscode-insiders/extensions`
- **命令**: `code-insiders`
- **说明**: VS Code 的预览版本，包含最新功能

### 3. VSCodium

- **官方网站**: https://vscodium.com/
- **配置路径**: `~/Library/Application Support/VSCodium/User/settings.json`
- **扩展路径**: `~/.vscode-oss/extensions`
- **命令**: `codium`
- **说明**: VSCode 的开源版本，移除了微软遥测

### 4. Cursor

- **官方网站**: https://cursor.sh/
- **配置路径**: `~/Library/Application Support/Cursor/User/settings.json`
- **扩展路径**: `~/.cursor/extensions`
- **命令**: `cursor`
- **说明**: AI 驱动的代码编辑器

### 5. Cursor Nightly

- **官方网站**: https://cursor.sh/
- **配置路径**: `~/Library/Application Support/Cursor Nightly/User/settings.json`
- **扩展路径**: `~/.cursor-nightly/extensions`
- **命令**: `cursor-nightly`
- **说明**: Cursor 的夜间构建版本，包含最新实验性功能

### 6. Windsurf

- **官方网站**: https://codeium.com/windsurf
- **配置路径**: `~/Library/Application Support/Windsurf/User/settings.json`
- **扩展路径**: `~/.windsurf/extensions`
- **命令**: `windsurf`
- **说明**: Codeium 推出的 AI 编辑器

### 7. Antigravity

- **配置路径**: `~/Library/Application Support/Antigravity/User/settings.json`
- **扩展路径**: `~/.antigravity/extensions`
- **命令**: `antigravity`
- **说明**: 基于 VSCode 的 AI 编辑器

### 8. Kiro

- **配置路径**: `~/Library/Application Support/Kiro/User/settings.json`
- **扩展路径**: `~/.kiro/extensions`
- **命令**: `kiro`
- **说明**: 基于 VSCode 的编辑器

### 9. Lingma (灵码)

- **官方网站**: https://tongyi.aliyun.com/lingma
- **配置路径**: `~/Library/Application Support/Lingma/User/settings.json`
- **扩展路径**: `~/.lingma/extensions`
- **命令**: `lingma`
- **说明**: 阿里云通义灵码 AI 编辑器

### 10. Trae

- **配置路径**: `~/Library/Application Support/Trae/User/settings.json`
- **扩展路径**: `~/.trae/extensions`
- **命令**: `trae`
- **说明**: 基于 VSCode 的编辑器

### 11. Positron

- **官方网站**: https://github.com/posit-dev/positron
- **配置路径**: `~/Library/Application Support/Positron/User/settings.json`
- **扩展路径**: `~/.positron/extensions`
- **命令**: `positron`
- **说明**: Posit 开发的数据科学 IDE

### 12. Codeium

- **官方网站**: https://codeium.com/
- **配置路径**: `~/Library/Application Support/Codeium/User/settings.json`
- **扩展路径**: `~/.codeium/extensions`
- **命令**: `codeium`
- **说明**: AI 代码补全编辑器（Windsurf 的前身）

### 13. Code - OSS

- **配置路径**: `~/Library/Application Support/Code - OSS/User/settings.json`
- **扩展路径**: `~/.vscode-oss/extensions`
- **命令**: `code-oss`
- **说明**: VSCode 的开源构建版本

## 检测逻辑

应用会自动检测 macOS 系统中已安装的编辑器：

- 检查配置文件是否存在于 `~/Library/Application Support/[编辑器名]/User/settings.json`
- 只显示实际安装的编辑器
- 不会显示未安装的编辑器

根据您的系统，当前已安装：

- ✅ Visual Studio Code
- ✅ Cursor
- ✅ Cursor Nightly
- ✅ Windsurf
- ✅ Antigravity
- ✅ Kiro
- ✅ Lingma (灵码)
- ✅ Trae

## 支持的同步内容

- ✅ 配置文件 (settings.json)
- ✅ 快捷键绑定 (keybindings.json)
- ✅ 插件扩展 (extensions)

## 同步策略

- **智能合并**: 合并配置项，保留目标端独有设置
- **强制覆盖**: 完全替换目标配置

## 注意事项

1. 所有编辑器必须实际安装才会在列表中显示
2. 配置文件路径必须存在
3. 插件同步可能需要较长时间
4. 建议先使用"空跑测试"模式验证同步操作
