import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import { archivesNotebook } from "../dashboardSlice";
import { JSX } from "react/jsx-runtime";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
  hidden: any;
  render?: (row: any) => JSX.Element;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface ProductListResponse {
  list: any[];
  columns: Column[];
  pagination: Pagination;
}

const NoteBookArchieves = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState<ProductListResponse | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    fetchArchieves();
  }, [dispatch]);

const fetchArchieves = async () => {

  try {

    const result = await dispatch(
      archivesNotebook({

        page: 1,
        size: 1000,

        // ✅ swagger required headers
        userId: userRole?.id,
        groupName: userRole?.groupName,
        role: userRole?.role,
      })
    ).unwrap();

    const normalizedData =
      normalizeKeysAndCleanData(result);

    const updatedColumns =
      enhanceColumns(
        normalizedData.columns || []
      );

    const updatedList =
      enhanceList(
        normalizedData.list || []
      );

    setData({
      list: updatedList,

      columns: updatedColumns,

      pagination:
        normalizedData.pagination,
    });

  } catch (err) {

    console.error(
      "Error fetching archives:",
      err
    );
  }
};

  // ✅ Normalize API response
  const normalizeKeysAndCleanData = (data: any) => {
    const { data: list, columns, pagination } = data;

    const unwantedKeys = new Set([
      "adminName",
      "userName",
      "createdBy",
      "updatedBy",
      "expiryDate",
    ]);

    const normalizedList = (list || []).map((item: any) => {
      const obj: any = {};
      Object.keys(item).forEach((key) => {
        if (!unwantedKeys.has(key)) {
          obj[key] = item[key];
        }
      });
      return obj;
    });

    const normalizedColumns = (columns || []).filter(
      (col: any) => !unwantedKeys.has(col.key)
    );

    return { list: normalizedList, columns: normalizedColumns, pagination };
  };

  // ✅ Format Date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Enhance Columns
  const enhanceColumns = (columns: any) => {
    return columns.map((column: any) => ({
      ...column,

      isDate: [
        "createddate",
        "updateddate",
        "createdat",
        "updatedat",
        "archivedat",
      ].includes(column.key?.toLowerCase()),

      // ✅ Hide long description
      hidden:
        column.key.toLowerCase().includes("orderid") ||
        column.key.toLowerCase().includes("longdescription"),
    }));
  };

  // ✅ Enhance List
  const enhanceList = (list: any) => {
    return list.map((item: any) => ({
      ...item,

      // ✅ Format Dates
      createdDate: formatDate(item.createdDate || item.createdAt),
      updatedDate: formatDate(item.updatedDate || item.updatedAt),

      // ✅ Attachments (safe UI)
      attachments: item.attachments?.length ? (
        <div style={{ maxWidth: 300, overflowX: "auto" }}>
          {item.attachments.map((file: string, i: number) => (
            <div key={i}><i className="fa fa-paperclip"></i> {file}</div>
          ))}
        </div>
      ) : (
        "-"
      ),
    }));
  };

  return (
    <>
      {error && <p>Error: {error}</p>}

      {!loading && data ? (
          <DynamicTable
            data={data.list || []}
            columns={data.columns || []}
            pagination={data.pagination}
          />
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default NoteBookArchieves;