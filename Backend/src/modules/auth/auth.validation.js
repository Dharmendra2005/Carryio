function validateRegisterInput({ email, password, firstName, lastName }) {
  if (!email || !password || !firstName) {
    return { valid: false, message: "Email, password, and firstName are required" };
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  return { valid: true };
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return { valid: false, message: "Email and password are required" };
  }
  return { valid: true };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
