import Table from "models/tableModel";
import connectMongo from "util/connectMongo";

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function table(req, res) {
  try {
    await connectMongo();
    let order;
    if (req.body.deleteAll) {
      order = await Table.deleteMany();
      return res.status(200).json(order);
    }
    if (req.body.find) {
      delete req.body.find;
      order = await Table.find(req.body);
      return res.status(200).json(order);
    }
    order = await Table.create(req.body);
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
}
