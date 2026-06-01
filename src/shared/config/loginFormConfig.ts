const loginFormConfig = [
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
    }
  ];
  
export default loginFormConfig;
  