import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import DynamicTable from "../../../shared/components/DynamicTable";
import Modal from "../../../shared/components/Modal";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { addOrder, approveAdmin, approvelabMgmt, deliveredPOD, downloadPDF, addFineChemicalOrder, editFineChemicalOrder, editOrder, fetchOrders, fetchOrdersOD, getBudgetList, getCompanies, getGroupNames, orderedPOD, rejectAdmin, rejectlabMgmt } from "../dashboardSlice";
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
      let filteredList = normalizedData.list || [];
      // labMgmt is the FIRST approver — sees ALL pending orders (no frontend filter needed)
      if (userRole?.role?.toLowerCase() === "groupleader") {
        // groupleader is the SECOND approver — only sees lab-approved orders
        filteredList = filteredList.filter((item: Order) => item.labApproved === true);
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
      let filteredList = normalizedData.list || [];

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
  }, [dispatch]);

const normalizeKeysAndCleanData = (data: any) => { 
    const { list, columns, pagination } = data;

    // Define spelling corrections
    const spellingCorrections: Record<string, string> = {
        recieved: "received",
        catalogue: "catalogue", // Keep backend spelling (since form uses it)
        companyinternalno: "companyinternalno",
        companyInternalNo: "companyinternalno", // ✅ normalize
        sapmaterialno: "sapmaterialno",
        sapMaterialNo: "sapmaterialno", // ✅ normalize
        remark: "remarks", // 
    };

    // Define keys to remove
    const unwantedKeys = new Set(["adminName", "userName", "createdBy", "updatedBy", "expiryDate", "approvalStatusDate"]);

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

  // ✅ Add Inventory Icon column only once
  if (!updatedColumns.some((col) => col.key === "inventoryType")) {
    updatedColumns.push({
      key: "inventoryType",
      label: "Inventory Type",
      sortable: false,
      isDate: false,
      hidden: false,
      onClick: undefined
    });
  }

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
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => handleOrder(item, "Delivered")}
          >
            Delivered
          </button>
        </>
      );
    }

    if (role === "labmgmt") {
      requestButtons = (
        <>
          <button
            className="btn-color upload-wrapper btn btn-primary"
            onClick={() => handleApproval(item, true)}
            disabled={!!item.labApproved}
          >
            Approve
          </button>
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => handleApproval(item, false)}
            disabled={!!item.labApproved}
          >
            Reject
          </button>
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
    // const selected = origalData?.list.filter((row) => row.orderId === rowId);
    // setSelectedOrder(selected ? selected[0] : null);

    //   if(row.inventoryType === "fineChemicalInventory") {
    //   const result = await dispatch(getFineChemicalById(parseInt(row.orderId))).unwrap();
    //   setSelectedOrder(mapFormDataToOrder(result.data.list[0]));
    // } else {
    //    const result = await dispatch(getProductById(parseInt(row.orderId))).unwrap();
    //    setSelectedOrder(mapFormDataToOrder(result.data));
    // }

    setSelectedOrder(mapFormDataToOrder(row, userRole));
    setIsModalOpen(true);
  };

  // 🟢 Approve/Reject Order
const handleApproval = async (order: Order, isApproved: boolean) => {
  try {
    let action;

    if (userRole.role === "admin" || userRole.role === "groupleader") {
      action = isApproved ? approveAdmin : rejectAdmin;
    } else if (userRole.role === "labMgmt") {
      action = isApproved ? approvelabMgmt : rejectlabMgmt;
    } else {
      throw new Error("Unauthorized role");
    }

    await dispatch(action(order.orderId)).unwrap();
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


   // 🟢 Ordered/Delievered Status Order
  const handleOrder = async (order: Order, status: string) => {
    try {
      const apiName = (status === "Ordered") ? orderedPOD : deliveredPOD;
      await dispatch(apiName({ id: order.orderId, user: { email: userRole.email, name: userRole.name, role: userRole.role, groupName: userRole.groupName } })).unwrap();
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
              ? UpdateOrderFormConfigFine(budget || [])
              : UpdateOrderFormConfig(budget || [])
          }
          initialValues={selectedOrder || {}}
          onSubmit={handleOrderSubmit}
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
          formConfig={addOrderFineChemicalFormConfig(budget || [], companyOptions)}
          initialValues={initialFineChemicalData || {}}
          onSubmit={handleAddFinechemicalt}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>
    </>
  );
};

export default Orders;
