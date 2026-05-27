const addProjectConfig = (budgetOptions: string[]) => [
  {
    id: "projectname",
    label: "Project Name",
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
    id: "longDescription",
    label: "Detail Description",
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

export default addProjectConfig;