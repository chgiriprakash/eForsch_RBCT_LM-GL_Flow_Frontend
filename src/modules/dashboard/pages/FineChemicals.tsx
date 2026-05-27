import DynamicTable from "../../../shared/components/DynamicTable";
import Button from "react-bootstrap/Button";
import Modal from "../../../shared/components/Modal";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import {
  // addProduct,
  // deleteProduct,
  fetchFineChemicals,
  getBudgetList,
  getCompanies,
  // uploadProduct,
  // deleteFineChemicals,
  deleteInventoryArchieves,
  // downloadPDFInv,
  downloadPDFFineChecm,
  downloadPDF,
  uploadFineChemical} from "../dashboardSlice";
import { addFineChemicals } from "../dashboardSlice";
import { useAppDispatch } from "../../../shared/hooks/useAppDispatch";
import FileUpload from "../compoenents/FileUpload";
import { useNavigate } from "react-router-dom";
import ReusableForm from "../../../shared/components/ReusableForm";
import addFineChemicalsFormConfig from "../../../shared/config/addFineChnemicalsFormConfig copy";

// Interfaces for Product and related types
// Interfaces for Product and related types
export interface Product {
  productid?: number;
  action?: JSX.Element; // Action column content, e.g., Delete button
  productname: string;
  companyname: string;
  quantity: string;
  budgetno: string;
  orderdate: string;
  // qtypriceordered?: string;
  concentration: string;
  remark: string;
  catalogue: string;
  expiryDate: string;
  companyInternalNo: string;
  sapMaterialNo: string;
  wvsubqty: string;
  orderedby: string;
  price: string;
  casnumber: string;
  hazardousSubstance: string; // "true"/"false" as string
  cmrSubstance: string;
  skinResorptive: string;
  ghsSymbols: string[];
  ghsSignalWord: string[];
  hPhrases: string;
  pPhrases: string;
  substitutionCheck: string;
  substitution?: string;
  substitutionOption?: string;
  storageLocation: string;
  groupName?: string;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
  hidden: any;
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

// Default values
const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const initialProductData: Product = {
  productname: "",
  companyname: "",
  quantity: "",
  budgetno: "",
  orderdate: "",
  // qtypriceordered: "",
  concentration: "",
  remark: "",
  catalogue: "",
  expiryDate: "",
  companyInternalNo: "",
  sapMaterialNo: "",
  wvsubqty: "",
  orderedby: "",
  price: "",
  casnumber: "",
  hazardousSubstance: "",
  cmrSubstance: "",
  skinResorptive: "",
  ghsSymbols: [],
  ghsSignalWord: [],
  hPhrases: "",
  pPhrases: "",
  substitutionCheck: "",
  substitutionOption: "",
  storageLocation: "",
  groupName: "",
};

const FineChemicals = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  console.log("FineChemicals - uploadedFile:", uploadedFile);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);
  console.log("FineChemicals - error from state:", error);
  const [budget, setBudget] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: number; companyNo: string; companyName: string }>>([]);
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; key: string }>>([]);
  
  const fetchData = async () => {
    try {
      const result = await dispatch(fetchFineChemicals(userRole)).unwrap();
      console.log("Fetched Fine Chemicals:", result);
      // Debugging API Response
      const normalizedData = normalizeKeysAndFixSpelling(result.data);
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
          hidden: undefined
        },
        {
          key: "catalogue", label: "catalogue", sortable: true,
          hidden: undefined
        },
        {
          key: "companyName", label: "Company Name", sortable: true,
          hidden: undefined
        },
        {
          key: "quantity", label: "Quantity", sortable: true,
          hidden: undefined
        },
        {
          key: "priority", label: "Priority", sortable: true,
          hidden: undefined
        },
        {
          key: "received", label: "Received", sortable: true,
          hidden: undefined
        },
        {
          key: "remark", label: "Remark",
          hidden: undefined
        },
        {
          key: "expiryDate", label: "Expiry Date", isDate: true, sortable: true,
          hidden: undefined
        },
      ];
  
      // Use columns from API if available, otherwise fallback to default
      const updatedColumns = (columnsFromAPI || defaultColumns).map((column: Column) => ({
        ...column,
        onClick:
          column.key === "productname"
            ? (row: Product) => openProductDetails(row)
            : column.key === "filename"
            ? (row: Product) => addAttachment(row)
            : undefined,
        isDate: column.key === "expiryDate" || column.key === "orderdate" ? true : undefined,
        hidden: column.key.includes("srno") ? true : false,
      }));
  
      setData({
        list: normalizedData.list || [], //mockData, //
        columns: updatedColumns,
        pagination: normalizedData.pagination || defaultPagination,
      });
  
      console.log("Final Columns:", updatedColumns);
    } catch (err) {
      console.error("Error fetching products:", err);
      setData({
        list: [],
        columns: [],
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

  // ✅ Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const result = await dispatch(getCompanies()).unwrap();
      setCompanies(result);
      setCompanyOptions(
        result.map((c: any) => ({ label: c.companyName, key: c.companyName }))
      );
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  // ✅ Auto-fill company internal number when company is selected
  const handleCompanyFieldChange = (id: string, value: any): Partial<Record<string, any>> | void => {
    if (id === "companyname") {
      const selected = companies.find((c) => c.companyName === value);
      if (selected) {
        return { companyInternalNo: selected.companyNo };
      }
    }
  };

  useEffect(() => {
    fetchData();
    fetchBudget();
    fetchCompanies();
    console.log("Product Data:", data);
  }, [dispatch]);

const addAttachment = async (row: any) => {
  const fileUrl =  await dispatch(downloadPDF(row.productid)).unwrap();
  console.log("File URL:", fileUrl);

  // Open file in a new tab
  window.open(fileUrl, "_blank");

  alert(`File downloaded successfully!`);
    
  fetchData();

};

const openProductDetails = (row: any) => {
  const cleanedRow: any = {};
  Object.entries(row).forEach(([key, value]) => {
    // keep only serializable values
    if (
      typeof value !== "object" ||
      value === null ||
      value instanceof Date ||
      Array.isArray(value)
    ) {
      cleanedRow[key] = value;
    }
  });

  navigate(`/inventory/Fine-Chemicals/${row.productid}`, { state: { product: cleanedRow } });
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
          const response = await dispatch(uploadFineChemical(formData)).unwrap(); // Dispatch API call
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
  
  const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    if (!formData || Object.keys(formData).length === 0) {
      console.warn("No data provided for submission.");
      alert("Please fill in the required fields before submitting.");
      return;
    }

    // ✅ Normalize Yes/No fields to boolean
    formData.hazardousSubstance = formData.hazardousSubstance === "Yes";
    formData.cmrSubstance = formData.cmrSubstance === "Yes";
    formData.skinResorptive = formData.skinResorptive === "Yes";

    // ✅ Add user details from localStorage
    if (userRole.role?.toLowerCase() === "labmgmt" || userRole.role?.toLowerCase() === "labmanager") {
      formData.orderedby = "Lab Manager";   // ✅ Always show as Lab Manager
      formData.groupName = "Admin User";  // ✅ Force group as Admin User
      formData.role = userRole.role;
    } else {
      formData.orderedby = userRole.name;       // ✅ Logged-in user name
      formData.groupName = userRole.groupName; // ✅ User’s group
      formData.role = userRole.role;
    }

    console.log("Submitting Form (raw):", formData);

    // ✅ Extract file object (if present)
    const fileObj = formData.attachment || null;
    delete formData.attachment;

    // ✅ Build FormData for multipart request
    const payload = new FormData();

    // backend expects `finechemical`, not `finechemical`
    payload.append("finechemical", JSON.stringify(formData));  

    if (fileObj) {
      payload.append("file", fileObj, fileObj.name); // attach file if present
    }

    try {
      // ✅ Dispatch API call
      const result = await dispatch(
        addFineChemicals(payload)
      ).unwrap();


      console.log("✅ Product Added Successfully:", result);
    } catch (error: unknown) {
      console.error("❌ Error Adding Product:", error);

      if (error instanceof Error) {
        alert(`Failed to add product: ${error.message}`);
      } else {
        alert("Failed to add product. Please try again.");
      }
      return;
    }

    // ✅ Reset File & Close Modal After Success
    setUploadedFile(null);
    setIsModalOpen(false);

    // ✅ Refresh Data After Submission
    fetchData();
  } catch (error: unknown) {
    console.error("Error processing submission:", error);

    if (error instanceof Error) {
      alert(`An unexpected error occurred: ${error.message}`);
    } else {
      alert("An unexpected error occurred. Please try again.");
    }
  }
};


const normalizeKeysAndFixSpelling = (data: any) => {
  const { list, columns, pagination } = data;

  // 🩹 Spelling corrections for known mismatches
  const spellingCorrections: Record<string, string> = {
    recieved: "received",
    catalogue: "catalogue", // ✅ fix for backend typo
    filename: "filename",   // ✅ consistent normalization
  };

  // 🗺️ Map lowercase column keys to corrected ones
  const keyMapping: Record<string, string> = {};
  columns.forEach((column: any) => {
    const lower = column.key.toLowerCase();
    const correctedKey = spellingCorrections[lower] || column.key;
    keyMapping[lower] = correctedKey;
  });

  // 🧩 Normalize list data and apply corrections
  const normalizedList = list.map((item: any, index: number) => {
    const normalizedItem: any = {};

    Object.keys(item).forEach((key) => {
      const lowerKey = key.toLowerCase();
      const normalizedKey =
        keyMapping[lowerKey] || spellingCorrections[lowerKey] || key;

      let value = item[key];

      // Parse stringified arrays safely (like '["Danger"]')
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch {
          /* ignore */
        }
      }

      // Special handling for "filename" — rename label in UI to "Attachment"
      if (lowerKey === "filename") {
        normalizedItem[normalizedKey] = value ? (
          <a
            href="#"
            onClick={() => downloadAttachment(item)}
            style={{ color: "#007bff", textDecoration: "underline" }}
          >
            {value}
          </a>
        ) : (
          <i className="fa fa-paperclip"></i>
        );
      } else {
        normalizedItem[normalizedKey] = value;
      }
    });

    // Add srno (serial number)
    normalizedItem.srno = index + 1;

    // Add Action column
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

  // 🧾 Normalize columns: apply corrections + hide File Type + rename File Name
  const normalizedColumns = columns
    .map((column: any) => {
      const lower = column.key.toLowerCase();
      let newLabel = column.label;

      // ✅ Rename File Name → Attachment
      if (lower === "filename") {
        newLabel = "Attachment";
      }

      return {
        ...column,
        key: spellingCorrections[lower] || column.key,
        label: newLabel,
      };
    })
    // ✅ Filter out File Type column
    .filter((column: any) => column.key.toLowerCase() !== "filetype");

  // ✅ Add Action column
  normalizedColumns.push({
    key: "action",
    label: "Action",
  });

  return { list: normalizedList, columns: normalizedColumns, pagination };
};

const downloadAttachment = async (row: any) => {
  try {
    const fileUrl = await dispatch(downloadPDFFineChecm(row.productid)).unwrap();
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

  
  const handleDelete = async (row: Product) => {
    const deleteData = {
      "produID": row.productid,
      "inventoryType": "fineChemical",
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
              {/* <Button onClick={() => navigate("/General-inventory")} className="btn-color">
                General Inventory
              </Button> */}
              <Button onClick={addProductModel} className="btn-color">
                Add Fine Chemicals
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fine Chemical Product">
        <ReusableForm formConfig={addFineChemicalsFormConfig(budget || [], companyOptions)} initialValues={initialProductData} onSubmit={handleFormSubmit} onFieldChange={handleCompanyFieldChange} />
      </Modal>
    </>
  );
};

export default FineChemicals;
