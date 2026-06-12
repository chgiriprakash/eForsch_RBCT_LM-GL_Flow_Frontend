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
  getProfile,
  getCompanies,
  downloadPDFInv,
  uploadInventoryFile, } from "../dashboardSlice";
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
  const [companies, setCompanies] = useState<Array<{ id: number; companyNo: string; companyName: string }>>([]);
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; key: string }>>([]);
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
    orderedby: userRole?.name || "",

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

  useEffect(() => {
    fetchData();
    fetchBudget();
    fetchGroupNames();
    fetchCompanies();
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

    // ReusableForm stores files as File[] — extract the first element
    const rawAttachment = formData.attachment;
    const fileObj: File | null = Array.isArray(rawAttachment) && rawAttachment.length > 0
      ? rawAttachment[0]
      : rawAttachment instanceof File ? rawAttachment : null;
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

    // ReusableForm stores files as File[] — extract the first element
    const rawAttachment = formData.attachment;
    const attachmentFile: File | null =
      Array.isArray(rawAttachment) && rawAttachment.length > 0 ? rawAttachment[0] :
      rawAttachment instanceof File ? rawAttachment : null;

    delete formData.attachment;

    // ✅ Update product metadata (JSON — no file)
    const finalPayload = mapToModifyApiPayload(formData);
    await dispatch(editProduct(finalPayload)).unwrap();

    // ✅ Upload file separately via the dedicated endpoint if provided
    if (attachmentFile) {
      const fileFormData = new FormData();
      fileFormData.append("file", attachmentFile, attachmentFile.name);
      await dispatch(uploadInventoryFile({
        id: product?.productId ?? Number(id),
        formData: fileFormData,
      })).unwrap();
    }

    fetchData();
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

  const handleDownloadAttachment = async () => {
    if (!product?.productId && !id) return;
    try {
      const productId = product?.productId || product?.productid || Number(id);
      const fileUrl = await dispatch(downloadPDFInv(productId)).unwrap();
      if (fileUrl) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = product?.fileName || product?.filename || "attachment";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);
      } else {
        alert("No attachment found for this product.");
      }
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download attachment.");
    }
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
          <div className="pd-page">
            {/* Header */}
            <div className="pd-header">
              <div className="pd-title-block">
                <span className="pd-breadcrumb">Inventory</span>
                <h2 className="pd-product-name">{getValue(product.productname)}</h2>
              </div>
              <div className="pd-actions">
                <Button className="pd-btn pd-btn-outline" onClick={handleShare}>
                  <i className="fa fa-share-alt me-1" /> Share
                </Button>
                <Button className="pd-btn pd-btn-outline" onClick={handleUpdate}>
                  <i className="fa fa-edit me-1" /> Update
                </Button>
                <Button className="pd-btn pd-btn-primary" onClick={handleOrder}>
                  <i className="fa fa-plus me-1" /> Add Order
                </Button>
              </div>
            </div>

            {/* Cards grid */}
            <div className="pd-grid">

              {/* Product Info */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <i className="fa fa-flask pd-card-icon" />
                  <span>Product Info</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Catalogue</span>
                    <span className="pd-value">{getValue(product.catalogue)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Company</span>
                    <span className="pd-value">{getValue(product.companyname)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Concentration</span>
                    <span className="pd-value">{getValue(product.concentration)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Remarks</span>
                    <span className="pd-value">{getValue(product.remarks)}</span>
                  </div>
                </div>
              </div>

              {/* Stock & IDs */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <i className="fa fa-barcode pd-card-icon" />
                  <span>IDs</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Quantity</span>
                    <span className="pd-value pd-badge">{getValue(product.quantity)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Weight / Vol / Sub QTY</span>
                    <span className="pd-value">{getValue(product.weightvolsubqty)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Company Internal No</span>
                    <span className="pd-value">{getValue(product.companyinternalno)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">SAP Material No</span>
                    <span className="pd-value">{getValue(product.sapmaterialno)}</span>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <i className="fa fa-euro-sign pd-card-icon" />
                  <span>Financials</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Price</span>
                    <span className="pd-value pd-price">{getValue(product.price)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Budget No</span>
                    <span className="pd-value">{getValue(product.budgetno)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Order Date</span>
                    <span className="pd-value">{formatDate(product.orderdate, "DD-MM-YYYY")}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Expiry Date</span>
                    <span className="pd-value pd-expiry">{formatDate(product.expirydate, "DD-MM-YYYY")}</span>
                  </div>
                </div>
              </div>

              {/* Ownership */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <i className="fa fa-users pd-card-icon" />
                  <span>Ownership</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Group Name</span>
                    <span className="pd-value">{getValue(product.groupName)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Added By</span>
                    <span className="pd-value">{getValue(product.addedby)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Shared</span>
                    <span className={`pd-value pd-shared ${product.shared ? "pd-shared-yes" : "pd-shared-no"}`}>
                      {product.shared ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attachment — full width */}
              <div className="pd-card pd-card-full">
                <div className="pd-card-header">
                  <i className="fa fa-paperclip pd-card-icon" />
                  <span>Attachment</span>
                </div>
                <div className="pd-attachment">
                  {product.filename || product.fileName ? (
                    <>
                      <i className="fa fa-file-pdf pd-file-icon" />
                      <span className="pd-filename">{product.filename || product.fileName}</span>
                      <button className="pd-btn pd-btn-outline pd-btn-sm" onClick={handleDownloadAttachment}>
                        <i className="fa fa-download me-1" /> Download
                      </button>
                    </>
                  ) : (
                    <span className="pd-no-file">No attachment</span>
                  )}
                </div>
              </div>

            </div>
          </div>

        </>
      ) : (
        <p>Loading...</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Order">
        <ReusableForm
          formConfig={addOrderProdFormConfig(budget || [], companyOptions)}
          initialValues={order || {}}
          onSubmit={handleOrderSubmit}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Update Product"
      >
        <ReusableForm
          formConfig={updateProductFormGenInvConfig(budget || [], companyOptions)}
          initialValues={updateProduct || {}}
          onSubmit={handleProductSubmit}
          onFieldChange={handleCompanyFieldChange}
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
