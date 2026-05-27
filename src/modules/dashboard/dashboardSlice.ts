import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../shared/api/axiosClient";


// interface Product {
//   productid: number;
//   productname: string;
//   catalogue: number;
//   companyname: string;
//   quantity: number;
//   companyInternalno: number;
//   sapmaterialno: number;
//   weightvolsubqty: string;
//   budgetno: number;
//   orderdate: string;
//   qtypriceordered: number;
//   concentration: string;
//   priority: string;
//   remark: string;
//   received: string;
// }

// interface Project {
//   projectId: number;
//   projectname: string;
//   shortdescription: string;
//   longDescription: string;
//   budgetno: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

interface Notebook {
  noteId: number;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface DashboardState {
  orders: any[];
  products: any[];
  projects: any[];
  notebooks: Notebook[];
  loading: boolean;
  error: string | null;
  users: any[];
  approvals: any[];
}

const initialState: DashboardState = {
  orders: [],
  products: [],
  projects: [],
  notebooks: [],
  loading: false,
  error: null,
  users: [],
  approvals: [],
};

interface Group {
  id: string;
  name: string;
}

interface GroupData {
  groupName: string;
}

interface GroupResponse {
  data: {
    group: Group;
  };
}

// interface GroupListResponse {
//   data: {
//     groups: Group[];
//   };
// }

// Centralized error handler
const handleThunkError = (error: any, thunkAPI: any) =>
  thunkAPI.rejectWithValue(
    error.response?.data?.message || error.message || "An unknown error occurred"
  );

const createThunk = <T, R>(
  type: string,
  request: (arg: T) => Promise<R>
) =>
  createAsyncThunk(type, async (arg: T, thunkAPI) => {
    try {
      const response = await request(arg);
      return response;
    } catch (error) {
      return handleThunkError(error, thunkAPI);
    }
  });

// 🟢 Fetch Orders
export const fetchOrders = createThunk(
  "dashboard/getOrdersList",
  (_user: { email: string; name: string; role: string; groupName: string }) =>
    axiosClient
      .get(`api/orders/getOrdersList?page=1&size=10000&id=10`)
      .then((res) => res.data)
);

// 🟢 Approve/Reject Admin Calls
export const rejectAdmin = createThunk("dashboard/rejectGroupLeader", (id: number) =>
  axiosClient.get(`api/orders/rejectGroupLeader/${id}`).then((res) => res.data)
);

export const approveAdmin = createThunk("dashboard/approveGroupLeader/approve", (id: number) =>
  axiosClient.get(`api/orders/approveGroupLeader/approve/${id}`).then((res) => res.data)
);

// 🟢 Approve/Reject Lab Manager Calls
export const rejectlabMgmt = createThunk("dashboard/labReject", (id: number) =>
  axiosClient.get(`api/orders/labReject/${id}`).then((res) => res.data)
);

export const approvelabMgmt = createThunk("dashboard/labApprove/approve", (id: number) =>
  axiosClient.get(`api/orders/labApprove/approve/${id}`).then((res) => res.data)
);

// 🟢 Fetch Orders POD Calls
export const fetchOrdersOD = createThunk("dashboard/getOrdersListByGroupName", (user: { email: string; name: string; role: string; groupName: string }) =>
  axiosClient.get(`api/orders/getOrdersListByGroupName?page=1&size=10000&id=10&email=${user.email}&name=${user.name}&role=${user.role}&groupName=${user.groupName}`)
  .then((res) => res.data)
);

// 🟢 Ordered/Delivered POD Calls
export const orderedPOD = createThunk(
  "dashboard/ordered",
  ({ id, user }: { id: number; user: { email: string; name: string; role: string; groupName: string } }) =>
    axiosClient
      .get(`api/orders/ordered/${id}?page=1&size=10000&id=10&email=${user.email}&name=${user.name}&role=${user.role}`)
      .then((res) => res.data)
);

export const deliveredPOD = createThunk(
  "dashboard/delivered",
  ({ id, user }: { id: number; user: { email: string; name: string; role: string; groupName: string } }) =>
  axiosClient.get(`api/orders/delivered/${id}?page=1&size=10000&id=10&email=${user.email}&name=${user.name}&role=${user.role}`).then((res) => res.data)
);

// 🟢 CRUD operations for Orders
export const addOrder = createThunk("dashboard/addOrder", (formData: FormData) =>
  axiosClient.post("api/orders/addOrder", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data)
);

export const editOrder = createThunk("dashboard/editOrder", (order: any) =>
  axiosClient.put(`api/orders/modifyOrder`, order).then((res) => res.data)
);

export const deleteOrder = createThunk("dashboard/deleteOrder", (id: number) =>
  axiosClient.delete(`api/orders/deleteOrder/${id}`).then(() => id)
);

export const addFineChemicalOrder = createThunk("dashboard/addOrderFineChemical", (formData: FormData) =>
  axiosClient.post("api/orders/addOrderFineChemical", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data)
);

export const editFineChemicalOrder = createThunk("dashboard/modifyOrder", (order: any) =>
  axiosClient.put(`api/orders/modifyOrder`, order).then((res) => res.data)
);

export const deleteFineChemicalOrder = createThunk("dashboard/deleteOrder", (id: number) =>
  axiosClient.delete(`api/orders/deleteOrder/${id}`).then(() => id)
);

// 🟢 CRUD operations for Products
export const fetchProducts = createThunk("dashboard/getInventoryList", (user) =>
  axiosClient.post("api/inventory/getInventoryList?page=1&size=10000", user).then((res) => res.data)
);

export const addProduct = createThunk(
  "dashboard/addProduct",
  async (formData: FormData) => {
    const response = await axiosClient.post(
      "/api/inventory/addProduct",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
);

export const editProduct = createThunk("dashboard/updateProduct", (product: any) =>
  // axiosClient.put("api/inventory/updateProduct", product).then((res) => res.data)
  axiosClient
    .put("api/inventory/updateProduct", product,
    // {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // }
    )
    .then((res) => res.data)
);

export const deleteProduct = createThunk("dashboard/deleteProduct", (id: number) =>
  axiosClient.delete(`api/inventory/deleteProduct?productId=${id}`).then(() => id)
);

// 🟢 Get Product by ID
export const getFineChemicalById = createThunk("dashboard/finechemical/getFineChemicalById", (id: number) =>
  axiosClient.get(`api/finechemical/getFineChemicalById/${id}`).then((res) => res.data)
);

// 🟢 CRUD operations for Fine Chemicals
export const fetchFineChemicals = createThunk("dashboard/finechemical/getFineChemicalInventory", (user) =>
  axiosClient.post("api/finechemical/getFineChemicalInventory?page=1&limit=10&sortBy=createdAt&order=desc", user).then((res) => res.data)
);

export const addFineChemicals = createThunk("dashboard/finechemical/addFineChemical", (product: any) =>
  // axiosClient.post("/api/finechemical/addFineChemical", product).then((res) => res.data)
  axiosClient
    .post("/api/finechemical/addFineChemical", product, {
      headers: {
         "Content-Type": "multipart/form-data", // ✅ required
          Accept: "*/*",
      },
    })
    .then((res) => res.data)
);

export const editFineChemicals = createThunk("dashboard/updateProduct", (product: any) =>
  // axiosClient.put(`api/finechemical/updateFineChemical/${product.productid}`, product).then((res) => res.data)
  axiosClient
    .put(`api/finechemical/updateFineChemical/${product.productId}`, product,
    // {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //   },
    // }
    )
    .then((res) => res.data)
);

export const deleteFineChemicals = createThunk("dashboard/finechemical/deletefinneChemicalt", (id: number) =>
  axiosClient.delete(`api/finechemical/deletefinneChemicalt?productId=${id}`).then(() => id)
);

// ✅ Create a new group
export const createGroup = createAsyncThunk<GroupResponse, GroupData>(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<GroupResponse>('groups/createGroup', groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ delete group
export const deleteGroup = createThunk("groups", (id: number) =>
  axiosClient.delete(`groups/${id}`).then(() => id)
);

// ✅ Fetch group names
export const getGroupNames = createAsyncThunk<any>(
  'groups/getAllGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>('groups/getAllGroups');
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Fetch group names
export const getGroupByHierarchy = createAsyncThunk<any, { id: number; role: string }>(
  'group-leader/groups/hierarchy',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>(`api/group-leader/groups/hierarchy?requesterRole=${user.role}&requesterId=${user.id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ approve User
export const getUserApproval = createAsyncThunk<any, { user: any }>(
  'group-leader/approve-user',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>(`api/group-leader/approve-user`, user);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Fetch users
export const getUsersList = createAsyncThunk<any, { user: any }>(
  'auth/getAllUsers',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>('auth/getAllUsers', user);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Delete users
export const deleteUsers = createThunk("auth/deleteUser", (id: number) =>
  axiosClient.delete(`auth/deleteUser?userId=${id}`).then(() => id)
);

// ✅ Fetch Archieves
export const getArchievesList = createAsyncThunk<any, { user: any }>(
  'api/archive/archives',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>('api/archive/archives', user);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Delete Archieves
export const deleteInventoryArchieves = createThunk(
  "api/archive/deleteInventory",
  (InventoryItem: any) =>
    axiosClient
      .delete("api/archive/deleteInventory", { data: InventoryItem })
      .then(() => InventoryItem)
);

// ✅ Delete Archieves
export const deleteArchievesSoft = createThunk(
  "api/archive/archives/soft",
  (InventoryItem: any) =>
    axiosClient
      .delete("api/archive/archives/soft", { data: InventoryItem })
      .then(() => InventoryItem)
);

// ✅ Delete Archieves
export const deleteArchievesPermenent = createThunk("api/archive/archives/permanent", (InventoryItem: any) =>
  axiosClient.delete(`api/archive/archives/permanent`, InventoryItem).then(() => InventoryItem)
);

// ✅ Fetch getNotifications
export const getNotifications = createAsyncThunk<any, { user: any }>(
  'api/v1/notifications',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>('api/v1/notifications', user);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ Fetch getNotifications Read
export const markNotificationAsRead = createAsyncThunk<any, { id: number }>(
  'api/v1/notifications',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>(`api/v1/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);


// 🟢 Upload Product API
export const uploadProduct = createThunk(
  "dashboard/uploadProduct",
  async (formData: FormData) =>
    axiosClient
      .post("api/inventory/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data)
);

// 🟢 Upload FineChemical API
export const uploadFineChemical = createThunk(
  "api/finechemical/uploadFineChemicals",
  async (formData: FormData) => {
    const groupName = formData.get('groupName');
    return axiosClient
      .post(`api/finechemical/uploadFineChemicals?groupName=${groupName}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
);

// 🟢 Upload Product API
export const downloadPDF = createAsyncThunk(
  "dashboard/downloadAttachment",
  async (id: number) => {
    const response = await axiosClient.get(`api/orders/downloadAttachment/${id}`, {
      responseType: "blob",
    });

    const blob = response.data;
    const url = URL.createObjectURL(blob); // Convert Blob to URL
    return url;
  }
);

// 🟢 Upload Product API
export const downloadPDFInv = createAsyncThunk(
  "dashboard/inventory",
  async (id: number) => {
    const response = await axiosClient.get(`api/inventory/${id}/downloadFile`, {
      responseType: "blob",
    });

    const blob = response.data;
    const url = URL.createObjectURL(blob); // Convert Blob to URL
    return url;
  }
);

// 🟢 Upload Product API
export const downloadPDFFineChecm = createAsyncThunk(
  "dashboard/finechemical",
  async (id: number) => {
    const response = await axiosClient.get(`api/finechemical/${id}/downloadFile`, {
      responseType: "blob",
    });

    const blob = response.data;
    const url = URL.createObjectURL(blob); // Convert Blob to URL
    return url;
  }
);


// 🟢 Get Borrowed Inventory
export const getBorrowedInventory = createThunk(
  "dashboard/getBorrowedInventory",
  ({
    page = 1,
    size = 10,
    user,
    filters = {},
  }: {
    page?: number;
    size?: number;
    user: any;
    filters?: any;
  }) =>

    axiosClient
      .post(
        `/api/inventory/borrowed?page=${page}&size=${size}`,
        {
          user,
          filters,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res.data)
);


// 🟢 Get Product by ID
export const getProductById = createThunk("dashboard/getProduct", (id: number) =>
  axiosClient.get(`api/inventory/getProduct/${id}`).then((res) => res.data)
);

// 🟢 Share Product
export const shareProduct = createThunk(
  "dashboard/shareProduct",
  (obj: any) =>
    axiosClient
      .post("/api/share/shareProduct", {

        productId: obj.productId,
        quantity: Number(obj.quantity),
        inventoryType: obj.inventoryType,

        timeSlots: obj.timeSlots,

        // ✅ user object
        user: {
          id: obj.user.id,
          userId: obj.user.userId,
          email: obj.user.email,
          name: obj.user.name,
          role: obj.user.role,
          groupName: obj.user.groupName,
          status: obj.user.status,
        },

        // ✅ address OUTSIDE user
        address: {
          line1: obj.address?.line1 || "",
          line2: obj.address?.line2 || "",
          city: obj.address?.city || "",
          state: obj.address?.state || "",
          postalCode:
            obj.address?.postalCode || "",
          country:
            obj.address?.country || "",
        },
      })
      .then((res) => res.data)
);

// 🟢 Unshare Product
export const unshareProduct = createThunk(
  "dashboard/unshareProduct",
  (obj: any) =>
    axiosClient
      .post(`/api/share/unshare`, {
        productId: obj.productId,
        inventoryType: obj.inventoryType,
        user: obj.user,
        reason: obj.reason,
      })
      .then((res) => res.data)
);

// 🟢 Create Share Request
export const createShareRequest = createThunk(
  "dashboard/createShareRequest",
  (obj: any) =>
    axiosClient
      .post(`/api/share/request`, {
        productId: obj.productId,
        quantity: obj.quantity,
        user: obj.user,
        address: obj.address,
        timeSlots: obj.timeSlots,
      })
      .then((res) => res.data)
);

// 🟢 Get Receiver Requests
export const getReceiverRequests = createThunk(
  "dashboard/getReceiverRequests",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/requests/receiver?page=${obj.page || 1}&size=${obj.size || 10}`,
        {
          user: obj.user,

          filters:
            obj.filters || {},
        }
      )
      .then((res) => res.data)
);

// 🟢 Get Donor Requests
export const getDonorRequests = createThunk(
  "dashboard/getDonorRequests",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/requests/donor?page=${obj.page || 1}&size=${obj.size || 10}`,
        {
          user: obj.user,

          filters:
            obj.filters || {},
        }
      )
      .then((res) => res.data)
);

// 🟢 Reject Request
export const rejectShareRequest = createThunk(
  "dashboard/rejectShareRequest",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/request/reject`,
        {
          requestId:
            obj.requestId,

          rejectedBy:
            obj.rejectedBy,

          reason:
            obj.reason,
        }
      )
      .then((res) => res.data)
);

// 🟢 Approve Share Request
export const approveShareRequest = createThunk(
  "dashboard/approveShareRequest",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/request/approve`,
        {
          requestId:
            obj.requestId,

          approvedBy:
            obj.approvedBy,
        }
      )
      .then((res) => res.data)
);

// 🟢 Mark Request as Received
export const markRequestReceived = createThunk(
  "dashboard/markRequestReceived",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/request/${obj.requestId}/received`,
        {
          receivedBy:
            obj.receivedBy,

          receivedAt:
            obj.receivedAt,

          notes:
            obj.notes,
        }
      )
      .then((res) => res.data)
);

// 🟢 Get Shared Product Time Slots
export const getSharedProductTimeSlots = createThunk(
  "dashboard/getSharedProductTimeSlots",
  (sharedInventoryId: number | string) =>
    axiosClient
      .post(`/api/share/getTimeSlots/${sharedInventoryId}`)
      .then((res) => res.data)
);

// 🟢 Get Shared Product List
export const getSharedProductList = createThunk(
  "dashboard/getSharedProductList",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/getSharedProductList?page=${obj.page || 1}&size=${obj.size || 10}`,
        {
          id: obj.user?.id,
          userId: obj.user?.userId,
          email: obj.user?.email,
          name: obj.user?.name,
          role: obj.user?.role,
          groupName: obj.user?.groupName,
          status: obj.user?.status,
        }
      )
      .then((res) => res.data)
);

// 🟢 Get All Shared Product List
export const getAllSharedProductList = createThunk(
  "dashboard/getAllSharedProductList",
  (obj: any) =>
    axiosClient
      .post(
        `/api/share/getAllSharedProductList?page=${obj.page || 1}&size=${obj.size || 10}`
      )
      .then((res) => res.data)
);

// 🔴 Revoke Shared Product
export const revokeSharedProduct = createThunk(
  "dashboard/revokeSharedProduct",
  (obj: any) =>
    axiosClient
      .delete(
        `/api/share/revokeShare/${obj.productId}?inventoryType=${obj.inventoryType}`
      )
      .then((res) => res.data)
);

// ✅ Fetch all companies
export const getCompanies = createAsyncThunk<any>(
  'companies/getAllCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get<any>('companies/getAllCompanies');
      return response.data; // array of { id, companyNo, companyName }
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// ✅ Fetch Budget names
export const getBudgetList = createThunk("budget/getBudgetList", (user) =>
  axiosClient.post("api/budget/getBudgetList?page=1&limit=10&sortBy=createddate&order=desc", user).then((res) => res.data)
);

// ✅ Define Budget interface
interface Budget {
  budgetId?: number;
  budget: object;
  user: object;
}

// ✅ Create a createBudget
export const createBudget = createAsyncThunk<any, Budget>(
  'budget/addBudget',
  async (budget, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post<any>('api/budget/addBudget', budget);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// ✅ edit Budget
export const editBudget = createThunk("budget/updateBudget", (budget: any) =>
  axiosClient.put(`api/budget/updateBudget?role=${budget.budgetId}`, budget).then((res) => res.data)
);

// ✅ delete Budget
export const deleteBudget = createThunk("budget/delecteBudget", (budget: any) =>
  axiosClient.delete(`/api/budget/delecteBudget?budgetID=${budget.budgetId}`, {
    data: budget.user,
  }).then((res) => res.data)
);

// 🟢 Fetch Projects
export const fetchProjects = createThunk(
  "dashboard/projects",
  (payload: any) =>
    axiosClient
      .get(`/projects`, {
        params: {
          page: payload.page || 1,
          size: payload.pageSize || 10,
          search: payload.search || "",
          groupName: payload.groupName, // ✅ required by swagger
        },
      })
      .then((res) => res.data)
);

// 🟢 Get Project By ID
export const getProjectById = createThunk(
  "dashboard/getProjectById",
  ({ projectId, groupName }: any) =>
    axiosClient
      .get(`/projects/${projectId}`, {
        params: {
          groupName, // ✅ required by swagger
        },
      })
      .then((res) => res.data)
);

// ✅ ADD PROJECT
export const addProject = createThunk(
  "dashboard/addProject",
  async (projectData: any) => {
    const formData = new FormData();

    // ✅ project JSON
    formData.append(
      "project",
      new Blob([JSON.stringify(projectData.project)], {
        type: "application/json",
      })
    );

    // ✅ userDetails JSON
    formData.append(
      "userDetails",
      new Blob([JSON.stringify(projectData.userDetails)], {
        type: "application/json",
      })
    );

    // ✅ multiple attachments
    if (projectData.attachments?.length) {
      projectData.attachments.forEach((file: File) => {
        formData.append("attachments", file);
      });
    }

    return axiosClient
      .post("/projects/addProjectsWithAttachments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
);

// 🟢 EDIT PROJECT
export const editProject = createThunk(
  "dashboard/updateProject",
  ({ projectId, project, userDetails, attachments }: any) => {

    // ✅ multipart form data required by swagger
    const formData = new FormData();

    // ✅ append project JSON
    formData.append(
      "project",
      new Blob([JSON.stringify(project)], {
        type: "application/json",
      })
    );

    // ✅ append userDetails JSON
    formData.append(
      "userDetails",
      new Blob([JSON.stringify(userDetails)], {
        type: "application/json",
      })
    );

    // ✅ optional attachments
    if (attachments?.length) {
      attachments.forEach((file: File) => {
        formData.append("attachments", file);
      });
    }

    return axiosClient
      .put(
        `/projects/${projectId}/updateprojectattachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => res.data);
  }
);

// // 🟢 Edit Project
// export const editProject = createThunk(
//   "dashboard/updateProject",
//   ({ projectId, project }: any) =>
//     axiosClient
//       .put(`/projects/${projectId}`, project)
//       .then((res) => res.data)
// );

// 🟢 Delete Project
export const deleteProject = createThunk(
  "dashboard/deleteProject",
  ({ projectId, userDetails }: any) => {

    // ✅ request payload as plain JSON
    const payload = {
      id: userDetails?.id || userDetails?.userId || "",
      userId: userDetails?.userId || "",
      email: userDetails?.email || "",
      name: userDetails?.name || "",
      role: userDetails?.role || "",
      groupName: userDetails?.groupName || "",
      status: userDetails?.status || "Approved",
    };

    return axiosClient
      .delete(`/projects/${projectId}`, {
        data: payload, // ✅ JSON body
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data);
  }
);

// 🟢 Fetch Project Archives
export const fetchProjectArchives = createThunk(
  "dashboard/fetchProjectArchives",
  (payload: any) =>
    axiosClient
      .get("/projects/archives", {
        params: {
          page: payload.page || 1,
          size: payload.size || 10,

          // ✅ flatten userDetails into query params
          id: payload.userDetails?.id || payload.userDetails?.userId,

          userId: payload.userDetails?.userId || "",

          email: payload.userDetails?.email || "",

          name: payload.userDetails?.name || "",

          role: payload.userDetails?.role || "",

          groupName: payload.userDetails?.groupName || "",

          status: payload.userDetails?.status || "Approved",
        },
      })
      .then((res) => res.data)
);

// 🟢 Upload Project Attachments
export const uploadProjectAttachments = createThunk(
  "dashboard/uploadProjectAttachments",
  ({
    projectId,
    files,
    userDetails,
  }: {
    projectId: string;
    files: File[];
    userDetails: any;
  }) => {

    const formData = new FormData();

    // ✅ append attachments
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    // ✅ append userDetails (required by swagger)
    formData.append(
      "userDetails",
      new Blob([JSON.stringify(userDetails)], {
        type: "application/json",
      })
    );

    return axiosClient
      .post(`projects/${projectId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
);

// 🟢 Download Project Attachment
export const downloadProjectAttachment = createThunk(
  "dashboard/downloadProjectAttachment",
  async ({
    projectId,
    fileName,
    userDetails,
    action = "download",
  }: {
    projectId: string;
    fileName: string;
    userDetails: any;
    action?: "download" | "open";
  }) => {

    const response = await axiosClient.get(
      `projects/${projectId}/attachments/download`,
      {
        params: {
          fileName,

          // ✅ swagger params
          id: userDetails?.id || 0,
          userId: userDetails?.userId || "",
          email: userDetails?.email || "",
          name: userDetails?.name || "",
          role: userDetails?.role || "",
          groupName: userDetails?.groupName || "",
          status: userDetails?.status || "",
        },

        responseType: "blob",
      }
    );

    // ✅ proper mime type
    const contentType =
      response.headers["content-type"] ||
      "application/octet-stream";

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const url = window.URL.createObjectURL(blob);

    // =========================================
    // ✅ OPEN / PREVIEW
    // =========================================
    if (action === "open") {

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      return true;
    }

    // =========================================
    // ✅ DOWNLOAD
    // =========================================
    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", fileName);

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    return true;
  }
);

// 🟢 Delete Project Attachment
export const deleteProjectAttachment = createThunk(
  "dashboard/deleteProjectAttachment",
  ({
    projectId,
    fileName,
    userDetails,
  }: {
    projectId: string;
    fileName: string;
    userDetails: any;
  }) =>

    axiosClient
      .delete(`projects/${projectId}/attachments`, {
        params: {
          fileName, // ✅ required query param
        },

        // ✅ request body required by swagger
        data: userDetails,

        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data)
);

// ✅ Get All Notebooks
export const fetchNotebooks = createThunk(
  "notebooks/getAll",
  (params?: {
    projectId?: string;
    budgetId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
    userId?: string;
    groupName?: string;
    role?: string;
  }) => {

    const {
      projectId,
      budgetId,
      fromDate,
      toDate,
      page = 1,
      size = 10,
      userId,
      groupName,
      role,
    } = params || {};

    // ✅ safe query params
    const queryParams: any = {
      page,
      size,
    };

    if (projectId) queryParams.projectId = projectId;
    if (budgetId) queryParams.budgetId = budgetId;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;

    return axiosClient
      .get("/api/notebooks", {
        params: queryParams,

        // ✅ required headers from swagger
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then((res) => res.data);
  }
);

// ✅ Get Notebook By ID
export const getNotebookById = createThunk(
  "notebooks/getById",
  ({
    noteId,
    userId,
    groupName,
    role,
  }: {
    noteId: number;
    userId: string;
    groupName: string;
    role: string;
  }) =>

    axiosClient
      .get(`/api/notebooks/${noteId}`, {

        // ✅ required headers from swagger
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then((res) => res.data)
);

// ✅ Create Notebook (WITH ATTACHMENTS - max 5)
export const createNotebook = createThunk(
  "notebooks/create",
  (
    data: any
  ) => {

    const formData = new FormData();

    // ✅ Append note JSON
    formData.append(
      "note",
      new Blob([JSON.stringify(data.note)], {
        type: "application/json",
      })
    );

    // ✅ Append userDetails JSON (required by swagger)
    formData.append(
      "userDetails",
      new Blob([JSON.stringify(data.userDetails)], {
        type: "application/json",
      })
    );

    // ✅ Append attachments (max 5)
    if (data.attachments?.length) {

      const files = data.attachments.slice(0, 5);

      files.forEach((file: string | Blob) => {
        formData.append("attachments", file);
      });
    }

    return axiosClient
      .post("/api/notebooks/createNoteWithAttachments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
);

// ✅ Update Notebook
export const updateNotebook = createThunk(
  "notebooks/update",
  ({
    noteId,
    data,
  }: {
    noteId: number;
    data: any;
  }) =>

    axiosClient
      .put(`/api/notebooks/${noteId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data)
);

// ✅ Delete Notebook
export const deleteNotebook = createThunk(
  "notebooks/delete",
  ({
    noteId,
    userId,
    groupName,
    role,
  }: {
    noteId: number;
    userId: string;
    groupName: string;
    role: string;
  }) =>

    axiosClient
      .delete(`/api/notebooks/${noteId}`, {

        // ✅ required swagger headers
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then(() => noteId)
);

export const uploadNotebookAttachments = createThunk(
  "notebooks/uploadAttachments",
  ({
    noteId,
    files,
    metadata,
    userDetails,
  }: {
    noteId: number;
    files: File[];
    metadata?: string;
    userDetails: any;
  }) => {

    const formData = new FormData();

    // ✅ append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // ✅ optional metadata
    if (metadata) {
      formData.append("metadata", metadata);
    }

    // ✅ required swagger field
    formData.append(
      "userDetails",
      new Blob([JSON.stringify(userDetails)], {
        type: "application/json",
      })
    );

    return axiosClient
      .post(`/api/notebooks/${noteId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }
);

// 🟢 Download Notebook Attachment
export const downloadNotebookAttachment = createThunk(
  "notebooks/downloadAttachment",
  async ({
    noteId,
    fileName,
    userId,
    groupName,
    role,
    action = "download",
  }: {
    noteId: number;
    fileName: string;
    userId: string;
    groupName: string;
    role: string;
    action?: "download" | "open";
  }) => {

    const response = await axiosClient.get(
      `/api/notebooks/${noteId}/attachments/download`,
      {
        // ✅ query params
        params: {
          fileName,
        },

        // ✅ swagger required headers
        headers: {
          userId,
          groupName,
          role,
        },

        // ✅ IMPORTANT
        responseType: "blob",
      }
    );

    // ✅ detect proper file type
    const contentType =
      response.headers["content-type"] || "application/pdf";

    // ✅ create blob with mime type
    const blob = new Blob([response.data], {
      type: contentType,
    });

    const url = window.URL.createObjectURL(blob);

    // =========================================
    // ✅ OPEN / PREVIEW IN NEW TAB
    // =========================================
    if (action === "open") {

      window.open(url, "_blank");

      // optional cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      return true;
    }

    // =========================================
    // ✅ DOWNLOAD FILE
    // =========================================
    const link = document.createElement("a");

    link.href = url;

    link.setAttribute("download", fileName);

    document.body.appendChild(link);

    link.click();

    link.remove();

    // cleanup
    window.URL.revokeObjectURL(url);

    return true;
  }
);

// 🟢 Delete Notebook Attachment
// 🟢 Delete Notebook Attachment
export const deleteNotebookAttachment = createThunk(
  "dashboard/deleteNotebookAttachment",
  ({
    noteId,
    fileName,
    userId,
    groupName,
    role,
  }: {
    noteId: number;
    fileName: string;
    userId: string;
    groupName: string;
    role: string;
  }) =>

    axiosClient
      .delete(`/api/notebooks/${noteId}/attachments`, {

        // ✅ query param
        params: {
          fileName,
        },

        // ✅ required swagger headers
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then((res) => res.data)
);

// 🟢 Get Notebook Versions
export const getNotebookVersions = createThunk(
  "notebooks/getVersions",
  ({
    noteId,
    page = 1,
    size = 10,
    userId,
    groupName,
    role,
  }: {
    noteId: number;
    page?: number;
    size?: number;
    userId: string;
    groupName: string;
    role: string;
  }) =>

    axiosClient
      .get(`/api/notebooks/${noteId}/versions`, {

        // ✅ query params
        params: {
          page,
          size,
        },

        // ✅ required swagger headers
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then((res) => res.data)
);

// ✅ Autosave Notebook
export const autosaveNotebook = createThunk(
  "notebooks/autosave",
  ({ noteId, data }: { noteId: number; data: any }) =>
    axiosClient
      .put(`/api/notebooks/${noteId}/autosave`, data)
      .then((res) => res.data)
);

// ✅ Autosave Notebook
export const archivesNotebook = createThunk(
  "notebooks/archives",
  ({
    page = 1,
    size = 1000,
    userId,
    groupName,
    role,
  }: {
    page?: number;
    size?: number;
    userId: string;
    groupName: string;
    role: string;
  }) => {

    return axiosClient
      .get("/api/notebooks/archives", {

        // ✅ query params
        params: {
          page,
          size,
        },

        // ✅ required swagger headers
        headers: {
          userId,
          groupName,
          role,
        },
      })
      .then((res) => res.data);
  }
);

// ✅ Create Profile
export const createProfile = createThunk(
  "profile/create",
  async (data: any) => {

    const res = await axiosClient.post(
      "/api/profile",
      data
    );

    // ✅ Get existing localStorage user
    const existingUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    // ✅ Update values from profile response
    const updatedUser = {
      ...existingUser,

      userId: res.data?.data?.userId,
      // email: res.data?.data?.email,

      // name: `${res.data?.data?.firstName || ""} ${
      //   res.data?.data?.lastName || ""
      // }`.trim(),
    };

    // ✅ Save updated object
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem( "profile", JSON.stringify(res.data?.data));

    return res.data;
  }
);

// ✅ Get Profile
export const getProfile = createThunk(
  "profile/get",
  async (userId: string) => {

    const res = await axiosClient.get(
      `/api/profile/${userId}`
    );

    // ✅ Get existing localStorage user
    const existingUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    // ✅ Update values from profile response
    const updatedUser = {
      ...existingUser,
      userId:res.data?.data?.userId,
      email:res.data?.data?.email ||existingUser?.email,
      name:
        `${res.data?.data?.firstName || ""} ${
          res.data?.data?.lastName || ""
        }`.trim(),

      // ✅ Save address also
      address: {
        line1: res.data?.data?.addressLine1 ||"",
        line2:res.data?.data?.addressLine2 || "",
        city:res.data?.data?.city || "",
        state:res.data?.data?.state || "",
        postalCode:res.data?.data?.postalCode ||"",
        country:res.data?.data?.country || "",
      },
    };

    // ✅ Save updated object
    localStorage.setItem( "user", JSON.stringify(updatedUser));
    localStorage.setItem( "profile", JSON.stringify(res.data?.data));

    return res.data;
  }
);

// ✅ Update Profile
export const updateProfile = createThunk(
  "profile/update",
  async ({
    userId,
    data,
  }: {
    userId: string;
    data: any;
  }) => {

    const res = await axiosClient.put(
      `/api/profile/${userId}`,
      data
    );

    // ✅ Existing local user
    const existingUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    // ✅ Merge updated profile fields
    const updatedUser = {
      ...existingUser,

      userId: res.data?.data?.userId,
      email: res.data?.data?.email,

      name: `${res.data?.data?.firstName || ""} ${
        res.data?.data?.lastName || ""
      }`.trim(),
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem( "profile", JSON.stringify(res.data?.data));

    return res.data;
  }
);

// ✅ Delete Profile
export const deleteProfile = createThunk(
  "profile/delete",
  (userId: string) =>
    axiosClient.delete(`/api/profile/${userId}`).then((res) => res.data)
);

// 🟢 Handle Redux State Updates
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    [
      fetchOrders,
      addOrder,
      editOrder,
      deleteOrder,
      fetchProducts,
      addProduct,
      editProduct,
      deleteProduct,
      uploadProduct,
      getProductById,
      shareProduct,
      unshareProduct,
      createShareRequest,
      getReceiverRequests,
      getDonorRequests,
      markRequestReceived,
      rejectShareRequest,
      approveShareRequest,
      getSharedProductTimeSlots,
      getSharedProductList,
      getAllSharedProductList,
      revokeSharedProduct,
      rejectAdmin,
      approveAdmin,
      orderedPOD,
      deliveredPOD,
      downloadPDF,
      fetchOrdersOD,
      getUserApproval,
      getUsersList,
      deleteUsers,
      deleteGroup,
      fetchProjects,
      addProject,
      editProject,
      deleteProject,
      getProjectById,
      fetchNotebooks,
      getNotebookById,
      createNotebook,
      updateNotebook,
      deleteNotebook,
      autosaveNotebook,
      archivesNotebook,
    ].forEach((thunk) => {

      /* =========================
         PENDING
      ========================= */
      builder.addCase(thunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      });

      /* =========================
         FULFILLED
      ========================= */
      builder.addCase(thunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;

        // 🔹 DOWNLOAD (no state update)
        if (thunk === downloadPDF) return;

        // 🔹 DELETE ORDER
        if (thunk === deleteOrder) {
          state.orders = state.orders.filter(
            (order) => order.orderId !== action.payload
          );
          return;
        }

        // 🔹 DELETE PRODUCT
        if (thunk === deleteProduct) {
          state.products = state.products.filter(
            (product) => product.productid !== action.payload
          );
          return;
        }

        // 🔹 DELETE PROJECT
        if (thunk === deleteProject) {
          state.projects = state.projects.filter(
            (project) => project.projectId !== action.payload
          );
          return;
        }

        // 🔹 DELETE NOTEBOOK ✅
        if (thunk === deleteNotebook) {
          state.notebooks = state.notebooks.filter(
            (note) => note.noteId !== action.payload
          );
          return;
        }

        // 🔹 USERS
        if (thunk === getUsersList) {
          state.users = action.payload;
          return;
        }

        // 🔹 APPROVALS
        if (thunk === getUserApproval) {
          state.approvals = action.payload;
          return;
        }

        /* =========================
           ARRAY RESPONSES
        ========================= */
        if (Array.isArray(action.payload)) {

          if (
            thunk === fetchOrders ||
            thunk === fetchOrdersOD ||
            thunk === orderedPOD ||
            thunk === deliveredPOD
          ) {
            state.orders = action.payload;
            return;
          }

          if (
            thunk === fetchProducts ||
            thunk === getSharedProductList
          ) {
            state.products = action.payload;
            return;
          }

          if (thunk === fetchProjects) {
            state.projects = action.payload;
            return;
          }

          if (thunk === fetchNotebooks) {
            state.notebooks = action.payload;
            return;
          }

          if (thunk === archivesNotebook) {
            state.notebooks = action.payload; // OR separate state if needed
            return;
          }
        }

        /* =========================
           SINGLE OBJECT RESPONSES
        ========================= */
        if (action.payload && typeof action.payload === "object") {

          // 🔹 ORDER UPDATE
          if ("orderId" in action.payload) {
            const index = state.orders.findIndex(
              (o) => o.orderId === action.payload.orderId
            );

            if (index !== -1) {
              state.orders[index] = action.payload;
            } else {
              state.orders.push(action.payload);
            }
            return;
          }

          // 🔹 PRODUCT UPDATE
          if ("productid" in action.payload) {
            const index = state.products.findIndex(
              (p) => p.productid === action.payload.productid
            );

            if (index !== -1) {
              state.products[index] = action.payload;
            } else {
              state.products.push(action.payload);
            }
            return;
          }

          // 🔹 PROJECT UPDATE
          if ("projectId" in action.payload) {
            const index = state.projects.findIndex(
              (p) => p.projectId === action.payload.projectId
            );

            if (index !== -1) {
              state.projects[index] = action.payload;
            } else {
              state.projects.push(action.payload);
            }
            return;
          }

          // 🔹 NOTEBOOK UPDATE / AUTOSAVE ✅
          if ("noteId" in action.payload) {
            const index = state.notebooks.findIndex(
              (n) => n.noteId === action.payload.noteId
            );

            if (index !== -1) {
              state.notebooks[index] = action.payload;
            } else {
              state.notebooks.push(action.payload);
            }
            return;
          }
        }

      });

      /* =========================
         REJECTED
      ========================= */
      builder.addCase(thunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Something went wrong";
      });

    });
  },
});

export default dashboardSlice.reducer;