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

const DynamicTable = <T extends Record<string, any>>({
  data = [],
  columns = [],
  // pagination,
  dateFormat = { year: "numeric", month: "long", day: "numeric" },
}: Props<T>) => {
  console.log("DynamicTable - dateFormat:", dateFormat);
  const userRole = JSON.parse(localStorage.getItem('user') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  // const [startDate, setStartDate] = useState<string>("");
  // const [endDate, setEndDate] = useState<string>("");

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  console.log("DynamicTable - totalPages:", totalPages);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
      console.log("DynamicTable - sort values - aValue:", aValue, "bValue:", bValue);

      if (sortColumn === "date") {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        console.log("DynamicTable - date sort - dateA:", dateA, "dateB:", dateB);
        return sortDirection === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const filteredData = sortedData.filter((row) =>
    Object.values(row).some((value) => value?.toString().toLowerCase().includes(searchQuery))
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="table-wrapper">
      <div className="table-controls">
        <div className="search-box">
          <label className="col-form-label label">Search</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            className="input"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="table-container scrollable-container">
        <table className="table-hover dynamic-table">
          <thead>
            <tr>
              {columns
              .filter((col) => !col.hidden) // 👈 skip hidden columns
              .map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)}>
                  <div className="column-header">{col.label}</div>
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
                      ? row.status !== "Pending"
                        ? "podeptGreen"
                        : "podept"
                      : ''
                  }
                >
                  {columns.filter((col) => !col.hidden).map((col) => {
                    const value = row[col.key];

                    return (
                     <td
                        key={col.key}
                        onClick={() => col.onClick?.(row)}
                        className={
                          (col.key === "productname" ||
                            col.key === "productName" ||
                            col.key === "request" ||
                            col.key === "fileName") && col.onClick
                            ? "clickable"
                            : ""
                        }
                      >
                        {col.isDate ? (
                          new Date(value).toLocaleDateString("en-GB")
                        ) : (() => {
                          let parsedArray: string[] = [];

                          if (Array.isArray(value)) {
                            parsedArray = value;
                          } else if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
                            try {
                              parsedArray = JSON.parse(value);
                            } catch (e) {
                              parsedArray = [];
                            }
                          }

                          return parsedArray.length ? (
                            <div className="ghs-array">
                              {parsedArray.map((item: string, idx: number) => (
                                <span
                                  key={idx}
                                  style={{ marginRight: "8px", display: "inline-flex", alignItems: "center" }}
                                >
                                  {ghsImageMap[item] && (
                                    <img
                                      src={ghsImageMap[item]}
                                      alt={item}
                                      title={item}
                                      style={{ width: "24px", height: "24px", marginRight: "4px" }}
                                    />
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
                <td colSpan={columns.length} className="no-data">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-controls">
        <div className="rows-per-page">
          <label className="col-form-label label">Row:</label>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            {[5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
