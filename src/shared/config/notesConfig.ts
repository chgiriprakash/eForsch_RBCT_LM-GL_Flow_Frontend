const addNotesConfig = (
  projectOptions: string[],
  budgetOptions: string[]
) => [
  {
    id: "projectId",
    label: "Project",
    type: "select",
    options: projectOptions,
    validation: { required: true },
  },
  {
    id: "experimentTitle",
    label: "Experiment Title",
    type: "text",
    validation: { required: true },
  },
  {
    id: "budgetIds",
    label: "Budget",
    type: "select", // can be multi-select later
    options: budgetOptions,
    validation: { required: true },
  },
  // {
  //   id: "noteDate",
  //   label: "Note Date",
  //   type: "date",
  //   validation: { required: true },
  // },
  {
    id: "content",
    label: "Content",
    type: "richtext",
    validation: { required: true },
  },
  {
    id: "attachment",
    label: "Attachment",
    type: "file",
    multiple: true,         
    maxFiles: 5,            
    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg", 
    validation: { required: false },
  },
];

export default addNotesConfig;
