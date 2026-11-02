import { create } from "zustand";
import { CooperativeConfig, BusinessModuleKey } from "@/types";
import { defaultCooperativeConfig } from "@/mocks/seedData";

interface ConfigState {
  config: CooperativeConfig;
  toggleModule: (moduleKey: BusinessModuleKey) => void;
  resetConfig: () => void;
}

const STORAGE_KEY = "kmb_demo_config";

function sanitizeConfig(config: CooperativeConfig): CooperativeConfig {
  return {
    ...config,
    tagline: (config.tagline || defaultCooperativeConfig.tagline).replace(/\*\*/g, "").replace(/\*/g, "").trim(),
  };
}

function getInitialConfig(): CooperativeConfig {
  if (typeof window === "undefined") return sanitizeConfig(defaultCooperativeConfig);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return sanitizeConfig({
        ...defaultCooperativeConfig,
        ...JSON.parse(saved),
      });
    }
  } catch {
    // fallback
  }
  return sanitizeConfig(defaultCooperativeConfig);
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: getInitialConfig(),
  toggleModule: (moduleKey: BusinessModuleKey) => {
    set((state) => {
      const updatedModules = {
        ...state.config.activeModules,
        [moduleKey]: !state.config.activeModules[moduleKey],
      };

      // If loans is disabled, installments depends on loans and must also be disabled
      if (moduleKey === "loans" && !updatedModules.loans) {
        updatedModules.installments = false;
      }

      const newConfig = {
        ...state.config,
        activeModules: updatedModules,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      } catch {
        // ignore
      }

      return { config: newConfig };
    });
  },
  resetConfig: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ config: defaultCooperativeConfig });
  },
}));

