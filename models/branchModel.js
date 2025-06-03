import { Schema, model, models } from 'mongoose';

const branchSchema = new Schema({
    _id: Number,
    cronjob: String,
    token: String,
    username: String,
    warehouse: Number,
    userData: Object,
});

const Branch = models.Branch || model('Branch', branchSchema);

export default Branch;