use std::path::PathBuf;
use crate::models::{IdeProfile, IdeType};

pub fn get_default_ides() -> Vec<IdeProfile> {
    let home = dirs::home_dir().expect("Could not find home directory");

    #[cfg(target_os = "macos")]
    let library = home.join("Library/Application Support");

    #[cfg(target_os = "windows")]
    let library = dirs::data_dir().unwrap_or_else(|| home.join("AppData/Roaming"));

    #[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
    let library = home.join(".config");

    let mut profiles = Vec::new();

    // 1. VS Code
    let vscode_config = library.join("Code/User/settings.json");
    let vscode_ext = home.join(".vscode/extensions");
    if vscode_config.exists() {
        profiles.push(IdeProfile {
            id: "vscode".to_string(),
            name: "Visual Studio Code".to_string(),
            ide_type: IdeType::VSCode,
            config_path: vscode_config.to_string_lossy().to_string(),
            extensions_path: vscode_ext.to_string_lossy().to_string(),
            executable: "code".to_string(),
            is_detected: true,
        });
    }

    // 2. VS Code Insiders
    let vscode_insiders_config = library.join("Code - Insiders/User/settings.json");
    let vscode_insiders_ext = home.join(".vscode-insiders/extensions");
    if vscode_insiders_config.exists() {
        profiles.push(IdeProfile {
            id: "vscode-insiders".to_string(),
            name: "VS Code Insiders".to_string(),
            ide_type: IdeType::VSCodeInsiders,
            config_path: vscode_insiders_config.to_string_lossy().to_string(),
            extensions_path: vscode_insiders_ext.to_string_lossy().to_string(),
            executable: "code-insiders".to_string(),
            is_detected: true,
        });
    }

    // 3. VSCodium
    let vscodium_config = library.join("VSCodium/User/settings.json");
    let vscodium_ext = home.join(".vscode-oss/extensions");
    if vscodium_config.exists() {
        profiles.push(IdeProfile {
            id: "vscodium".to_string(),
            name: "VSCodium".to_string(),
            ide_type: IdeType::VSCodium,
            config_path: vscodium_config.to_string_lossy().to_string(),
            extensions_path: vscodium_ext.to_string_lossy().to_string(),
            executable: "codium".to_string(),
            is_detected: true,
        });
    }

    // 4. Cursor
    let cursor_config = library.join("Cursor/User/settings.json");
    let cursor_ext = home.join(".cursor/extensions");
    if cursor_config.exists() {
        profiles.push(IdeProfile {
            id: "cursor".to_string(),
            name: "Cursor".to_string(),
            ide_type: IdeType::Cursor,
            config_path: cursor_config.to_string_lossy().to_string(),
            extensions_path: cursor_ext.to_string_lossy().to_string(),
            executable: "cursor".to_string(),
            is_detected: true,
        });
    }

    // 5. Cursor Nightly
    let cursor_nightly_config = library.join("Cursor Nightly/User/settings.json");
    let cursor_nightly_ext = home.join(".cursor-nightly/extensions");
    if cursor_nightly_config.exists() {
        profiles.push(IdeProfile {
            id: "cursor-nightly".to_string(),
            name: "Cursor Nightly".to_string(),
            ide_type: IdeType::CursorNightly,
            config_path: cursor_nightly_config.to_string_lossy().to_string(),
            extensions_path: cursor_nightly_ext.to_string_lossy().to_string(),
            executable: "cursor-nightly".to_string(),
            is_detected: true,
        });
    }

    // 7. Windsurf
    let wind_config = library.join("Windsurf/User/settings.json");
    let wind_ext = home.join(".windsurf/extensions");
    if wind_config.exists() {
        profiles.push(IdeProfile {
            id: "windsurf".to_string(),
            name: "Windsurf".to_string(),
            ide_type: IdeType::Windsurf,
            config_path: wind_config.to_string_lossy().to_string(),
            extensions_path: wind_ext.to_string_lossy().to_string(),
            executable: "windsurf".to_string(),
            is_detected: true,
        });
    }

    // 8. Antigravity
    let anti_config = library.join("Antigravity/User/settings.json");
    let anti_ext = home.join(".antigravity/extensions");
    if anti_config.exists() {
        profiles.push(IdeProfile {
            id: "antigravity".to_string(),
            name: "Antigravity".to_string(),
            ide_type: IdeType::Antigravity,
            config_path: anti_config.to_string_lossy().to_string(),
            extensions_path: anti_ext.to_string_lossy().to_string(),
            executable: "antigravity".to_string(),
            is_detected: true,
        });
    }

    // 9. Kiro
    let kiro_config = library.join("Kiro/User/settings.json");
    let kiro_ext = home.join(".kiro/extensions");
    if kiro_config.exists() {
        profiles.push(IdeProfile {
            id: "kiro".to_string(),
            name: "Kiro".to_string(),
            ide_type: IdeType::Kiro,
            config_path: kiro_config.to_string_lossy().to_string(),
            extensions_path: kiro_ext.to_string_lossy().to_string(),
            executable: "kiro".to_string(),
            is_detected: true,
        });
    }

    // 10. Lingma (灵码 - 阿里云/通义)
    let lingma_config = library.join("Lingma/User/settings.json");
    let lingma_ext = home.join(".lingma/extensions");
    if lingma_config.exists() {
        profiles.push(IdeProfile {
            id: "lingma".to_string(),
            name: "Lingma (灵码)".to_string(),
            ide_type: IdeType::Lingma,
            config_path: lingma_config.to_string_lossy().to_string(),
            extensions_path: lingma_ext.to_string_lossy().to_string(),
            executable: "lingma".to_string(),
            is_detected: true,
        });
    }

    // 11. Trae
    let trae_config = library.join("Trae/User/settings.json");
    let trae_ext = home.join(".trae/extensions");
    if trae_config.exists() {
        profiles.push(IdeProfile {
            id: "trae".to_string(),
            name: "Trae".to_string(),
            ide_type: IdeType::Trae,
            config_path: trae_config.to_string_lossy().to_string(),
            extensions_path: trae_ext.to_string_lossy().to_string(),
            executable: "trae".to_string(),
            is_detected: true,
        });
    }

    // 12. Positron (统计分析 IDE)
    let positron_config = library.join("Positron/User/settings.json");
    let positron_ext = home.join(".positron/extensions");
    if positron_config.exists() {
        profiles.push(IdeProfile {
            id: "positron".to_string(),
            name: "Positron".to_string(),
            ide_type: IdeType::Positron,
            config_path: positron_config.to_string_lossy().to_string(),
            extensions_path: positron_ext.to_string_lossy().to_string(),
            executable: "positron".to_string(),
            is_detected: true,
        });
    }

    // 13. Codeium (Windsurf 的前身)
    let codeium_config = library.join("Codeium/User/settings.json");
    let codeium_ext = home.join(".codeium/extensions");
    if codeium_config.exists() {
        profiles.push(IdeProfile {
            id: "codeium".to_string(),
            name: "Codeium".to_string(),
            ide_type: IdeType::Codeium,
            config_path: codeium_config.to_string_lossy().to_string(),
            extensions_path: codeium_ext.to_string_lossy().to_string(),
            executable: "codeium".to_string(),
            is_detected: true,
        });
    }

    // 14. Code - OSS (开源版本)
    let code_oss_config = library.join("Code - OSS/User/settings.json");
    let code_oss_ext = home.join(".vscode-oss/extensions");
    if code_oss_config.exists() {
        profiles.push(IdeProfile {
            id: "code-oss".to_string(),
            name: "Code - OSS".to_string(),
            ide_type: IdeType::CodeOSS,
            config_path: code_oss_config.to_string_lossy().to_string(),
            extensions_path: code_oss_ext.to_string_lossy().to_string(),
            executable: "code-oss".to_string(),
            is_detected: true,
        });
    }

    profiles
}

pub fn get_keybindings_path(config_path: &str) -> PathBuf {
    let mut path = PathBuf::from(config_path);
    path.pop(); // Remove settings.json
    path.push("keybindings.json");
    path
}
