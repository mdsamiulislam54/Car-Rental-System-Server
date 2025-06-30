import BookingModel from "../schema/carSchemaModel/BookingModel.js";
import { CarModel } from "../schema/carSchemaModel/carSchemaModel.js";
import dotenv from "dotenv";
dotenv.config()

import admin from "firebase-admin";




admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: process.env.FB_PROJECT_ID, 
    private_key_id: process.env.FB_PRIVATE_KEY_ID,
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FB_CLIENT_EMAIL,
    client_id: process.env.FB_CLIENT_ID,
    auth_uri: process.env.FB_AUTH_URI,
    token_uri: process.env.FB_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FB_CLIENT_CERT_URL,
    universe_domain: process.env.FB_UNIVERSE_DOMAIN,
  }),
});


export const car = async (req, res) => {
  try {
    const data = req.body;
    const email = req.query.email;
    if (email !== req.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log(data);
    const result = await CarModel.insertOne(data);
    console.log(result);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong", error });
  }
};

export const getCars = async (req, res) => {
  try {
    const result = await CarModel.find()
      .lean()
      .limit(6)
      .sort({ createdAt: -1 });

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch cars", error });
  }
};

export const availableCars = async (req, res) => {
  const { search, sort } = req.query;
  const query = {
    availability: "Available",
  };

  if (search) {
    query.$or = [
      { carModel: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  let result = CarModel.find(query).lean();
  if (sort === "asc") {
    result = result.sort({ dailyRentalPrice: 1 });
  } else if (sort === "desc") {
    result = result.sort({ dailyRentalPrice: -1 });
  }
  const cars = await result;
  res.send(cars);
};

export const myCars = async (req, res) => {
  const uid = req.query.uid;
  const email = req.query.email;

  if (email !== req.email) {
    return res.status(403).send({ message: "Forbidden access" });
  }

  const sort = req.query.sort;

  let result = CarModel.find({ uid: uid });
  if (sort === "asc") {
    result = result.sort({ createdAt: -1 });
  } else if (sort === "desc") {
    result = result.sort({ createdAt: 1 });
  }
  const cars = await result;
  res.send(cars);
};

export const deleteCar = async (req, res) => {
  const { id } = req.params;
  const query = { _id: id };
  const result = await CarModel.deleteOne(query);
  res.send(result);
};

export const updateCar = async (req, res) => {
  const id = req.params.id;
  const query = { _id: id };
  const updatedDoc = req.body;

  const result = await CarModel.updateOne(query, updatedDoc);
  res.send(result);
};

export const carDetails = async (req, res) => {
  const id = req.params.id;
  const car = await CarModel.findById(id);

  res.send(car);
};

export const carBooking = async (req, res) => {
  const bookingData = req.body;
  const { carId } = bookingData;
  const query = { _id: carId };
  const updatedDoc = {
    $inc: { bookingCount: 1 },
  };

  const result = await BookingModel.insertOne(bookingData);
  await CarModel.updateOne(query, updatedDoc);
  res.send(result);
};
export const getBooking = async (req, res) => {
  const uid = req.query.uid;
  const email = req.query.email;
  if (email !== req.email) {
    return res.status(403).send({ message: "Forbidden access" });
  }

  const query = { userUid: uid };

  const result = await BookingModel.find(query).lean();
  res.send(result);
};

export const cancelBooking = async (req, res) => {
  const id = req.params.id;

  const query = { _id: id };
  const updatedDoc = {
    $set: { bookingStatus: "Canceled" },
  };
  const car = await BookingModel.findOne(query);
  const { carId } = car;
  const bookingCountData = await CarModel.findOne({ _id: carId });
  const { bookingCount } = bookingCountData;
  if (bookingCount > 0) {
    await CarModel.updateOne({ _id: carId }, { $inc: { bookingCount: -1 } });
  }
  if (car.bookingStatus === "Canceled") {
    return res.status(400).send({ message: "Booking is already canceled" });
  }

  const result = await BookingModel.updateOne(query, updatedDoc);
  res.send(result);
};

export const updateDate = async (req, res) => {
  const id = req.params.id;
  const { startDay, endDate } = req.body;
  const query = { _id: id };

  const booking = await BookingModel.findOne({ _id: id });
  const { carId } = booking;
  const car = await CarModel.findOne({ _id: carId });
  const { dailyRentalPrice } = car;

  const startDayDate = new Date(startDay);
  const endDayDate = new Date(endDate);

  const timeDiff = endDayDate.getTime() - startDayDate.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  const totalPrice = dayDiff * dailyRentalPrice;

  const updateDoc = {
    $set: { startDay: startDay, endDate: endDate, totalPrice: totalPrice },
  };

  const result = await BookingModel.updateOne(query, updateDoc);
  res.send(result);
};

// export const jwtTokenGenerate = async (req, res) => {
//   const userEmail = req.query.email;
//   console.log("User email: ", userEmail);

//   const token = jwt.sign({ email: userEmail }, process.env.SECRET_KEY, {
//     expiresIn: "1h",
//   });
//   console.log("Token: ", token);

//   const isProduction = process.env.NODE_ENV === "production";

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: isProduction ? "none" : "lax",
//     maxAge: 60 * 60 * 1000,
//   });

//   res.send({ success: true, token });
// };

// export const jwtTokenVerify = async (req, res, next) => {
//   const token = req.cookies.token;
//   console.log(token)

//   if (!token) {
//     return res.status(401).send({message:"Unauthorized Access"})
//   }
//   jwt.verify(token, process.env.SECRET_KEY, (err, decode) => {
//     if (err) {
//       return res.status(403).send("Unauthorized Access Forbidden");
//     }

//     req.user = decode;

//     next();
//   });
// };

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeaders = req.headers?.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  const token = authHeaders.split(" ")[1];
  try {
    const decode = await admin.auth().verifyIdToken(token);
    req.email = decode.email;

    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};
