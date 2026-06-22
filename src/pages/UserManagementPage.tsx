import { useState } from "react";
import { ChevronRight, ShieldCheck, Users, FolderKanban } from "lucide-react";
import Step1Roles from "@/components/user-management/Step1Roles";
import Step2UserProfiles from "@/components/user-management/Step2UserProfiles";
import Step3Groups from "@/components/user-management/Step3Groups";
import { useUserManagement } from "@/contexts/UserManagementContext";

type View = "hub" | "roles" | "users" | "groups";

const UserManagementPage = () => {
  const { roles, users, groups } = useUserManagement();
  const [view, setView] = useState<View>("hub");

  const cards: {
    id: Exclude<View, "hub">;
    title: string;
    description: string;
    count: number;
    icon: typeof ShieldCheck;
    accent: string;
  }[] = [
    {
      id: "roles",
      title: "Roles",
      description: "Define roles with permissions and module access.",
      count: roles.length,
      icon: ShieldCheck,
      accent: "bg-primary/10 text-primary",
    },
    {
      id: "users",
      title: "Users",
      description: "Create and manage user profiles and their roles.",
      count: users.length,
      icon: Users,
      accent: "bg-primary/10 text-primary",
    },
    {
      id: "groups",
      title: "Groups",
      description: "Organise groups and add users to them.",
      count: groups.length,
      icon: FolderKanban,
      accent: "bg-primary/10 text-primary",
    },
  ];

  const backToHub = () => setView("hub");
  const screens: Record<Exclude<View, "hub">, JSX.Element> = {
    roles: <Step1Roles onBack={backToHub} />,
    users: <Step2UserProfiles onBack={backToHub} />,
    groups: <Step3Groups onBack={backToHub} />,
  };

  return (
    <div className="w-full pb-8">
      {view === "hub" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {cards.map((card) => {
            return (
              <button
                key={card.id}
                onClick={() => setView(card.id)}
                className="group bg-card rounded-xl border border-b-4 border-b-primary shadow-sm p-4 min-h-[110px] flex items-center justify-center hover:shadow-md transition-all"
              >
                <h3 className="text-base font-semibold text-center">{card.title}</h3>
              </button>
            );
          })}
        </div>
      ) : (
        screens[view]
      )}
    </div>
  );
};

export default UserManagementPage;
