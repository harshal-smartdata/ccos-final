import { useRole } from "@/contexts/RoleContext";
import { ConsultantDashboard } from "@/components/dashboards/ConsultantDashboard";
import { ManagerDashboard } from "@/components/dashboards/ManagerDashboard";
import { ClientDashboard } from "@/components/dashboards/ClientDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";

const Index = () => {
  const { role } = useRole();

  switch (role) {
    case "consultant":
      return <ConsultantDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "client":
      return <ClientDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <ConsultantDashboard />;
  }
};

export default Index;
