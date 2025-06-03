import { ifError } from 'assert';
import Branch from 'models/branchModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function saveBranch(req, res) {
    try {
        await connectMongo();
        let order;
        if (req.body.delete) {
            order = await Branch.deleteOne({ username: req.body.delete });
            return res.status(200).json(order);
        }
        if (req.body.id) {
            order = await Branch.findOne({ username: req.body.id });
        } else if(req.body.username){
            await Branch.deleteOne({ username: req.body.username });
            let count = await Branch.findOne({}, {}, { sort: { '_id': -1 } });
            if (!count)
                count = 1;
            else
                count = count._id + 1
            req.body._id = count;
            order = await Branch.create(req.body);
        }
        return res.status(200).json({ order });
    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}

