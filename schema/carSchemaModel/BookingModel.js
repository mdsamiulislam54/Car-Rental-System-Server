import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  carModel: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  startDay: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  userUid: {
    type: String,
    required: true
  },
  bookingStatus: {
    type: String,
    default: "Pending"
  },
  carImages:{
    type:String,
    required:true
  },
  carId:{
    type:String,
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BookingModel = mongoose.model("Booking", bookingSchema);

export default BookingModel;
