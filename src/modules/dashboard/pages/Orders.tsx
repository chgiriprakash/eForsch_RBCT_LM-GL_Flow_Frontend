import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import DynamicTable from "../../../shared/components/DynamicTable";
import Modal from "../../../shared/components/Modal";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { addOrder, approveAdmin, approvelabMgmt, deliveredPOD, downloadPDF, addFineChemicalOrder, editFineChemicalOrder, editOrder, fetchOrders, fetchOrdersOD, getBudgetList, getCompanies, getStorageLocations, getGroupNames, orderedPOD, rejectAdmin, rejectlabMgmt } from "../dashboardSlice";
import ReusableForm from "../../../shared/components/ReusableForm";
import addOrderFormConfig from "../../../shared/config/addOrderFormConfig";
import addOrderFineChemicalFormConfig from "../../../shared/config/addOrderFineChemicalFormConfig";
import UpdateOrderFormConfigFine from '../../../shared/config/UpdateOrderFormConfigFine';
import UpdateOrderFormConfig from '../../../shared/config/UpdateOrderFormConfig';

// Define interface for a column in the table
interface OrderColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  isDate?: boolean;
  onClick?: (row: any) => void;
  hidden: any;
}

// Define interface for an individual order
interface Order {
  orderId: number;
  productId: number;
  productname: string;
  catalogue: string;
  companyName: string;
  sapmaterialno: string;
  quantity: number;
  budgetno: string;
  price: string;
  remark: string;
  approved: boolean;
  approvalStatusDate: string;
  adminName: string;
  userName: string;
  status: string;
  attachment: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  groupName: string;
  inventoryType?: string; // Added property to fix error
  labApproved: boolean; // Added property to fix error
  adminApproved: boolean; // Added property to fix error
  companyInternalNo?: string; // Added property to fix error
  weightvolsubqty?: string; // Added property to fix error
  casnumber?: string; // Added property to fix error
  hazardousSubstance?: string; // Added property to fix error
  cmrSubstance?: string; // Added property to fix error
  skinResorptive?: string; // Added property to fix error
  ghsSymbols?: any[]; // Added property to fix error
  ghsSignalWord?: any[]; // Added property to fix error
  hPhrases?: string; // Added property to fix error
  pPhrases?: string; // Added property to fix error
  substitutionCheck?: string; // Added property to fix error
  substitutionOption?: string; // Added property to fix error
  storageLocation?: string; // Added property to fix error
  orderdate?: string; // Added property to fix error
  concentration?: string; // Added property to fix error
  expiryDate?: string; // Added property to fix error
}

// Define interface for pagination
interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

// Define the main order data structure
interface OrderData {
  columns: OrderColumn[];
  list: Order[];
  pagination: Pagination;
}

const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

const initialData: Order = {
  orderId: 0,
  productname: "",
  catalogue: "", // fixed from catalogue
  companyName: "",
  sapmaterialno: "",
  quantity: 0,
  budgetno: "",
  price: "",
  remark: "",
  approved: false,
  approvalStatusDate: "",
  adminName: "",
  userName: "",
  status: "",
  attachment: "",
  fileName: "",
  createdAt: "",
  updatedAt: "",
  createdBy: "",
  updatedBy: "",
  groupName: "",
  inventoryType: "",
  labApproved: false,
  adminApproved: false,
  companyInternalNo: "",
  weightvolsubqty: "",
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
  orderdate: "",
  expiryDate  : "",
  concentration: "",
  productId: 0
};

const initialGeneralInventoryData = {
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
  expiryDate: "",
  // qtypriceordered: "",
  concentration: "",
  // priority: "",
  remarks: "",
  // received: "",
};

const initialFineChemicalData = {
  productname: "",
  companyName: "",
  quantity: "",
  budgetno: "",
  orderdate: "",
  concentration: "",
  remark: "",
  catalogue: "",
  expiryDate: "",
  companyInternalNo: "",
  sapMaterialNo: "",
  weightvolsubqty: "",
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
  groupName: ""
};

