use crate::models::SyncRecord;
use std::fs;
use std::path::PathBuf;

pub fn get_history_file_path() -> PathBuf {
    let mut path = dirs::home_dir().expect("Could not determine home directory");
    path.push(".ide-sync-pro");
    if !path.exists() {
        fs::create_dir_all(&path).unwrap_or_default();
    }
    path.push("history.json");
    path
}

pub fn read_history() -> Vec<SyncRecord> {
    let path = get_history_file_path();
    if !path.exists() {
        return Vec::new();
    }

    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_else(|_| Vec::new()),
        Err(_) => Vec::new(),
    }
}

pub fn append_history(record: SyncRecord) {
    let mut history = read_history();
    // Prepend new records
    history.insert(0, record);
    // Limit to last 50
    if history.len() > 50 {
        history.truncate(50);
    }

    let path = get_history_file_path();
    if let Ok(json) = serde_json::to_string_pretty(&history) {
        let _ = fs::write(path, json);
    }
}
