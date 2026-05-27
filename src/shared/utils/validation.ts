export const validateField = (name: string, value: string, validation: any): string | null => {
  console.log("validateField - name:", name, "value:", value, "validation:", validation);
  
  if (!value) return `${name} is required.`;

  if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
    return 'Invalid email address.';
  }

  if (name === 'password' && value.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  if (name === 'confirmPassword' && value !== 'password') {
    return 'Passwords do not match.';
  }

  return null;
};

export const baseUrl =  'http://localhost:8080/'