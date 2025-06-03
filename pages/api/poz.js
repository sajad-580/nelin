import { toast } from 'react-toastify';
import { saveOrderOffline } from 'services/order';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function addOrder(req, res) {
    try {
        let order_id = req.body.order_id;
        delete req.body.order_id;
        let update = {
            id: order_id,
            poz_response: req.body
        };
        if (req.body.ResponseCode == '00') {
            update['status'] = 6;
        }
        saveOrderOffline(update).then((r) => {
            if (r['order']) {
                res.status(200).json({ success: true, msg: req.body.ResponseDescription, status: r['order'].status });
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ error });
    }
}

