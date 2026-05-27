const addFineChemicalsFormConfig = (
  budgetOptions: string[],
  companyOptions: { label: string; key: string }[] = [],
) => [
  {
    id: "productname",
    label: "Product",
    type: "text",
    validation: { required: true },
  },
  {
    id: "catalogue",
    label: "Catalogue/Article Number",
    type: "text", // changed to text to accept alphanumeric
    validation: { required: true },
  },
  {
    id: "companyname",
    label: "Company",
    type: "select",
    options: companyOptions,
    validation: { required: true },
  },
  {
    id: "quantity",
    label: "Quantity",
    type: "text", // changed from "number" to "text"
    validation: {
      required: true,
      pattern: /^[0-9]+$/, // optional: enforces numeric values only
    },
  },
  {
    id: "expiryDate",
    label: "Expiry Date",
    type: "date",
    validation: { required: true },
  },
  {
    id: "companyInternalNo",
    label: "Company Internal No (auto-filled)",
    type: "text",
    validation: { required: false },
  },
  {
    id: "sapMaterialNo",
    label: "SAP Material No",
    type: "text", // changed to text to accept alphanumeric
    validation: { required: true },
  },
  {
    id: "wvsubqty",
    label: "Quantity Unit",
    type: "text",
    validation: { required: true },
  },
  {
    id: "budgetno",
    label: "Budget Number",
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
  //   id: "orderedby",
  //   label: "Ordered By",
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
    id: "casnumber",
    label: "CAS Number",
    type: "text", // changed to text to accept alphanumeric
    validation: { required: true },
  },
  {
    id: "hazardousSubstance",
    label: "Hazardous Substance",
    type: "select",
    options: ["Yes", "No"],
    validation: { required: true },
  },
  {
    id: "cmrSubstance",
    label: "CMR Substance",
    type: "select",
    options: ["Yes", "No"],
    validation: { required: true },
  },
  {
    id: "skinResorptive",
    label: "Skin-Resorptive",
    type: "select",
    options: ["Yes", "No"],
    validation: { required: true },
  },
  {
    id: "ghsSymbols",
    label: "Select the GHS Symbols",
    type: "checkbox-group",
    options: ["Explosive", "Flammable", "Oxidizing", "Corrosive", "Toxic", "Harmful", "Gas under pressure", "Environmental hazard"],
    validation: { required: false },
  },
  {
    id: "ghsSignalWord",
    label: "Signal Word",
    type: "checkbox-group",
    options: ["Danger", "Attention"],
    validation: { required: true },
  },
  {
    id: "hPhrases",
    label: "H-Phrases (e.g. +H332)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "pPhrases",
    label: "P-Phrases (e.g. +P332)",
    type: "text",
    validation: { required: true },
  },
  {
    id: "substitutionCheck",
    label: "Substitution Checking Performed",
    type: "radio",
    options: ["Yes", "No"],
    validation: { required: true },
  },
  {
    id: "substitutionOption",
    label: "If No, specify the reason",
    type: "text",
    validation: { required: false },
    showIf: { field: "substitutionCheck", value: "No" },
  },
  {
    id: "substitutionOption",
    label: "If Yes, select one of the following",
    type: "select",
    options: [
      "Substance already substituted, by...",
      "Substance cannot be replaced, research chemical",
      "Substance cannot be replaced, it's necessary for the experiment",
      "Please complete the result of the test..."
    ],
    validation: { required: false },
    showIf: { field: "substitutionCheck", value: "Yes" },
  },
  {
    id: "storageLocation",
    label: "Storage Location",
    type: "text",
    validation: { required: true },
  },
  {
      id: "attachment",
      label: "Attachment",
      type: "file",
      validation: { required: false },
  },
];

export default addFineChemicalsFormConfig;
