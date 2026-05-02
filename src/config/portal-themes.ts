import type { CSSProperties } from "react";

export type PortalThemeKey = "admin" | "manager" | "worker";

export type PortalTheme = {
  key: PortalThemeKey;
  brand: string;
  roleLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  initials: string;
  colors: {
    appBg: string;
    sidebarBg: string;
    sidebarMuted: string;
    sidebarBorder: string;
    accent: string;
    accentStrong: string;
    accentSoft: string;
    accentText: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textMuted: string;
    success: string;
    warning: string;
    danger: string;
    chartA: string;
    chartB: string;
    chartC: string;
  };
};

export const portalThemes = {
  admin: {
    key: "admin",
    brand: "JammuServe",
    roleLabel: "ADMIN",
    eyebrow: "Admin Operations",
    title: "Back-office command center",
    subtitle: "Admin Ops",
    initials: "JS",
    colors: {
      appBg: "#f6f4ef",
      sidebarBg: "#191816",
      sidebarMuted: "#a8a196",
      sidebarBorder: "rgba(255,255,255,0.1)",
      accent: "#f3b43f",
      accentStrong: "#c98212",
      accentSoft: "#fff1c7",
      accentText: "#8a7446",
      surface: "#ffffff",
      surfaceMuted: "#fbf8ef",
      border: "#e1d8ca",
      text: "#191816",
      textMuted: "#6f675d",
      success: "#2f9e67",
      warning: "#f3b43f",
      danger: "#b42318",
      chartA: "#f3b43f",
      chartB: "#191816",
      chartC: "#2f9e67"
    }
  },
  manager: {
    key: "manager",
    brand: "JammuServe",
    roleLabel: "MANAGER",
    eyebrow: "Manager Operations",
    title: "Dispatch command center",
    subtitle: "Manager Ops",
    initials: "MG",
    colors: {
      appBg: "#eef4ff",
      sidebarBg: "#0b1730",
      sidebarMuted: "#9fb2d8",
      sidebarBorder: "rgba(191,219,254,0.16)",
      accent: "#4f7cff",
      accentStrong: "#2e55d4",
      accentSoft: "#dbe7ff",
      accentText: "#2e55d4",
      surface: "#ffffff",
      surfaceMuted: "#f6f9ff",
      border: "#d7e2f5",
      text: "#101828",
      textMuted: "#667085",
      success: "#16a36a",
      warning: "#f59e0b",
      danger: "#dc2626",
      chartA: "#4f7cff",
      chartB: "#0b1730",
      chartC: "#16a36a"
    }
  },
  worker: {
    key: "worker",
    brand: "JammuServe",
    roleLabel: "WORKER",
    eyebrow: "Worker Field Ops",
    title: "Field execution console",
    subtitle: "Worker Ops",
    initials: "WK",
    colors: {
      appBg: "#edf9f4",
      sidebarBg: "#06251e",
      sidebarMuted: "#9ed8c6",
      sidebarBorder: "rgba(167,243,208,0.16)",
      accent: "#20b879",
      accentStrong: "#0f8a5a",
      accentSoft: "#d9f6ea",
      accentText: "#0f7a52",
      surface: "#ffffff",
      surfaceMuted: "#f4fcf8",
      border: "#ccebdd",
      text: "#10231d",
      textMuted: "#5c756c",
      success: "#20b879",
      warning: "#e7a72d",
      danger: "#d43f3a",
      chartA: "#20b879",
      chartB: "#06251e",
      chartC: "#4f7cff"
    }
  }
} satisfies Record<PortalThemeKey, PortalTheme>;

export const operationsNav = [
  {
    href: "/worker",
    label: "Worker",
    shortLabel: "WK",
    roles: ["ADMIN", "WORKER"],
    theme: "worker"
  }
] as const;

export function portalThemeVars(theme: PortalTheme): CSSProperties & Record<`--portal-${string}`, string> {
  return {
    "--portal-app-bg": theme.colors.appBg,
    "--portal-sidebar-bg": theme.colors.sidebarBg,
    "--portal-sidebar-muted": theme.colors.sidebarMuted,
    "--portal-sidebar-border": theme.colors.sidebarBorder,
    "--portal-accent": theme.colors.accent,
    "--portal-accent-strong": theme.colors.accentStrong,
    "--portal-accent-soft": theme.colors.accentSoft,
    "--portal-accent-text": theme.colors.accentText,
    "--portal-surface": theme.colors.surface,
    "--portal-surface-muted": theme.colors.surfaceMuted,
    "--portal-border": theme.colors.border,
    "--portal-text": theme.colors.text,
    "--portal-text-muted": theme.colors.textMuted,
    "--portal-success": theme.colors.success,
    "--portal-warning": theme.colors.warning,
    "--portal-danger": theme.colors.danger,
    "--portal-chart-a": theme.colors.chartA,
    "--portal-chart-b": theme.colors.chartB,
    "--portal-chart-c": theme.colors.chartC
  };
}
