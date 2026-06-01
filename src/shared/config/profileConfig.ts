const profileConfig = () => [
  {
    id: "title",
    label: "Title",
    type: "select",
    options: ["Dr.",
      "Prof.",
      // "Mr.",
      // "Ms.",
      // "Mrs.",
      "Researcher",
      "Scientist",
      "Lab Technician",
      "PhD Scholar",],
    validation: { required: true },
  },
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    validation: { required: true },
  },
  {
    id: "secondName",
    label: "Last Name",
    type: "text",
    validation: { required: true },
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    validation: { required: true },
    disabled: true,
  },
  {
    id: "groupLeader",
    label: "Group Leader",
    type: "text",
  },
   {
    id: "role",
    label: "Role",
    type: "text",
    validation: { required: true },
  },
  {
    id: "groupName",
    label: "Group",
    type: "text",
    validation: { required: true },
  },
   {
    id: "labName",
    label: "Lab Name",
    type: "text",
  },
  {
    id: "roomNumber",
    label: "Room Number",
    type: "text",
  },
    {
    id: "buildingNumber",
    label: "Building Number",
    type: "text",
  },
  {
    id: "addressLine1",
    label: "Address Line 1",
    type: "text",
  },
  {
    id: "addressLine2",
    label: "Address Line 2",
    type: "text",
  },
  {
    id: "streetName",
    label: "Street Name",
    type: "text",
  },
  {
    id: "city",
    label: "City",
    type: "text",
  },
];

export default profileConfig;