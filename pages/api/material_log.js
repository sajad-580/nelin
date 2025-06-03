import MaterialLog from 'models/materialLogModel';
import connectMongo from 'util/connectMongo';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function saveMaterialLog(req, res) {
    try {
        await connectMongo();
        let order;
        if (req.body.delete) {
            let logs = await MaterialLog.deleteMany();
            return res.status(200).json(logs);
        }
        if (req.body.remove) {
            let logs = await MaterialLog.deleteOne(req.body);
            return res.status(200).json(logs);
        }
        if (req.body.data) {
            let data = req.body.data;
            for (const key in data) {
                let doc = await MaterialLog.findOne({ _id: key }).then(async (item) => {
                    if (item) {
                        item.qty = (parseFloat(data[key]) + parseFloat(item.qty));
                        order = await item.save();
                    } else {
                        order = await MaterialLog.create({ _id: key, qty: data[key] });
                    }
                });
            }

        }
        return res.status(200).json(order);


        // order = await MaterialLog.findOne({ _id: req.body._id }).then(item => {
        //     if (!item) {
        //         MaterialLog.create(req.body);
        //     } else {
        //         let qty = (parseFloat(req.body.qty) + parseFloat(item.qty));
        //         MaterialLog.updateOne({ _id: req.body._id }, { qty: qty }, function (err, docs) {
        //             if (err) {
        //                 console.log(err)
        //             }
        //             else {
        //                 console.log("Updated Docs : ", docs);
        //             }
        //         })
        //     }
        // })
        // return res.status(200).json(order);
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
}

