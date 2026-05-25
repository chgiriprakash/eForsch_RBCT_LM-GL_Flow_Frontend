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
  // getGroupNames,
  getFineChemicalById,
  editFineChemicals,
} from "../dashboardSlice";
import addOrderFineChemicalFormConfig from "../../../shared/config/addOrderFineChemicalFormConfig";

const FineChemicalsDetails = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.dashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [updateProd, setupdateProd] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  console.log("FineChemicalsDetails - order:", order);
  const [budget, setBudget] = useState<string[]>([]);

  // ✅ FIXED normalize function
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

      // ✅ Parse stringified arrays (like '["Danger"]')
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch {
          /* ignore invalid JSON */
        }
      }

      // ✅ Convert “Yes”/“No” or “true”/“false” consistently
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
    // 🔹 Core product info
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

    // 🔹 Amount & pricing
    amount: Number(product.amount) || Number(product.price) || 0, // API expects 'amount'
    price: Number(product.price) || 0,
    qtypriceordered:
      product.quantity && product.price
        ? `${product.quantity}x${product.price}`
        : "",

    // 🔹 Remarks and identification
    remarks: product.remarks || "",
    casnumber: product.casnumber || "",

    // 🔹 Boolean conversions
    hazardousSubstance: product.hazardousSubstance || "",
    cmrSubstance: product.cmrSubstance || "",
    skinResorptive: product.skinResorptive || "",
    
    // 🔹 GHS & safety info
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
    hPhrases: product.gethPhrases || product.hPhrases || product.hphrases || "",
    pPhrases: product.getpPhrases || product.pPhrases || product.pphrases || "",

    // 🔹 Substitution fields
    substitutionCheck: product.substitutionCheck || "",
    substitutionOption: product.substitutionOption || "",

    // 🔹 Storage & group data
    storageLocation: product.storageLocation || product.storagelocation || "",

    // 🔹 Status info
    priority: product.priority || "Normal",
    received: product.received || "Pending",
    catalogue: product.catalogue || "",

    // 🔹 System metadata
    createdAt: product.createdAt
      ? new Date(product.createdAt).toISOString()
      : new Date().toISOString(),

    // 🔹 File and attachment info
    fileName: product.fileName || product.filename || "",
    fileType: product.fileType || product.filetype || "",
    fileContent: product.attachment
      ? [product.attachment.name || ""]
      : product.fileContent || [],
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
        console.log("Normalized Product:", normalized);
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
      console.error("Failed to fetch budget:", error);
      setBudget(["Budget"]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchBudget();
  }, [dispatch, id]);

  const handleOrder = () => setIsModalOpen(true);
  const handleShare = () =>
    navigate(`/sharing/${id}`, { state: { inventoryType: "fineChemicalInventory" } });
  const handleUpdate = () => setIsProductModalOpen(true);

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
        console.error("Order submission failed:", error);
        alert("Failed to place order.");
      }
    },
    [product, userRole, dispatch, navigate]
  );

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

  const handleUpdateSubmit = async (formData: any) => {
    const payload = mapToModifyApiPayload(formData);
    ["hazardousSubstance", "cmrSubstance", "skinResorptive"].forEach(key => {
      payload[key] = formData[key] === "Yes";
    });

    try {
      const updated = await dispatch(editFineChemicals(payload)).unwrap();
      setProduct(normalizeKeysToFormIds(updated.data));
      fetchData();
      setIsProductModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product.");
    }
    
  };


  return (
    <>
      {error && <div className="error-message">Error: {error}</div>}
      {!loading && product ? (
        <>
          <div className="title-header">
            <div className="btn-wrapper">
              <Button className="btn-color" onClick={handleOrder}>
                Add Order
              </Button>
              <Button className="btn-color" onClick={handleShare}>
                Share
              </Button>
              <Button className="btn-color" onClick={handleUpdate}>
                Update Product
              </Button>
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
                          <img
                            key={idx}
                            src={ghsImageMap[symbol]}
                            alt={symbol}
                            style={{ width: 40, height: 40, marginRight: 6 }}
                          />
                        ))
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Signal Words</td>
                  <td>
                    {Array.isArray(product.ghsSignalWord)
                      ? product.ghsSignalWord.join(", ")
                      : getValue(product.ghsSignalWord)}
                  </td>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Fine Chemical Product Order"
      >
        <ReusableForm
          formConfig={addOrderFineChemicalFormConfig(budget || [])}
          initialValues={order || {}}
          onSubmit={handleOrderSubmit}
        />
      </Modal>

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Update Fine Chemical Product"
      >
        <ReusableForm
          formConfig={updateProductFormConfig(budget || [])}
          initialValues={updateProd || {}}
          onSubmit={handleUpdateSubmit}
        />
      </Modal>
    </>
  );
};

export default FineChemicalsDetails;
