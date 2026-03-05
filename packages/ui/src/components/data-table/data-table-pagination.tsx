import type { Table } from "@tanstack/react-table";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

interface DataTablePaginationProps<TData> extends Omit<ComponentProps<"div">, "children"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-2 py-4 text-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>표시</span>
        <select
          className={cn(
            "h-8 rounded-md border border-border bg-background px-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}개
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 text-muted-foreground">
        <span>
          {pageCount > 0 ? pageIndex + 1 : 0} / {pageCount} 페이지
        </span>
      </div>

      <div className="flex items-center gap-1">
        <PaginationButton
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="첫 페이지"
        >
          <ChevronDoubleLeftIcon />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="이전 페이지"
        >
          <ChevronLeftIcon />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="다음 페이지"
        >
          <ChevronRightIcon />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label="마지막 페이지"
        >
          <ChevronDoubleRightIcon />
        </PaginationButton>
      </div>
    </div>
  );
}

function PaginationButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDoubleLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 12L4 8L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12L8 8L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDoubleRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L8 8L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4L12 8L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

DataTablePagination.displayName = "DataTablePagination";

export { DataTablePagination };
export type { DataTablePaginationProps };