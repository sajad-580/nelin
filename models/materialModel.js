import { Schema, model, models } from 'mongoose';

const materialSchema = new Schema({
    _id: Number,
    data: Object,
});

const Material = models.Material || model('Material', materialSchema);

export default Material;