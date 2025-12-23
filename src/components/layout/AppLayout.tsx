import * as React from "react";
import { LayoutDashboard, Settings as SettingsIcon, Command } from "lucide-react";
import { cn } from "../../lib/utils";

interface TopbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Topbar({ activeTab, onTabChange }: TopbarProps) {
  const menuItems = [
    { id: "dashboard", label: "同步中心", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "settings", label: "软件设置", icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div>
      {/* macOS 标题栏占位区域 - 可拖拽 */}
      <div className="fixed top-0 left-0 right-0 h-7 z-50 bg-card border-b" data-tauri-drag-region />

      {/* 导航栏 */}
      <header className="fixed top-7 left-0 right-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-between h-11 px-4 md:px-6">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <div className="bg-primary/10 p-1 rounded-lg">
              <Command className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-xs tracking-tight">IDE 同步助手</h2>
              <p className="text-[8px] text-muted-foreground leading-none">Pro</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-medium text-muted-foreground hidden md:inline">主题</span>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // 默认使用浅色主题
    const hasDarkClass = document.documentElement.classList.contains("dark");
    setIsDark(hasDarkClass);
    // 如果有 dark class，移除它
    if (hasDarkClass) {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className="relative inline-flex h-5 w-9 items-center rounded-full border border-input bg-transparent transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <span className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full bg-primary shadow-lg ring-0 transition-transform",
        isDark ? "translate-x-4" : "translate-x-0.5"
      )} />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

export function AppLayout({ children, activeTab, onTabChange }: { children: React.ReactNode } & TopbarProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Topbar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="pt-[72px]">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
