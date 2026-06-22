import React, { createContext, useContext, useState, useEffect } from "react";

export type Permission = "Read" | "Write" | "Delete" | "Download";
export const ALL_PERMISSIONS: Permission[] = ["Read", "Write", "Delete", "Download"];

export type JobType = "Full Time" | "Part Time" | "Contract";
export type EntityStatus = "Active" | "Inactive";

/** Permissions granted per module, e.g. { Clients: ["Read", "Write"], CADs: ["Read"] }. */
export type ModulePermissions = Record<string, Permission[]>;

export interface Role {
  id: string;
  name: string;
  description: string;
  modulePermissions: ModulePermissions;
}

/** Modules the role can access (those with at least one permission). */
export const getRoleModules = (role: Role): string[] =>
  Object.keys(role.modulePermissions).filter((m) => role.modulePermissions[m]?.length > 0);

/** Union of all permissions granted across the role's modules. */
export const getRolePermissions = (role: Role): Permission[] => {
  const set = new Set<Permission>();
  Object.values(role.modulePermissions).forEach((perms) => perms.forEach((p) => set.add(p)));
  return ALL_PERMISSIONS.filter((p) => set.has(p));
};

export interface User {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  directLine: string;
  extension: string;
  mobileNumber: string;
  jobTitle: string;
  roleId: string;
  reportsToId: string;
  jobType: JobType;
  startDate?: string;
  endDate?: string;
  status: EntityStatus;
}

export interface Group {
  id: string;
  name: string;
  status: EntityStatus;
  memberIds: string[];
}

interface UserManagementState {
  roles: Role[];
  users: User[];
  groups: Group[];
}

