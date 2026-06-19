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
  getCompanies,
  getStorageLocations,
  getHPhrases,
  getPPhrases,
  downloadPDFFineChecm,
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
  const [companies, setCompanies] = useState<Array<{ id: number; companyNo: string; companyName: string }>>([]);
  const [companyOptions, setCompanyOptions] = useState<Array<{ label: string; key: string }>>([]);
  const [storageLocationOptions, setStorageLocationOptions] = useState<string[]>([]);
  const [hPhraseMap, setHPhraseMap] = useState<Record<string, string>>({});
  const [pPhraseMap, setPPhraseMap] = useState<Record<string, string>>({});
  const [hPhraseOptions, setHPhraseOptions] = useState<Array<{ label: string; key: string }>>([]);
  const [pPhraseOptions, setPPhraseOptions] = useState<Array<{ label: string; key: string }>>([]);

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
    orderType: product.orderType || "",
    barcodeInfo: product.barcodeInfo || "",
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
          companyInternalNo: selected.companyNo,
          companyinternalno: selected.companyNo,
        };
      }
    }
  };

  const fetchStorageLocations = async () => {
    try {
      const result = await dispatch(getStorageLocations()).unwrap();
      setStorageLocationOptions(result.map((s: any) => s.storageLocation));
    } catch (error) {
      console.error("Failed to fetch storage locations:", error);
    }
  };

  const fetchHPhrases = async () => {
    try {
      const result = await dispatch(getHPhrases()).unwrap();
      const map: Record<string, string> = {};
      result.forEach((h: any) => { map[h.phraseCode] = h.phraseDescription; });
      setHPhraseMap(map);
      setHPhraseOptions(result.map((h: any) => ({ label: `${h.phraseCode} - ${h.phraseDescription}`, key: h.phraseCode })));
    } catch (e) { console.error("Failed to fetch H-Phrases:", e); }
  };

  const fetchPPhrases = async () => {
    try {
      const result = await dispatch(getPPhrases()).unwrap();
      const map: Record<string, string> = {};
      result.forEach((p: any) => { map[p.phraseCode] = p.phraseDescription; });
      setPPhraseMap(map);
      setPPhraseOptions(result.map((p: any) => ({ label: `${p.phraseCode} - ${p.phraseDescription}`, key: p.phraseCode })));
    } catch (e) { console.error("Failed to fetch P-Phrases:", e); }
  };

  useEffect(() => {
    fetchData();
    fetchBudget();
    fetchCompanies();
    fetchStorageLocations();
    fetchHPhrases();
    fetchPPhrases();
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
        const orderData = mapFineProductToOrder(formData, userRole);
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
    try {
      // ReusableForm stores files as File[] array — extract first file
      const attachmentFile: File | null =
        formData.attachment instanceof File ? formData.attachment :
        Array.isArray(formData.attachment) && formData.attachment.length > 0 ? formData.attachment[0] :
        null;

      // Build clean JSON payload
      const rawPayload = mapToModifyApiPayload(formData);
      const cleanPayload: any = {
        ...rawPayload,
        // Convert "Yes"/"No" strings → true/false for backend Boolean fields
        hazardousSubstance: rawPayload.hazardousSubstance === "Yes" ? true : rawPayload.hazardousSubstance === "No" ? false : rawPayload.hazardousSubstance,
        cmrSubstance:       rawPayload.cmrSubstance       === "Yes" ? true : rawPayload.cmrSubstance       === "No" ? false : rawPayload.cmrSubstance,
        skinResorptive:     rawPayload.skinResorptive     === "Yes" ? true : rawPayload.skinResorptive     === "No" ? false : rawPayload.skinResorptive,
        fileContent: null,  // will be set below if file exists
      };

      // If file selected — convert to Base64 and include in JSON payload
      if (attachmentFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(attachmentFile);
        });
        cleanPayload.fileName    = attachmentFile.name;
        cleanPayload.fileType    = attachmentFile.type;
        cleanPayload.fileContent = base64;   // backend setFileContent(Object) decodes Base64 → byte[]
      }

      const updated = await dispatch(editFineChemicals(cleanPayload)).unwrap();
      setProduct(normalizeKeysToFormIds(updated.data));
      fetchData();
      setIsProductModalOpen(false);
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product.");
    }
  };

  const handleDownloadAttachment = async () => {
    if (!id) { console.error("No product ID"); return; }
    console.log("Downloading attachment for product id:", id);
    console.log("Product filename:", product?.filename || product?.fileName);
    try {
      const fileUrl = await dispatch(downloadPDFFineChecm(Number(id))).unwrap();
      console.log("File URL received:", fileUrl);
      if (fileUrl) {
        const fileName = product?.filename || product?.fileName || "attachment";
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", fileName);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(fileUrl);
        }, 100);
      } else {
        alert("No attachment found for this product.");
      }
    } catch (error: any) {
      console.error("Download failed:", error);
      console.error("Error details:", error?.message, error?.response?.status, error?.response?.data);
      alert(`Download failed: ${error?.message || "Unknown error"}`);
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
          <div className="pd-page">
            {/* Header */}
            <div className="pd-header">
              <div className="pd-title-block">
                <span className="pd-breadcrumb">Fine Chemicals</span>
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
                    <span className="pd-label">CAS Number</span>
                    <span className="pd-value">{getValue(product.casnumber)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Concentration</span>
                    <span className="pd-value">{getValue(product.concentration)}</span>
                  </div>
                </div>
              </div>

              {/* IDs */}
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
                    <span className="pd-label">Weight / Vol Sub QTY</span>
                    <span className="pd-value">{getValue(product.wvsubqty)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Company Internal No</span>
                    <span className="pd-value">{getValue(product.companyInternalNo)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">SAP Material No</span>
                    <span className="pd-value">{getValue(product.sapMaterialNo)}</span>
                  </div>
                  {product.orderType && (
                    <div className="pd-field">
                      <span className="pd-label">Order Type</span>
                      <span className="pd-value pd-badge">{product.orderType}</span>
                    </div>
                  )}
                  {product.barcodeInfo && (
                    <div className="pd-field">
                      <span className="pd-label">Barcode Info</span>
                      <span className="pd-value">{product.barcodeInfo}</span>
                    </div>
                  )}
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
                    <span className="pd-label">Budget No</span>
                    <span className="pd-value">{getValue(product.budgetno)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Order Date</span>
                    <span className="pd-value">{formatDate(product.orderdate, "DD-MM-YYYY")}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Expiry Date</span>
                    <span className="pd-value pd-expiry">{formatDate(product.expiryDate, "DD-MM-YYYY")}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Ordered By</span>
                    <span className="pd-value">{getValue(product.orderedby)}</span>
                  </div>
                </div>
              </div>

              {/* Hazard Info */}
              <div className="pd-card">
                <div className="pd-card-header">
                  <i className="fa fa-exclamation-triangle pd-card-icon" />
                  <span>Hazard Info</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Hazardous Substance</span>
                    <span className="pd-value">{getValue(product.hazardousSubstance)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">CMR Substance</span>
                    <span className="pd-value">{getValue(product.cmrSubstance)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Skin Resorptive</span>
                    <span className="pd-value">{getValue(product.skinResorptive)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Signal Words</span>
                    <span className="pd-value">
                      {Array.isArray(product.ghsSignalWord) ? product.ghsSignalWord.join(", ") : getValue(product.ghsSignalWord)}
                    </span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">GHS Symbols</span>
                    <span className="pd-value">
                      {Array.isArray(product.ghsSymbols) && product.ghsSymbols.length > 0
                        ? product.ghsSymbols.map((symbol: any, idx: any) => (
                            <img key={idx} src={ghsImageMap[symbol]} alt={symbol} style={{ width: 40, height: 40, marginRight: 6 }} />
                          ))
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Phrases — full width */}
              <div className="pd-card pd-card-full">
                <div className="pd-card-header">
                  <i className="fa fa-shield-alt pd-card-icon" />
                  <span>Safety Phrases</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">H-Phrases</span>
                    <span className="pd-value">
                      {product.hPhrases ? (
                        <><strong>{product.hPhrases}</strong>
                          {hPhraseMap[product.hPhrases] && <span style={{ color: "#555", marginLeft: "8px" }}>— {hPhraseMap[product.hPhrases]}</span>}
                        </>
                      ) : "-"}
                    </span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">P-Phrases</span>
                    <span className="pd-value">
                      {product.pPhrases ? (
                        <><strong>{product.pPhrases}</strong>
                          {pPhraseMap[product.pPhrases] && <span style={{ color: "#555", marginLeft: "8px" }}>— {pPhraseMap[product.pPhrases]}</span>}
                        </>
                      ) : "-"}
                    </span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Substitution Check</span>
                    <span className="pd-value">{getValue(product.substitutionCheck)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Substitution Option</span>
                    <span className="pd-value">{getValue(product.substitutionOption)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Storage Location</span>
                    <span className="pd-value">{getValue(product.storageLocation)}</span>
                  </div>
                </div>
              </div>

              {/* Chemical Risk Assessment — full width */}
              <div className="pd-card pd-card-full">
                <div className="pd-card-header">
                  <i className="fa fa-biohazard pd-card-icon" />
                  <span>Chemical Risk Assessment</span>
                </div>
                <div className="pd-fields">
                  <div className="pd-field">
                    <span className="pd-label">Application of Hazardous Substance</span>
                    <span className="pd-value">{getValue(product.applicationOfHazardousSubstance)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Concentration / Working Volume</span>
                    <span className="pd-value">{getValue(product.concentrationWorkingVolume)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Lab No. Working with this Chemical</span>
                    <span className="pd-value">{getValue(product.labNoWorkingWithChemical)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">No. of Employees Working with this Chemical</span>
                    <span className="pd-value">{getValue(product.numberOfEmployees)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Handling Duration &gt; 15min/day?</span>
                    <span className="pd-value">{getValue(product.handlingDurationGreater15Min)}</span>
                  </div>
                  <div className="pd-field">
                    <span className="pd-label">Hazardous Due to Skin Contact?</span>
                    <span className="pd-value">{getValue(product.hazardousDueToSkinContact)}</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fine Chemical Product Order">
        <ReusableForm
          formConfig={addOrderFineChemicalFormConfig(budget || [], companyOptions, storageLocationOptions)}
          initialValues={order || {}}
          onSubmit={handleOrderSubmit}
          onFieldChange={handleCompanyFieldChange}
        />
      </Modal>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Update Fine Chemical Product">
        <ReusableForm
          formConfig={updateProductFormConfig(budget || [], companyOptions, storageLocationOptions, hPhraseOptions, pPhraseOptions)}
          initialValues={updateProd || {}}
          onSubmit={handleUpdateSubmit}
          onFieldChange={handleCompanyFieldChange}
        />
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