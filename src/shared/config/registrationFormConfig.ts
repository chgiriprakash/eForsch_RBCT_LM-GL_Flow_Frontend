const registrationFormConfig = [
    {
        id: "fname",
        label: "First Name",
        type: "text",
        validation: { required: true, minLength: 3 },
    },
    {
        id: "lname",
        label: "Last Name",
        type: "text",
        validation: { required: true, minLength: 3 },
    },
    {
        id: "role",
        label: "Designation",
        type: "select",
        options: ["Admin", "podept", "Scientist"],
        validation: { required: true },
    },
    {
        id: "groupName",
        label: "Group Name",
        type: "select",
        options: ["EForsch Group-A", "EForsch Group-B", "EForsch Group-C"],
        validation: { required: true },
    },
    {
        id: "email",
        label: "Email",
        type: "email",
        validation: { required: true, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ },
    },
    {
        id: "password",
        label: "Password",
        type: "password",
        validation: { required: true, minLength: 6 },
    },
    {
        id: "retypePassword",
        label: "Retype Password",
        type: "password",
        validation: { required: true, validate: (value: string, context: any) => value === context.password || 'Passwords do not match', },
    }
  ];
  
export default registrationFormConfig;
  