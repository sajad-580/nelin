import { Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  _id: Number,
  offline_id: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: Number,
    required: true,
  },
  table_id: {
    type: Number,
    required: false,
  },
  online_table_id: {
    type: Number,
    required: false,
  },
  details: Object,
});

const Order = models.Order || model("Order", orderSchema);

export default Order;
