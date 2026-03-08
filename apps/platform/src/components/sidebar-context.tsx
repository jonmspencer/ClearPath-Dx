"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  toggleCollapsed: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleCollapsed = useCallback(() => setIsCollapsed((v) => !v), []);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
