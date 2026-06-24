import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldSelect from "@/components/agreements/FieldSelect";
import {
  type DataSource,
  type DataSourceKind,
  type DataSourceStatus,
  emptyDataSource,
} from "@/contexts/OnboardingContext";

const FIELD =
  "w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

const KIND_OPTIONS: { value: DataSourceKind; label: string }[] = [
  { value: "OnboardingForm", label: "Onboarding Form" },
  { value: "CARM", label: "CARM Portal Access" },
  { value: "BrokerRecords", label: "Customs Broker Records" },
  { value: "CADReport", label: "CAD Report (CBSA)" },
  { value: "ImportData", label: "Import Data" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS: DataSourceStatus[] = ["Requested", "Received", "Validated"];

interface Props {
  dataSources: DataSource[];
  onChange: (dataSources: DataSource[]) => void;
}

/** A4.9–A4.11 — track data sources (CARM, broker records, CAD report, additional) and their status. */
export const DataSourcesEditor = ({ dataSources, onChange }: Props) => {
  const update = (id: string, patch: Partial<DataSource>) =>
    onChange(dataSources.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const add = () => onChange([...dataSources, emptyDataSource()]);
  const remove = (id: string) => onChange(dataSources.filter((d) => d.id !== id));

  return (
    <div className="space-y-2">
      {dataSources.length === 0 && (
        <p className="text-sm text-muted-foreground">No data sources added yet.</p>
      )}
      {dataSources.map((d) => (
        <div key={d.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-2">
          <input
            className={FIELD}
            value={d.label}
            placeholder="Data source label"
            onChange={(e) => update(d.id, { label: e.target.value })}
          />
          <FieldSelect
            value={d.kind}
            onChange={(v) => update(d.id, { kind: v as DataSourceKind })}
            options={KIND_OPTIONS}
            className="w-44"
          />
          <FieldSelect
            value={d.status}
            onChange={(v) => update(d.id, { status: v as DataSourceStatus })}
            options={STATUS_OPTIONS}
            className="w-36"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(d.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add data source
      </Button>
    </div>
  );
};

export default DataSourcesEditor;
