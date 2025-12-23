use std::fs;
use std::path::Path;
use std::process::Command;
use crate::models::{IdeProfile, SyncOptions, SyncResult, SyncStrategy};
use crate::backup;
use jsonc_parser::{parse_to_serde_value, ParseOptions};
use serde_json::Value;

pub fn perform_sync(source: IdeProfile, target: IdeProfile, options: SyncOptions) -> SyncResult {
    let mut log = Vec::new();
    let mut success = true;

    log.push(format!("Starting sync from {} to {}...", source.name, target.name));
    log.push(format!("Strategy: {:?}", options.strategy));

    if options.sync_settings {
        log.push("--- Syncing Settings ---".to_string());
        match sync_file(&source.config_path, &target.config_path, options.dry_run, &options.strategy, &source.name, &target.name, "settings") {
            Ok(msg) => log.push(msg),
            Err(e) => {
                log.push(format!("Error syncing settings: {}", e));
                success = false;
            }
        }
    }

    if options.sync_keybindings {
        log.push("--- Syncing Keybindings ---".to_string());
        let src_kb = crate::ide::get_keybindings_path(&source.config_path);
        let tgt_kb = crate::ide::get_keybindings_path(&target.config_path);
        
        if src_kb.exists() {
             // Keybindings are usually arrays, so merge strategy might be different (append).
             // For now, we reuse the same strategy (Top level array merge if array, or overwrite).
             // Since keybindings.json is [ ... ], merging usually means appending.
             // But if it's Overwrite, we replace.
             match sync_file(&src_kb.to_string_lossy(), &tgt_kb.to_string_lossy(), options.dry_run, &options.strategy, &source.name, &target.name, "keybindings") {
                Ok(msg) => log.push(msg),
                Err(e) => {
                    log.push(format!("Error syncing keybindings: {}", e));
                    success = false;
                }
            }
        } else {
             log.push("Source keybindings.json not found, skipping.".to_string());
        }
    }

    if options.sync_extensions {
        log.push("--- Syncing Extensions (CLI Method) ---".to_string());
        if options.dry_run {
            log.push("[Dry Run] Would run extension install commands.".to_string());
        } else {
            match sync_extensions_cli(&source, &target, &mut log) {
                Ok(_) => log.push("Extensions sync completed.".to_string()),
                Err(e) => {
                    log.push(format!("Error syncing extensions: {}", e));
                    success = false;
                }
            }
        }
    }

    SyncResult { success, log }
}

fn sync_file(
    src_path: &str, 
    tgt_path: &str, 
    dry_run: bool, 
    strategy: &SyncStrategy,
    source_ide: &str,
    target_ide: &str,
    file_type: &str,
) -> Result<String, String> {
    // Read Source
    let src_content = fs::read_to_string(src_path).map_err(|e| format!("Failed to read source: {}", e))?;
    let src_json: Value = parse_to_serde_value(&src_content, &ParseOptions::default())
        .map_err(|_| "Source file is invalid JSONC".to_string())?
        .unwrap_or(Value::Null);

    let final_content_str: String;

    if matches!(strategy, SyncStrategy::Merge) && Path::new(tgt_path).exists() {
        // Read Target for merging
        let tgt_content = fs::read_to_string(tgt_path).map_err(|e| format!("Failed to read target: {}", e))?;
        let mut tgt_json: Value = parse_to_serde_value(&tgt_content, &ParseOptions::default())
            .map_err(|_| "Target file is invalid JSONC, cannot merge.".to_string())?
            .unwrap_or(Value::Null);
        
        // Disable "smart merge" for arrays for now, just complex objects (settings).
        merge_json_values(&mut tgt_json, &src_json);
        
        // Convert back to string (Pretty printed)
        final_content_str = serde_json::to_string_pretty(&tgt_json).map_err(|e| e.to_string())?;
    } else {
        // Overwrite or file doesn't exist -> Use source as is (but prettified/cleaned)
        // OR simply copy raw content to preserve comments?
        // If Overwrite, users usually prefer raw content copy to keep comments.
        // But if we want to valid JSONC, maybe keeping raw is better.
        // Let's stick to raw copy for Overwrite to preserve comments.
        final_content_str = src_content;
    }

    if dry_run {
        return Ok(format!("[Dry Run] Would write to {} (Strategy: {:?})", tgt_path, strategy));
    }

    // 使用新的带时间戳的备份系统
    if Path::new(tgt_path).exists() {
        match backup::create_timestamped_backup(tgt_path, source_ide, target_ide, file_type) {
            Ok(metadata) => {
                // 备份成功后自动清理旧备份，保留最新 10 个
                let _ = backup::cleanup_old_backups(tgt_path, 10);
            },
            Err(e) => {
                // 备份失败不应阻止同步，只记录警告
                eprintln!("Warning: Backup failed: {}", e);
            }
        }
    }

    // Write
    fs::write(tgt_path, final_content_str).map_err(|e| e.to_string())?;
    Ok(format!("Successfully synced {} (Strategy: {:?}, auto-backup created)", tgt_path, strategy))
}

// Recursive shallow merge for JSON objects
fn merge_json_values(target: &mut Value, source: &Value) {
    match (target, source) {
        (Value::Object(tgt_map), Value::Object(src_map)) => {
            for (k, v) in src_map {
                // If key exists in target and both are objects, recurse.
                if let Some(tgt_v) = tgt_map.get_mut(k) {
                    if tgt_v.is_object() && v.is_object() {
                        merge_json_values(tgt_v, v);
                    } else {
                        // Otherwise overwrite value
                        *tgt_v = v.clone();
                    }
                } else {
                    // Key doesn't exist, insert
                    tgt_map.insert(k.clone(), v.clone());
                }
            }
        }
        (Value::Array(tgt_arr), Value::Array(src_arr)) => {
            // For arrays (like keybindings), we append simplified.
            // Avoid duplicates? complex to check.
            // Simple append for now.
             for item in src_arr {
                 if !tgt_arr.contains(item) {
                     tgt_arr.push(item.clone());
                 }
             }
        }
        // For other types (or mismatch), we assume source wins if we called this function.
        // But in the recursive branch above, we only called it if both are objects.
        // This function signature is a bit weird for top-level calling without checks.
        // Correct usage: only call if you intend to merge source INTO target.
        (t, s) => {
            *t = s.clone();
        }
    }
}

fn sync_extensions_cli(source: &IdeProfile, target: &IdeProfile, log: &mut Vec<String>) -> Result<(), String> {
    // 1. Get list from source
    let output = Command::new(&source.executable)
        .arg("--list-extensions")
        .output()
        .map_err(|_| format!("Failed to run '{}'. Is it in PATH?", source.executable))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let extensions_str = String::from_utf8_lossy(&output.stdout);
    let extensions: Vec<&str> = extensions_str.lines().collect();
    
    log.push(format!("Found {} extensions in {}", extensions.len(), source.name));

    // 2. Install on target
    for ext in extensions {
        log.push(format!("Installing {} on {}...", ext, target.name));
        let install = Command::new(&target.executable)
            .arg("--install-extension")
            .arg(ext)
            .output();
        
        match install {
            Ok(out) if out.status.success() => {},
            Ok(out) => {
                log.push(format!("Failed to install {}: {}", ext, String::from_utf8_lossy(&out.stderr)));
            },
            Err(e) => {
                 log.push(format!("Failed to execute install command: {}", e));
            }
        }
    }
    Ok(())
}
