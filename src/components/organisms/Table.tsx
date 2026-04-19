import React, { useMemo, useState } from "react";
import { Checkbox, Input, Table as HeroTable } from "@heroui/react";

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

interface SortConfig<T> {
  key: keyof T;
  direction: "asc" | "desc";
}

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  sortable = false,
  pagination = false,
  pageSize = 10,
  searchable = false,
  selectable = false,
  onRowClick,
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (key: keyof T) => {
    if (!sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleRowSelection = (index: number, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(index);
    } else {
      newSelection.delete(index);
    }
    setSelectedRows(newSelection);

    if (onSelectionChange) {
      const selectedData = Array.from(newSelection).map((i) => data[i]);
      onSelectionChange(selectedData);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(paginatedData.map((_, index) => index));
      setSelectedRows(allIndices);
      if (onSelectionChange) {
        onSelectionChange(paginatedData);
      }
    } else {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const renderCell = (column: Column<T>, row: T) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return String(value ?? "");
  };

  if (loading) {
    return (
      <div
        className={`rounded-2xl border border-border bg-surface ${className}`}
      >
        <div className="p-8 text-center text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface ${className}`}>
      {(searchable || selectable) && (
        <div className="p-4 border-b border-border/60 bg-surface-secondary">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {selectable && selectedRows.size > 0 && (
              <div className="text-sm text-muted">
                {selectedRows.size} item(s) selected
              </div>
            )}
          </div>
        </div>
      )}

      <HeroTable>
        <HeroTable.ScrollContainer>
          <HeroTable.Content aria-label="Data table" className="min-w-[640px]">
            <HeroTable.Header>
              {selectable && (
                <HeroTable.Column>
                  <Checkbox
                    isSelected={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={(checked) => handleSelectAll(checked)}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox>
                </HeroTable.Column>
              )}
              {columns.map((column) => {
                const alignmentClass =
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                      ? "text-right"
                      : "text-left";
                return (
                  <HeroTable.Column
                    key={String(column.key)}
                    className={alignmentClass}
                    style={{ width: column.width }}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={`inline-flex items-center gap-2 ${alignmentClass}`}
                      >
                        {column.header}
                      </button>
                    ) : (
                      column.header
                    )}
                  </HeroTable.Column>
                );
              })}
            </HeroTable.Header>
            <HeroTable.Body>
              {paginatedData.length === 0 ? (
                <HeroTable.Row>
                  <HeroTable.Cell
                    colSpan={columns.length + (selectable ? 1 : 0)}
                  >
                    <div className="p-6 text-center text-muted">
                      {emptyMessage}
                    </div>
                  </HeroTable.Cell>
                </HeroTable.Row>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <HeroTable.Row
                    key={`row-${rowIndex}`}
                    onPress={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <HeroTable.Cell>
                        <Checkbox
                          isSelected={selectedRows.has(rowIndex)}
                          onChange={(checked) =>
                            handleRowSelection(rowIndex, checked)
                          }
                        >
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                        </Checkbox>
                      </HeroTable.Cell>
                    )}
                    {columns.map((column) => (
                      <HeroTable.Cell key={`${rowIndex}-${String(column.key)}`}>
                        {renderCell(column, row)}
                      </HeroTable.Cell>
                    ))}
                  </HeroTable.Row>
                ))
              )}
            </HeroTable.Body>
          </HeroTable.Content>
        </HeroTable.ScrollContainer>
      </HeroTable>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border/60 bg-surface-secondary text-sm">
          <span className="text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
