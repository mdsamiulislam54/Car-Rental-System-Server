import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import {
  availableCars,
  cancelBooking,
  car,
  carBooking,
  carDetails,
  deleteCar,
  getBooking,
  getCars,
  // jwtTokenGenerate,
  myCars,
  updateCar,
  updateDate,
  verifyFirebaseToken,
} from "./route/carRoute.js";
import errorHandler from "./errorHandling/errohandling.js";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(errorHandler);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://car-ride.netlify.app",
      "https://car-rental-system-server-beta.vercel.app",
    ],
    credentials: true,
  })
);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Database connected successfully!"))
  .catch((err) => console.error(" DB Connection Failed:", err));

app.post("/car",verifyFirebaseToken, car);
app.post("/booking-car", carBooking);
// app.post("/jwt", jwtTokenGenerate);

app.get("/car", getCars);
app.get("/available-cars", availableCars);
app.get("/my-cars", verifyFirebaseToken, myCars);
app.get("/car-details/:id", carDetails);
app.get("/booking-car", verifyFirebaseToken, getBooking);

app.patch("/update-car/:id", updateCar);
app.patch("/update-booking/:id", updateDate);

app.delete("/cancel-booking/:id", cancelBooking);
app.delete("/my-cars/:id", deleteCar);

// Run server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
