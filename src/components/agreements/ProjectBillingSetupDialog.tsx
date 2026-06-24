import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Project } from "@/contexts/AgreementContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

interface Props {
  open: boolean;
  project: Project | null;
  onSave: (patch: Partial<Project>) => void;
  onClose: () => void;
}

export const ProjectBillingSetupDialog = ({ open, project, onSave, onClose }: Props) => {
  const [form, setForm] = useState({
    billingType: "",
    billingRate: "",
    billingEstimate: "",
    allocatedHours: "",
    allocatedBudget: "",
  });

  useEffect(() => {
    if (project) {
      setForm({
        billingType: project.billingType ?? "",
        billingRate: project.billingRate?.toString() ?? "",
        billingEstimate: project.billingEstimate?.toString() ?? "",
        allocatedHours: project.allocatedHours?.toString() ?? "",
        allocatedBudget: project.allocatedBudget?.toString() ?? "",
      });
    }
  }, [project]);

  const num = (v: string) => (v === "" ? undefined : Number(v));
  const save = () => {
    onSave({
      billingType: form.billingType || undefined,
      billingRate: num(form.billingRate),
      billingEstimate: num(form.billingEstimate),
      allocatedHours: num(form.allocatedHours),
      allocatedBudget: num(form.allocatedBudget),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Billing Setup</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Billing Type</label>
            <input className={FIELD} value={form.billingType} onChange={(e) => setForm({ ...form, billingType: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Billing Rate</label>
              <input type="number" className={FIELD} value={form.billingRate} onChange={(e) => setForm({ ...form, billingRate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Billing Estimate</label>
              <input type="number" className={FIELD} value={form.billingEstimate} onChange={(e) => setForm({ ...form, billingEstimate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Allocated Hours</label>
              <input type="number" className={FIELD} value={form.allocatedHours} onChange={(e) => setForm({ ...form, allocatedHours: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Allocated Budget</label>
              <input type="number" className={FIELD} value={form.allocatedBudget} onChange={(e) => setForm({ ...form, allocatedBudget: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectBillingSetupDialog;
