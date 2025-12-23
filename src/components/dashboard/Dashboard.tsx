import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IdeProfile, SyncOptions, SyncResult } from "../../types";
import { Box, Settings, Terminal, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface DashboardProps {
  ides: IdeProfile[];
  loading: boolean;
  onRefresh: () => void;
  // State lifted to App
  sourceId: string;
  setSourceId: (id: string) => void;
  targetId: string;
  setTargetId: (id: string) => void;
  options: SyncOptions;
  setOptions: (opt: SyncOptions) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Dashboard({
  ides, loading, onRefresh,
  sourceId, setSourceId,
  targetId, setTargetId,
  options, setOptions,
  logs, setLogs
}: DashboardProps) {
  const [syncing, setSyncing] = useState(false);

  // Auto-select logic moved to App or kept here but only if empty
  useEffect(() => {
    if (ides.length >= 1 && !sourceId) setSourceId(ides[0].id);
    if (ides.length >= 2 && !targetId) setTargetId(ides[1].id);
  }, [ides, sourceId, targetId, setSourceId, setTargetId]);

  async function handleSync() {
    if (!sourceId || !targetId) return;
    if (sourceId === targetId) {
      setLogs(prev => [...prev, "错误: 源 (Source) 和 目标 (Target) 不能相同。"]);
      return;
    }

    setSyncing(true);
    setLogs(["开始同步流程..."]);

    try {
      const result = await invoke<SyncResult>("execute_sync", {
        sourceId,
        targetId,
        options,
      });

      setLogs(result.log);
      if (result.success) {
        setLogs(prev => [...prev, "✅ 同步成功完成!"]);
      } else {
        setLogs(prev => [...prev, "❌ 同步失败，请检查日志。"]);
      }
    } catch (e) {
      setLogs(prev => [...prev, `关键错误: ${e}`]);
    } finally {
      setSyncing(false);
      // Progress will be handled by useEffect to jump to 100
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">同步中心</h1>
          <p className="text-sm text-muted-foreground">跨设备统一管理您的 IDE 配置。</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          刷新
        </Button>
      </div>

      <Card className="min-w-0">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">IDE 同步配置</CardTitle>
          <CardDescription className="text-xs md:text-sm">选择源 IDE 和目标 IDE 进行配置同步</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 min-w-0">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">源 (Source) IDE</label>
              <select
                className="flex h-9 md:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-2 md:px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
              >
                <option value="" disabled>请选择源编辑器...</option>
                {ides.map(ide => (
                  <option key={ide.id} value={ide.id}>{ide.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 min-w-0">
              <label className="text-xs md:text-sm font-medium text-muted-foreground">目标 (Target) IDE</label>
              <select
                className="flex h-9 md:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-2 md:px-3 py-2 text-xs md:text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
              >
                <option value="" disabled>请选择目标编辑器...</option>
                {ides.map(ide => (
                  <option key={ide.id} value={ide.id}>{ide.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 md:gap-6 min-w-0">
        {/* Options Column */}
        <Card className="min-w-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">同步选项</CardTitle>
            <CardDescription className="text-xs md:text-sm">自定义需要同步的内容。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ToggleOption
                active={options.sync_settings}
                onClick={() => setOptions({ ...options, sync_settings: !options.sync_settings })}
                icon={<Settings className="w-4 h-4" />}
                title="配置 (Settings)"
                desc="同步 settings.json"
              />
              <ToggleOption
                active={options.sync_keybindings}
                onClick={() => setOptions({ ...options, sync_keybindings: !options.sync_keybindings })}
                icon={<Settings className="w-4 h-4" />}
                title="快捷键"
                desc="同步 keybindings.json"
              />
              <ToggleOption
                active={options.sync_extensions}
                onClick={() => setOptions({ ...options, sync_extensions: !options.sync_extensions })}
                icon={<Box className="w-4 h-4" />}
                title="插件扩展"
                desc="自动安装缺失插件 (较慢)"
              />
              <ToggleOption
                active={options.dry_run}
                onClick={() => setOptions({ ...options, dry_run: !options.dry_run })}
                icon={<Terminal className="w-4 h-4" />}
                title="空跑测试 (Dry Run)"
                desc="模拟同步，不修改文件"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">合并策略</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StrategyBtn
                  active={options.strategy === 'Merge'}
                  onClick={() => setOptions({ ...options, strategy: 'Merge' })}
                  title="智能合并 (推荐)"
                  desc="合并配置项，保留目标端独有设置。"
                />
                <StrategyBtn
                  active={options.strategy === 'Overwrite'}
                  onClick={() => setOptions({ ...options, strategy: 'Overwrite' })}
                  title="强制覆盖 (慎用)"
                  desc="完全替换目标配置，原有配置将丢失。"
                  variant="destructive"
                />
              </div>
            </div>

            <Button
              className="w-full h-10 md:h-12 text-base md:text-lg"
              onClick={handleSync}
              disabled={syncing || !sourceId || !targetId}
            >
              {syncing ? "正在同步..." : "开始同步"}
            </Button>
          </CardContent>
        </Card>

        {/* Logs Column */}
        <Card className="flex flex-col h-full min-h-[300px] max-h-[500px] xl:max-h-[600px] min-w-0">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">活动日志</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-black/90 p-3 mx-4 md:mx-6 mb-4 md:mb-6 rounded-lg border font-mono text-[10px] md:text-xs text-green-400">
            {logs.length === 0 ? (
              <div className="text-muted-foreground italic opacity-50">等待操作...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={cn("mb-1 break-all", log.includes("Error") && "text-red-400")}>
                  <span className="opacity-50 mr-2">[{i + 1}]</span>
                  {log}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleOption({ active, onClick, icon, title, desc }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start space-x-2 md:space-x-3 rounded-md border p-2.5 md:p-3 cursor-pointer transition-all hover:bg-accent min-w-0",
        active ? "border-primary bg-primary/5" : "border-input"
      )}
    >
      <div className={cn("mt-0.5 shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</div>
      <div className="flex-1 space-y-0.5 min-w-0">
        <p className="text-xs md:text-sm font-medium leading-tight">{title}</p>
        <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{desc}</p>
      </div>
      {active && <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />}
    </div>
  )
}

function StrategyBtn({ active, onClick, title, desc, variant = 'default' }: any) {
  const isDest = variant === 'destructive';
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-md border p-2.5 md:p-3 cursor-pointer transition-all hover:bg-accent text-left min-w-0",
        active && !isDest ? "border-primary bg-primary/5" : "",
        active && isDest ? "border-destructive bg-destructive/10" : ""
      )}
    >
      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
        {isDest && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
        <p className={cn("text-xs md:text-sm font-medium leading-tight", active && isDest ? "text-destructive" : "")}>{title}</p>
      </div>
      <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">{desc}</p>
    </div>
  )
}
