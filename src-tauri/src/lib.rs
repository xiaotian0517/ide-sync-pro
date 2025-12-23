// use tauri::Emitter; // Unused
pub mod models;
pub mod ide;
pub mod sync;
pub mod history;
pub mod backup;

use models::{IdeProfile, SyncOptions, SyncResult, SyncRecord};
use backup::{BackupInfo, BackupStats};
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
fn get_ides() -> Vec<IdeProfile> {
    ide::get_default_ides()
}

#[tauri::command]
async fn execute_sync(source_id: String, target_id: String, options: SyncOptions, _app_handle: tauri::AppHandle) -> Result<SyncResult, String> {
    let ides = ide::get_default_ides();
    
    let source = ides.iter().find(|i| i.id == source_id).ok_or("Source IDE not found")?;
    let target = ides.iter().find(|i| i.id == target_id).ok_or("Target IDE not found")?;

    let src_name = source.name.clone();
    let tgt_name = target.name.clone();

    // Cloning for ownership
    let src_clone = source.clone();
    let tgt_clone = target.clone();
    
    // Spawn blocking task
    let result = tauri::async_runtime::spawn_blocking(move || {
        sync::perform_sync(src_clone, tgt_clone, options)
    }).await.map_err(|e| e.to_string())?;

    // Record History
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    let record = SyncRecord {
        id: timestamp.to_string(), // Simple ID
        timestamp,
        source_name: src_name,
        target_name: tgt_name,
        status: if result.success { "Success".to_string() } else { "Failed".to_string() },
        details: if result.success { 
            "同步成功".to_string() 
        } else { 
            format!("同步失败，共 {} 条日志", result.log.len()) 
        },
    };
    history::append_history(record);

    Ok(result)
}

#[tauri::command]
fn list_backups(file_path: String) -> Result<Vec<BackupInfo>, String> {
    backup::list_backups(&file_path)
}

#[tauri::command]
fn restore_backup(backup_path: String) -> Result<String, String> {
    backup::restore_backup(&backup_path)
}

#[tauri::command]
fn delete_backup(backup_path: String) -> Result<String, String> {
    backup::delete_backup(&backup_path)
}

#[tauri::command]
fn cleanup_old_backups(file_path: String, keep_count: usize) -> Result<usize, String> {
    backup::cleanup_old_backups(&file_path, keep_count)
}

#[tauri::command]
fn get_backup_stats(file_path: String) -> Result<BackupStats, String> {
    backup::get_backup_stats(&file_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_ides,
            execute_sync,
            list_backups,
            restore_backup,
            delete_backup,
            cleanup_old_backups,
            get_backup_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
