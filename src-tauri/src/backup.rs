use std::fs;
use std::path::{Path, PathBuf};
use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BackupMetadata {
    pub backup_path: String,
    pub original_path: String,
    pub timestamp: i64,
    pub source_ide: String,
    pub target_ide: String,
    pub file_type: String, // "settings" or "keybindings"
    pub file_size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupInfo {
    pub metadata: BackupMetadata,
    pub formatted_time: String,
    pub size_mb: f64,
}

/// 创建带时间戳的备份
pub fn create_timestamped_backup(
    file_path: &str,
    source_ide: &str,
    target_ide: &str,
    file_type: &str,
) -> Result<BackupMetadata, String> {
    let path = Path::new(file_path);
    
    if !path.exists() {
        return Err(format!("文件不存在: {}", file_path));
    }

    // 生成带时间戳的备份文件名
    let timestamp = Local::now();
    let timestamp_str = timestamp.format("%Y%m%d-%H%M%S").to_string();
    
    let backup_path = format!("{}.backup.{}", file_path, timestamp_str);
    
    // 复制文件
    fs::copy(file_path, &backup_path)
        .map_err(|e| format!("备份失败: {}", e))?;
    
    // 获取文件大小
    let file_size = fs::metadata(&backup_path)
        .map(|m| m.len())
        .unwrap_or(0);
    
    // 创建元数据文件
    let metadata = BackupMetadata {
        backup_path: backup_path.clone(),
        original_path: file_path.to_string(),
        timestamp: timestamp.timestamp(),
        source_ide: source_ide.to_string(),
        target_ide: target_ide.to_string(),
        file_type: file_type.to_string(),
        file_size,
    };
    
    // 保存元数据
    let metadata_path = format!("{}.meta.json", backup_path);
    let metadata_json = serde_json::to_string_pretty(&metadata)
        .map_err(|e| format!("序列化元数据失败: {}", e))?;
    
    fs::write(metadata_path, metadata_json)
        .map_err(|e| format!("保存元数据失败: {}", e))?;
    
    Ok(metadata)
}

/// 获取所有备份列表
pub fn list_backups(file_path: &str) -> Result<Vec<BackupInfo>, String> {
    let path = Path::new(file_path);
    let parent = path.parent().ok_or("无效的文件路径")?;
    let filename = path.file_name().ok_or("无效的文件名")?;
    
    let mut backups = Vec::new();
    
    // 扫描目录查找备份文件
    if let Ok(entries) = fs::read_dir(parent) {
        for entry in entries.flatten() {
            let entry_path = entry.path();
            let entry_name = entry_path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
            
            // 查找匹配的备份文件
            if entry_name.starts_with(filename.to_str().unwrap_or(""))
                && entry_name.contains(".backup.") {
                
                // 读取元数据
                let metadata_path = format!("{}.meta.json", entry_path.display());
                if let Ok(metadata_json) = fs::read_to_string(&metadata_path) {
                    if let Ok(metadata) = serde_json::from_str::<BackupMetadata>(&metadata_json) {
                        let dt = DateTime::from_timestamp(metadata.timestamp, 0)
                            .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap());
                        let local_dt: DateTime<Local> = dt.into();
                        
                        backups.push(BackupInfo {
                            formatted_time: local_dt.format("%Y-%m-%d %H:%M:%S").to_string(),
                            size_mb: metadata.file_size as f64 / 1024.0 / 1024.0,
                            metadata,
                        });
                    }
                }
            }
        }
    }
    
    // 按时间倒序排列
    backups.sort_by(|a, b| b.metadata.timestamp.cmp(&a.metadata.timestamp));
    
    Ok(backups)
}

/// 恢复备份
pub fn restore_backup(backup_path: &str) -> Result<String, String> {
    let backup = Path::new(backup_path);
    
    if !backup.exists() {
        return Err("备份文件不存在".to_string());
    }
    
    // 读取元数据获取原始路径
    let metadata_path = format!("{}.meta.json", backup_path);
    let metadata_json = fs::read_to_string(&metadata_path)
        .map_err(|_| "无法读取备份元数据".to_string())?;
    
    let metadata: BackupMetadata = serde_json::from_str(&metadata_json)
        .map_err(|_| "元数据格式错误".to_string())?;
    
    // 恢复前先备份当前文件
    let original_path = &metadata.original_path;
    if Path::new(original_path).exists() {
        let temp_backup = format!("{}.before-restore", original_path);
        fs::copy(original_path, &temp_backup)
            .map_err(|e| format!("创建临时备份失败: {}", e))?;
    }
    
    // 恢复文件
    fs::copy(backup_path, original_path)
        .map_err(|e| format!("恢复失败: {}", e))?;
    
    Ok(format!("已恢复到: {}", original_path))
}

/// 删除备份
pub fn delete_backup(backup_path: &str) -> Result<String, String> {
    let backup = Path::new(backup_path);
    
    if !backup.exists() {
        return Err("备份文件不存在".to_string());
    }
    
    // 删除备份文件
    fs::remove_file(backup_path)
        .map_err(|e| format!("删除备份文件失败: {}", e))?;
    
    // 删除元数据文件
    let metadata_path = format!("{}.meta.json", backup_path);
    let _ = fs::remove_file(metadata_path);
    
    Ok("备份已删除".to_string())
}

/// 清理旧备份，保留指定数量
pub fn cleanup_old_backups(file_path: &str, keep_count: usize) -> Result<usize, String> {
    let mut backups = list_backups(file_path)?;
    
    let mut deleted_count = 0;
    
    // 保留最新的 keep_count 个备份，删除其余的
    if backups.len() > keep_count {
        for backup in backups.drain(keep_count..) {
            if let Ok(_) = delete_backup(&backup.metadata.backup_path) {
                deleted_count += 1;
            }
        }
    }
    
    Ok(deleted_count)
}

/// 获取备份统计信息
pub fn get_backup_stats(file_path: &str) -> Result<BackupStats, String> {
    let backups = list_backups(file_path)?;
    
    let total_size: u64 = backups.iter().map(|b| b.metadata.file_size).sum();
    let total_count = backups.len();
    
    let oldest = backups.last().map(|b| b.formatted_time.clone());
    let newest = backups.first().map(|b| b.formatted_time.clone());
    
    Ok(BackupStats {
        total_count,
        total_size_mb: total_size as f64 / 1024.0 / 1024.0,
        oldest_backup: oldest,
        newest_backup: newest,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupStats {
    pub total_count: usize,
    pub total_size_mb: f64,
    pub oldest_backup: Option<String>,
    pub newest_backup: Option<String>,
}

