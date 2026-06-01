import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import { fetchProjectArchives } from "../dashboardSlice";
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

const ProjectArchives = () => {
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
        fetchProjectArchives({
          page: 1,
          size: 10,
          search: "",
          userDetails:userRole,
        })
      ).unwrap();

      const normalizedData = normalizeKeysAndCleanData(result);

      let filteredList = normalizedData.list || [];

      const updatedColumns = enhanceColumns(
        normalizedData.columns || []
      );

      const updatedList = enhanceList(filteredList);

      setData({
        list: updatedList,
        columns: updatedColumns,
        pagination: normalizedData.pagination,
      });
    } catch (err) {
      console.error("Error fetching archives:", err);
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
      const normalizedItem: any = {};
      Object.keys(item).forEach((key) => {
        if (!unwantedKeys.has(key)) {
          normalizedItem[key] = item[key];
        }
      });
      return normalizedItem;
    });

    const normalizedColumns = (columns || []).filter(
      (column: any) => !unwantedKeys.has(column.key)
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

      // ✅ Date detection
      isDate: [
        "createddate",
        "updateddate",
        "createdat",
        "updatedat",
        "archivedat",
      ].includes(column.key?.toLowerCase()),

      // ✅ Hide unwanted columns
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

      // ✅ Attachments UI
      attachment: item.attachment?.length ? (
        <div>
          {item.attachment.map((file: string, i: number) => (
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

export default ProjectArchives;