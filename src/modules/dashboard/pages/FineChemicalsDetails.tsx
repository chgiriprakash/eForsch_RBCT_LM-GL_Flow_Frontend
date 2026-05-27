import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../../../shared/components/Modal";
import { useEffect, useState, useCallback } from "react";
import updateProductFormConfig from "../../../shared/config/updateProductFormConfig";
import useAppDispatch from "../../../shared/hooks/useAppDispatch";
import { useAppSelector } from "../../../shared/hooks/customHooks";
import ReusableForm from "../../../shared/components/ReusableForm";
import {
  addFineChemicalOrder,
  getBudgetList,
  getFineChemicalById,
  editFineChemicals,
  shareProduct,
  getProfile,
} from "../dashboardSlice";
import addOrderFineChemicalFormConfig from "../../../shared/config/addOrderFineChemicalFormConfig";
import sharingRequestFormConfig from "../../../shared/config/sharingRequestFormConfig";

const FineChemicalsDetails = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  
  const [product, setProduct] = useState<any>(null);
  const [updateProd, setupdateProd] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [budget, setBudget] = useState<string[]>([]);

  const [shareInitialValues] = useState<any>({
    slot1Start: "",
    slot1End: "",
    slot2Start: "",
    slot2End: "",
    slot3Start: "",
    slot3End: "",
  });

  function normalizeKeysToFormIds(input: Record<string, any>): Record<string, any> {
    const keyMapping: Record<string, string> = {
      productid: "productid",
      productname: "productname",
      catalogue: "catalogue",
      companyname: "companyname",
      quantity: "quantity",
      expirydate: "expiryDate",
      companyinternalno: "companyInternalNo",
      sapmaterialno: "sapMaterialNo",
      weightvolsubqty: "wvsubqty",
      budgetno: "budgetno",
      orderdate: "orderdate",
      orderedby: "orderedby",
      concentration: "concentration",
      price: "price",
      remarks: "remarks",
      remark: "remarks",
      casnumber: "casnumber",
      hazardoussubstance: "hazardousSubstance",
      cmrsubstance: "cmrSubstance",
      skinresorptive: "skinResorptive",
      ghssymbols: "ghsSymbols",
      ghssignalword: "ghsSignalWord",
      hphrases: "hPhrases",
      pphrases: "pPhrases",
      substitutioncheck: "substitutionCheck",
      substitutionoption: "substitutionOption",
      storagelocation: "storageLocation",
      groupname: "groupName",
      filename: "filename",
      filetype: "filetype",
      createdat: "createdAt",
    };

    const result: Record<string, any> = {};

    Object.keys(input).forEach((key) => {
      const normalizedKey = keyMapping[key.toLowerCase()] || key;
      let value = input[key];

      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch {
          /* ignore invalid JSON */
        }
      }

      if (value === "true") value = "Yes";
      if (value === "false") value = "No";

      result[normalizedKey] = value;
    });

    return result;
  }

  const mapFineProductToOrder = (product: any, userRole?: any) => ({
    productId: product.productid || "",
    productname: product.productname || "",
    catalogue: product.catalogue || "",
    companyname: product.companyname || "",
    quantity: product.quantity || "",
    expiryDate: product.expiryDate || "",
    companyInternalNo: product.companyInternalNo || "",
    sapMaterialNo: product.sapMaterialNo || "",
    weightvolsubqty: product.wvsubqty || "",
    budgetno: product.budgetno || "",
    orderdate: product.orderdate || "",
    concentration: product.concentration || "",
    price: Number(product.price) || 0,
    remarks: product.remarks || "",
    casnumber: product.casnumber || "",
    hazardousSubstance: product.hazardousSubstance || "",
    cmrSubstance: product.cmrSubstance || "",
    skinResorptive: product.skinResorptive || "",
    storageLocation: product.storageLocation || "",
    orderedby: product.orderedby || userRole?.name || "",
    ghsSymbols: product.ghsSymbols || [],
    ghsSignalWord: product.ghsSignalWord || [],
    hPhrases: product.hPhrases || "",
    pPhrases: product.pPhrases || "",
    substitutionCheck: product.substitutionCheck || "",
    substitutionOption: product.substitutionOption || "",
    filename: product.filename || "",
    filetype: product.filetype || "",
    groupName: userRole?.groupName || "",
    status: product.status || "Pending",
    approved: false,
    approvalStatusDate: product.orderdate || "",
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    createdBy: userRole?.name || "",
    updatedBy: userRole?.name || "",
    role: userRole?.role || "",
  });

  function mapToModifyApiPayload(product: any): any {
    return {
      productId: product.productId || product.productid || 0,
      productname: product.productname || "",
      companyname: product.companyname || "",
      quantity: product.quantity || "",
      expiryDate: product.expiryDate,
      companyInternalNo: product.companyInternalNo || product.companyinternalno || "",
      sapMaterialNo: product.sapMaterialNo || product.sapmaterialno || "",
      wvsubqty: product.wvsubqty || product.weightvolsubqty || "",
      budgetno: product.budgetno || "",
      orderdate: product.orderdate,
      orderedby: userRole?.name || "",
      concentration: product.concentration || "",
      amount: Number(product.amount) || Number(product.price) || 0,
      price: Number(product.price) || 0,
      qtypriceordered:
        product.quantity && product.price
          ? `${product.quantity}x${product.price}`
          : "",
      remarks: product.remarks || "",
      casnumber: product.casnumber || "",
      hazardousSubstance: product.hazardousSubstance || "",
      cmrSubstance: product.cmrSubstance || "",
      skinResorptive: product.skinResorptive || "",
      ghsSymbols: Array.isArray(product.ghsSymbols)
        ? product.ghsSymbols
        : typeof product.ghsSymbols === "string"
        ? [product.ghsSymbols]
        : [],
      ghsSignalWord: Array.isArray(product.ghsSignalWord)
        ? product.ghsSignalWord
        : typeof product.ghsSignalWord === "string"
        ? [product.ghsSignalWord]
        : [],
      hPhrases: product.hPhrases || "",
      pPhrases: product.pPhrases || "",
      substitutionCheck: product.substitutionCheck || "",
      substitutionOption: product.substitutionOption || "",
      storageLocation: product.storageLocation || "",
      priority: product.priority || "Normal",
      received: product.received || "Pending",
      catalogue: product.catalogue || "",
      createdAt: product.createdAt || new Date().toISOString(),
      fileName: product.fileName || product.filename || "",
      fileType: product.fileType || product.filetype || "",
      fileContent: product.fileContent || [],
      groupName: userRole?.groupName || product.groupName || "",
      updatedAt: product.updatedAt || new Date().toISOString(),
      createdBy: userRole?.name || "",
      updatedBy: userRole?.name || "",
      role: userRole?.role || "",
    };
  }

  const ghsImageMap: Record<string, string> = {
    "Explosive": "/src/assets/ghs/ghs_001.jpg",
    "Flammable": "/src/assets/ghs/ghs_002.jpg",
    "Oxidizing": "/src/assets/ghs/ghs_003.jpg",
    "Corrosive": "/src/assets/ghs/ghs_005.jpg",
    "Toxic": "/src/assets/ghs/ghs_006.jpg",
    "Harmful": "/src/assets/ghs/ghs_007.jpg",
    "Gas under pressure": "/src/assets/ghs/ghs_008.jpg",
    "Environmental hazard": "/src/assets/ghs/ghs_009.jpg",
  };

  const fetchData = async () => {
    if (!id) return;
    try {
      const result = await dispatch(getFineChemicalById(parseInt(id))).unwrap();
      if (result?.data?.list?.length) {
        const normalized = normalizeKeysToFormIds(result.data.list[0]);
        setProduct(normalized);
        setupdateProd(mapToModifyApiPayload(normalized));
        setOrder(mapFineProductToOrder(normalized, userRole));
      }
    } catch (err) {
      console.error("Error fetching product:", err);
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
      setBudget(["Budget"]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchBudget();
  }, [dispatch, id]);

  const handleOrder = () => setIsModalOpen(true);
  const handleUpdate = () => setIsProductModalOpen(true);

  const handleShare = async () => {
    try {
      const profileResult = await dispatch(getProfile(userRole.id)).unwrap();
      const profileData = profileResult?.data;

      const isProfileIncomplete =
        !profileData ||
        !profileData.firstName ||
        !profileData.email ||
        !profileData.addressLine1 ||
        !profileData.city ||
        !profileData.labName;

      if (isProfileIncomplete) {
        setProfileMissing(true);
      } else {
        setProfileMissing(false);
      }
      setIsShareModalOpen(true);
    } catch (error) {
      setProfileMissing(true);
      setIsShareModalOpen(true);
    }
  };

  const handleShareSubmit = async (formData: Record<string, any>) => {
    const localProfile = JSON.parse(localStorage.getItem("profile") || "{}");

    try {
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

      inventoryType: "fineChemicals",

      timeSlots,

      // ✅ USER
      user: {

        id: userRole?.id || 0,

        userId: userRole?.userId || "",

        email: userRole?.email || "",

        name: userRole?.name || "",

        role: userRole?.role || "",

        groupName:
          userRole?.groupName || "",

        status:
          userRole?.status || "",
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

      await dispatch(shareProduct(payload)).unwrap();
      alert("Product shared successfully!");
      setIsShareModalOpen(false);
      navigate("/sharing");
    } catch (error) {
      alert("Failed to share product.");
      navigate("/sharing");
    }
  };

  const handleOrderSubmit = useCallback(
    async (formData: Record<string, any>) => {
      formData.productid = product.productid;
      formData.orderedby = userRole.name;
      formData.groupName = userRole.groupName;
      formData.role = userRole.role;

      try {
        const orderData = mapFineProductToOrder(formData);
        const payload = new FormData();
        payload.append("order", JSON.stringify(orderData));

        if (formData.attachment) {
          payload.append("file", formData.attachment, formData.attachment.name);
        }

        await dispatch(addFineChemicalOrder(payload)).unwrap();
        alert("Order placed successfully!");
        setIsModalOpen(false);
        navigate(`/orders`);
      } catch (error) {
        alert("Failed to place order.");
      }
    },
    [product, userRole, dispatch, navigate]
  );

  const handleUpdateSubmit = async (formData: any) => {
    const payload = mapToModifyApiPayload(formData);
    try {
      const updated = await dispatch(editFineChemicals(payload)).unwrap();
      setProduct(normalizeKeysToFormIds(updated.data));
      fetchData();
      setIsProductModalOpen(false);
      alert("Product updated successfully!");
    } catch (error) {
      alert("Failed to update product.");
    }
  };

  const getValue = (value: any) =>
    value === null || value === undefined || value === "" ? "-" : value;

  const formatDate = (dateStr: string, format: string): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const map: Record<string, string> = {
      DD: date.getDate().toString().padStart(2, "0"),
      MM: (date.getMonth() + 1).toString().padStart(2, "0"),
      YYYY: date.getFullYear().toString(),
    };
    return format.replace(/DD|MM|YYYY/g, (key) => map[key]);
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
              <thead><tr><th colSpan={2}>{getValue(product.productname)}</th></tr></thead>
              <tbody>
                <tr><td>Catalogue</td><td>{getValue(product.catalogue)}</td></tr>
                <tr><td>Company</td><td>{getValue(product.companyname)}</td></tr>
                <tr><td>Quantity</td><td>{getValue(product.quantity)}</td></tr>
                <tr><td>Company Internal No</td><td>{getValue(product.companyInternalNo)}</td></tr>
                <tr><td>SAP Material No</td><td>{getValue(product.sapMaterialNo)}</td></tr>
                <tr><td>Weight/Vol Sub QTY</td><td>{getValue(product.wvsubqty)}</td></tr>
                <tr><td>Budget No</td><td>{getValue(product.budgetno)}</td></tr>
                <tr><td>Order Date</td><td>{formatDate(product.orderdate, "DD-MM-YYYY")}</td></tr>
                <tr><td>Expiry Date</td><td>{formatDate(product.expiryDate, "DD-MM-YYYY")}</td></tr>
                <tr><td>Concentration</td><td>{getValue(product.concentration)}</td></tr>
                <tr><td>CAS Number</td><td>{getValue(product.casnumber)}</td></tr>
                <tr><td>Hazardous Substance</td><td>{getValue(product.hazardousSubstance)}</td></tr>
                <tr><td>CMR Substance</td><td>{getValue(product.cmrSubstance)}</td></tr>
                <tr><td>Skin Resorptive</td><td>{getValue(product.skinResorptive)}</td></tr>
                <tr>
                  <td>GHS Symbols</td>
                  <td>
                    {Array.isArray(product.ghsSymbols) && product.ghsSymbols.length > 0
                      ? product.ghsSymbols.map((symbol: any, idx: any) => (
                          <img key={idx} src={ghsImageMap[symbol]} alt={symbol} style={{ width: 40, height: 40, marginRight: 6 }} />
                        ))
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Signal Words</td>
                  <td>{Array.isArray(product.ghsSignalWord) ? product.ghsSignalWord.join(", ") : getValue(product.ghsSignalWord)}</td>
                </tr>
                <tr><td>H Phrases</td><td>{getValue(product.hPhrases)}</td></tr>
                <tr><td>P Phrases</td><td>{getValue(product.pPhrases)}</td></tr>
                <tr><td>Substitution Check</td><td>{getValue(product.substitutionCheck)}</td></tr>
                <tr><td>Substitution Option</td><td>{getValue(product.substitutionOption)}</td></tr>
                <tr><td>Storage Location</td><td>{getValue(product.storageLocation)}</td></tr>
                <tr><td>Ordered By</td><td>{getValue(product.orderedby)}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fine Chemical Product Order">
        <ReusableForm formConfig={addOrderFineChemicalFormConfig(budget || [])} initialValues={order || {}} onSubmit={handleOrderSubmit} />
      </Modal>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Update Fine Chemical Product">
        <ReusableForm formConfig={updateProductFormConfig(budget || [])} initialValues={updateProd || {}} onSubmit={handleUpdateSubmit} />
      </Modal>

      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Share Product">
        {profileMissing ? (
          <div>
            <p style={{ color: "red", fontWeight: "bold" }}>Please update profile details before sharing.</p>
            <Button className="btn-color" onClick={() => navigate("/profile")}>Update Profile</Button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
              <h5><b>Product Details</b></h5>
              <p><b>Name:</b> {getValue(product?.productname)}</p>
              <p><b>Company:</b> {getValue(product?.companyname)}</p>
              <p><b>Catalogue:</b> {getValue(product?.catalogue)}</p>
              <p><b>Quantity:</b> {getValue(product?.quantity)}</p>
            </div>
            <ReusableForm formConfig={sharingRequestFormConfig()} initialValues={shareInitialValues} onSubmit={handleShareSubmit} />
          </>
        )}
      </Modal>
    </>
  );
};

export default FineChemicalsDetails;