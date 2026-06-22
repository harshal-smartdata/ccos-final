import React, { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "consultant" | "manager" | "client" | "admin";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem("appRole") as UserRole) || "consultant";
  });
  const [isAuthenticated, setIsAuth] = useState(() => {
    return localStorage.getItem("appAuth") === "true";
  });

  const setRole = (r: UserRole) => {
    localStorage.setItem("appRole", r);
    setRoleState(r);
  };

  const setIsAuthenticated = (auth: boolean) => {
    localStorage.setItem("appAuth", String(auth));
    setIsAuth(auth);
  };

  const nameMap: Record<UserRole, string> = {
    consultant: "Sarah Chen",
    manager: "James Wilson",
    client: "Toronto Tech Solutions",
    admin: "Admin User",
  };

  return (
    <RoleContext.Provider value={{ role, setRole, userName: nameMap[role], isAuthenticated, setIsAuthenticated }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
