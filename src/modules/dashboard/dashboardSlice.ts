import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "../../shared/api/axiosClient";

interface Order {
  orderId: number;
  productname: string;
  catalogue: string;
  companyName: string;
  sapmaterialno: string;
  quantity: number;
  budget: string;
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
}

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
  orderdate: string;
  qtypriceordered: number;
  concentration: string;
  priority: string;
  remark: string;
  received: string;
}

interface DashboardState {
  orders: Order[];
  products: Product[];
  loading: boolean;
  error: string | null;
  users: any[];
  approvals: any[];
}

const initialState: DashboardState = {
  orders: [],
  products: [],
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
  thunkAPI.rejectWithValue(error.response?.data?.message || error.message || "An unknown error occurred");

// Helper function to create async thunks
const createThunk = <T, R>(
  type: string,
  request: (arg: T) => Promise<R>
) =>
  createAsyncThunk(type, async (arg: T, thunkAPI) => {
    try {
      const response = await request(arg);
      return response; // ✅ Removed `.data` as Axios already returns it
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

export const addProduct = createThunk("dashboard/addProduct", (product: any) =>
  // axiosClient.post("api/inventory/addProduct", product).then((res) => res.data)
  axiosClient
      .post("api/inventory/addProduct", product, {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ required
          Accept: "*/*",
        },
      })
      .then((res) => res.data)
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


// 🟢 Get Product by ID
export const getProductById = createThunk("dashboard/getProduct", (id: number) =>
  axiosClient.get(`api/inventory/getProduct/${id}`).then((res) => res.data)
);

// 🟢 Share Product API Calls
export const shareProduct = createThunk("dashboard/shareProduct", (obj:any) =>
    // const response = await axiosClient.post(
    //   `/api/sharedinventory/shareProduct/${obj.id}?inventoryType=${obj.inventoryType}`, obj.user) 
    // return response.data;
    axiosClient.post(`/api/sharedinventory/shareProduct/${obj.id}?inventoryType=${obj.inventoryType}`, obj.user).then((res) => res.data)
);

export const getSharedProductList = createThunk("dashboard/getSharedProductList", (user) =>
  axiosClient.post("api/sharedinventory/getSharedProductList?page=1&size=10000", user).then((res) => res.data)
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
      getSharedProductList,
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
    ].forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      });

      builder.addCase(thunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;

        if (thunk === downloadPDF) {
          // Just returns the blob URL, not part of state
          return;
        }

        if (thunk === deleteOrder) {
          const id = action.payload;
          state.orders = state.orders.filter((order) => order.orderId !== id);
          return;
        }

        if (thunk === deleteProduct) {
          const id = action.payload;
          state.products = state.products.filter((product) => product.productid !== id);
          return;
        }

        if (thunk === getUserApproval) {
          state.approvals = action.payload;
          return;
        }

        if (thunk === getUsersList) {
          state.users = action.payload;
          return;
        }

        if (Array.isArray(action.payload)) {
          if (thunk === fetchOrders || thunk === fetchOrdersOD || thunk === orderedPOD || thunk === deliveredPOD) {
            state.orders = action.payload;
          } else if (thunk === fetchProducts || thunk === getSharedProductList) {
            state.products = action.payload;
          }
        } else {
          // Handle object updates for both Order and Product
          if ("orderId" in action.payload) {
            const index = state.orders.findIndex((o) => o.orderId === action.payload.orderId);
            if (index !== -1) {
              state.orders[index] = action.payload;
            } else {
              state.orders.push(action.payload);
            }
          } else if ("productid" in action.payload) {
            const index = state.products.findIndex((p) => p.productid === action.payload.productid);
            if (index !== -1) {
              state.products[index] = action.payload;
            } else {
              state.products.push(action.payload);
            }
          }
        }
      });

      builder.addCase(thunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Something went wrong";
      });
    });
  },
});

export default dashboardSlice.reducer;