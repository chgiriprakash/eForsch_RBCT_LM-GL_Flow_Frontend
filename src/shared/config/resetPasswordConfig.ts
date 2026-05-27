const resetPasswordConfig = [
  {
    id: "password",
    label: "New Password",
    type: "password",
    validation: {
      required: true,
      minLength: 6,
    },
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    validation: {
      required: true,
      minLength: 6,
    },
  },
];

export default resetPasswordConfig;