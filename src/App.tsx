import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole, type UserRole } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import UserManagementPage from "./pages/UserManagementPage.tsx";
import ClientProfilesPage from "./pages/ClientProfilesPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CommandPalette } from "@/components/shared/CommandPalette";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: UserRole[] }) => {
  const { role } = useRole();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainApp = () => {
  const { isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Navigate to="/client-profiles" replace />} />

        <Route path="/client-profiles" element={<ProtectedRoute allowedRoles={["admin", "manager", "consultant"]}><ClientProfilesPage /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute allowedRoles={["admin"]}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

import { NavigationProvider } from "@/contexts/NavigationContext";
import { UserManagementProvider } from "@/contexts/UserManagementContext";
import { ClientProfileProvider } from "@/contexts/ClientProfileContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <NavigationProvider>
          <UserManagementProvider>
            <ClientProfileProvider>
              <BrowserRouter>
                <MainApp />
              </BrowserRouter>
            </ClientProfileProvider>
          </UserManagementProvider>
        </NavigationProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