const Orders = () => {
  const userRole = JSON.parse(localStorage.getItem('user') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalGIOpen, setIsModalGIOpen] = useState(false);
  const [isModalFCOpen, setIsModalFCOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [data, setData] = useState<OrderData | null>(null);
  const [origalData, setOrigalData] = useState<OrderData | null>(null);
  console.log("Orders - origalData state:", origalData);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state: any) => state.dashboard);
  // const [order, setOrder] = useState<any>(null);
  const [budget, setBudget] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: number; companyNo: string; companyName: string }>>([]);
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; key: string }>>([]);
  const [storageLocationOptions, setStorageLocationOptions] = useState<string[]>([]);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [rejectReason, setRejectReason] = useState("");
  const [deliveryModal, setDeliveryModal] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null });
  const [deliveryForm, setDeliveryForm] = useState({ storageLocation: "", orderType: "bulk", barcodeInfo: "" });
  const [viewOrderModal, setViewOrderModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null });
  console.log("groupOptions:", groupOptions);
  
  console.log("selectedOrder:", selectedOrder);
  const fetchData = async () => {
  try {
    const result = await dispatch(fetchOrders(userRole)).unwrap();
    const normalizedData = normalizeKeysAndCleanData(result.data);

    console.log("Normalized Data:", normalizedData);

    if (result) {
      const updatedColumns = enhanceColumns(normalizedData.columns || [], userRole);

      // ✅ Filter list by role
      // Approval flow: Scientist → labMgmt (1st approver) → groupleader (2nd approver) → PO
      let filteredList = (normalizedData.list || []).filter(
        (item: Order) => item.status?.toLowerCase() !== "rejected"
      );
      const role = userRole?.role?.toLowerCase();

      // labMgmt sees only orders where labApproved = false AND status = Pending
      if (role === "labmgmt") {
        filteredList = filteredList.filter((item: any) =>
          (item.labApproved === false || item.labapproved === false) &&
          item.status?.toLowerCase() === "pending"
        );
      }

      // groupleader sees only orders where labApproved = true AND adminApproved = false
      if (role === "groupleader") {
        filteredList = filteredList.filter((item: any) =>
          (item.labApproved === true || item.labapproved === true) &&
          (item.adminApproved === false || item.adminapproved === false)
        );
      }

      const updatedList = enhanceList(filteredList, userRole);

      setOrigalData(normalizedData); // store raw cleaned data
      setData({ ...result, columns: updatedColumns, list: updatedList });
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
};


const fetchPodeptData = async () => {
  try {
    const result = await dispatch(fetchOrdersOD(userRole)).unwrap();
    const normalizedData = normalizeKeysAndCleanData(result.data);
    console.log("Normalized Data:", normalizedData);

    if (result) {
      let filteredList = (normalizedData.list || []).filter(
        (item: any) => item.status?.toLowerCase() !== "rejected"
      );

      // ✅ Only for PO Dept & Purchase Department → filter approved items
      const role = userRole?.role?.toLowerCase();
      if (role === "podept" || role === "purchase department") {
        filteredList = filteredList.filter(
          (item: any) => item.adminApproved === true && item.labApproved === true
        );
      }

      const updatedColumns = enhanceColumns(normalizedData.columns || [], userRole);
      const updatedList = enhanceList(filteredList, userRole);

      setOrigalData(normalizedData); // keep unfiltered for reference if needed
      setData({ ...result, columns: updatedColumns, list: updatedList });
    }
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
};


  const fetchBudget = async () => {
    try {
      const result = await dispatch(getBudgetList(userRole)).unwrap();
      const formattedOptions = result.data.list
        .filter((item: any) => item.groupName && item.budgetno)
        .map((item: any) => ({
          label: `${item.groupName}-${item.budgetno}`,
          key: item.budgetno,
        }));
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

  // ✅ Fetch storage locations for dropdown
  const fetchStorageLocations = async () => {
    try {
      const result = await dispatch(getStorageLocations()).unwrap();
      setStorageLocationOptions(result.map((s: any) => s.storageLocation));
    } catch (error) {
      console.error("Failed to fetch storage locations:", error);
    }
  };

  // Fetch orders
  useEffect(() => {
    if(userRole.role === "podept" || userRole.role === 'purchase department') {
      fetchPodeptData(); // Fetch orders only if the user is an Admin
    } else {
      fetchData();
    }

    fetchBudget();
    fetchGroupNames();
    fetchCompanies();
    fetchStorageLocations();
  }, [dispatch]);

const normalizeKeysAndCleanData = (data: any) => { 
    const { list, columns, pagination } = data;

    // Define spelling corrections
    const spellingCorrections: Record<string, string> = {
        recieved: "received",
        catalogue: "catalogue",
        companyinternalno: "companyinternalno",
        companyInternalNo: "companyinternalno",
        sapmaterialno: "sapmaterialno",
        sapMaterialNo: "sapmaterialno",
        remark: "remarks",
        labapproved: "labApproved",      // preserve camelCase
        adminapproved: "adminApproved",  // preserve camelCase
    };

    // Define ONLY the columns to show (whitelist) with display labels
    const allowedColumns: { key: string; label: string; sortable?: boolean }[] = [
      { key: "productName",     label: "Product Name",          sortable: true  },
      { key: "companyName",     label: "Company",               sortable: true  },
      { key: "catalogue",       label: "Article Number",        sortable: false },
      { key: "quantity",        label: "Quantity",              sortable: true  },
      { key: "weightvolsubqty", label: "Qty / Packaging Unit",  sortable: false },
      { key: "price",           label: "Price",                 sortable: true  },
      { key: "budgetno",        label: "Budget Number",         sortable: false },
      { key: "orderedby",       label: "Ordered By",            sortable: false },
      { key: "status",          label: "Status",                sortable: true  },
    ];

    const allowedKeys = new Set(allowedColumns.map(c => c.key));

    // Create a mapping of lowercase column keys to their actual keys (after spelling corrections)
    const keyMapping: Record<string, string> = {};
    columns.forEach((column: any) => {
        const correctedKey = spellingCorrections[column.key] || column.key;
        keyMapping[column.key.toLowerCase()] = correctedKey;
    });

    // Keep all list data (we need hidden fields like orderId, labApproved etc. for logic)
    const normalizedList = list.map((item: any) => {
        const normalizedItem: any = {};
        Object.keys(item).forEach((key) => {
            const normalizedKey = keyMapping[key.toLowerCase()] || spellingCorrections[key] || key;
            normalizedItem[normalizedKey] = item[key];
        });
        return normalizedItem;
    });

    // Build columns from whitelist only, preserving order
    const seenKeys = new Set();
    const normalizedColumns = allowedColumns
        .map((allowed) => {
            const backendCol = columns.find((c: any) =>
                (spellingCorrections[c.key] || c.key) === allowed.key
            );
            return {
                ...(backendCol || {}),
                key: allowed.key,
                label: allowed.label,
                sortable: allowed.sortable ?? false,
                filterable: true,
            };
        })
        .filter((column: any) => {
            if (seenKeys.has(column.key)) return false;
            seenKeys.add(column.key);
            return true;
        });

    return { list: normalizedList, columns: normalizedColumns, pagination };
};


  // Process columns to add dynamic onClick functionality
const enhanceColumns = (columns: OrderColumn[], userRole: any) => {
  const role = userRole?.role?.toLowerCase();

  let updatedColumns = columns.map((column) => ({
    ...column,
    isDate: ["orderdate", "approvalStatusDate", "createdat", "updatedat"].includes(
      column.key?.toLowerCase()
    ),
    hidden: column.key.includes("orderId") ? true : false,
    onClick:
      column.key === "attachment"
        ? (row: Order) => addAttachment(row)
        : column.key === "productName" && role !== "podept"
        ? (row: Order) => openOrderDetails(row)
        : column.onClick,
  }));

  // ✅ Role-based action column
  if (["admin", "labmgmt", "podept", "purchase department", "groupleader"].includes(role)) {
    updatedColumns.push({
      key: "request",
      label: role === "podept" || role === "purchase department"
        ? "Order Management"
        : "Permission",
      sortable: false,
      isDate: false,
      hidden: false,
      onClick: undefined
    });
  }

  return updatedColumns;
};

// ✅ Modify `enhanceList` function to use `formatDate`
const enhanceList = (list: Order[], userRole: any) => {
  const role = userRole?.role?.toLowerCase();

  return list.map((item) => {
    let requestButtons = null;

    if (role === "podept" || role === "purchase department") {
      requestButtons = (
        <>
          <button
            className="btn-color upload-wrapper btn btn-primary"
            onClick={() => handleOrder(item, "Ordered")}
          >
            Ordered
          </button>
        </>
      );
    }

    if (role === "labmgmt") {
      requestButtons = (
        <>
          {item.status?.toLowerCase() === "ordered" && !!item.labApproved && !!item.adminApproved && (
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => { setDeliveryModal({ open: true, order: item }); setDeliveryForm({ storageLocation: "", orderType: "bulk", barcodeInfo: "" }); }}
          >
            Delivered
          </button>
          )}
          {item.status?.toLowerCase() === "pending" && (
            <button
              className="btn-color upload-wrapper btn btn-primary"
              onClick={() => handleApproval(item, true)}
            >
              Approve
            </button>
          )}
          {item.status?.toLowerCase() === "pending" && (
            <button
              className="btn-color upload-wrapper btn btn-danger"
              onClick={() => { setRejectModal({ open: true, order: item }); setRejectReason(""); }}
            >
              Reject
            </button>
          )}
        </>
      );
    }

    if (role === "admin" || role === "groupleader") {
      const canAct = role === "admin" || item.groupName === userRole.groupName;

      requestButtons = canAct ? (
        <>
          <button
            className="btn-color upload-wrapper btn btn-primary"
            onClick={() => handleApproval(item, true)}
            disabled={!!item.adminApproved}
          >
            Approve
          </button>
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => handleApproval(item, false)}
            disabled={!!item.adminApproved}
          >
            Reject
          </button>
        </>
      ) : null;
    }

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
        item.inventoryType === "generalInventory"
          ? <i className="fa fa-flask text-primary"></i>
          : <i className="fa fa-flask text-warning"></i>, // Display only, does not overwrite inventoryType
      request: requestButtons,
    };
  });
};

  // Handlers
  const addAttachment = async (row: Order) => {
    const fileUrl =  await dispatch(downloadPDF(row.orderId)).unwrap();
    console.log("File URL:", fileUrl);

    // Open file in a new tab
    window.open(fileUrl, "_blank");

    alert(`File downloaded successfully!`);
      
    if(userRole.role === "podept" || userRole.role === 'purchase department') {
      fetchPodeptData(); // Fetch orders only if the user is an Admin
    } else {
      fetchData();
    }
  };

  const openOrderDetails = (row: any) => {
    const role = userRole?.role?.toLowerCase();
    if (role === "labmgmt") {
      // Find the raw order from origalData for full field access
      const rawOrder = origalData?.list.find((o: any) => o.orderId === row.orderId) || row;
      setViewOrderModal({ open: true, order: rawOrder });
    } else {
      setSelectedOrder(mapFormDataToOrder(row, userRole));
      setIsModalOpen(true);
    }
  };

  // 🟢 Approve/Reject Order
const handleApproval = async (order: Order, isApproved: boolean) => {
  try {
    let action;

    const normalizedRole = userRole.role?.toLowerCase();
    if (normalizedRole === "admin" || normalizedRole === "groupleader") {
      action = isApproved ? approveAdmin : rejectAdmin;
    } else if (normalizedRole === "labmgmt") {
      action = isApproved ? approvelabMgmt : rejectlabMgmt;
    } else {
      throw new Error("Unauthorized role");
    }

    const payload = (!isApproved && normalizedRole === "labmgmt")
      ? { id: order.orderId, rejectReason: rejectReason || "" }
      : order.orderId;
    await dispatch(action(payload)).unwrap();
    alert(`Order ${isApproved ? "Approved" : "Rejected"} successfully!`);

    if (userRole.role === "podept" || userRole.role === 'purchase department') {
      fetchPodeptData(); // Fetch orders only if the user is from PO Dept
    } else {
      fetchData();
    }
  } catch (error) {
    console.error(`Error ${isApproved ? "approving" : "rejecting"} order:`, error);
    alert(`Failed to ${isApproved ? "approve" : "reject"} order. Please try again.`);
  }
};


   // 🟢 Ordered/Delivered Status Order
  const handleOrder = async (order: Order, status: string, extra?: { storageLocation?: string; orderType?: string; barcodeInfo?: string }) => {
    try {
      const user = { email: userRole.email, name: userRole.name, role: userRole.role, groupName: userRole.groupName };
      const apiName = (status === "Ordered") ? orderedPOD : deliveredPOD;
      const payload = status === "Ordered"
        ? { id: order.orderId, user }
        : { id: order.orderId, user, orderType: extra?.orderType, barcodeInfo: extra?.barcodeInfo };
      await dispatch(apiName(payload)).unwrap();
      alert(`Order ${status} successfully!`);
      
      if(userRole.role === "podept" || userRole.role === 'purchase department') {
        fetchPodeptData(); // Fetch orders only if the user is an Admin
      } else {
        fetchData();
      }
  
    } catch (error) {
      console.error(`Error updating order status to ${status}:`, error);
      alert(`Failed to update order status to ${status}. Please try again.`);
    }
  };

 const mapFormDataToOrder = (
  formData: Record<string, any>,
  userRole: { name: string; groupName: string; role?: string }
): Order => {
  const formatToISOWithOffset = (date: any): string => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "";
    return parsedDate.toISOString().split("T")[0]; // ✅ Standardize to YYYY-MM-DD
  };

  const normalizeString = (value: any, key?: string): string => {
    // ✅ Handle undefined/null
    if (value == null) return "";

    // ✅ Special case: inventoryType might come as a React element (icon)
    if (key === "inventoryType" && value?.props?.className) {
      const className = value.props.className;

      if (className.includes("text-primary")) return "generalInventory";
      if (className.includes("text-warning")) return "fineChemicalInventory";
    }

    // ✅ Convert non-string values safely
    if (typeof value !== "string") return String(value).trim();

    return value.trim();
  };

  const normalizeApproveBool = (value: any, key?: string): boolean => {
    // ✅ Handle undefined/null
    if (value == null) return false;

    // ✅ Handle React element (e.g., icon representing approval)
    if ((key === "adminApproved" || key === "labApproved") && value?.props?.className) {
      const className = value.props.className;
      if (className.includes("text-success")) return true;
      if (className.includes("text-danger")) return false;
    }

    // ✅ Convert to boolean from common truthy/falsey string or number values
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;

    if (typeof value === "string") {
      const val = value.trim().toLowerCase();
      return ["true", "yes", "1", "approved"].includes(val);
    }

    // ✅ Fallback for unexpected types
    return false;
  };

  const normalizeArray = (value: any) =>
    Array.isArray(value) ? value : value ? [value] : [];
  // const normalizeBool = (value: any) => value === true || value === "true";

  const baseOrder: any = {
    orderId: formData.orderId || 0,
    productId: formData.productId || 0,
    productName: formData.productName || formData.productname || "",
    catalogue: formData.catalogue || "",
    companyName: formData.companyName || formData.companyname || "",
    quantity: formData.quantity || 0,
    budgetno: formData.budgetno,
    price: formData.price || 0,
    // Removed 'role' property as it does not exist in 'Order' type
    safetydatasheet: formData.safetydatasheet || "",
    expiryDate:
      formatToISOWithOffset(formData.expiryDate) ||
      formatToISOWithOffset(formData.expirydate),
    companyinternalno:
      formData.companyinternalno || formData.companyInternalNo || "",
    sapmaterialno: formData.sapmaterialno || formData.sapMaterialNo || "",
    weightvolsubqty: formData.weightvolsubqty || "",
    orderdate:
      formatToISOWithOffset(formData.orderdate) ||
      formatToISOWithOffset(formData.orderDate),
    orderedby: formData.orderedby || userRole?.name || "",
    concentration: normalizeString(formData.concentration),
    remarks: normalizeString(formData.remarks || formData.remark),
    casNumber: normalizeString(formData.casNumber || formData.casnumber),
    hazardousSubstance: normalizeString(formData.hazardousSubstance),
    cmrSubstance: normalizeString(formData.cmrSubstance),
    skinResorptive: normalizeString(formData.skinResorptive),
    inventoryType: normalizeString(formData.inventoryType, "inventoryType"),
    ghsSymbols: normalizeArray(formData.ghsSymbols),
    ghsCheckbox: normalizeString(formData.ghsCheckbox),
    ghsSignalWord: normalizeArray(formData.ghsSignalWord || formData.ghssignalword),
    hPhrases: normalizeString(formData.hPhrases || formData.gethPhrases),
    pPhrases: normalizeString(formData.pPhrases || formData.getpPhrases),
    substitutionCheck: normalizeString(formData.substitutionCheck),
    substitutionOption: normalizeString(formData.substitutionOption),
    storageLocation: normalizeString(formData.storageLocation),
    adminApproved: normalizeApproveBool(formData.adminApproved, "adminApproved"),
    labApproved: normalizeApproveBool(formData.labApproved, "labApproved"),
    adminApprovalStatusDate: formatToISOWithOffset(formData.adminApprovalStatusDate),
    labApprovalStatusDate: formatToISOWithOffset(formData.labApprovalStatusDate),
    adminName: normalizeString(formData.adminName),
    userName: userRole?.name || "",
    status: normalizeString(formData.status || "Pending"),
    attachment: normalizeString(formData.attachment),
    fileContent: normalizeArray(formData.fileContent),
    createdAt: formatToISOWithOffset(formData.createdAt),
    updatedAt: formatToISOWithOffset(formData.updatedAt),
    createdBy: normalizeString(formData.createdBy),
    updatedBy: userRole?.name || "",
    groupName: formData.groupName !== "" ? formData.groupName : userRole?.groupName,
  };

  return baseOrder;
};


  // 🟢 Edit Order (Submit Form)
  const handleOrderSubmit = async (formData: Record<string, any>) => {
    try {
      console.log("Before Mapping FormData:", formData);

      // 🟢 Remove the "request" key & map formData to match order structure
      const { request, ...rawFormData } = formData;

      // 🟢 Normalize inventoryType if it’s a React element
      if (rawFormData.inventoryType && typeof rawFormData.inventoryType !== "string") {
        const className = rawFormData.inventoryType?.props?.className;

        if (className === "fa fa-flask text-primary") {
          rawFormData.inventoryType = "generalInventory";
        } else if (className === "fa fa-flask text-warning") {
          rawFormData.inventoryType = "fineChemicalInventory";
        } else {
          rawFormData.inventoryType = "generalInventory"; // fallback
        }
      }

      const mappedFormData = mapFormDataToOrder(rawFormData, userRole);
      if (userRole.role === "podept" || userRole.role === 'purchase department' || userRole.role === 'labMgmt') {
        mappedFormData.groupName= formData.groupName;
      }
console.log("selectedOrder:", selectedOrder);
      console.log("Updating Order with Mapped Data:", mappedFormData);

      if (mappedFormData.inventoryType === "fineChemicalInventory") {
        await dispatch(editFineChemicalOrder(mappedFormData as Order)).unwrap();
      } else {
        await dispatch(editOrder(mappedFormData as Order)).unwrap();
      }

      alert("Order updated successfully!");
      setIsModalOpen(false);

      if (userRole.role === "podept" || userRole.role === 'purchase department') {
        fetchPodeptData(); // Fetch orders only if the user is from PO Dept
      } else {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };

  const addGeneralInventory = () => { 
    setSelectedOrder({ ...initialData, inventoryType: "generalInventory" }); 
    setIsModalGIOpen(true); 
  }; 
  const addFineChemical = () => { 
    setSelectedOrder({ ...initialData, inventoryType: "fineChemicalInventory" }); 
    setIsModalFCOpen(true); 
  };

  // ✅ Handle adding a General Inventory order
const handleAddGenerlaiInventory = async (formData: Record<string, any>) => {
    formData.addedby = userRole.name;       // ✅ Logged-in user name
    formData.groupName = userRole.groupName; // ✅ User’s group
    formData.role = userRole.role;
    
    const fileObj = formData.attachment || null;
    delete formData.attachment;
  try {
    console.log("Adding General Inventory with data:", formData);

    const mappedOrder = {
      ...formData,
      // inventoryType: "generalInventory",
      // orderId: 0,
      approved: false,
      // adminApproved: false,
      // labApproved: false,
      approvalStatusDate: new Date().toISOString(),
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groupName: userRole.groupName,
      createdBy: userRole.name,
      updatedBy: userRole.name
    };

    const payload = new FormData();

    payload.append("order", JSON.stringify(mappedOrder));  

    if (fileObj) {
      payload.append("file", fileObj, fileObj.name); // attach file if present
    }
    
    await dispatch(addOrder(payload)).unwrap();
    alert("General Inventory Order added successfully!");
    setIsModalGIOpen(false);
    fetchData();
  } catch (error) {
    console.error("Error adding general inventory order:", error);
    alert("Failed to add order. Please try again.");
  }
};

// ✅ Handle adding a Fine Chemical order
const handleAddFinechemicalt = async (formData: Record<string, any>) => {
  const fileObj = formData.attachment || null;
    delete formData.attachment;
    
  try {
    console.log("Adding Fine Chemical Order with data:", formData);

    const mappedOrder = {
      ...formData,
      // inventoryType: "fineChemicalInventory",
      // orderId: 0,
      approved: false,
      // adminApproved: false,
      // labApproved: false,
      approvalStatusDate: new Date().toISOString(),
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      groupName: userRole.groupName,
      createdBy: userRole.name,
      updatedBy: userRole.name
    };

    const payload = new FormData();

    payload.append("order", JSON.stringify(mappedOrder));  

    if (fileObj) {
      payload.append("file", fileObj, fileObj.name); // attach file if present
    }

    await dispatch(addFineChemicalOrder(payload)).unwrap();
    alert("Fine Chemical Order added successfully!");
    setIsModalFCOpen(false);
    fetchData();
  } catch (error) {
    console.error("Error adding fine chemical order:", error);
    alert("Failed to add order. Please try again.");
  }
};

const isFineChemical = (order: any) =>
  order?.inventoryType === "fineChemicalInventory";

// ✅ Auto-fill company internal number when company is selected
const handleCompanyFieldChange = (id: string, value: any): Partial<Record<string, any>> | void => {
  if (id === "companyname" || id === "companyName") {
    const selected = companies.find((c) => c.companyName === value);
    if (selected) {
      return {
        companyinternalno: selected.companyNo,
        companyInternalNo: selected.companyNo,
      };
    }
  }
};

  return (
    <>
      {error && <p>Error: {error}</p>}

      {!loading && data ? (
        <> 
        <div className="title-header"> 
          <div className="btn-wrapper"> 
            <Button onClick={addGeneralInventory} className="btn-color"> Add Order General Inventory </Button> 
            <Button onClick={addFineChemical} className="btn-color"> Add Order Fine Chemical Inventory </Button> 
          </div> 
        </div>
        <div className={`dynamic-class ${userRole?.role === 'podept' ? 'podept' : ''}`}>
          <DynamicTable data={data.list} columns={data.columns} pagination={data.pagination || defaultPagination} />
        </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Update ${isFineChemical(selectedOrder) ? "Fine Chemical" : "General Inventory"} Order`}
      >
        <ReusableForm
          formConfig={
            isFineChemical(selectedOrder)
              ? UpdateOrderFormConfigFine(budget || [], companyOptions, storageLocationOptions)
              : UpdateOrderFormConfig(budget || [], companyOptions)
          }
          initialValues={selectedOrder || {}}
          onSubmit={handleOrderSubmit}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>


      <Modal isOpen={isModalGIOpen} onClose={() => setIsModalGIOpen(false)} title={"Add General Inventory Order"}>
        <ReusableForm
          formConfig={addOrderFormConfig(budget || [], companyOptions)}
          initialValues={initialGeneralInventoryData || {}}
          onSubmit={handleAddGenerlaiInventory}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>

      <Modal isOpen={isModalFCOpen} onClose={() => setIsModalFCOpen(false)} title="Add Fine-Chemicals Order">
        <ReusableForm
          formConfig={addOrderFineChemicalFormConfig(budget || [], companyOptions, storageLocationOptions)}
          initialValues={initialFineChemicalData || {}}
          onSubmit={handleAddFinechemicalt}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>

      {/* Delivery Modal */}
      {deliveryModal.open && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <h5 className="reject-modal-title">
              <i className="fa fa-truck me-2 text-success" />
              Mark as Delivered
            </h5>

            <div className="reject-modal-field">
              <label className="reject-modal-label">Storage Location</label>
              <div className="pd-value" style={{ padding: "8px 12px", background: "#f4f7fb", borderRadius: "8px", border: "1px solid #e0e6ef", fontSize: "14px" }}>
                {deliveryModal.order?.storageLocation || <span style={{ color: "#aaa" }}>Not specified</span>}
              </div>
            </div>

            <div className="reject-modal-field">
              <label className="reject-modal-label">Order Type <span className="text-danger">*</span></label>
              <div style={{ display: "flex", gap: 24, marginTop: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="orderType"
                    value="bulk"
                    checked={deliveryForm.orderType === "bulk"}
                    onChange={() => setDeliveryForm({ ...deliveryForm, orderType: "bulk", barcodeInfo: "" })}
                  />
                  Bulk Order
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="orderType"
                    value="nonbulk"
                    checked={deliveryForm.orderType === "nonbulk"}
                    onChange={() => setDeliveryForm({ ...deliveryForm, orderType: "nonbulk" })}
                  />
                  Non-Bulk Order
                </label>
              </div>
            </div>

            {deliveryForm.orderType === "nonbulk" && (
              <div className="reject-modal-field">
                <label className="reject-modal-label">Barcode Information <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter barcode..."
                  value={deliveryForm.barcodeInfo}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, barcodeInfo: e.target.value })}
                />
              </div>
            )}

            <div className="reject-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeliveryModal({ open: false, order: null })}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                disabled={
                  deliveryForm.orderType === "nonbulk" && !deliveryForm.barcodeInfo.trim()
                }
                onClick={async () => {
                  if (deliveryModal.order) {
                    await handleOrder(deliveryModal.order, "Delivered", {
                      storageLocation: deliveryForm.storageLocation,
                      orderType: deliveryForm.orderType,
                      barcodeInfo: deliveryForm.barcodeInfo,
                    });
                    setDeliveryModal({ open: false, order: null });
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {viewOrderModal.open && viewOrderModal.order && (
        <div className="reject-modal-overlay">
          <div className="reject-modal" style={{ maxWidth: 700, width: "95%" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <span className="pd-breadcrumb">Order</span>
                <h2 className="pd-product-name">{viewOrderModal.order.productName}</h2>
              </div>
              <button type="button" style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}
                onClick={() => setViewOrderModal({ open: false, order: null })}>×</button>
            </div>

            {/* Cards */}
            <div className="pd-grid">

              {/* Product Info */}
              <div className="pd-card">
                <div className="pd-card-header"><i className="fa fa-flask pd-card-icon" /><span>Product Info</span></div>
                <div className="pd-fields">
                  {[
                    { label: "Company",            value: viewOrderModal.order.companyName || viewOrderModal.order.companyname },
                    { label: "Catalogue No",        value: viewOrderModal.order.catalogue },
                    { label: "Quantity",            value: viewOrderModal.order.quantity },
                    { label: "Qty / Pkg Unit",      value: viewOrderModal.order.weightvolsubqty || viewOrderModal.order.weightVolSubQty },
                    { label: "Concentration",       value: viewOrderModal.order.concentration },
                    { label: "Remarks",             value: viewOrderModal.order.remarks },
                  ].map(({ label, value }) => (
                    <div key={label} className="pd-field">
                      <span className="pd-label">{label}</span>
                      <span className="pd-value">{value ?? <span style={{ color: "#aaa" }}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IDs */}
              <div className="pd-card">
                <div className="pd-card-header"><i className="fa fa-barcode pd-card-icon" /><span>IDs</span></div>
                <div className="pd-fields">
                  {[
                    { label: "Company Internal No", value: viewOrderModal.order.companyinternalno || viewOrderModal.order.companyInternalNo },
                    { label: "SAP Material No",     value: viewOrderModal.order.sapmaterialno || viewOrderModal.order.sapMaterialNo },
                    { label: "Expiry Date",         value: viewOrderModal.order.expiryDate ? new Date(viewOrderModal.order.expiryDate).toLocaleDateString("en-GB") : null },
                    { label: "Order Date",          value: viewOrderModal.order.orderdate ? new Date(viewOrderModal.order.orderdate).toLocaleDateString("en-GB") : null },
                  ].map(({ label, value }) => (
                    <div key={label} className="pd-field">
                      <span className="pd-label">{label}</span>
                      <span className="pd-value">{value ?? <span style={{ color: "#aaa" }}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div className="pd-card">
                <div className="pd-card-header"><i className="fa fa-euro-sign pd-card-icon" /><span>Financials</span></div>
                <div className="pd-fields">
                  {[
                    { label: "Price",      value: viewOrderModal.order.price },
                    { label: "Budget No",  value: viewOrderModal.order.budgetno },
                    { label: "Ordered By", value: viewOrderModal.order.orderedby },
                    { label: "Status",     value: viewOrderModal.order.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="pd-field">
                      <span className="pd-label">{label}</span>
                      <span className="pd-value">{value ?? <span style={{ color: "#aaa" }}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ownership */}
              <div className="pd-card">
                <div className="pd-card-header"><i className="fa fa-users pd-card-icon" /><span>Ownership</span></div>
                <div className="pd-fields">
                  {[
                    { label: "Group Name",   value: viewOrderModal.order.groupName },
                    { label: "Added By",     value: viewOrderModal.order.createdBy || viewOrderModal.order.userName },
                    { label: "LM Approved",  value: viewOrderModal.order.labApproved != null ? (viewOrderModal.order.labApproved ? "Yes" : "No") : null },
                    { label: "GL Approved",  value: viewOrderModal.order.adminApproved != null ? (viewOrderModal.order.adminApproved ? "Yes" : "No") : null },
                  ].map(({ label, value }) => (
                    <div key={label} className="pd-field">
                      <span className="pd-label">{label}</span>
                      <span className="pd-value">{value ?? <span style={{ color: "#aaa" }}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="pd-card pd-card-full">
                <div className="pd-card-header"><i className="fa fa-truck pd-card-icon" /><span>Delivery Info</span></div>
                <div className="pd-fields">
                  {[
                    { label: "Storage Location", value: viewOrderModal.order.storageLocation },
                    { label: "Order Type",        value: viewOrderModal.order.orderType },
                    { label: "Barcode Info",      value: viewOrderModal.order.barcodeInfo },
                  ].map(({ label, value }) => (
                    <div key={label} className="pd-field">
                      <span className="pd-label">{label}</span>
                      <span className="pd-value">{value ?? <span style={{ color: "#aaa" }}>—</span>}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setViewOrderModal({ open: false, order: null })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModal.open && (
        <div className="reject-modal-overlay">
          <div className="reject-modal">
            <h5 className="reject-modal-title">
              <i className="fa fa-exclamation-triangle me-2 text-danger" />
              Confirm Rejection
            </h5>
            <p className="reject-modal-subtitle">
              Are you sure you want to reject this order?
            </p>
            <div className="reject-modal-field">
              <label className="reject-modal-label">Rejection Reason <span className="text-danger">*</span></label>
              <textarea
                className="reject-modal-textarea"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="reject-modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setRejectModal({ open: false, order: null })}
              >
                No, Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={!rejectReason.trim()}
                onClick={async () => {
                  if (rejectModal.order) {
                    await handleApproval(rejectModal.order, false);
                    setRejectModal({ open: false, order: null });
                  }
                }}
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
