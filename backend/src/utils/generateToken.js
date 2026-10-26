
export const generateToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = isProduction ? "none" : "lax";

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/",
  };

  return res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      message,
    });
};
