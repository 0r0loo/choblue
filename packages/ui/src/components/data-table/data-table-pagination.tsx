import type { Table } from "@tanstack/react-table";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { ChevronLeft, ChevronRight, ChevronDoubleLeft, ChevronDoubleRight } from "../icons";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../select/select";
export { Select } from "../select/select-context";

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
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px] px-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}개
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <ChevronDoubleLeft size={16} />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={16} />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="다음 페이지"
        >
          <ChevronRight size={16} />
        </PaginationButton>
        <PaginationButton
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
          aria-label="마지막 페이지"
        >
          <ChevronDoubleRight size={16} />
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

DataTablePagination.displayName = "DataTablePagination";

export { DataTablePagination };
export type { DataTablePaginationProps };