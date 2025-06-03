import { Schema, model, models } from 'mongoose';

const materialLogSchema = new Schema({
    _id: Number,
    qty: Number,
});

const MaterialLog = models.MaterialLog || model('MaterialLog', materialLogSchema);

export default MaterialLog;