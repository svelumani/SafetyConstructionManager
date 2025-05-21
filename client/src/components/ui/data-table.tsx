import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
  };
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  searchField?: string;
  onSearch?: (value: string) => void;
  searchValue?: string;
}

export function DataTable<T>({
  columns,
  data,
  pagination,
  emptyState,
  isLoading,
  searchField,
  onSearch,
  searchValue,
}: DataTableProps<T>) {
  // State for search input if searchField is provided but no onSearch function
  const [localSearchValue, setLocalSearchValue] = React.useState("");
  const searchQuery = searchValue !== undefined ? searchValue : localSearchValue;

  // Filter data locally if onSearch is not provided but searchField is
  const filteredData = React.useMemo(() => {
    if (!searchField || onSearch || !searchQuery) return data;

    return data.filter((item: any) => {
      const value = item[searchField]?.toString().toLowerCase() || "";
      return value.includes(searchQuery.toLowerCase());
    });
  }, [data, searchField, onSearch, searchQuery]);

  // Handler for local search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearch) {
      onSearch(value);
    } else {
      setLocalSearchValue(value);
    }
  };

  return (
    <div className="w-full">
      {/* Search input if searchField is provided */}
      {searchField && (
        <div className="mb-4">
          <Input
            placeholder={`Search by ${searchField}...`}
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyState || "No results found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell ? column.cell(row) : (row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {pagination && (
        <div className="flex items-center justify-between space-x-4 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, (pagination.pageCount * pagination.pageSize) || 0)}{" "}
            of {pagination.pageCount * pagination.pageSize || "many"} entries
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => {
                  pagination.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => pagination.setPageIndex(0)}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => pagination.setPageIndex(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {pagination.pageIndex + 1} of {Math.max(1, pagination.pageCount)}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => pagination.setPageIndex(pagination.pageIndex + 1)}
                disabled={pagination.pageIndex + 1 >= pagination.pageCount}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => pagination.setPageIndex(pagination.pageCount - 1)}
                disabled={pagination.pageIndex + 1 >= pagination.pageCount}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
