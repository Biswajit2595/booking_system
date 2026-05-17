import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {

    const user = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {

    const data = await authService.loginUser(req.body);

    res.json({
      success: true,
      data
    });

  } catch (error) {
    next(error);
  }
};