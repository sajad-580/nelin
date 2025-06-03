import { Schema, model, models } from 'mongoose';

const rawItemsSchema = new Schema({
    _id: Number,
    name: String,
    price: Number,
    category_id: Number,
    original_price: Number,
});

const RawItems = models.RawItems || model('RawItems', rawItemsSchema);

export default RawItems;