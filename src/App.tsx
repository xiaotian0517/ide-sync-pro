import { useEffect, useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./components/dashboard/Dashboard";

import { SettingsView } from "./components/settings/SettingsView";
import { invoke } from "@tauri-apps/api/core";
import { IdeProfile, SyncOptions, AppSettings, DEFAULT_SETTINGS } from "./types";

// 从 localStorage 加载设置
function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('ide-sync-settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ides, setIdes] = useState<IdeProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // 设置状态
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Lifted State - 使用设置中的默认值
  const [sourceId, setSourceId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [options, setOptions] = useState<SyncOptions>({
    sync_settings: settings.defaultSyncSettings,
    sync_extensions: settings.defaultSyncExtensions,
    sync_keybindings: settings.defaultSyncKeybindings,
    dry_run: false,
    strategy: settings.defaultStrategy,
  });

  // 当设置变更时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('ide-sync-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    loadIdes();
  }, []);

  async function loadIdes() {
    setLoading(true);
    try {
      const detected = await invoke<IdeProfile[]>("get_ides");
      setIdes(detected);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
        <Dashboard
          ides={ides}
          loading={loading}
          onRefresh={loadIdes}
          sourceId={sourceId}
          setSourceId={setSourceId}
          targetId={targetId}
          setTargetId={setTargetId}
          options={options}
          setOptions={setOptions}
          logs={logs}
          setLogs={setLogs}
        />
      </div>



      <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
        <SettingsView
          settings={settings}
          setSettings={setSettings}
          ides={ides}
        />
      </div>
    </AppLayout>
  );
}

export default App;
