export interface IdeProfile {
  id: string;
  name: string;
  ide_type: "VSCode" | "Cursor" | "Antigravity" | "Windsurf" | "Unknown";
  config_path: string;
  extensions_path: string;
  executable: string;
  is_detected: boolean;
}

export type SyncStrategy = "Overwrite" | "Merge";

export interface SyncOptions {
  sync_settings: boolean;
  sync_extensions: boolean;
  sync_keybindings: boolean;
  dry_run: boolean;
  strategy: SyncStrategy;
}

export interface SyncResult {
  success: boolean;
  log: string[];
}

export interface SyncRecord {
  id: string;
  timestamp: number;
  source_name: string;
  target_name: string;
  status: string;
  details: string;
}

export interface AppSettings {
  autoDetectOnStartup: boolean;
  defaultStrategy: SyncStrategy;
  defaultSyncSettings: boolean;
  defaultSyncKeybindings: boolean;
  defaultSyncExtensions: boolean;
  autoBackup: boolean;
  backupRetentionCount: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoDetectOnStartup: true,
  defaultStrategy: "Merge",
  defaultSyncSettings: true,
  defaultSyncKeybindings: true,
  defaultSyncExtensions: false,
  autoBackup: true,
  backupRetentionCount: 10,
};

// 备份相关类型
export interface BackupMetadata {
  backup_path: string;
  original_path: string;
  timestamp: number;
  source_ide: string;
  target_ide: string;
  file_type: string;
  file_size: number;
}

export interface BackupInfo {
  metadata: BackupMetadata;
  formatted_time: string;
  size_mb: number;
}
