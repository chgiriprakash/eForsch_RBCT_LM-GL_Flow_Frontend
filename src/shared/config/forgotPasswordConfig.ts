const forgotPasswordConfig = [
  {
    id: "email",
    label: "Email",
    type: "email",
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  },
];

export default forgotPasswordConfig;