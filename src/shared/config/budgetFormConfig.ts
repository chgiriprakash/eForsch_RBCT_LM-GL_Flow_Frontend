const budgetFormConfig  = (
  // budgetOptions: string[],
  groupOptions: string[]
) => [
//   {
//     id: "productid",
//     label: "Sr. No",
//     type: "number",
//     validation: { required: true, min: 1, max: 1000 },
//   },
  {
    id: "groupName",
    label: "Group Name",
    type: "select",
    options: groupOptions,
    validation: { required: true }
  },
  {
    id: "budgetno",
    label: "Budget Number",
    type: "text",
    validation: { required: true, pattern: /^[0-9]{6,}$/ },
  },
  // {
  //   id: "budgetname",
  //   label: "Budget Name",
  //   type: "text",
  //   validation: { required: true },
  // },
  {
    id: "moneyallocated",
    label: "Money Alloted",
    type: "text", // changed to "text"
    inputMode: "numeric",
    validation: {
      required: true,
      pattern: /^[0-9]+$/, // allows only numbers
      min: 0,
      max: 1000000
    }
  },
  {
    id: "moneyleft",
    label: "Money Left",
    type: "text", // changed to "text"
    inputMode: "numeric",
    validation: {
      required: true,
      pattern: /^[0-9]+$/, // allows only numbers
      min: 0,
      max: 1000000
    }
  },
  //  {
  //       id: "groupName",
  //       label: "Group Name",
  //       type: "select",
  //       options: ["EForsch Group-A", "EForsch Group-B", "EForsch Group-C"],
  //       validation: { required: true },
  //   },
//   {
//     id: "createddate",
//     label: "Created Date",
//     type: "date",
//     validation: { required: true },
//   }
];

export default budgetFormConfig;
