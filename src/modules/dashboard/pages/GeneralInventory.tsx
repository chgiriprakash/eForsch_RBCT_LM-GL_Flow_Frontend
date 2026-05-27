import DynamicTable from "../../../shared/components/DynamicTable";
import Button from "react-bootstrap/Button";
import Modal from "../../../shared/components/Modal";
import { useEffect, useState } from "react";
import addProductFormConfig from "../../../shared/config/addProductFormConfig";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { addProduct, deleteInventoryArchieves, downloadPDFInv, fetchProducts, getBudgetList, getGroupNames, uploadProduct } from "../dashboardSlice";
import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
import FileUpload from "../compoenents/FileUpload";
import { useNavigate } from "react-router-dom";
import ReusableForm from "../../../shared/components/ReusableForm";
// import { addInventoryItem } from "../../../shared/services/inventoryService";
// import { productData } from "../../../shared/utils/data";

// Interfaces for Product and related types
interface Product {
  productId: number;
  productname: string,
  attachment: File | null; // Updated to handle file uploads
  catalogue: number,
  companyname: string,
  quantity: number,
  companyinternalno: number,
  sapmaterialno: number,
  weightvolsubqty: string,
  budgetno: number,
  orderdate: string, 
  // qtypriceordered: number,
  concentration: string,
  // priority: string,
  remarks: string,
  // received: string,
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
  hidden: boolean;
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

// Default values
const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 50,
  totalPages: 1,
  totalRecords: 0,
};

const initialProductData = {
  // productName: "",
  // catalogue: "",
  // companyName: "",
  // quantity: "",
  // priority: "",
  // received: "",
  // remark: "",
  // expiryDate: "",
  productname: "",
  catalogue: "",
  companyname: "",
  quantity: "",
  companyinternalno: "",
  sapmaterialno: "",
  weightvolsubqty: "",
  budgetno: "",
  orderdate: "", 
  // qtypriceordered: "",
  concentration: "",
  // priority: "",
  remarks: "",
  // received: "",
};

