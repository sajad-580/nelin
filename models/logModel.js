import { Schema, model, models } from 'mongoose';

const logSchema = new Schema({
    _id: Number,
    item_id: Number,
    item_name: String,
    qty: Number,
    status: Number,
    info: String,
});

const Log = models.Log || model('Log', logSchema);

export default Log;