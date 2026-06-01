import { useEffect, useState } from "react";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import DynamicTable from "../../../shared/components/DynamicTable";
import {
  getUsersList,
  getUserApproval,
  deleteUsers,
  createGroup,
  getGroupNames,
  deleteGroup,
} from "../dashboardSlice";
import { useParams } from "react-router-dom";

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

const formatUsersForTable = (
  users: any[],
  role: string | null,
  onApprove: (userId: number) => void,
  onReject: (userId: number) => void,
  _onDelete: (userId: number) => void
): ProductListResponse => {
  const columns: Column[] = [
    // { key: "userId", label: "User ID", sortable: true },
    {
      key: "firstname", label: "First Name", sortable: true,
      hidden: undefined
    },
    {
      key: "lastname", label: "Last Name", sortable: true,
      hidden: undefined
    },
    {
      key: "email", label: "Email", sortable: true,
      hidden: undefined
    },
    {
      key: "role", label: "Role", sortable: true,
      hidden: undefined
    },
    {
      key: "status", label: "Status", sortable: true,
      hidden: undefined
    },
    {
      key: "groupName", label: "Group", sortable: true,
      hidden: undefined
    },
    {
      key: "actions", label: "Actions", sortable: true,
      hidden: undefined
    },
  ];

  const pagination: Pagination = {
    currentPage: 1,
    pageSize: 10,
    totalPages: Math.ceil(users.length / 10),
    totalRecords: users.length,
  };

  const updatedList = users.map((item) => ({
    ...item,
    status: item.status.toLowerCase(),
    actions:
      role === "admin" || role === "groupleader" ? (
        <div>
          {item.action === true && (
            <>
              <button
                disabled={item.status?.toLowerCase() === "approved"}
                className="btn-color upload-wrapper btn btn-primary"
                onClick={() => onApprove(item)}
              >
                Approve
              </button>
              <button
                // disabled={
                //   ["rejected", "denied"].includes(item.status?.toLowerCase())
                // }
                disabled={item.status?.toLowerCase() === "approved"}
                className="btn-color upload-wrapper btn btn-primary"
                onClick={() => onReject(item)}
              >
                Reject
              </button>
            </>
          )}
        </div>
      ) : null,
  }));

  return {
    list: updatedList,
    columns,
    pagination,
  };
};

const Users = () => {
  const { id } = useParams<{ id?: string }>();
  console.log("Users - id parameter:", id);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  console.log("Users - toastMessage:", toastMessage);
  console.log("Users - toastType", toastType);
  const [groupOptions, setGroupOptions] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchGroupNames();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const result = await dispatch(getUsersList(currentUser)).unwrap();
      const formatted = formatUsersForTable(result, currentUser.role, handleApprove, handleReject, handleDelete);
      setData(formatted);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchGroupNames = async () => {
    try {
      const result = await dispatch(getGroupNames()).unwrap();
      if (Array.isArray(result)) {
        const groupNames = result.map((group: any) => ({
          id: group.id,
          name: group.groupName,
        }));
        setGroupOptions(groupNames);
      }
    } catch (error) {
      console.error("Failed to fetch group names:", error);
    }
  };

  const doesGroupExist = (groupName: string): boolean => {
    return groupOptions.some((group) => group.name.toLowerCase() === groupName.toLowerCase());
  };

  const handleApprove = async (user: any) => {
    const userObj = {
      approverId: currentUser.id,
      user: user,
      approve: true,
    };

    try {
      const result = await dispatch(getUserApproval(userObj)).unwrap();

      if (user.role === "groupleader" && result?.userStatus?.toLowerCase() === "approved") {
        console.log("User approved:", doesGroupExist(user.groupName));
        if (!doesGroupExist(user.groupName)) {
          const groupResult = await dispatch(createGroup({ groupName: user.groupName })).unwrap();
          if (groupResult) {
            setToastMessage("Group created successfully!");
            setToastType("success");
            fetchGroupNames(); // Refresh groups
          }
        }
      }

      fetchUsers();
    } catch (err) {
      console.error("Approval failed:", err);
      fetchUsers();
    }
  };

  const handleReject = async (user: any) => {
    const userObj = {
      approverId: currentUser.id,
      user: user,
      approve: false,
    };

    try {
      const result = await dispatch(getUserApproval(userObj)).unwrap();

      if (
        user.role === "groupleader" &&
        ["rejected", "denied"].includes(result?.userStatus?.toLowerCase())
      ) {
        const existingGroup = groupOptions.find(
          (group) => group.name.toLowerCase() === user.groupName.toLowerCase()
        );

        if (existingGroup && existingGroup.id) {
          // ✅ Group exists, now delete
          await dispatch(deleteGroup(parseInt(existingGroup.id))).unwrap();
          setToastMessage("Group deleted successfully.");
          setToastType("success");
          fetchGroupNames(); // refresh groupOptions
        }
      }

      fetchUsers();
    } catch (err) {
      console.error("Rejection failed:", err);
      fetchUsers();
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await dispatch(deleteUsers(userId)).unwrap();
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
      fetchUsers();
    }
  };

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

export default Users;
