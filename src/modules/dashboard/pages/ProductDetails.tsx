import { Button } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Modal from "../../../shared/components/Modal";
// import addOrderFormConfig from "../../../shared/config/addOrderFormConfig";
import { useEffect, useState } from "react";
// import addProductFormConfig from "../../../shared/config/addProductFormConfig";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import ReusableForm from "../../../shared/components/ReusableForm";
import {  addOrder,
  editProduct,
  getProductById,
  getBudgetList,
  getGroupNames,
  shareProduct,
  getProfile, } from "../dashboardSlice";
import addOrderProdFormConfig from "../../../shared/config/addOrderProdFormConfig";
import updateProductFormGenInvConfig from "../../../shared/config/updateProductFormGenInvConfig.";
import sharingRequestFormConfig from "../../../shared/config/sharingRequestFormConfig";

const ProductDetails = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const location = useLocation();
  console.log("ProductDetails - location:", location);
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [updateProduct, setUpdateProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  console.log("ProductDetails - order:", order);
  const [budget, setBudget] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] =
  useState(false);

const [profileMissing, setProfileMissing] =
  useState(false);

const [shareInitialValues] =
  useState<any>({
    slot1Start: "",
    slot1End: "",

    slot2Start: "",
    slot2End: "",

    slot3Start: "",
    slot3End: "",
  });
  console.log("groupOptions:", groupOptions);

  const fetchData = async () => {
    if (!id) return;
    try {
      const result = await dispatch(getProductById(parseInt(id))).unwrap();
      if (result) {
        setProduct(result.data);
        setUpdateProduct(mapToModifyApiPayload(result.data));
        setOrder(mapProductToOrder(result.data, userRole));
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  };

  const mapProductToOrder = (product: any, userRole: { name: string; groupName: string }) => ({
    // ✅ Keep all product fields exactly as in API response
    productId: product.productId || 0,
    productname: product.productname || "",
    catalogue: product.catalogue || product.catalogue || product.catalogue || "",
    companyname: product.companyname || "",
    quantity: product.quantity || 0,
    // groupName: product.groupName || userRole.groupName || "",
    companyinternalno: product.companyinternalno || "",
    sapmaterialno: product.sapmaterialno || "",
    weightvolsubqty: product.weightvolsubqty || "",
    budgetno: product.budgetno ? `${product.budgetno}` : "",
    concentration: product.concentration || "",
    remarks: product.remarks || "",
    orderdate: product.orderdate || "",
    expirydate: product.expirydate || "",
    addedby: product.addedby || userRole.name,
    // shared: product.shared ?? false,
    // fileName: product.fileName || null,
    // fileType: product.fileType || null,
    // fileContent: product.fileContent || null,

    // ✅ Extra order-related fields
    price: product.price || 0,
    approved: false,
    approvalStatusDate: product.orderdate || "",
    adminName: "",
    userName: userRole?.name || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: userRole?.name || "",
    updatedBy: userRole?.name || "",
    groupName: userRole?.groupName || "",
  });

 const mapToModifyApiPayload = (formData: Record<string, any>) => {
  // const formatDateToISO = (date: any): string => {
  //   if (!date) return new Date().toISOString();
  //   const d = new Date(date);
  //   console.log("ProductDetails - formatDateToISO - d:", d);
  //   return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  // };

  // Convert "Yes"/"No" string to boolean
  const toBoolean = (value: any): boolean =>
    value === "Yes" || value === true ? true : false;

  // Extract file if uploaded
  let fileName = formData.fileName || "";
  let fileType = formData.fileType || "";
  let fileContent: string[] = [];
  console.log("ProductDetails - mapToModifyApiPayload - fileContent:", fileContent);

  if (formData.attachment instanceof File) {
    const file = formData.attachment;
    fileName = file.name;
    fileType = file.type;
    // fileContent will be filled by converting the file to base64 later (async)
  }

  // Build payload based on backend schema
  const payload = {
    productId: Number(formData.productId ?? 0),
    productname: formData.productname?.trim() || "",
    catalogue: formData.catalogue?.trim() || "",
    companyname: formData.companyname?.trim() || "",
    quantity: Number(formData.quantity ?? 0),
    groupName: formData.groupName || "",
    companyinternalno: formData.companyinternalno?.trim() || "",
    sapmaterialno: formData.sapmaterialno?.trim() || "",
    weightvolsubqty: formData.weightvolsubqty?.trim() || "",
    budgetno: formData.budgetno?.trim() || "",
    concentration: formData.concentration?.trim() || "",
    remarks: formData.remarks?.trim() || "",
    price: Number(formData.price ?? 0),
    orderdate: formData.orderdate,
    expirydate: formData.expirydate,
    addedby: formData.addedby || "",
    shared: toBoolean(formData.shared),
    fileName: formData.fileName || fileName,
    fileType : formData.fileType || fileType,
    fileContent: formData.fileContent || [],
  };

  // Remove temporary frontend-only fields
  delete (payload as any).attachment;

  return payload;
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
  }, [dispatch, id]);

  const handleOrder = () => setIsModalOpen(true);

 const handleShare = async () => {

  try {

    const profileResult = await dispatch(
      getProfile(userRole.id)
    ).unwrap();

    console.log(
      "PROFILE RESULT:",
      profileResult
    );

    const profileData =
      profileResult?.data;

    const isProfileIncomplete =

      !profileData ||

      !profileData.firstName ||

      !profileData.email ||

      !profileData.addressLine1 ||

      !profileData.city ||

      !profileData.labName;

    if (isProfileIncomplete) {

      setProfileMissing(true);

      setIsShareModalOpen(true);

      return;
    }

    setProfileMissing(false);

    setIsShareModalOpen(true);

  } catch (error) {

    console.error(
      "Profile validation failed:",
      error
    );

    setProfileMissing(true);

    setIsShareModalOpen(true);
  }
};

const handleShareSubmit = async (
  formData: Record<string, any>
) => {
  try {

    const localUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const localProfile = JSON.parse(
      localStorage.getItem("profile") || "{}"
    );

    // ✅ Helper for slot creation
    const buildSlot = (
      slotNumber: number,
      day: string,
      fromTime: string,
      toTime: string
    ) => {

      // Skip empty optional slots
      if (!day || !fromTime || !toTime) {
        return null;
      }

      const today = new Date()
        .toISOString()
        .split("T")[0];

      return {
        timeSlotId: slotNumber,
        slotNumber,

        day,

        fromTime,
        toTime,

        startTime: new Date(
          `${today}T${fromTime}`
        ).toISOString(),

        endTime: new Date(
          `${today}T${toTime}`
        ).toISOString(),

        date: today,

        time: `${fromTime} - ${toTime}`,
      };
    };

    // ✅ Build slots array
    const timeSlots = [

      buildSlot(
        1,
        formData.slot1Day,
        formData.slot1FromTime,
        formData.slot1ToTime
      ),

      buildSlot(
        2,
        formData.slot2Day,
        formData.slot2FromTime,
        formData.slot2ToTime
      ),

      buildSlot(
        3,
        formData.slot3Day,
        formData.slot3FromTime,
        formData.slot3ToTime
      ),

    ].filter(Boolean);

    const payload = {

      productId: Number(id),

      quantity: Number(formData.quantity),

      inventoryType: "generalInventory",

      timeSlots,

      // ✅ USER
      user: {

        id: localUser?.id || 0,

        userId: localUser?.userId || "",

        email: localUser?.email || "",

        name: localUser?.name || "",

        role: localUser?.role || "",

        groupName:
          localUser?.groupName || "",

        status:
          localUser?.status || "",
      },

      // ✅ ADDRESS
      address: {

        line1:
          localProfile?.address?.line1 ||
          localProfile?.addressLine1 ||
          "",

        line2:
          localProfile?.address?.line2 ||
          localProfile?.addressLine2 ||
          "",

        city:
          localProfile?.address?.city ||
          localProfile?.city ||
          "",

        state:
          localProfile?.address?.state ||
          localProfile?.state ||
          "",

        postalCode:
          localProfile?.address?.postalCode ||
          localProfile?.postalCode ||
          "",

        country:
          localProfile?.address?.country ||
          localProfile?.country ||
          "",
      },
    };

    console.log(
      "🚀 FINAL SHARE PAYLOAD:",
      payload
    );

    await dispatch(
      shareProduct(payload)
    ).unwrap();

    alert("Product shared successfully!");

    setIsShareModalOpen(false);

    navigate("/sharing");

  } catch (error) {

    console.error("Share failed:", error);

    alert("Failed to share product.");
  }
};
  
  const handleUpdate = () => setIsProductModalOpen(true);

  const handleOrderSubmit: (formData: Record<string, any>) => Promise<void> = async (formData) => {
    // Ensure productId is set correctly
    formData.productId = product?.productId ?? 0;
    formData.addedby = userRole.name;       // ✅ Logged-in user name
    formData.groupName = userRole.groupName; // ✅ User’s group
    formData.role = userRole.role;

    const fileObj = formData.attachment || null;
    delete formData.attachment;

    try {
      const orderData = mapProductToOrder(formData, userRole);

      const payload = new FormData();

      payload.append("order", JSON.stringify(orderData));  

      console.log("🚀 Final payload to addOrder:", payload);

      if (fileObj) {
        payload.append("file", fileObj, fileObj.name); // attach file if present
      }

      await dispatch(addOrder(payload)).unwrap();
      alert("Order placed successfully!");
      setIsModalOpen(false);
      navigate(`/orders`);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Failed to place order.");
    }
  };

const handleProductSubmit = async (formData: Record<string, any>) => {
  try {
    // ✅ Ensure productId is always set
    formData.productId = product?.productId ?? 0;

    // ✅ Include user info
    formData.addedby = userRole.name;
    formData.groupName = userRole.groupName;

    // ✅ Convert and normalize payload
    const finalPayload = mapToModifyApiPayload(formData);

    // ✅ Convert File to base64 if attachment exists
    if (formData.attachment instanceof File) {
      const file = formData.attachment;
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      finalPayload.fileContent = [base64String];
      finalPayload.fileName = file.name;
      finalPayload.fileType = file.type;
    }

    console.log("🚀 Final payload to editProduct:", finalPayload);

    // ✅ Dispatch API call
    const updated = await dispatch(editProduct(finalPayload)).unwrap();

    // ✅ Update UI
    setProduct(mapProductToOrder(updated.data, userRole));
    fetchData(); // Refresh data
    setIsProductModalOpen(false);
    alert("Product updated successfully!");
  } catch (error) {
    console.error("❌ Update failed:", error);
    alert("Failed to update product. Please check console for details.");
  }
};


  const formatDate = (dateStr: string, format: string): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const map: Record<string, string> = {
      DD: date.getDate().toString().padStart(2, "0"),
      MM: (date.getMonth() + 1).toString().padStart(2, "0"),
      YYYY: date.getFullYear().toString(),
    };
    const result = format.replace(/DD|MM|YYYY/g, (key) => map[key]);
    console.log("ProductDetails - formatDate - result:", result);
    return result;
  };

  const getValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const result = value;
    console.log("ProductDetails - getValue - result:", result);
    return result;
  };

  return (
    <>
      {error && <div className="error-message">Error: {error}</div>}
      {!loading && product ? (
        <>
          <div className="title-header">
            <div className="btn-wrapper">
              <Button className="btn-color" onClick={handleOrder}>Add Order</Button>
              <Button className="btn-color" onClick={handleShare}>Share</Button>
              <Button className="btn-color" onClick={handleUpdate}>Update Product</Button>
            </div>
          </div>

          <div className="product-details">
            <table className="product-details-table">
              <thead>
                <tr>
                  <th colSpan={2}>{getValue(product.productname)}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Catalogue</td>
                  <td>{getValue(product.catalogue)}</td>
                </tr>
                <tr>
                  <td>Company</td>
                  <td>{getValue(product.companyname)}</td>
                </tr>
                <tr>
                  <td>Quantity</td>
                  <td>{getValue(product.quantity)}</td>
                </tr>
                <tr>
                  <td>Company Internal No</td>
                  <td>{getValue(product.companyinternalno)}</td>
                </tr>
                <tr>
                  <td>SAP Material No</td>
                  <td>{getValue(product.sapmaterialno)}</td>
                </tr>
                <tr>
                  <td>Weight/Vol Sub QTY</td>
                  <td>{getValue(product.weightvolsubqty)}</td>
                </tr>
                <tr>
                  <td>Budget No</td>
                  <td>{getValue(product.budgetno)}</td>
                </tr>
                <tr>
                  <td>Order Date</td>
                  <td>{formatDate(product.orderdate, "DD-MM-YYYY")}</td>
                </tr>
                <tr>
                  <td>Expiry Date</td>
                  <td>{formatDate(product.expirydate, "DD-MM-YYYY")}</td>
                </tr>
                <tr>
                  <td>Concentration</td>
                  <td>{getValue(product.concentration)}</td>
                </tr>
                <tr>
                  <td>Remarks</td>
                  <td>{getValue(product.remarks)}</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>{getValue(product.price)}</td>
                </tr>
                <tr>
                  <td>Group Name</td>
                  <td>{getValue(product.groupName)}</td>
                </tr>
                <tr>
                  <td>Added By</td>
                  <td>{getValue(product.addedby)}</td>
                </tr>
                <tr>
                  <td>Shared</td>
                  <td>{product.shared ? "Yes" : "No"}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </>
      ) : (
        <p>Loading...</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Order">
        <ReusableForm formConfig={addOrderProdFormConfig(budget || [])} initialValues={order || {}} onSubmit={handleOrderSubmit} />
      </Modal>

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Update Product"
      >
        <ReusableForm
          formConfig={updateProductFormGenInvConfig(budget || [])}
          initialValues={updateProduct || {}}
          onSubmit={handleProductSubmit}
        />
      </Modal>

      <Modal
  isOpen={isShareModalOpen}
  onClose={() =>
    setIsShareModalOpen(false)
  }
  title="Share Product"
>

  {profileMissing ? (

    <div>

      <p
        style={{
          color: "red",
          fontWeight: "bold",
        }}
      >
        Please update profile details
        before sharing.
      </p>

      <Button
        className="btn-color"
        onClick={() =>
          navigate("/profile")
        }
      >
        Update Profile
      </Button>

    </div>

  ) : (

    <>

      {/* PRODUCT DETAILS */}

      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px",
        }}
      >

        <h5>
          <b>Product Details</b>
        </h5>

        <p>
          <b>Name:</b>{" "}
          {getValue(
            product?.productname
          )}
        </p>

        <p>
          <b>Company:</b>{" "}
          {getValue(
            product?.companyname
          )}
        </p>

        <p>
          <b>Catalogue:</b>{" "}
          {getValue(
            product?.catalogue
          )}
        </p>

        <p>
          <b>Quantity:</b>{" "}
          {getValue(
            product?.quantity
          )}
        </p>

      </div>

      {/* SHARE FORM */}

      <ReusableForm
        formConfig={
          sharingRequestFormConfig()
        }

        initialValues={
          shareInitialValues
        }

        onSubmit={
          handleShareSubmit
        }
      />

    </>

  )}

</Modal>
    </>
  );
};

export default ProductDetails;