interface UserManagementContextType extends UserManagementState {
  // Roles
  addRole: (role: Omit<Role, "id">) => Role;
  updateRole: (id: string, role: Omit<Role, "id">) => void;
  deleteRole: (id: string) => void;
  findRoleByName: (name: string) => Role | undefined;
  /** Grant/revoke a role's access to a module (drives navigation visibility). */
  setRoleModuleAccess: (roleId: string, module: string, enabled: boolean) => void;
  // Users
  addUser: (user: Omit<User, "id" | "status">) => User;
  updateUser: (id: string, user: Omit<User, "id" | "status">) => void;
  toggleUserStatus: (id: string) => void;
  // Groups
  addGroup: (group: Omit<Group, "id">) => Group;
  updateGroup: (id: string, group: Omit<Group, "id">) => void;
  deleteGroup: (id: string) => void;
  findGroupByName: (name: string) => Group | undefined;
  // Assignments
  assignUsersToGroup: (userIds: string[], groupIds: string[]) => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

const STORAGE_KEY = "ccos_user_management";

const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.floor(Math.random() * 1e9).toString(36)}`;

/** Helper to build modulePermissions by granting the same permissions to a list of modules. */
const grant = (modules: string[], perms: Permission[]): ModulePermissions =>
  Object.fromEntries(modules.map((m) => [m, [...perms]]));

const seedState = (): UserManagementState => {
  const adminRole: Role = {
    id: "role-admin",
    name: "Administrator",
    description: "Full system access across all modules.",
    modulePermissions: grant(
      ["Client Profiles", "User Management", "Settings"],
      ["Read", "Write", "Delete", "Download"]
    ),
  };
  const managerRole: Role = {
    id: "role-manager",
    name: "Manager",
    description: "Oversees consultants, approves submissions, views reports and billing.",
    modulePermissions: grant(["Client Profiles"], ["Read", "Write", "Delete"]),
  };
  const consultantRole: Role = {
    id: "role-consultant",
    name: "Consultant",
    description: "Handles day-to-day client and customs work.",
    modulePermissions: grant(["Client Profiles"], ["Read", "Write"]),
  };

  const users: User[] = [
    {
      id: "user-sarah",
      fullName: "Sarah Chen",
      email: "sarah@ccos.ca",
      contactNumber: "",
      directLine: "",
      extension: "",
      mobileNumber: "",
      jobTitle: "Customs Consultant",
      roleId: consultantRole.id,
      reportsToId: "user-james",
      jobType: "Full Time",
      status: "Active",
    },
    {
      id: "user-james",
      fullName: "James Wilson",
      email: "james@ccos.ca",
      contactNumber: "",
      directLine: "",
      extension: "",
      mobileNumber: "",
      jobTitle: "Operations Manager",
      roleId: managerRole.id,
      reportsToId: "",
      jobType: "Full Time",
      status: "Active",
    },
    {
      id: "user-lisa",
      fullName: "Lisa Park",
      email: "lisa@ccos.ca",
      contactNumber: "",
      directLine: "",
      extension: "",
      mobileNumber: "",
      jobTitle: "Customs Consultant",
      roleId: consultantRole.id,
      reportsToId: "user-james",
      jobType: "Full Time",
      status: "Active",
    },
    {
      id: "user-admin",
      fullName: "Admin User",
      email: "admin@ccos.ca",
      contactNumber: "",
      directLine: "",
      extension: "",
      mobileNumber: "",
      jobTitle: "System Administrator",
      roleId: adminRole.id,
      reportsToId: "",
      jobType: "Full Time",
      status: "Active",
    },
  ];

  return {
    roles: [adminRole, managerRole, consultantRole],
    users,
    groups: [
      { id: "group-ops", name: "Operations Team", status: "Active", memberIds: ["user-sarah", "user-lisa", "user-james"] },
    ],
  };
};

/** Upgrade a stored role from the legacy { permissions, moduleAccess } shape to modulePermissions. */
const migrateRole = (r: Role & { permissions?: Permission[]; moduleAccess?: string[] }): Role => {
  // Drop any permission values no longer in the current set (e.g. legacy "Approve"/"Admin").
  const clean = (perms: Permission[] = []) => ALL_PERMISSIONS.filter((p) => perms.includes(p));

  if (r.modulePermissions) {
    const modulePermissions: ModulePermissions = {};
    Object.entries(r.modulePermissions).forEach(([m, perms]) => {
      const valid = clean(perms);
      if (valid.length) modulePermissions[m] = valid;
    });
    return { id: r.id, name: r.name, description: r.description, modulePermissions };
  }
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    modulePermissions: grant(r.moduleAccess ?? [], clean(r.permissions)),
  };
};

export const UserManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserManagementState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserManagementState;
        return { ...parsed, roles: parsed.roles.map(migrateRole) };
      } catch (e) {
        console.error("Failed to parse user management state", e);
      }
    }
    return seedState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ---- Roles ----
  const addRole: UserManagementContextType["addRole"] = (role) => {
    const newRole: Role = { ...role, id: genId() };
    setState((s) => ({ ...s, roles: [...s.roles, newRole] }));
    return newRole;
  };
  const updateRole: UserManagementContextType["updateRole"] = (id, role) => {
    setState((s) => ({ ...s, roles: s.roles.map((r) => (r.id === id ? { ...role, id } : r)) }));
  };
  const deleteRole: UserManagementContextType["deleteRole"] = (id) => {
    setState((s) => ({ ...s, roles: s.roles.filter((r) => r.id !== id) }));
  };
  const findRoleByName: UserManagementContextType["findRoleByName"] = (name) =>
    state.roles.find((r) => r.name.trim().toLowerCase() === name.trim().toLowerCase());
  const setRoleModuleAccess: UserManagementContextType["setRoleModuleAccess"] = (roleId, module, enabled) => {
    setState((s) => ({
      ...s,
      roles: s.roles.map((r) => {
        if (r.id !== roleId) return r;
        const modulePermissions = { ...r.modulePermissions };
        if (enabled) {
          // Grant minimal access if the module isn't already enabled; keep existing permissions otherwise.
          if (!modulePermissions[module]?.length) modulePermissions[module] = ["Read"];
        } else {
          delete modulePermissions[module];
        }
        return { ...r, modulePermissions };
      }),
    }));
  };

  // ---- Users ----
  const addUser: UserManagementContextType["addUser"] = (user) => {
    const newUser: User = { ...user, id: genId(), status: "Active" };
    setState((s) => ({ ...s, users: [...s.users, newUser] }));
    return newUser;
  };
  const updateUser: UserManagementContextType["updateUser"] = (id, user) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...user, id } : u)) }));
  };
  const toggleUserStatus: UserManagementContextType["toggleUserStatus"] = (id) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      ),
    }));
  };

  // ---- Groups ----
  const addGroup: UserManagementContextType["addGroup"] = (group) => {
    const newGroup: Group = { ...group, id: genId() };
    setState((s) => ({ ...s, groups: [...s.groups, newGroup] }));
    return newGroup;
  };
  const updateGroup: UserManagementContextType["updateGroup"] = (id, group) => {
    setState((s) => ({ ...s, groups: s.groups.map((g) => (g.id === id ? { ...group, id } : g)) }));
  };
  const deleteGroup: UserManagementContextType["deleteGroup"] = (id) => {
    setState((s) => ({ ...s, groups: s.groups.filter((g) => g.id !== id) }));
  };
  const findGroupByName: UserManagementContextType["findGroupByName"] = (name) =>
    state.groups.find((g) => g.name.trim().toLowerCase() === name.trim().toLowerCase());

  // ---- Assignments ----
  const assignUsersToGroup: UserManagementContextType["assignUsersToGroup"] = (userIds, groupIds) => {
    setState((s) => ({
      ...s,
      groups: s.groups.map((g) =>
        groupIds.includes(g.id)
          ? { ...g, memberIds: Array.from(new Set([...g.memberIds, ...userIds])) }
          : g
      ),
    }));
  };

  return (
    <UserManagementContext.Provider
      value={{
        ...state,
        addRole,
        updateRole,
        deleteRole,
        findRoleByName,
        setRoleModuleAccess,
        addUser,
        updateUser,
        toggleUserStatus,
        addGroup,
        updateGroup,
        deleteGroup,
        findGroupByName,
        assignUsersToGroup,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const ctx = useContext(UserManagementContext);
  if (!ctx) throw new Error("useUserManagement must be used within a UserManagementProvider");
  return ctx;
};
