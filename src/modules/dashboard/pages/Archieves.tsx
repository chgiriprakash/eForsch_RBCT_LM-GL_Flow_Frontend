import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import {
  getArchievesList,
  // deleteUsers,
  // deleteArchievesPermenent,
  // fetchOrders,
} from "../dashboardSlice";
// import { useParams } from "react-router-dom";
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

// const defaultPagination: Pagination = {
//   currentPage: 1,
//   pageSize: 10,
//   totalPages: 1,
//   totalRecords: 0,
// };

const Archieves = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  // const { id } = useParams<{ id?: string }>();
  const [data, setData] = useState<ProductListResponse | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    fetchArchieves();
  }, [dispatch]);

  const fetchArchieves = async () => {
    //  const payload = {
    //   "produID": "",
    //   "inventoryType": "fineChemical",
    //   "user": userRole
    // }
    try {
      const result = await dispatch(getArchievesList(userRole)).unwrap();
      // const result = await dispatch(fetchOrders(userRole)).unwrap();
      const normalizedData = normalizeKeysAndCleanData(result.data);
      console.log("Normalized Data:", normalizedData);

      if (result) {
        let filteredList = normalizedData.list || [];

        const updatedColumns = enhanceColumns(normalizedData.columns || [], userRole);
        const updatedList = enhanceList(filteredList, userRole);

        setData({ ...result, columns: updatedColumns, list: updatedList });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const normalizeKeysAndCleanData = (data: any) => { 
    const { list, columns, pagination } = data;

    // Define spelling corrections
    const spellingCorrections: Record<string, string> = {
        recieved: "received", // Correct the spelling error
    };

    // Define keys to remove
    const unwantedKeys = new Set(["adminName", "userName", "createdBy", "updatedBy", "expiryDate"]);

    // Create a mapping of lowercase column keys to their actual keys (after spelling corrections)
    const keyMapping: Record<string, string> = {};
    columns.forEach((column: any) => {
        const correctedKey = spellingCorrections[column.key] || column.key;
        keyMapping[column.key.toLowerCase()] = correctedKey;
    });

    // Normalize keys in the list, fix spelling errors, and remove unwanted keys
    const normalizedList = list.map((item: any) => {
        const normalizedItem: any = {};
        Object.keys(item).forEach((key) => {
            const normalizedKey = keyMapping[key.toLowerCase()] || spellingCorrections[key] || key;
            if (!unwantedKeys.has(normalizedKey)) {
                normalizedItem[normalizedKey] = item[key];
            }
        });
        return normalizedItem;
    });

    // Normalize columns, fix spelling errors, remove unwanted keys, and remove duplicates
    const seenKeys = new Set();
    const normalizedColumns = columns
        .map((column: any) => ({
            ...column,
            key: spellingCorrections[column.key] || column.key,  // Apply spelling correction if needed
        }))
        .filter((column: any) => !unwantedKeys.has(column.key)) // Remove unwanted columns
        .filter((column: any) => {
            if (seenKeys.has(column.key)) {
                return false; // Skip if key already exists
            }
            seenKeys.add(column.key);
            return true;
        });

    return { list: normalizedList, columns: normalizedColumns, pagination };
};


  // Process columns to add dynamic onClick functionality
const enhanceColumns = (columns: any, userRole: any) => {
  const role = userRole?.role?.toLowerCase();
  console.log("EnhanceColumns - userRole:", userRole, "role:", role);
  let updatedColumns = columns.map((column:any) => ({
    ...column,
    isDate: ["orderdate", "approvalstatusdate", "createdat", "updatedat"].includes(
      column.key?.toLowerCase()
    ),
    hidden: column.key.includes("orderId") ? true : false
  }));

  return updatedColumns;
};

// ✅ Modify `enhanceList` function to use `formatDate`
const enhanceList = (list: any, userRole: any) => {
  const role = userRole?.role?.toLowerCase();
  console.log("EnhanceList - userRole:", userRole, "role:", role);
  return list.map((item:any) => {
    console.log("Item inventoryType:", item.inventoryType); // Debugging line

    return {
      ...item,
      fileName: item.fileName ? item.fileName : <i className="fa fa-paperclip"></i>,
      adminApproved: item.adminApproved
        ? <i className="fa fa-check-circle text-success"></i>
        : <i className="fa fa-times-circle text-danger"></i>,
      labApproved: item.labApproved
        ? <i className="fa fa-check-circle text-success"></i>
        : <i className="fa fa-times-circle text-danger"></i>,
      inventoryType:
        item.inventoryType
          ? item.inventoryType.toLowerCase().trim() === "generalinventory"
            ? <i className="fa fa-flask text-primary"></i>
            : <i className="fa fa-flask text-warning"></i>
          : <i className="fa fa-question-circle text-danger"></i>,
    };
  });
};


  // const handleDelete = async (userId: number) => {
  //   const deleteData = {
  //     "produID": userId,
  //     "inventoryType": "fineChemical",
  //     "user": userRole
  //   }
  //   const confirmDelete = window.confirm(`Are you sure you want to delete "${userId}"?`);
  //   if (!confirmDelete) return;

  //   try {
  //     await dispatch(deleteArchievesPermenent(deleteData)).unwrap();
  //     fetchArchieves();
  //   } catch (err) {
  //     console.error("Delete failed:", err);
  //     fetchArchieves();
  //   }
  // };

  return (
    <>
      {error && <p>Error: {error}</p>}
      {!loading && data ? (
        <DynamicTable
          data={data.list}
          columns={data.columns}
          pagination={data.pagination}
        />
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Archieves;
