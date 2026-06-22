import React, { createContext, useContext, useState, useEffect } from "react";

interface NavigationContextType {
  visibleItems: Record<string, boolean>;
  toggleItemVisibility: (itemLabel: string) => void;
  isItemVisible: (itemLabel: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEY = "ccos_nav_visibility";

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse nav visibility settings", e);
      }
    }
    // Default: all items visible
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleItems));
  }, [visibleItems]);

  const toggleItemVisibility = (itemLabel: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [itemLabel]: prev[itemLabel] === false ? true : false,
    }));
  };

  const isItemVisible = (itemLabel: string) => {
    return visibleItems[itemLabel] !== false;
  };

  return (
    <NavigationContext.Provider value={{ visibleItems, toggleItemVisibility, isItemVisible }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
