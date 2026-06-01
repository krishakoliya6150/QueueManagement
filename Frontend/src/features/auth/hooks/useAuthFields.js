const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email";

  if (!password) errors.password = "Password is required";
  return errors;
}

export function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Name is required";

  if (!email?.trim()) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Use at least 6 characters";

  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

  return errors;
}
