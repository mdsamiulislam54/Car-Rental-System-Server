import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import {
  allUser,
  availableCars,
  blockUser,
  bookingCencel,
  bookingConfirm,
  cancelBooking,
  car,
  carBooking,
  carDetails,
  createUser,
  deleteBlogsById,
  deleteCar,
  getBlogs,
  getBlogsById,
  getBooking,
  getCars,
  getCarType,
  getUser,
  manageAllBlogs,
  // jwtTokenGenerate,
  myCars,
  postBlogs,
  recentlyBookingCar,
  totalCar,
  totalCarBooking,
  totalCarBookingPending,
  totalUser,
  updateCar,
  updateDate,
  userBookingCar,
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
//user
app.post('/user-create', createUser)
// app.post("/jwt", jwtTokenGenerate);

//admin 
app.post('/admin/blog/post', postBlogs)

app.get("/car", getCars);
app.get("/available-cars", availableCars);
app.get("/my-cars", myCars);
app.get("/car-details/:id", carDetails);
app.get("/booking-car", verifyFirebaseToken, getBooking);
app.get('/car-type',getCarType)
app.get('/blogs', getBlogs)
app.get('/blogs/:id', getBlogsById)
//user
app.get('/user', getUser)
app.get('/dashboard/user/booking/car', userBookingCar)

//admin
app.get('/admin/total/car', totalCar)
app.get('/admin/total/user', totalUser);
app.get('/dashboard/total/booking/car', totalCarBooking)
app.get('/dashboard/total/booking/car/pending', totalCarBookingPending);
app.get('/admin/user', allUser)
app.get('/admin/recently/added/car', recentlyBookingCar)
app.get('/admin/manage/blogs', manageAllBlogs)




app.patch("/update-car/:id", updateCar);
app.patch("/update-booking/:id", updateDate);
//admin
app.patch('/admin/booking/confirm/:id', bookingConfirm);
app.patch('/admin/booking/cencel/:id', bookingCencel);

app.delete("/cancel-booking/:id", cancelBooking);
app.delete("/my-cars/:id", deleteCar);
app.delete('/admin/user/block', blockUser)
app.delete('/admin/delete/blogs/:id', deleteBlogsById)

// Run server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
