import { Fragment, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChevronLeft, ChevronRight, MoreHorizontal, ArrowLeft, Upload, Download } from "lucide-react";
import { downloadCsvTemplate } from "@/components/shared/BulkUploadPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Single back button + breadcrumb trail. Back always goes up one level. */
export const ScreenHeader = ({ onBack, trail }: { onBack: () => void; trail: string[] }) => (
  <div className="flex items-center gap-3 mb-4">
    <Button variant="outline" size="sm" onClick={onBack}>
      <ArrowLeft className="h-4 w-4 mr-1" /> Back
    </Button>
    <nav className="flex items-center text-sm">
      {trail.map((seg, i) => (
        <Fragment key={seg + i}>
          {i > 0 && <span className="mx-1.5 text-muted-foreground">/</span>}
          <span className={i === trail.length - 1 ? "font-semibold" : "text-muted-foreground"}>{seg}</span>
        </Fragment>
      ))}
    </nav>
  </div>
);

interface ListShellProps {
  title: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Optional extra buttons rendered before the primary Add button. */
  headerActions?: ReactNode;
  children: ReactNode;
}

export const ListShell = ({
  title,
  count,
  addLabel,
  onAdd,
  search,
  onSearchChange,
  page,
  pageCount,
  onPageChange,
  headerActions,
  children,
}: ListShellProps) => {
  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Summary header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-secondary/40">
        <h2 className="text-sm font-semibold">
          {title} <span className="text-muted-foreground font-normal">({count})</span>
        </h2>
        <div className="flex items-center gap-2">
          {headerActions}
          <Button size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" /> {addLabel}
          </Button>
        </div>
      </div>

      {/* Toolbar: search + pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-background border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Search..."
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="whitespace-nowrap">
            Page {pageCount === 0 ? 0 : page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export const RowActions = ({ actions }: { actions: RowAction[] }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8" title="Actions">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {actions.map((a) => (
        <DropdownMenuItem
          key={a.label}
          onClick={a.onClick}
          className={a.destructive ? "text-destructive focus:text-destructive" : ""}
        >
          <span className="mr-2 flex h-4 w-4 items-center justify-center">{a.icon}</span>
          {a.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const PAGE_SIZE = 8;

/** Template-download + bulk-upload buttons for a list header (pass as ListShell `headerActions`). */
export const BulkActions = ({
  entityName,
  columns,
  rows,
  onBulkUpload,
}: {
  entityName: string;
  columns: string[];
  rows: string[][];
  onBulkUpload: () => void;
}) => (
  <>
    <Button variant="outline" size="sm" onClick={() => downloadCsvTemplate(entityName, columns, rows)}>
      <Download className="h-4 w-4 mr-1" /> Template
    </Button>
    <Button variant="outline" size="sm" onClick={onBulkUpload}>
      <Upload className="h-4 w-4 mr-1" /> Bulk Upload
    </Button>
  </>
);
