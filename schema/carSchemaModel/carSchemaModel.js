import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    carModel: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    dailyRentalPrice: {
      type: Number,
      required: true,
    },
    availability: {
      type: String,
      default: "Available",
    },
    registrationNumber: {
      type: String,
      required: true,
     
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      required: true,
    },
    seatingCapacity: {
      type: Number,
      required: true,
    },
    mileage: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
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
    galleryImages: {
      type: [String],
      default: [],
    },
    location: {
      type: Object,
      required: true,
    },
    ownerId: {
      type: String, 
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CarModel = mongoose.model("Car", carSchema);
