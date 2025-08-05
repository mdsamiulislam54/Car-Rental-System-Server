import BookingModel from "../schema/carSchemaModel/BookingModel.js";
import { CarModel } from "../schema/carSchemaModel/carSchemaModel.js";
import dotenv from "dotenv";
dotenv.config();

import admin from "firebase-admin";
import { UserModel } from "../schema/userModel/userModel.js";

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FB_PROJECT_ID,
    private_key_id: process.env.FB_PRIVATE_KEY_ID,
    private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
    console.log(data)
    const email = req.query.email;
    if (email !== req.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    const result = await CarModel.insertOne(data)
    console.log(result);
    res.status(201).send(result);
  } catch (error) {
    console.log(error)
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
  try {
    const {
      search,
      sort,
      limit = 6,
      page = 1,
      carModels,
      locations
    } = req.query;
    console.log(locations, carModels)
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    // 🔍 Build MongoDB query
    const query = {};

    if (carModels) {
      query.carModel = carModels;
    }

    if (locations) {
      query["location.city"] = locations;
    }

    if (search) {
      query.$or = [
        { carModel: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        // { "location.pickupPoints": { $regex: search, $options: "i" } },
        // { category: { $regex: search, $options: "i" } },
        // { fuelType: { $regex: search, $options: "i" } }
      ];
    }

    // ⬇️ Prepare base query
    let carQuery = CarModel.find(query)
      .lean()
      .skip(skip)
      .limit(parsedLimit);

    // 🔀 Sorting
    if (sort === "asc") {
      carQuery = carQuery.sort({ dailyRentalPrice: 1 });
    } else if (sort === "desc") {
      carQuery = carQuery.sort({ dailyRentalPrice: -1 });
    }

    // 🚀 Fetch cars and total count in parallel
    const [cars, count] = await Promise.all([
      carQuery.exec(),
      CarModel.countDocuments(query)
    ]);

    // 📤 Response
    res.send({
      cars,
      count,

    });

  } catch (error) {
    console.error("Error fetching available cars:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};




export const myCars = async (req, res) => {

  try {
    const { email, limit = 6, page = 1, } = req.query;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;


    const sort = req.query.sort;

    let result = CarModel.find().skip(skip).limit(parsedLimit).lean();
    if (sort === "asc") {
      result = result.sort({ createdAt: -1 });
    } else if (sort === "desc") {
      result = result.sort({ createdAt: 1 });
    }
    const cars = await result;
    const totalCars = await CarModel.countDocuments();

    res.send({
      cars,
      totalCars,
    });
  } catch (error) {

    console.error("Error fetching my cars:", error);
    res.status(500).send({ message: "Internal server error" });
  }

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
  console.log(id);
  const result = await BookingModel.deleteOne(query);
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

export const getCarType = async (req, res) => {
  try {
    const carTypes = await CarModel.distinct("carModel");
    const location = await CarModel.distinct("location");

    res.send({ carTypes, location })
  } catch (error) {
    res.status(404).json({ message: "Data not found" });
  }
};


//user

export const createUser = async (req, res) => {
  try {
    const user = req.body;


    const existUser = await UserModel.find({ userEmail: user.userEmail });

    if (existUser.length > 0) {
      return res.status(200).send({ message: "User already exists" }, existUser);
    }

    const result = await UserModel.create(user);

    console.log(result, existUser);
    res.status(201).send({ message: "User created successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "User not created" });
  }
};

export const getUser = async (req, res) => {
  try {
    const email = req.query.email;

    const result = await UserModel.findOne({ userEmail: email });
    console.log(result)
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "user not found " });
  }
};


//admin 

export const totalCar = async (req, res) => {
  try {
    const totalCar = await CarModel.find().lean();
    const totalPaid = await BookingModel.find({ paymentStatus: "paid" });
    const paid = totalPaid.reduce((acc, item) => acc + item.totalPrice, 0);
    console.log(paid)
    const total = totalCar.length;
    res.send({ total, paid })
  } catch (error) {
    res.status(500).json({ message: 'car not foun' })
  }
}
export const totalUser = async (req, res) => {
  try {
    const totalUser = await UserModel.find().lean();
    const total = totalUser.length;
    res.send(total)
  } catch (error) {
    res.status(500).json({ message: 'car not foun' })
  }
}
export const totalCarBooking = async (req, res) => {
  try {
    const totalBookingCar = await BookingModel.find().lean();

    res.send(totalBookingCar);
  } catch (error) {
    res.status(500).json({ message: 'car not foun' })
  }
}
export const totalCarBookingPending = async (req, res) => {
  try {
    const totalBookingCar = await BookingModel.find({ bookingStatus: "pending" }).lean().sort({ createdAt: -1 })

    res.send(totalBookingCar);
  } catch (error) {
    res.status(500).json({ message: 'car not foun' })
  }
}

export const bookingConfirm = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      { bookingStatus: 'confirmed' },
      { new: true }
    );
    console.log(updatedBooking)

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking confirmed successfully', updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

export const allUser = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit
    const user = await UserModel.find().skip(skip).limit(limit).lean();
    console.log(user)
    const count = await UserModel.countDocuments();
    res.send({user,count})
  } catch (error) {
    res.status(400).json({ message: "user not found" })
  }
}

// Cancel Booking
export const bookingCencel = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBooking = await BookingModel.findByIdAndUpdate(
      id,
      { bookingStatus: 'canceled' },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking canceled successfully', updatedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}
