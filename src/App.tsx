import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole, type UserRole } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login.tsx";
import Index from "./pages/Index.tsx";
import ClientsPage from "./pages/ClientsPage.tsx";
import ClientForm from "./pages/ClientForm.tsx";
import ClientDetail from "./pages/ClientDetail.tsx";
import SuppliersPage from "./pages/SuppliersPage.tsx";
import SupplierForm from "./pages/SupplierForm.tsx";
import SupplierDetail from "./pages/SupplierDetail.tsx";
import InteractionsPage from "./pages/InteractionsPage.tsx";
import InteractionForm from "./pages/InteractionForm.tsx";
import CADsPage from "./pages/CADsPage.tsx";
import CADForm from "./pages/CADForm.tsx";
import CADDetail from "./pages/CADDetail.tsx";
import AdjustmentsPage from "./pages/AdjustmentsPage.tsx";
import AdjustmentForm from "./pages/AdjustmentForm.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import TaskForm from "./pages/TaskForm.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import BillingPage from "./pages/BillingPage.tsx";
import BillingForm from "./pages/BillingForm.tsx";
import CustomsDataPage from "./pages/CustomsDataPage.tsx";
import AdminPage from "./pages/AdminPage.tsx";
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
        <Route path="/" element={<Index />} />
        
        {/* Clients */}
        <Route path="/clients" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><ClientsPage /></ProtectedRoute>} />
        <Route path="/clients/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><ClientForm /></ProtectedRoute>} />
        <Route path="/clients/:id" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><ClientDetail /></ProtectedRoute>} />
        <Route path="/clients/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><ClientForm /></ProtectedRoute>} />
        
        {/* Suppliers */}
        <Route path="/suppliers" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><SuppliersPage /></ProtectedRoute>} />
        <Route path="/suppliers/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><SupplierForm /></ProtectedRoute>} />
        <Route path="/suppliers/:id" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><SupplierDetail /></ProtectedRoute>} />
        <Route path="/suppliers/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><SupplierForm /></ProtectedRoute>} />
        
        {/* Interactions */}
        <Route path="/interactions" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><InteractionsPage /></ProtectedRoute>} />
        <Route path="/interactions/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><InteractionForm /></ProtectedRoute>} />
        <Route path="/interactions/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><InteractionForm /></ProtectedRoute>} />
        
        {/* CADs */}
        <Route path="/cads" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><CADsPage /></ProtectedRoute>} />
        <Route path="/cads/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><CADForm /></ProtectedRoute>} />
        <Route path="/cads/:id" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><CADDetail /></ProtectedRoute>} />
        <Route path="/cads/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><CADForm /></ProtectedRoute>} />
        
        {/* Adjustments */}
        <Route path="/adjustments" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><AdjustmentsPage /></ProtectedRoute>} />
        <Route path="/adjustments/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><AdjustmentForm /></ProtectedRoute>} />
        <Route path="/adjustments/:id" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><AdjustmentForm /></ProtectedRoute>} />
        <Route path="/adjustments/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><AdjustmentForm /></ProtectedRoute>} />
        <Route path="/cad/:id/adjust" element={<ProtectedRoute allowedRoles={["consultant", "manager", "client", "admin"]}><AdjustmentForm /></ProtectedRoute>} />
        
        {/* Tasks */}
        <Route path="/tasks" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><TasksPage /></ProtectedRoute>} />
        <Route path="/tasks/new" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><TaskForm /></ProtectedRoute>} />
        <Route path="/tasks/:id/edit" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><TaskForm /></ProtectedRoute>} />
        
        {/* Billing */}
        <Route path="/billing" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><BillingPage /></ProtectedRoute>} />
        <Route path="/billing/new" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><BillingForm /></ProtectedRoute>} />
        <Route path="/billing/:id/edit" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><BillingForm /></ProtectedRoute>} />
        
        
        {/* Other */}
        <Route path="/customs-data" element={<ProtectedRoute allowedRoles={["consultant", "manager", "admin"]}><CustomsDataPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={["manager", "admin"]}><ReportsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

import { NavigationProvider } from "@/contexts/NavigationContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RoleProvider>
        <NavigationProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </NavigationProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
