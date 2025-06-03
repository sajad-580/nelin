import { Schema, model, models } from 'mongoose';

const menuSchema = new Schema({
    _id: Number,
    name: String,
    order_show: Number,
    count: Number,
    parent_id: Number,
    items: Array,
});

const Menu = models.Menu || model('Menu', menuSchema);

export default Menu;