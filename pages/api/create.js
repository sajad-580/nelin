import { ifError } from "assert";
import Order from "models/orderModel";
import connectMongo from "util/connectMongo";

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function addOrder(req, res) {
  try {
    await connectMongo();
    let create = true;
    let order;
    if (req.body.id) {
      if (req.body.total) {
        let old_order = await Order.findOne({ offline_id: req.body.id });
        req.body.revision_num = old_order.revision_num + 1;
      }
      order = await Order.findOneAndUpdate({ offline_id: req.body.id }, req.body, { new: true });
      if (order) {
        create = false;
      }
      console.log("body");
      return res.status(200).json({ order });
    }
    if (create) {
      let count = await Order.findOne({}, {}, { sort: { _id: -1 } });

      if (!count) count = 105;
      else count = count._id + 1;
      req.body._id = count;
      if (req.body.table_id) {
        let table_check = await Order.findOne({ table_id: req.body.table_id, status: { $nin: [6, 20] } });
        if (table_check) {
          order = table_check;
          return res.status(200).json({ order });
        }
      }
      order = await Order.create(req.body);
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}
