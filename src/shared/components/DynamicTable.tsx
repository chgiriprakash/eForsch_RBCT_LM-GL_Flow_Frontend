import React, { useState, useMemo } from "react";

interface Column {
  hidden: any;
  key: string;
  label: string;
  sortable?: boolean;
  isDateColumn?: boolean;
  onClick?: (row: any) => void;
  isDate?: boolean;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface Props<T> {
  data: T[];
  columns: Column[];
  pagination: Pagination;
  dateFormat?: Intl.DateTimeFormatOptions;
  onAddClick?: () => void;
  canManage?: boolean;
}

const ghsImageMap: Record<string, string> = {
  "Explosive": "/src/assets/ghs/ghs_001.jpg",
  "Flammable": "/src/assets/ghs/ghs_002.jpg",
  "Oxidizing": "/src/assets/ghs/ghs_003.jpg",
  "Corrosive": "/src/assets/ghs/ghs_005.jpg",
  "Toxic": "/src/assets/ghs/ghs_006.jpg",
  "Harmful": "/src/assets/ghs/ghs_007.jpg",
  "Gas under pressure": "/src/assets/ghs/ghs_008.jpg",
  "Environmental hazard": "/src/assets/ghs/ghs_009.jpg",
};

// ── Smart pagination: max 7 visible buttons with ellipsis ──
const getPageNumbers = (currentPage: number, totalPages: number): (number | "...")[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
  }
  return pages;
};

const DynamicTable = <T extends Record<string, any>>({
  data = [],
  columns = [],
  dateFormat = { year: "numeric", month: "long", day: "numeric" },
}: Props<T>) => {
  const userRole = JSON.parse(localStorage.getItem('user') || '{}');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (sortColumn === "date") {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const filteredData = sortedData.filter((row) =>
    Object.values(row).some((value) =>
      value != null && value.toString().toLowerCase().includes(searchQuery)
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Record count info
  const startRecord = filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredData.length);
  const totalRecords = filteredData.length;

  const visibleColumns = columns.filter((col) => !col.hidden);

  return (
    <div className="dt-wrapper">

      {/* ── Top bar: Search ── */}
      <div className="dt-toolbar">
        <div className="dt-search-box">
          <i className="fa fa-search dt-search-icon" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            className="dt-search-input"
            onChange={(e) => { setSearchQuery(e.target.value.toLowerCase()); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="dt-table-container">
        <table className="dt-table">
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`dt-th ${sortColumn === col.key ? "dt-th-sorted" : ""}`}
                >
                  <div className="dt-th-inner">
                    <span>{col.label}</span>
                    <span className="dt-sort-icon">
                      {sortColumn === col.key
                        ? sortDirection === "asc" ? " ▲" : " ▼"
                        : " ⇅"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={
                    userRole?.role === 'podept'
                      ? row.status !== "Pending" ? "podeptGreen" : "podept"
                      : "dt-row"
                  }
                >
                  {visibleColumns.map((col) => {
                    const value = row[col.key];
                    const isClickable =
                      (col.key === "productname" || col.key === "productName" ||
                       col.key === "projectName" || col.key === "experimentTitle" ||
                       col.key === "request" || col.key === "fileName") && col.onClick;

                    return (
                      <td
                        key={col.key}
                        onClick={() => col.onClick?.(row)}
                        className={isClickable ? "dt-td-link" : "dt-td"}
                      >
                        {col.isDate ? (
                          new Date(value).toLocaleDateString("en-GB", dateFormat)
                        ) : (() => {
                          let parsedArray: string[] = [];
                          if (Array.isArray(value)) {
                            parsedArray = value;
                          } else if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
                            try { parsedArray = JSON.parse(value); } catch (e) { parsedArray = []; }
                          }
                          return parsedArray.length ? (
                            <div className="ghs-array">
                              {parsedArray.map((item: string, idx: number) => (
                                <span key={idx} style={{ marginRight: "8px", display: "inline-flex", alignItems: "center" }}>
                                  {ghsImageMap[item] && (
                                    <img src={ghsImageMap[item]} alt={item} title={item}
                                      style={{ width: "24px", height: "24px", marginRight: "4px" }} />
                                  )}
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            value
                          );
                        })()}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleColumns.length} className="dt-empty">
                  <div className="dt-empty-state">
                    <i className="fa fa-inbox dt-empty-icon" />
                    <p className="dt-empty-text">No records found</p>
                    {searchQuery && (
                      <p className="dt-empty-hint">Try adjusting your search term</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Bottom bar: record count + rows per page + pagination ── */}
      <div className="dt-footer">
        <div className="dt-record-info">
          {totalRecords > 0
            ? `Showing ${startRecord}–${endRecord} of ${totalRecords} records`
            : "No records"}
        </div>

        <div className="dt-rows-select">
          <label>Rows:</label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 15, 20, 50].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="dt-pagination">
          <button
            className="dt-page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ‹ Prev
          </button>

          {getPageNumbers(currentPage, totalPages).map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="dt-ellipsis">…</span>
            ) : (
              <button
                key={page}
                className={`dt-page-btn ${currentPage === page ? "dt-page-active" : ""}`}
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </button>
            )
          )}

          <button
            className="dt-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
