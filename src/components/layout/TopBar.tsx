import { Search, Bell, LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";

const roleLabels: Record<UserRole, string> = {
  consultant: "Consultant",
  manager: "Manager",
  client: "Client Portal",
  admin: "Administrator",
};

const roleColors: Record<UserRole, string> = {
  consultant: "bg-primary/10 text-primary",
  manager: "bg-emerald-50 text-emerald-700",
  client: "bg-amber-50 text-amber-700",
  admin: "bg-red-50 text-red-700",
};

export const TopBar = () => {
  const { role, setIsAuthenticated, userName } = useRole();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-command-palette'))}
          className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 w-80 cursor-pointer hover:bg-secondary/80 transition-colors group"
        >
          <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="text-sm text-muted-foreground w-full">
            Search clients, CADs, tasks...
          </div>
          <kbd className="hidden sm:inline text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Logout (formerly Role switcher) */}
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs font-medium px-3 py-1.5 rounded-full hover:bg-secondary border border-border flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
          Log out
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {userName.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
