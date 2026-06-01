// import { useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { ReactNode, useEffect, useState } from "react";
import {
  createBudget,
  getBudgetList,
  deleteBudget,
  editBudget,
  getGroupNames,
} from "../dashboardSlice";
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
  moneyallocated: string;
  moneyleft: string;
  createddate: string;
  actions?: ReactNode;
}

interface TableObject {
  list: BudgetRow[];
  columns: Column[];
  pagination: Pagination;
}

const initialBudgetData = {
  name: "",
  budgetno: "",
  budgetname: "",
  moneyleft: "",
};

const Budget = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  // const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>();
  const [editItem, setEditItem] = useState<BudgetRow | null>(null);

  // ✅ FIXED TYPE
  const [groupOptions, setGroupOptions] = useState<
    { label: string; key: string }[]
  >([]);

  useEffect(() => {
    fetchBudget();
    fetchGroupNames();
  }, [dispatch]);

  const fetchBudget = async () => {
    try {
      const result = await dispatch(getBudgetList(userRole)).unwrap();
      const updatedConfig = enhanceTableConfig(result.data, userRole);
      setData(updatedConfig);
    } catch (error) {
      console.error("Failed to fetch budget:", error);
    }
  };

  const addBudgetModel = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: BudgetRow) => {
    const { actions, ...cleanedItem } = item;
    setEditItem(cleanedItem);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: BudgetRow) => {
    const budgetObj = {
      budgetId: item.budgetId,
      user: userRole,
    };

    await dispatch(deleteBudget(budgetObj)).unwrap();
    fetchBudget();
  };

  const enhanceTableConfig = (
    config: TableObject,
    userRole: { role?: string }
  ) => {
    const enhancedColumns: Column[] = config.columns.map((col) => ({
      ...col,
      sortable: col.sortable ?? true,
      isDate: col.key.toLowerCase().includes("date"),
    }));

    if (userRole.role === "labMgmt") {
      enhancedColumns.push({
        key: "actions",
        label: "Actions",
        sortable: false,
      });
    }

    const enhancedList = config.list.map((item) => {
      const newItem = { ...item };

      if (userRole.role === "labMgmt") {
        newItem["actions"] = (
          <>
            <button
              className="btn btn-color me-2"
              onClick={() => handleEdit(newItem)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
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
  };

  // ✅ FIXED GROUP OPTIONS
  const fetchGroupNames = async () => {
    try {
      const result = await dispatch(getGroupNames()).unwrap();

      const groupNames = (result || [])
        .filter((g: any) => g?.groupName)
        .map((g: any) => ({
          label: g.groupName,
          key: g.groupName,
        }));

      setGroupOptions(groupNames);
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

      formData.budgetname = `${formData.groupName}-${formData.budgetno}` || "";
      formData.name = formData.groupName || "";
      formData.moneyleft = Number(formData.moneyleft);
      formData.moneyalloted = Number(formData.moneyalloted);

      const budgetObj: any = {
        budget: formData,
        user: userRole,
      };

      if (editItem) {
        budgetObj.budgetId = editItem.budgetId;
        await dispatch(editBudget(budgetObj)).unwrap();
      } else {
        await dispatch(createBudget(budgetObj)).unwrap();
      }

      setIsModalOpen(false);
      setEditItem(null);
      fetchBudget();
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred while saving.");
    }
  };

  return (
    <>
      {error && <p>Error: {error}</p>}

      {!loading ? (
        <>
          {userRole.role === "labMgmt" && (
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

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Add Budget"
          >
            <ReusableForm
              formConfig={budgetFormConfig(groupOptions || [])}
              initialValues={editItem || initialBudgetData}
              onSubmit={handleFormSubmit}
            />
          </Modal>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Budget;