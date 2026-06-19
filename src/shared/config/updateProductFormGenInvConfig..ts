const updateProductFormGenInvConfig = (
  budgetOptions: string[],
  companyOptions: { label: string; key: string }[] = [],
) => [
  // {
  //   id: "productId",
  //   label: "Product ID",
  //   type: "number",
  //   validation: { required: false },
  //   readOnly: true, // usually non-editable
  // },
  {
    id: "productname",
    label: "Product Name",
    type: "text",
    validation: { required: true },
  },
  {
    id: "catalogue",
    label: "Catalogue",
    type: "text",
    validation: { required: true },
  },
  {
    id: "companyname",
    label: "Company Name",
    type: "select",
    options: companyOptions,
    validation: { required: true },
  },
  {
    id: "quantity",
    label: "Quantity",
    type: "number",
    validation: { required: true, pattern: /^[0-9]+$/ },
  },
   {
    id: "orderdate",
    label: "Order Date",
    type: "date",
    validation: { required: true },
  },
  {
    id: "expirydate",
    label: "Expiry Date",
    type: "date",
    validation: { required: true },
  },
  // {
  //   id: "groupName",
  //   label: "Group Name",
  //   type: "text",
  //   validation: { required: true },
  // },
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
    label: "Weight / Volume / Sub Qty",
    type: "text",
    validation: { required: true },
  },
  {
    id: "budgetno",
    label: "Budget No",
    type: "select",
    options: budgetOptions,
    validation: { required: true },
  },
  {
    id: "concentration",
    label: "Concentration",
    type: "text",
    validation: { required: true },
  },
  {
    id: "remarks",
    label: "Remarks",
    type: "text",
    validation: { required: false },
  },
  {
    id: "price",
    label: "Price",
    type: "number",
    validation: { required: true, pattern: /^[0-9]+$/ },
  },
  // {
  //   id: "addedby",
  //   label: "Added By",
  //   type: "text",
  //   validation: { required: true },
  //   readOnly: true, // often derived from user context
  // },
  // {
  //   id: "shared",
  //   label: "Shared",
  //   type: "select",
  //   options: ["Yes", "No"],
  //   validation: { required: true },
  //   transform: (value: string) => value === "Yes", // optional mapping to boolean
  // },
  // {
  //   id: "fileName",
  //   label: "Attached File Name",
  //   type: "text",
  //   validation: { required: false },
  //   readOnly: true,
  // },
  // {
  //   id: "fileType",
  //   label: "File Type",
  //   type: "text",
  //   validation: { required: false },
  //   readOnly: true,
  // },
  // {
  //   id: "fileContent",
  //   label: "Attachment",
  //   type: "file",
  //   validation: { required: false },
  // },
  {
    id: "attachment",
    label: "Attachment",
    type: "file",
    validation: { required: false },
},
];

export default updateProductFormGenInvConfig;
