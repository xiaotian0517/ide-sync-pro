import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Settings, Database, Shield, RefreshCw, CheckCircle, Trash2, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { AppSettings, DEFAULT_SETTINGS, IdeProfile, BackupInfo } from "../../types";

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  ides: IdeProfile[];
}

export function SettingsView({ settings, setSettings, ides }: SettingsViewProps) {
  const [saved, setSaved] = useState(false);
  const [selectedIdeForBackup, setSelectedIdeForBackup] = useState<string>("");
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  // 加载备份列表
  const loadBackups = async (configPath: string) => {
    if (!configPath) return;
    setLoadingBackups(true);
    try {
      const list = await invoke<BackupInfo[]>("list_backups", { filePath: configPath });
      setBackups(list);
    } catch (e) {
      console.error("Failed to load backups:", e);
      setBackups([]);
    } finally {
      setLoadingBackups(false);
    }
  };

  // 恢复备份
  const handleRestoreBackup = async (backupPath: string) => {
    try {
      await invoke<string>("restore_backup", { backupPath });
      // 刷新备份列表
      const ide = ides.find(i => i.id === selectedIdeForBackup);
      if (ide) loadBackups(ide.config_path);
    } catch (e) {
      console.error("Failed to restore backup:", e);
    }
  };

  // 删除备份
  const handleDeleteBackup = async (backupPath: string) => {
    try {
      await invoke<string>("delete_backup", { backupPath });
      // 刷新备份列表
      const ide = ides.find(i => i.id === selectedIdeForBackup);
      if (ide) loadBackups(ide.config_path);
    } catch (e) {
      console.error("Failed to delete backup:", e);
    }
  };

  // 当选择的 IDE 变化时加载备份
  useEffect(() => {
    if (selectedIdeForBackup) {
      const ide = ides.find(i => i.id === selectedIdeForBackup);
      if (ide) loadBackups(ide.config_path);
    } else {
      setBackups([]);
    }
  }, [selectedIdeForBackup, ides]);

  const handleSave = () => {
    // 设置已在 App.tsx 的 useEffect 中自动保存到 localStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    // 重置为默认值
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">软件设置</h1>
          <p className="text-sm text-muted-foreground">配置同步行为和应用偏好设置</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                已保存
              </>
            ) : (
              <>保存设置</>
            )}
          </Button>
        </div>
      </div>

      {/* 通用设置 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg md:text-xl">通用设置</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">配置应用的基本行为</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          <SettingItem
            label="启动时自动检测 IDE"
            description="应用启动时自动扫描并检测已安装的编辑器"
            checked={settings.autoDetectOnStartup}
            onChange={(checked) => setSettings({ ...settings, autoDetectOnStartup: checked })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">默认同步策略</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({ ...settings, defaultStrategy: "Merge" })}
                className={cn(
                  "p-3 rounded-md border text-left transition-all",
                  settings.defaultStrategy === "Merge"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-accent"
                )}
              >
                <p className="text-sm font-medium">智能合并</p>
                <p className="text-xs text-muted-foreground">保留目标端独有设置</p>
              </button>
              <button
                onClick={() => setSettings({ ...settings, defaultStrategy: "Overwrite" })}
                className={cn(
                  "p-3 rounded-md border text-left transition-all",
                  settings.defaultStrategy === "Overwrite"
                    ? "border-destructive bg-destructive/10"
                    : "border-input hover:bg-accent"
                )}
              >
                <p className="text-sm font-medium">强制覆盖</p>
                <p className="text-xs text-muted-foreground">完全替换目标配置</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 默认同步选项 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg md:text-xl">默认同步选项</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">设置新建同步任务的默认选项</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          <SettingItem
            label="默认同步配置文件 (settings.json)"
            description="新建同步任务时默认勾选此项"
            checked={settings.defaultSyncSettings}
            onChange={(checked) => setSettings({ ...settings, defaultSyncSettings: checked })}
          />
          <SettingItem
            label="默认同步快捷键 (keybindings.json)"
            description="新建同步任务时默认勾选此项"
            checked={settings.defaultSyncKeybindings}
            onChange={(checked) => setSettings({ ...settings, defaultSyncKeybindings: checked })}
          />
          <SettingItem
            label="默认同步插件扩展"
            description="新建同步任务时默认勾选此项（同步较慢）"
            checked={settings.defaultSyncExtensions}
            onChange={(checked) => setSettings({ ...settings, defaultSyncExtensions: checked })}
          />
        </CardContent>
      </Card>

      {/* 备份管理 */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg md:text-xl">备份管理</CardTitle>
          </div>
          <CardDescription className="text-xs md:text-sm">配置自动备份策略和查看历史备份</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 space-y-4">
          <SettingItem
            label="同步前自动备份"
            description="在执行同步操作前自动备份目标配置"
            checked={settings.autoBackup}
            onChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">备份保留数量</label>
            <select
              className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={settings.backupRetentionCount}
              onChange={(e) => setSettings({ ...settings, backupRetentionCount: parseInt(e.target.value) })}
            >
              <option value="3">最近 3 个备份</option>
              <option value="5">最近 5 个备份</option>
              <option value="10">最近 10 个备份</option>
              <option value="20">最近 20 个备份</option>
            </select>
            <p className="text-xs text-muted-foreground">旧备份会自动删除</p>
          </div>

          {/* 备份列表 */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">查看备份</label>
              <select
                className="flex h-8 w-48 items-center rounded-md border border-input bg-background px-2 py-1 text-xs"
                value={selectedIdeForBackup}
                onChange={(e) => setSelectedIdeForBackup(e.target.value)}
              >
                <option value="">选择 IDE...</option>
                {ides.map(ide => (
                  <option key={ide.id} value={ide.id}>{ide.name}</option>
                ))}
              </select>
            </div>

            {selectedIdeForBackup && (
              <div className="space-y-2">
                {loadingBackups ? (
                  <p className="text-xs text-muted-foreground text-center py-4">加载中...</p>
                ) : backups.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">暂无备份</p>
                ) : (
                  <div className="max-h-60 overflow-auto space-y-2">
                    {backups.map((backup, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-md border bg-muted/30 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{backup.metadata.file_type}</p>
                          <p className="text-muted-foreground">{backup.formatted_time}</p>
                          <p className="text-muted-foreground">{backup.size_mb.toFixed(2)} MB</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRestoreBackup(backup.metadata.backup_path)}
                            title="恢复此备份"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBackup(backup.metadata.backup_path)}
                            title="删除此备份"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardContent className="p-4 md:p-6 text-center space-y-2">
          <p className="text-sm font-medium">IDE 同步助手 Pro</p>
          <p className="text-xs text-muted-foreground">版本 1.0.0</p>
          <p className="text-xs text-muted-foreground">
            © 2024 IDE Sync Pro. 支持 14 个基于 VSCode 的编辑器
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingItem({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors",
          checked ? "bg-primary border-primary" : "bg-input border-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}