const GeneralInventory = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  console.log("GeneralInventory - uploadedFile:", uploadedFile);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);
  console.log("GeneralInventory - error state:", error);
  const [budget, setBudget] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  console.log("GeneralInventory - groupOptions:", groupOptions);

  const fetchData = async () => {
    try {
      const result = await dispatch(fetchProducts(userRole)).unwrap();
  
      // Debugging API Response
      const normalizedData = normalizeKeysAndFixSpelling(result);
      console.log("Normalized Data:", normalizedData);
  
      // Ensure result is defined
      if (!result) {
        throw new Error("No data received from API");
      }
  
      // Ensure `columns` is defined and not empty
      const columnsFromAPI = normalizedData.columns && normalizedData.columns.length > 0 ? normalizedData.columns : null;
      
      if (!columnsFromAPI) {
        console.warn("API returned no columns. Using default columns.");
      }
  
      // Define default columns in case API does not return them
      const defaultColumns: Column[] = [
        {
          key: "productName", label: "Product Name", sortable: true,
          hidden: false
        },
        {
          key: "catalogue", label: "catalogue", sortable: true,
          hidden: false
        },
        {
          key: "companyName", label: "Company Name", sortable: true,
          hidden: false
        },
        {
          key: "quantity", label: "Quantity", sortable: true,
          hidden: false
        },
        {
          key: "priority", label: "Priority", sortable: true,
          hidden: false
        },
        {
          key: "received", label: "Received", sortable: true,
          hidden: false
        },
        {
          key: "remarks", label: "Remark",
          hidden: false
        },
        {
          key: "expiryDate", label: "Expiry Date", isDate: true, sortable: true,
          hidden: false
        },
      ];
  
      // Use columns from API if available, otherwise fallback to default
      const updatedColumns = (columnsFromAPI || defaultColumns).map((column: Column) => ({
        ...column,
        onClick:
          column.key === "productname"
            ? (row: Product) => openProductDetails(row)
            : undefined,
        isDate: column.key === "expiryDate" || column.key === "orderdate" ? true : undefined,
        hidden: column.key.includes("productId") ? true : false, // Hide productid column
      }));
  
      setData({
        list: normalizedData.list || [],
        columns: updatedColumns,
        pagination: normalizedData.pagination || defaultPagination,
      });
  
      console.log("Final Columns:", updatedColumns);
    } catch (err) {
      console.error("Error fetching products:", err);
  
      // If API fails, set default values
      setData({
        list: [],
        columns: [
          {
            key: "productName", label: "Product Name", sortable: true,
            hidden: false
          },
          {
            key: "catalogue", label: "catalogue", sortable: true,
            hidden: false
          },
          {
            key: "companyName", label: "Company Name", sortable: true,
            hidden: false
          },
          {
            key: "quantity", label: "Quantity", sortable: true,
            hidden: false
          },
          {
            key: "priority", label: "Priority", sortable: true,
            hidden: false
          },
          {
            key: "received", label: "Received", sortable: true,
            hidden: false
          },
          {
            key: "remarks", label: "Remark",
            hidden: false
          },
          {
            key: "expiryDate", label: "Expiry Date", isDate: true, sortable: true,
            hidden: false
          },
        ],
        pagination: defaultPagination,
      });
    }
  };

   const fetchBudget = async () => {
      try {
        const result = await dispatch(getBudgetList(userRole)).unwrap();
        console.log("Budget fetched successfully:", result);
  
        // Format options with label and value
        const formattedOptions = result.data.list
          .filter((item: any) => item.groupName && item.budgetno)
          .map((item: any) => ({
            label: `${item.groupName}-${item.budgetno}`,
            key: item.budgetno
          }));
          // .sort((a:any, b:any) => a.label.localeCompare(b.label));
        
        setBudget(formattedOptions);
      } catch (error) {
        console.error("Failed to fetch budget:", error);
        setBudget(["Budget"]);
      }
    };

  // ✅ Fetch group names
  const fetchGroupNames = async () => {
    try {
      const result = await dispatch(getGroupNames()).unwrap();
      if (result.length > 0) {
        const groupNames = result.map((groupNames: any) => groupNames.groupName);

        console.log("Fetched group names:", groupNames);
        setGroupOptions(groupNames);
      }
    } catch (error) {
      console.error("Failed to fetch group names:", error);
    }
  };
  

  useEffect(() => {
    fetchData();
    fetchBudget();
    fetchGroupNames();
    console.log("Product Data:", data);
  }, [dispatch]);

 const openProductDetails = (row: Product) => {
  // Remove all non-serializable properties recursively
  const cleanedRow = JSON.parse(
    JSON.stringify(row, (key, value) => {
      console.log(`Key: ${key}, Value:`, value);
      // Remove React elements or functions
      if (
        typeof value === "function" ||
        (typeof value === "object" && value !== null && "$$typeof" in value)
      ) {
        return undefined;
      }
      return value;
    })
  );

  navigate(`/inventory/General-inventory/${cleanedRow.productId}`, {
    state: { product: cleanedRow },
  });
};


  const addProductModel = () => {
    setIsModalOpen(true);
  };

  const handleUploadClick = async () => {
    try {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".xlsx,.xls,.csv";
  
      fileInput.onchange = async (event: any) => {
        const file = event.target.files[0];
  
        if (!file) {
          console.warn("No file selected.");
          return;
        }
  
        console.log("File Selected:", file);
        console.log("File Name:", file.name);
        console.log("File Type:", file.type);
        console.log("File Size:", file.size);
  
        // Ensure file is accessible before appending to FormData
        if (file.size === 0) {
          alert("Selected file is empty. Please upload a valid file.");
          return;
        }
  
        // Create FormData and append the file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("groupName ", userRole.groupName); // Convert user object to string
  
        try {
          const response = await dispatch(uploadProduct(formData)).unwrap(); // Dispatch API call
          console.log("Upload Success:", response);

          fetchData(); // Refresh data after upload
  
          // if (response && response.success) {
          //   alert("File uploaded successfully!");
          // } else {
          //   console.error("Unexpected API response:", response);
          //   alert("File upload failed. Please try again.");
          // }
        } catch (error) {
          console.error("Upload Failed:", error);
          fetchData(); // Refresh data after upload
        }
      };
  
      fileInput.click();
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
    }
  };
  
// 🟢 Handle Form Submission
const handleFormSubmit = async (formValues: Record<string, any>) => {
  try {
    if (!formValues || Object.keys(formValues).length === 0) {
      alert("Please fill required fields");
      return;
    }

    // ✅ Add user info
    if (
      userRole.role?.toLowerCase() === "labmgmt" ||
      userRole.role?.toLowerCase() === "labmanager"
    ) {
      formValues.addedby = "Lab Manager";
      formValues.groupName = "Admin User";
      formValues.role = userRole.role;
    } else {
      formValues.addedby = userRole.name;
      formValues.groupName = userRole.groupName;
      formValues.role = userRole.role;
    }

    // ✅ Extract file
    const file = formValues.attachment || null;

    // ✅ Remove from object
    delete formValues.attachment;

    // ✅ Build FormData
    const payload = new FormData();

    // VERY IMPORTANT ✅
    payload.append("inventory", JSON.stringify(formValues));

    if (file) {
      payload.append("file", file); // name MUST match API
    }

    console.log("🚀 Final Payload:");
    console.log("inventory:", JSON.stringify(formValues));
    console.log("file:", file);

    await dispatch(addProduct(payload)).unwrap();

    alert("✅ Product added successfully");

    setIsModalOpen(false);
    setUploadedFile(null);

    fetchData();
  } catch (error: any) {
    console.error("❌ Add product failed:", error);
    alert(error?.message || "Something went wrong");
  }
};

