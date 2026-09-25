const authService = require("./auth.service");
const { validateRegisterInput, validateLoginInput } = require("./auth.validation");
const { successResponse, errorResponse } = require("../../utils/response");
const asyncHandler = require("../../utils/asyncHandler");

const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};

const register = asyncHandler(async (req, res) => {
  const validation = validateRegisterInput(req.body);
  if (!validation.valid) {
    return errorResponse(res, 400, validation.message);
  }

  const { user, accessToken, refreshToken, role } = await authService.registerUser(req.body);
  setTokenCookies(res, accessToken, refreshToken);

  return successResponse(res, 201, "User registered successfully", {
    user: {
      id: user._id || user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || role,
    },
    token: accessToken,
    refreshToken,
  });
});

const login = asyncHandler(async (req, res) => {
  const validation = validateLoginInput(req.body);
  if (!validation.valid) {
    return errorResponse(res, 400, validation.message);
  }

  const { user, accessToken, refreshToken, role } = await authService.loginUser(req.body.email, req.body.password);
  setTokenCookies(res, accessToken, refreshToken);

  return successResponse(res, 200, "Login successful", {
    user: {
      id: user._id || user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || role,
    },
    token: accessToken,
    refreshToken,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken: newRefreshToken, role } = await authService.refreshAccessToken(refreshToken);

  setTokenCookies(res, accessToken, newRefreshToken);

  return successResponse(res, 200, "Token refreshed successfully", {
    user: {
      id: user._id || user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || role,
    },
    token: accessToken,
    refreshToken: newRefreshToken,
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.token || req.cookies?.token;
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  await authService.logoutUser(token, refreshToken);

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  return successResponse(res, 200, "Logged out successfully");
});

const getProfile = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "User profile retrieved", { user: req.user });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
};
