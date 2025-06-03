import { Schema, model, models } from 'mongoose';

const tableSchema = new Schema({
    _id: Number,
    name: String,
    p_bar: Number,
    p_bill: Number,
    tables: Array,
});

const Table = models.Table || model('Table', tableSchema);

export default Table;