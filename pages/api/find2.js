import Log from 'models/logModel';
import MaterialLog from 'models/materialLogModel';
import Material from 'models/materialModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function findOrder(req, res) {
    try {

        await connectMongo();
        let order, model;
        switch (req.query.model) {
            case 'MaterialLog':
                model = MaterialLog;
                break;
            case 'Material':
                model = Material;
                break;
            case 'Log':
                model = Log;
                break;
        }
        if (req.body.count == 1) {
            delete req.body.count;
            order = await model.find(req.body).countDocuments();
            return res.status(200).json(order);
        }
        if (req.body.remove == 1) {
            order = await model.deleteOne(req.body);
            return res.status(200).json(order);
        }
        if (req.body.removeAll == 1) {
            order = await model.deleteMany();
            return res.status(200).json(order);
        }
        let limit = 1000;
        let skip = 0;
        let sort = 1;
        if (req.body.sort) {
            sort = req.body.sort;
            delete req.body.sort;
        }
        if (req.body.limit) {
            limit = req.body.limit
            skip = req.body.skip;
            delete req.body.limit;
            delete req.body.skip;
        }
        if (req.query.one == 1)
            order = await model.findOne(req.body);
        else {
            order = await model.find(req.body).skip(skip).limit(limit).sort({ _id: sort });
        }
        return res.status(200).json(order);
    } catch (error) {
        res.json({ error });
    }
}
