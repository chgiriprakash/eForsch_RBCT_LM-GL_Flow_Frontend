import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import DynamicTable from "../../../shared/components/DynamicTable";
import { getArchievesList } from "../dashboardSlice";
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

const Archieves = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchArchieves();
  }, []);

  const fetchArchieves = async () => {
    setLocalLoading(true);
    setFetchError(null);
    try {
      const result = await dispatch(getArchievesList(userRole)).unwrap();

      // ✅ Correct API structure: result.data.list
      const normalizedData = normalizeKeysAndCleanData(result.data);

      const updatedColumns = enhanceColumns(
        normalizedData.columns || [],
        userRole
      );

      const updatedList = enhanceList(
        normalizedData.list || [],
        userRole
      );

      setData({
        list: updatedList,
        columns: updatedColumns,
        pagination: normalizedData.pagination,
      });

    } catch (err: any) {
      console.error("Error fetching archives:", err);
      setFetchError(err?.message || JSON.stringify(err) || "Failed to load archives");
    } finally {
      setLocalLoading(false);
    }
  };

  const normalizeKeysAndCleanData = (data: any) => {
    const { list = [], columns = [], pagination = {} } = data;

    const spellingCorrections: Record<string, string> = {
      recieved: "received",
    };

    const unwantedKeys = new Set([
      "adminName",
      "userName",
      "createdBy",
      "updatedBy",
      "expiryDate",
    ]);

    const keyMapping: Record<string, string> = {};
    columns.forEach((column: any) => {
      const correctedKey = spellingCorrections[column.key] || column.key;
      keyMapping[column.key.toLowerCase()] = correctedKey;
    });

    const normalizedList = list.map((item: any) => {
      const normalizedItem: any = {};
      Object.keys(item).forEach((key) => {
        const normalizedKey =
          keyMapping[key.toLowerCase()] ||
          spellingCorrections[key] ||
          key;

        if (!unwantedKeys.has(normalizedKey)) {
          normalizedItem[normalizedKey] = item[key];
        }
      });
      return normalizedItem;
    });

    const seenKeys = new Set();
    const normalizedColumns = columns
      .map((column: any) => ({
        ...column,
        key: spellingCorrections[column.key] || column.key,
      }))
      .filter((column: any) => !unwantedKeys.has(column.key))
      .filter((column: any) => {
        if (seenKeys.has(column.key)) return false;
        seenKeys.add(column.key);
        return true;
      });

    return {
      list: normalizedList,
      columns: normalizedColumns,
      pagination,
    };
  };

  const enhanceColumns = (columns: any, userRole: any) => {
    console.log("Enhancing columns for role:", userRole);
    return columns.map((column: any) => ({
      ...column,
      isDate: [
        "orderdate",
        "approvalstatusdate",
        "createdat",
        "updatedat",
        "archivedat",
      ].includes(column.key?.toLowerCase()),
      hidden: column.key.toLowerCase() === "orderid",
    }));
  };

  const enhanceList = (list: any, userRole: any) => {
    console.log("Enhancing columns for role:", userRole);
    return list.map((item: any) => ({
      ...item,
      fileName: item.fileName ? (
        item.fileName
      ) : (
        <i className="fa fa-paperclip"></i>
      ),
      adminApproved: item.adminApproved ? (
        <i className="fa fa-check-circle text-success"></i>
      ) : (
        <i className="fa fa-times-circle text-danger"></i>
      ),
      labApproved: item.labApproved ? (
        <i className="fa fa-check-circle text-success"></i>
      ) : (
        <i className="fa fa-times-circle text-danger"></i>
      ),
      inventoryType: item.inventoryType ? (
        item.inventoryType.toLowerCase().trim() === "generalinventory" ? (
          <i className="fa fa-flask text-primary"></i>
        ) : (
          <i className="fa fa-flask text-warning"></i>
        )
      ) : (
        <i className="fa fa-question-circle text-danger"></i>
      ),
    }));
  };

  return (
    <>
      {fetchError && <p style={{ color: "red" }}>Error: {fetchError}</p>}

     {!localLoading && data ? (
        <DynamicTable
          data={data.list || []}
          columns={data.columns || []}
          pagination={data.pagination}
        />
      ) : localLoading ? (
        <p>Loading...</p>
      ) : (
        <p>No archive data available.</p>
      )}
    </>
  );
};

export default Archieves;

