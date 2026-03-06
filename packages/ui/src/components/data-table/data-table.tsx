import {
  type ColumnDef,
  type SortingState,
  type Table as TableInstance,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ComponentProps, useState } from "react";
import { cn } from "../../lib/cn";
import { SortAsc, SortDesc, SortDefault } from "../icons";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData> extends Omit<ComponentProps<"div">, "children"> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <SortAsc size={12} className="ml-1 inline-block" />;
  }
  if (direction === "desc") {
    return <SortDesc size={12} className="ml-1 inline-block" />;
  }
  return <SortDefault size={12} className="ml-1 inline-block opacity-30" />;
}

function DataTable<TData>({
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다",
  pagination = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  className,
  ...props
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } },
    }),
  });

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="relative overflow-auto rounded-lg border border-table-border shadow-sm">
        {loading && <LoadingOverlay />}
        <table className="w-full caption-bottom text-sm">
          <TableHeader table={table} />
          <TableBody
            table={table}
            colCount={columns.length}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        </table>
      </div>
      {pagination && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

function TableHeader<TData>({ table }: { table: TableInstance<TData> }) {
  return (
    <thead className="bg-table-header border-b border-table-header-border">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            return (
              <th
                key={header.id}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-table-header-foreground",
                  canSort && "cursor-pointer select-none",
                )}
                onClick={header.column.getToggleSortingHandler()}
              >
                {header.isPlaceholder ? null : (
                  <span className="inline-flex items-center">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {canSort && <SortIcon direction={header.column.getIsSorted()} />}
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

function TableBody<TData>({
  table,
  colCount,
  loading,
  emptyMessage,
}: {
  table: TableInstance<TData>;
  colCount: number;
  loading: boolean;
  emptyMessage: string;
}) {
  const rows = table.getRowModel().rows;

  if (!loading && rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={colCount}
            className="px-4 py-12 text-center text-sm text-muted-foreground"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((row) => (
        <tr
          key={row.id}
          className="border-b border-table-border transition-colors hover:bg-table-row-hover"
        >
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-4 py-3 text-sm">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

DataTable.displayName = "DataTable";

export { DataTable };
export type { DataTableProps };