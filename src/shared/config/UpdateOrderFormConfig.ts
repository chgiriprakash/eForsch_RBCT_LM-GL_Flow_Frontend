const UpdateOrderFormConfig = (
  budgetOptions: string[],
  companyOptions: { label: string; key: string }[] = [],
) => [
  {
    id: "productName",
    label: "Product (Mandatory)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "catalogue", // backend spelling is catalogue
    label: "Catalogue/Article Number",
    type: "text",
    validation: { required: true },
  },
  {
    id: "companyName",
    label: "Company (Mandatory)",
    type: "select",
    options: companyOptions,
    validation: { required: true },
  },
  {
    id: "quantity",
    label: "Quantity (Mandatory)",
    type: "number",
    validation: { required: true },
  },
  {
    id: "expiryDate",
    label: "Expiry Date (Mandatory)",
    type: "date",
    validation: { required: true },
  },
  {
    id: "companyinternalno",
    label: "Company Internal No (auto-filled)",
    type: "text",
    validation: { required: false },
  },
  {
    id: "sapmaterialno",
    label: "SAP Material No",
    type: "text",
    validation: { required: true },
  },
  {
    id: "weightvolsubqty",
    label: "W/V/Sub Qty",
    type: "text",
    validation: { required: true },
  },
  {
    id: "budgetno", // backend expects budgetno not budgetNo
    label: "Budget No",
    type: "select",
    options: budgetOptions,
    validation: { required: true },
  },
  {
    id: "orderdate",
    label: "Order Date",
    type: "date",
    validation: { required: true },
  },
  {
    id: "concentration",
    label: "Concentration",
    type: "text",
    validation: { required: false },
  },
  {
    id: "price",
    label: "Price",
    type: "number",
    validation: { required: true },
  },
  {
    id: "remarks",
    label: "Remarks",
    type: "text",
    validation: { required: false },
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    validation: { required: false },
  },
  {
    id: "attachment",
    label: "Attachment",
    type: "file",
    validation: { required: false },
  },
];

export default UpdateOrderFormConfig;
