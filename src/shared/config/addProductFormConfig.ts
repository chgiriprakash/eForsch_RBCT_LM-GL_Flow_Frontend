const addProductFormConfig = (
  budgetOptions: string[],
  // groupOptions: string[]
) => [
  // {
  //   id: "productid",
  //   label: "Sr No",
  //   type: "number",
  //   validation: { required: true },
  // },
  {
    id: "productname",
    label: "Product (Mandatory)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "catalogue",
    label: "catalogue (Mandatory)",
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
    type: "text", // changed from "number" to "text"
    validation: {
      required: true,
      pattern: /^[0-9]+$/, // optional: enforces numeric values only
    },
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
    validation: { required: true },
  },
  {
    id: "price",
    label: "Price",
    type: "number", // changed from "number" to "text"
    validation: {
      required: true,
      pattern: /^[0-9]+$/, // optional: enforces numeric values only
    },
  },
  {
    id: "remarks",
    label: "Remarks",
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

export default addProductFormConfig;
