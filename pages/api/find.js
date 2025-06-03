import { ifError } from "assert";
import Order from "models/orderModel";
import connectMongo from "util/connectMongo";

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function findOrder(req, res) {
  try {
    await connectMongo();
    let order, total, total2, total3, total4;
    if (req.body.remove == 1) {
      order = await Order.deleteMany();
      return res.status(200).json({ order });
    }
    if (req.body.removeOrder == 1) {
      delete req.body.removeOrder;
      order = await Order.deleteOne(req.body);
      return res.status(200).json({ order });
    }
    if (req.body.sum == 1) {
      total = await Order.aggregate([
        {
          $group: {
            _id: "",
            total: { $sum: "$details.total" },
            count: { $sum: 1 },
          },
        },
      ]);
      total2 = await Order.aggregate([
        {
          $match: {
            status: 6,
            "details.pay_status": { $ne: 1 },
          },
        },
        {
          $group: {
            _id: "",
            total: { $sum: "$details.total" },
            count: { $sum: 1 },
          },
        },
      ]);
      total3 = await Order.aggregate([
        {
          $match: {
            status: 20,
            "details.pay_status": { $ne: 1 },
          },
        },
        {
          $group: {
            _id: "",
            total: { $sum: "$details.total" },
            count: { $sum: 1 },
          },
        },
      ]);
      total4 = await Order.aggregate([
        {
          $match: {
            $or: [{ "details.flag": 1 }, { "details.pay_status": 1 }],
          },
        },
        {
          $group: {
            _id: "",
            total: { $sum: "$details.total" },
            count: { $sum: 1 },
          },
        },
      ]);
      return res.status(200).json({ total: total, total2: total2, total3: total3, total4: total4 });
    } else {
      if (req.body.table_id == 0) {
        req.body.table_id = { $exists: true, $ne: null };
      }
      if (req.body.status == 6 && req.body.just_status != 6) {
        req.body.status = { $nin: [6, 20] };
      }
      if (req.body.status == 20) {
        req.body.status = { $ne: 20 };
      }
      if (req.body.status == 0) {
        req.body.status = { $in: [6, 20] };
      }
      let limit = 1000;
      let skip = 0;
      if (req.body.limit) {
        limit = req.body.limit;
        skip = req.body.skip;
        delete req.body.limit;
        delete req.body.skip;
      }
      let sort = req.body.sort ? 1 : 0;
      if (req.body.just_status) delete req.body.just_status;
      if (req.body.sort) delete req.body.sort;
      // console.log(req.body)
      if (req.query.one == 1) order = await Order.findOne(req.body);
      else if (!sort) order = await Order.find(req.body).skip(skip).limit(limit).sort({ _id: -1 });
      else order = await Order.find(req.body).skip(skip).limit(limit);

      if (req.body.count == 1) {
        delete req.body.count;
        order = await Order.find(req.body).countDocuments();
      }
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
}