const normalizeKeysAndFixSpelling = (
  data: any,
) => {
  const { list, columns, pagination } = data;

  // Fix common spelling errors
  const spellingCorrections: Record<string, string> = {
    recieved: "received",
  };

  // Build lowercase key mapping
  const keyMapping: Record<string, string> = {};
  columns.forEach((column: any) => {
    const correctedKey = spellingCorrections[column.key] || column.key;
    keyMapping[column.key.toLowerCase()] = correctedKey;
  });

  // Normalize data list
  const normalizedList = list.map((item: any) => {
    const normalizedItem: any = {};

    Object.keys(item).forEach((key) => {
      const normalizedKey =
        keyMapping[key.toLowerCase()] || spellingCorrections[key] || key;
      const value = item[key];

      // ✅ Handle fileName column with clickable link
      if (normalizedKey.toLowerCase() === "filename") {
        normalizedItem[normalizedKey] = value ? (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              downloadAttachment(item);
            }}
            style={{
              color: "#007bff",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {value}
          </a>
        ) : (
          <i
            className="fa fa-paperclip"
            title="No attachment available"
            style={{ color: "#aaa" }}
          ></i>
        );
      } else {
        normalizedItem[normalizedKey] = value;
      }
    });

    // Add Action column with Delete button
    normalizedItem["action"] = (
      <button
        className="btn btn-danger btn-sm"
        style={{ padding: "4px 10px" }}
        onClick={() => handleDelete(normalizedItem)}
      >
        Delete
      </button>
    );

    return normalizedItem;
  });

  // Normalize columns
  const normalizedColumns = columns.map((column: any) => ({
    ...column,
    key: spellingCorrections[column.key] || column.key,
  }));

  // Add missing columns
  if (!normalizedColumns.some((col: any) => col.key === "fileName")) {
    normalizedColumns.push({ key: "fileName", label: "Attachment" });
  }

  normalizedColumns.push({ key: "action", label: "Action" });

  return { list: normalizedList, columns: normalizedColumns, pagination };
};

  
  const handleDelete = async (row: Product) => {
    const deleteData = {
      "produID": row.productId,
      "inventoryType": "generalInventory",
      "user": userRole
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete "${row.productname}"?`);
    if (!confirmDelete) return;
    
    try {
      await dispatch(deleteInventoryArchieves(deleteData)).unwrap();
      fetchData(); // refresh the table
    } catch (error) {
      console.error("Delete failed:", error);
      fetchData(); // refresh the table
    }
  };

  // const handlePdf = async (row: Product) => {
  //   const deleteData = {
  //     "produID": row.productId,
  //     "inventoryType": "generalInventory",
  //     "user": userRole
  //   }
  //   const confirmDelete = window.confirm(`Are you sure you want to delete "${row.productname}"?`);
  //   if (!confirmDelete) return;
    
  //   try {
  //     await dispatch(deleteArchievesSoft(deleteData)).unwrap();
  //     fetchData(); // refresh the table
  //   } catch (error) {
  //     console.error("Delete failed:", error);
  //     fetchData(); // refresh the table
  //   }
  // };

const downloadAttachment = async (row: any) => {
  try {
      const fileUrl = await dispatch(downloadPDFInv(row.productId)).unwrap();
      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        alert("No attachment found for this record.");
      }
    } catch (error) {
      console.error("Failed to download attachment:", error);
      alert("Error downloading file.");
    }
};


  return (
    <>
      {/* {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )} */}

      {!loading ? (
        <>
          <div className="title-header">
            <div className="btn-wrapper">
              {/* <Button onClick={(e) => { navigate("/FineChemicals"); }} className="btn-color">
                Fine Chemicals
              </Button> */}
              <Button onClick={addProductModel} className="btn-color">
                Add Product
              </Button>
              <div onClick={handleUploadClick} className="btn-color upload-wrapper">
                Upload Excel<FileUpload />
              </div>
            </div>
          </div>

          <DynamicTable
            data={data?.list || []}
            columns={data?.columns || []}
            pagination={data?.pagination || defaultPagination}
          />
        </>
      ) : (
        <p>Loading...</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <ReusableForm formConfig={addProductFormConfig(budget || [])} initialValues={initialProductData} onSubmit={handleFormSubmit} />
      </Modal>
    </>
  );
};

export default GeneralInventory;
