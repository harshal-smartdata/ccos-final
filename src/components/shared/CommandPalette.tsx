import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileText,
  AlertTriangle,
  History,
  Search,
  LayoutDashboard,
  Users,
  Box,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const toggle = () => setOpen((open) => !open);

    document.addEventListener("keydown", down);
    window.addEventListener("toggle-command-palette", toggle as any);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("toggle-command-palette", toggle as any);
    };
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/cads"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>CAD Listing</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/adjustments"))}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Discrepancy List</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/customs-data"))}>
            <Box className="mr-2 h-4 w-4" />
            <span>Customs Data Intake</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent CADs">
          <CommandItem onSelect={() => runCommand(() => navigate("/cads/CAD-2024-0891"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>CAD-2024-0891 (Client 4)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/cads/CAD-2024-0890"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>CAD-2024-0890 (Client 2)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Clients">
          <CommandItem onSelect={() => runCommand(() => navigate("/clients/1"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Client 1 (C1-001)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/clients/2"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Client 2 (C2-002)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Management">
          <CommandItem onSelect={() => runCommand(() => navigate("/clients"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>All Clients</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/suppliers"))}>
            <User className="mr-2 h-4 w-4" />
            <span>All Suppliers</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
