const addOrderProdFormConfig = (
  budgetOptions: string[],
  // groupOptions: string[]
) => [
//   {
//     id: "productId",
//     label: "Product ID",
//     type: "number",
//     validation: { required: false }, // auto-generated, not mandatory
//   },
  {
    id: "productname",
    label: "Product (Mandatory)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "catalogue",
    label: "Catalogue (Mandatory)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "companyname",
    label: "Company (Mandatory)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "quantity",
    label: "Quantity (Mandatory)",
    type: "number",
    validation: { required: true },
  },
  {
    id: "expirydate",
    label: "Expiry Date (Mandatory)",
    type: "date",
    validation: { required: true },
  },
  {
    id: "companyinternalno",
    label: "Company Internal No",
    type: "text",
    validation: { required: true },
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
    id: "budgetno",
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
  // {
  //   id: "groupName",
  //   label: "Group Name",
  //   type: "select",
  //   options: groupOptions,
  //   validation: { required: true },
  // },
  // {
  //   id: "addedby",
  //   label: "Added By",
  //   type: "text",
  //   validation: { required: true },
  // },
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
//   {
//     id: "shared",
//     label: "Shared",
//     type: "checkbox",
//     validation: { required: false },
//   },
//   {
//     id: "fileName",
//     label: "File Name",
//     type: "text",
//     validation: { required: false },
//   },
//   {
//     id: "fileType",
//     label: "File Type",
//     type: "text",
//     validation: { required: false },
//   },
//   {
//     id: "fileContent",
//     label: "File Content",
//     type: "file",
//     validation: { required: false },
//   },
    {
      id: "attachment",
      label: "Attachment",
      type: "file",
      validation: { required: false },
  },
];

export default addOrderProdFormConfig;
