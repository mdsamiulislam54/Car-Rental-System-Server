// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.log(statusCode. err)
  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
