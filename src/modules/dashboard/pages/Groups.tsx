import { useNavigate } from "react-router-dom";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { getGroupByHierarchy } from "../dashboardSlice";
// import Modal from "../../../shared/components/Modal";
import DynamicTable from "../../../shared/components/DynamicTable";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import { Button } from "react-bootstrap";
// import { console } from "inspector";

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

interface GroupMemberRow {
  groupName: string;
  leaderName: string;
  leaderEmail: string;
  memberName: string;
  memberEmail: string;
  memberRole: string;
  memberStatus: string;
}

interface Column {
  key: string;
  label: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

interface TableObject {
  list: GroupMemberRow[];
  columns: Column[];
  pagination: Pagination;
}

// interface FilterOptions {
//   groupName?: string;
//   memberRole?: string;
//   memberStatus?: string;
// }

const Groups = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  userRole.role= "admin";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);
  console.log("Groups - navigate function:", navigate);
  console.log("Groups - error:", error);
  const [data, setData] = useState<any>();

  const fetchGroups = async () => {
    try {
      const result = await dispatch(getGroupByHierarchy(userRole)).unwrap();
      console.log("Groups - fetched group data:", result);
      const groupData = {
  data: [
    {
      groupName: "BioChem Research Group",
      groupLeader: {
        userId: "gl_001",
        name: "Dr. Sophia Ray",
        email: "sophia.ray@example.com"
      },
      members: [
        {
          userId: "usr_101",
          name: "Alice Smith",
          email: "alice@example.com",
          role: "Scientist",
          status: "approved"
        },
        {
          userId: "usr_102",
          name: "John Doe",
          email: "john@example.com",
          role: "labMgmt",
          status: "pending"
        }
      ]
    },
    {
      groupName: "Molecular Biology Core",
      groupLeader: {
        userId: "gl_002",
        name: "Dr. Arjun Mehta",
        email: "arjun@example.com"
      },
      members: [
        {
          userId: "usr_201",
          name: "Priya Nair",
          email: "priya@example.com",
          role: "podept",
          status: "approved"
        },
        {
          userId: "usr_202",
          name: "Rajiv Singh",
          email: "rajiv@example.com",
          role: "Scientist",
          status: "approved"
        }
      ]
    }
  ]
};

  const sample = generateTableObject(groupData, 10)

    setData(generateTableObject(groupData, 10));
    console.log("Fetched groups:", sample)
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [dispatch]);

  const generateTableObject = (
      groupData: any,
      pageSize: number = 5
    ): TableObject => {
      // Step 1: Flatten nested data
      const flatData: GroupMemberRow[] = groupData.data.flatMap((group: any) =>
        group.members.map((member: any) => ({
          groupName: group.groupName,
          leaderName: group.groupLeader.name,
          leaderEmail: group.groupLeader.email,
          memberName: member.name,
          memberEmail: member.email,
          memberRole: member.role,
          memberStatus: member.status,
        }))
      );

      // Step 2: Auto-generate columns
      const sample = flatData[0] || {};
      const columns: Column[] = Object.keys(sample).map((key) => ({
        key,
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase()), // camelCase to human-readable
      }));

      // Step 3: Setup pagination
      const pagination: Pagination = {
        currentPage: 1,
        pageSize,
        totalPages: Math.ceil(flatData.length / pageSize),
        totalRecords: flatData.length,
      };

      return {
        list: flatData,
        columns,
        pagination,
      };
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
              <Button className="btn-color">
                Add Group
              </Button>
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

      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <ReusableForm formConfig={addProductFormConfig} initialValues={initialProductData} onSubmit={handleFormSubmit} />
      </Modal> */}
    </>
  );
};

export default Groups;
