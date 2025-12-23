# 备份系统说明文档

## 📋 概述

IDE 同步助手 Pro 实现了完善的自动备份系统，确保您的配置文件安全。

## ✨ 功能特性

### 1. **自动备份**

- 每次同步操作前自动创建备份
- 支持 settings.json 和 keybindings.json
- 默认启用，无需手动配置

### 2. **带时间戳的多版本备份**

- 备份文件格式：`settings.json.backup.20241223-143000`
- 每次备份都有唯一的时间标识
- 可以同时保留多个历史版本

### 3. **备份元数据**

每个备份都包含详细的元数据文件（`.meta.json`）：

```json
{
  "backup_path": "完整备份路径",
  "original_path": "原始文件路径",
  "timestamp": 1703318400,
  "source_ide": "Cursor",
  "target_ide": "VS Code",
  "file_type": "settings",
  "file_size": 2048
}
```

### 4. **智能清理**

- 自动保留最新的 10 个备份（可配置）
- 旧备份自动删除，释放存储空间
- 每次同步后自动触发清理

### 5. **备份管理功能**

- ✅ 查看所有备份列表
- ✅ 查看备份详情（时间、大小、来源）
- ✅ 恢复指定版本
- ✅ 删除单个备份
- ✅ 统计信息（总数、总大小）

## 📂 备份位置

备份文件保存在原文件的同一目录下：

### 示例：

```
~/Library/Application Support/Cursor/User/
├── settings.json                           # 当前文件
├── settings.json.backup.20241223-140000    # 备份 1
├── settings.json.backup.20241223-140000.meta.json
├── settings.json.backup.20241223-143000    # 备份 2
├── settings.json.backup.20241223-143000.meta.json
├── settings.json.backup.20241223-150000    # 备份 3
└── settings.json.backup.20241223-150000.meta.json
```

## 🎯 使用场景

### 1. 自动备份（推荐）

默认情况下，每次同步都会自动创建备份，无需任何操作。

### 2. 恢复备份

如果同步后发现问题：

1. 打开设置页面（即将添加备份管理界面）
2. 查看备份列表
3. 选择要恢复的版本
4. 点击"恢复"按钮

### 3. 手动清理

如果需要手动清理：

1. 在设置页面查看备份统计
2. 点击"清理旧备份"按钮
3. 系统会保留最新的 N 个备份

## ⚙️ 配置选项

在**软件设置**页面可以配置：

### 同步前自动备份

- **默认**: 开启 ✅
- **说明**: 在执行同步操作前自动备份目标配置

### 备份保留数量

- **默认**: 10 个
- **可选**: 3 / 5 / 10 / 20 个
- **说明**: 保留最新的 N 个备份，旧备份自动删除

## 🔍 Tauri 命令 API

后端提供了以下 Tauri 命令：

```rust
// 列出所有备份
list_backups(file_path: String) -> Result<Vec<BackupInfo>, String>

// 恢复备份
restore_backup(backup_path: String) -> Result<String, String>

// 删除备份
delete_backup(backup_path: String) -> Result<String, String>

// 清理旧备份
cleanup_old_backups(file_path: String, keep_count: usize) -> Result<usize, String>

// 获取备份统计
get_backup_stats(file_path: String) -> Result<BackupStats, String>
```

## 📊 备份数据结构

### BackupInfo

```rust
{
  "metadata": {
    "backup_path": String,
    "original_path": String,
    "timestamp": i64,
    "source_ide": String,
    "target_ide": String,
    "file_type": String,
    "file_size": u64,
  },
  "formatted_time": String,  // "2024-12-23 14:30:00"
  "size_mb": f64,            // 0.002
}
```

### BackupStats

```rust
{
  "total_count": usize,
  "total_size_mb": f64,
  "oldest_backup": Option<String>,
  "newest_backup": Option<String>,
}
```

## 🚀 工作流程

### 同步时的备份流程

```
1. 用户点击"开始同步"
   ↓
2. 检查目标文件是否存在
   ↓
3. 如果存在，创建带时间戳的备份
   ├── 复制文件到备份位置
   ├── 保存元数据（JSON）
   └── 自动清理旧备份（保留最新 10 个）
   ↓
4. 执行同步操作（合并或覆盖）
   ↓
5. 写入新的配置文件
   ↓
6. 完成 ✅
```

## ⚠️ 注意事项

1. **存储空间**:

   - 配置文件通常很小（几 KB）
   - 10 个备份大约占用 20-50 KB
   - 可根据需要调整保留数量

2. **恢复安全**:

   - 恢复前会先备份当前文件（.before-restore）
   - 即使恢复失败也有双重保护

3. **元数据文件**:

   - `.meta.json` 文件与备份文件成对出现
   - 删除备份时会同时删除元数据
   - 手动删除备份文件可能导致孤立的元数据

4. **自动清理**:
   - 每次同步后自动执行
   - 只清理超过保留数量的备份
   - 按时间顺序，保留最新的

## 🎨 未来计划

即将添加的功能：

- [ ] 备份管理 UI 界面
- [ ] 备份对比功能
- [ ] 导出/导入备份
- [ ] 备份压缩（节省空间）
- [ ] 云端备份集成

## 📝 版本历史

- **v1.0.0** (2024-12-23)
  - ✅ 实现带时间戳的多版本备份
  - ✅ 添加备份元数据记录
  - ✅ 实现智能备份清理
  - ✅ 集成到同步流程
  - ✅ 默认保留 10 个备份
