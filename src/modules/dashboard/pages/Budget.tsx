import { useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { ReactNode, useEffect, useState } from "react";
import { createBudget, getBudgetList, deleteBudget, editBudget, getGroupNames } from "../dashboardSlice";
import Modal from "../../../shared/components/Modal";
import DynamicTable from "../../../shared/components/DynamicTable";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { Button } from "react-bootstrap";
import budgetFormConfig from "../../../shared/config/budgetFormConfig";
import ReusableForm from "../../../shared/components/ReusableForm";

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

// Default values
const defaultPagination: Pagination = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalRecords: 0,
};

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  isDate?: boolean;
}

interface BudgetRow {
  budgetId: number;
  name: string;
  budgetno: string;
  budgetname: string;
  moneyallocated: string; // numeric string (e.g., "5000")
  moneyleft: string;    // numeric string (e.g., "1500")
  createddate: string;  // ISO date string (e.g., "2025-07-11T11:08:14.672Z")
  actions?: ReactNode;
}

interface TableObject {
  list: BudgetRow[];
  columns: Column[];
  pagination: Pagination;
}

// interface FilterOptions {
//   name?: string;
//   memberRole?: string;
//   memberStatus?: string;
// }

const initialBudgetData = {
  name: "",
  budgetno: "",
  budgetname: "",
  moneyleft: "",
};

const Budget = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  // userRole.role= "admin";
  const navigate = useNavigate();
  console.log("Budget - navigate function:", navigate);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);
  console.log("Budget - loading state:", loading);
  console.log("Budget - error state:", error);
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>();
  const [editItem, setEditItem] = useState<BudgetRow | null>(null);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);

  const fetchBudget = async () => {
    try {
      const result = await dispatch(getBudgetList(userRole)).unwrap();
      console.log("Budget data fetched:", result);
      const updatedConfig = enhanceTableConfig(result.data, userRole);
      console.log("Budget data fetched:", updatedConfig);
      setData(updatedConfig);
    } catch (error) {
      // Optionally handle the error here
      console.error("Failed to fetch budget:", error);
    }
  };

  useEffect(() => {
    fetchBudget();
    fetchGroupNames();
  }, [dispatch]);

    const addBudgetModel = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (item: BudgetRow) => {
    const { actions, ...cleanedItem } = item; // Remove the 'actions' field
    setEditItem(cleanedItem); // Set cleaned item as form data
    setIsModalOpen(true);
  };

  const handleDelete = async (item: BudgetRow) => {
    let budgetObj = {
      budgetId: item.budgetId,
      user: userRole
    };
    // Assuming 'budgetno' is the unique identifier for the budget
    const result = await dispatch(deleteBudget(budgetObj)).unwrap();
    if (result.meta && result.meta.requestStatus === 'fulfilled') {
      console.log("Budget deleted successfully:", item);
      // Refresh the budget list after deletion
      fetchBudget();
    }
    fetchBudget();
  }

const enhanceTableConfig = (config: TableObject, userRole: { role?: string }) => {
  const enhancedColumns: Column[] = config.columns.map(col => ({
    ...col,
    sortable: col.sortable ?? true,
    isDate: col.key.toLowerCase().includes('date') ? true : col.isDate,
  }));

  // Add "actions" column if user is lab manager
  if (userRole.role === 'labMgmt') { //userRole.toLowerCase() === 'admin' || 
    enhancedColumns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
    });
  }

  const enhancedList = config.list.map(item => {
    const newItem = { ...item };

    if (userRole.role === 'labMgmt') {
      newItem["actions"] = (
        <>
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => handleEdit(newItem)}
          >
            Edit
          </button>
          <button
            className="btn-color upload-wrapper btn btn-danger"
            onClick={() => handleDelete(newItem)}
          >
            Delete
          </button>
        </>
      );
    }

    return newItem;
  });

  return {
    ...config,
    columns: enhancedColumns,
    list: enhancedList,
  };
}

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

const handleFormSubmit = async (formData: Record<string, any>) => {
  try {
    if (!formData || Object.keys(formData).length === 0) {
      alert("Please fill in the required fields.");
      return;
    }

    // Convert moneyleft to number to match backend schema
    formData.budgetname = `${formData.groupName}-${formData.budgetno}` || ""; 
    formData.name = formData.groupName || "";
    formData.moneyleft = Number(formData.moneyleft);
    formData.moneyalloted = Number(formData.moneyalloted);
    let budgetObj = {
      budget: formData,
      user: userRole,
      budgetId: editItem ? editItem.budgetId : undefined,
    };
    // formData.user = userRole;

    let result;

    if (editItem) {
      budgetObj.budgetId = editItem.budgetId; // Include ID for update
      result = await dispatch(editBudget(budgetObj)).unwrap();
      console.log("Budget updated successfully:", result);
    } else {
      delete budgetObj.budgetId; // Remove ID for creation
      result = await dispatch(createBudget(budgetObj)).unwrap();
      console.log("Budget added successfully:", result);
    }

    setIsModalOpen(false);
    setEditItem(null); // Clear edit mode
    fetchBudget();
  } catch (error: unknown) {
    console.error("Error during submission:", error);
    alert("An error occurred while saving. Please try again.");
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
          {userRole.role && userRole.role === 'labMgmt' && (
            <div className="title-header">
              <div className="btn-wrapper">
                <Button onClick={addBudgetModel} className="btn-color">
                  Add Budget
                </Button>
              </div>
            </div>
          )}

          <DynamicTable
            data={data?.list || []}
            columns={data?.columns || []}
            pagination={data?.pagination || defaultPagination}
          />

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Budget">
            <ReusableForm formConfig={budgetFormConfig(groupOptions || [])} initialValues={editItem || initialBudgetData} onSubmit={handleFormSubmit} />
          </Modal>
        </>
      ) : (
        <p>Loading...</p>
      )}

      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <ReusableForm formConfig={addProductFormConfig} initialValues={initialProductData} onSubmit={handleFormSubmit} />
      </Modal> */}
    </>
  );
};

export default Budget;
