export type DeviceType = "mobile" | "tablet" | "desktop";

export interface NavItemConfig {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  isMore?: boolean;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
  type: "receita" | "despesa" | "transferencia" | "conta";
  color?: string;
}

export interface PwaBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
