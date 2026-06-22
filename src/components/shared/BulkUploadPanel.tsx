import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from "lucide-react";

interface BulkUploadPanelProps {
  entityName: string;
  templateColumns: string[];
  sampleRows: string[][];
  onBack: () => void;
}

const BulkUploadPanel = ({ entityName, templateColumns, sampleRows, onBack }: BulkUploadPanelProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<{ name: string; rows: number } | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "done">("upload");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setFile({ name: `${entityName.toLowerCase()}_import.csv`, rows: 24 });
    setStep("preview");
  };

  const simulateUpload = () => {
    setFile({ name: `${entityName.toLowerCase()}_import.csv`, rows: 24 });
    setStep("preview");
  };

  const simulateProcess = () => {
    setStep("processing");
    setTimeout(() => setStep("done"), 1500);
  };

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <>
          {/* Download template */}
          <div className="bg-accent/50 rounded-xl border border-border p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Download CSV Template</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use this template to format your {entityName.toLowerCase()} data correctly.</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Template
            </Button>
          </div>

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-1">Upload {entityName} CSV</h3>
            <p className="text-sm text-muted-foreground mb-4">Drag & drop your CSV file here, or click to browse</p>
            <Button variant="outline" onClick={simulateUpload}>Select File</Button>
          </div>

          {/* Expected columns */}
          <div className="bg-card rounded-xl border shadow-sm p-5">
            <h4 className="text-sm font-semibold mb-3">Expected Columns</h4>
            <div className="flex flex-wrap gap-2">
              {templateColumns.map((col) => (
                <span key={col} className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium">{col}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "preview" && file && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.rows} records detected</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setStep("upload"); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Validation summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-700">21</p>
              <p className="text-xs text-emerald-600">Valid</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-700">2</p>
              <p className="text-xs text-amber-600">Warnings</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-700">1</p>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b">
              <h4 className="text-sm font-semibold">Data Preview</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th className="w-10">#</th>
                    {templateColumns.map((col) => <th key={col}>{col}</th>)}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, i) => (
                    <tr key={i} className={i === 2 ? "bg-red-50" : ""}>
                      <td className="text-muted-foreground">{i + 1}</td>
                      {row.map((cell, j) => <td key={j}>{cell}</td>)}
                      <td>
                        {i === 2 ? (
                          <span className="text-xs text-red-600 font-medium">Duplicate</span>
                        ) : i === 1 ? (
                          <span className="text-xs text-amber-600 font-medium">Warning</span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Valid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setFile(null); setStep("upload"); }}>Cancel</Button>
            <Button onClick={simulateProcess}>
              <Upload className="h-4 w-4 mr-1" /> Import {file.rows} Records
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-base font-semibold mb-1">Processing Upload...</h3>
          <p className="text-sm text-muted-foreground">Validating and importing records.</p>
        </div>
      )}

      {step === "done" && (
        <div className="bg-card rounded-xl border shadow-sm p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-base font-semibold mb-1">Import Complete</h3>
          <p className="text-sm text-muted-foreground mb-4">21 {entityName.toLowerCase()} records imported, 2 warnings, 1 skipped.</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); }}>Upload Another</Button>
            <Button onClick={onBack}>View {entityName}s</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadPanel;
