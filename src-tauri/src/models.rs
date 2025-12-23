use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum IdeType {
    VSCode,
    VSCodeInsiders,
    VSCodium,
    Cursor,
    CursorNightly,
    Windsurf,
    Antigravity,
    Kiro,
    Lingma,
    Trae,
    Positron,
    Codeium,
    CodeOSS,
    Unknown,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdeProfile {
    pub id: String,
    pub name: String,
    pub ide_type: IdeType,
    pub config_path: String,      // Path to settings.json
    pub extensions_path: String,  // Path to extensions dir
    pub executable: String,       // Command to launch/install extensions (e.g. 'code', 'cursor')
    pub is_detected: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncOptions {
    pub sync_settings: bool,
    pub sync_extensions: bool,
    pub sync_keybindings: bool,
    pub dry_run: bool,
    pub strategy: SyncStrategy,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum SyncStrategy {
    Overwrite,
    Merge,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncResult {
    pub success: bool,
    pub log: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncRecord {
    pub id: String, // timestamp or uuid
    pub timestamp: i64,
    pub source_name: String,
    pub target_name: String,
    pub status: String, // "Success" or "Failed"
    pub details: String,
}
