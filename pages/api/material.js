import Material from 'models/materialModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function saveMaterial(req, res) {
    try {
        await connectMongo();
        let create = true;
        let order;
        if (req.body.id) {
            order = await Material.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
            return res.status(200).json(order);
        }
        if (create) {
            let count = 1;

            req.body._id = count;
            await Material.deleteMany();
            order = await Material.create(req.body);
        }
        return res.status(200).json(order);

    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
}

