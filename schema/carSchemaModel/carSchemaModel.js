import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    carModel: {
      type: String,
      required: true,
    },
    dailyRentalPrice: {
      type: Number,
      required: true,
    },
    availability: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    features: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      require: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CarModel = mongoose.model("Car", carSchema);
