"use client";

import { useMemo } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

export interface ChartTheme {
  background: string;
  gridStroke: string;
  axisStroke: string;
  textColor: string;
  accentLine: string;
  goalLineColor: string;
  pigeonColors: string[];
}

const DARK_THEME: ChartTheme = {
  background: "#0F2030",
  gridStroke: "#1F3852",
  axisStroke: "#8A95A5",
  textColor: "#CBD5E1",
  accentLine: "#1FB6D3",
  goalLineColor: "#FACC15",
  pigeonColors: ["#1FB6D3", "#F472B6", "#FBBF24", "#A78BFA", "#34D399", "#FB923C"],
};

const LIGHT_THEME: ChartTheme = {
  background: "#FFFFFF",
  gridStroke: "#E2E8F0",
  axisStroke: "#64748B",
  textColor: "#334155",
  accentLine: "#0284C7",
  goalLineColor: "#F59E0B",
  pigeonColors: ["#0284C7", "#DB2777", "#D97706", "#7C3AED", "#059669", "#EA580C"],
};

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  return useMemo(() => (theme === "dark" ? DARK_THEME : LIGHT_THEME), [theme]);
}
