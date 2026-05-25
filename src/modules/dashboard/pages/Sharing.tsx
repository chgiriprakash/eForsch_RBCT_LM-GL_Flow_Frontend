import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import { productData } from "../../../shared/utils/data";
import { getSharedProductList, shareProduct } from "../dashboardSlice";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

interface Product {
  productid: number;
  productname: string;
  catalogue: number;
  companyname: string;
  quantity: number;
  companyInternalno: number;
  sapmaterialno: number;
  weightvolsubqty: string;
  budgetno: number;
  orderdate: string; // ISO date format
  qtypriceordered: number;
  concentration: string;
  priority: string;
  remark: string;
  received: string;
}

interface Column {
  hidden: any;
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface ProductListResponse {
  list: Product[];
  columns: Column[];
  pagination: Pagination;
}

const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const defaultColumns: Column[] = [
  { key: "productname", label: "Product Name", sortable: true, hidden: undefined },
  { key: "catalogue", label: "catalogue", sortable: true, hidden: undefined },
  { key: "companyname", label: "Company Name", sortable: true, hidden: undefined },
  { key: "quantity", label: "Quantity", sortable: true, hidden: undefined },
  { key: "priority", label: "Priority", sortable: true, hidden: undefined },
  { key: "received", label: "Received", sortable: true, hidden: undefined },
  { key: "remark", label: "Remark", hidden: undefined},
  { key: "orderdate", label: "Order Date", isDate: true, sortable: true, hidden: undefined },
];

const Sharing = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>(); // Ensuring id is a string or undefined
  const [searchParams] = useSearchParams();
  console.log("Sharing - searchParams:", searchParams);
  // const inventoryType = searchParams.get("inventoryType");
  const location = useLocation();
  const { inventoryType } = location.state || {};
  const storedUser = localStorage.getItem("user");
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [otherLabsData, setOtherLabsData] = useState(productData);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  const openProductDetails = (row: any) => {
    const { action, ...serializableRow } = row as any;
    navigate(`/inventory/General-inventory/${row.productId}`, { state: { product: serializableRow } });
  };

  // Fetch products based on `id`
  useEffect(() => {
    const fetchData = async () => {
      console.log('id ', id, inventoryType)
      try {
        let sharedProductResult = null;
        const payload = {          
          id: id ? parseInt(id) : null,
          inventoryType: inventoryType || "generalInventory",
          user: storedUser ? JSON.parse(storedUser) : null
        };
        if (id) {
          sharedProductResult = await dispatch(
            shareProduct(payload)
          ).unwrap();
          console.log("Shared Product Response:", sharedProductResult);
          console.log("Sharing - sharedProductResult variable:", sharedProductResult);
        }

        const sharedListResult = await dispatch(getSharedProductList(storedUser)).unwrap();
        console.log("Shared Product List Response:", sharedListResult);

        const normalizedData = normalizeKeysAndFixSpelling(sharedListResult.data);
        console.log("Normalized Data:", normalizedData);

        // Ensure `columns` exist; fallback to default if missing
        const columnsFromAPI = normalizedData.columns || defaultColumns;

        const sharedListResultColumns = columnsFromAPI.map((column: Column) => ({
          ...column,
          onClick:
          column.key === "productName"
            ? (row: Product) => openProductDetails(row)
            : undefined,
          isDate: column.key === "expiryDate" || column.key === "orderdate",
          hidden: column.key.includes("productId") ? true : false,
        }));

        setData({
          list: normalizedData.list || [],
          columns: sharedListResultColumns,
          pagination: normalizedData.pagination || defaultPagination,
        });

        // Add a new "Request" column dynamically
        const updatedColumns = columnsFromAPI.map((column: Column) => ({
          ...column,
          onClick:
          column.key === "productName"
            ? (row: Product) => openProductDetails(row)
            : undefined,
          isDate: column.key === "expiryDate" || column.key === "orderdate",
          hidden: column.key.includes("productId") ? true : false,
        }));
        // Then, add the new "Request" column dynamically
        updatedColumns.push({
          key: "request",
          label: "Contact",
          sortable: false,
          onClick: (row: any) => alert(`Clicked on ${row.productname}`),
        });

        const updatedList = normalizedData.list.map((item: any) => ({
          ...item,
          request: <button className="btn-color upload-wrapper btn btn-primary">Request</button>,
        })) || [];

        setOtherLabsData({
          ...otherLabsData,
          columns: updatedColumns,
          list: updatedList,
        });

      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchData();
  }, [dispatch, id]); // ✅ Runs when `id` changes

  const normalizeKeysAndFixSpelling = (data: any) => {
    const { list, columns, pagination } = data;
  
    // Create a mapping of incorrect keys to their correct spellings
    const spellingCorrections: Record<string, string> = {
      recieved: "received", // Correct the spelling error
    };
  
    // Create a mapping of lowercase column keys to their actual keys
    const keyMapping: Record<string, string> = {};
    console.log("Sharing - keyMapping initialized:", keyMapping);
    columns.forEach((column: any) => {
      const correctedKey = spellingCorrections[column.key] || column.key; // Apply spelling correction if necessary
      keyMapping[column.key.toLowerCase()] = correctedKey;
    });
  
    // Normalize keys in the list and fix spelling errors
    const normalizedList = list.map((item: any) => {
      const normalizedItem: any = {};
      Object.keys(item).forEach((key) => {
        const normalizedKey = keyMapping[key.toLowerCase()] || spellingCorrections[key] || key; // Use corrected key
        console.log("Sharing - normalizedKey for key:", key, "-> normalizedKey:", normalizedKey);
        normalizedItem[normalizedKey] = item[key];
      });
      return normalizedItem;
    });
  
    // Normalize columns and fix spelling errors
    const normalizedColumns = columns.map((column: any) => ({
      ...column,
      key: spellingCorrections[column.key] || column.key, // Correct column keys if necessary
    }));
  
    return { list: normalizedList, columns: normalizedColumns, pagination };
  };

  return (
    <>
      {error && <p>Error: {error}</p>}

      {!loading && data ? (
        <div className="two-tables-container">
          {/* Table 1 - Chemicals We Share */}
          <div className="table-card">
            <h4>Chemicals We Share</h4>
            <DynamicTable
              data={data?.list}
              columns={data?.columns}
              pagination={data?.pagination || defaultPagination}
            />
          </div>

          {/* Table 2 - Chemicals We May Need */}
          <div className="table-card">
            <h4>Chemicals We May Need</h4>
            <DynamicTable
              data={otherLabsData.list}
              columns={otherLabsData.columns}
              pagination={data.pagination || defaultPagination}
            />
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Sharing;
