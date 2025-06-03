import Material from 'models/materialModel';
import Menu from 'models/menuModel';
import RawItems from 'models/rawItemsModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function menu(req, res) {
    try {
        await connectMongo();
        let order;
        if (req.body.deleteAll) {
            order = await RawItems.deleteMany();
            return res.status(200).json(order);
        }
        if (req.body.find) {
            delete req.body.find;
            order = await RawItems.find(req.body);
            return res.status(200).json(order);
        }
        order = await RawItems.create(req.body);
        return res.status(200).json(order);

    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
}

