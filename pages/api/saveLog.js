import Log from 'models/logModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function saveLog(req, res) {
    try {
        await connectMongo();
        let log;
        if (req.body.remove == 1) {
            log = await Log.deleteMany();
            return res.status(200).json(log);
        }
        if (req.body.id) {
            log = await Log.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true });
            return res.status(200).json({ success: true, data: log });
        }
        let count = await Log.findOne({}, {}, { sort: { '_id': -1 } });
        if (!count)
            count = 1;
        else
            count = count._id + 1
        req.body._id = count;
        log = await Log.create(req.body);
        return res.status(200).json({ success: true, data: log });

    } catch (error) {
        res.json({ success: false, error: error });
    }
}

