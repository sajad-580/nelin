import { SendPrintType } from "interfaces/printer";
import { findOrder, removeOrder, saveOrderOffline, submitOrderOffline } from "services/order";
import { getTable } from "services/table";
import { getBranchId, request, roundFinalPrice } from "util/util";

export const getMenu = async (token: string) => {
    try {
        try {
            let branch_id = getBranchId(token);
            let res = await request(`/category?branch_id=${branch_id}`, 'GET', null, true);
            if (res['data']['categories']?.length) {
                await request('/api/menu', 'POST', { deleteAll: 1 });
                for (const item of res['data']['categories']) {
                    item['_id'] = item['id'];
                    let create = await request('/api/menu', 'POST', item);
                }
            }
            if (res['data']['raw_items']?.length) {
                await request('/api/raw_items', 'POST', { deleteAll: 1 });
                for (const item of res['data']['raw_items'])
                    await request('/api/raw_items', 'POST', item);
            }
            return res['data'];
        } catch (error) {

        }
    } catch (error) {

    }
}
export const getTables = async (token: string) => {
    try {
        let branch_id = getBranchId(token);
        let res = await request(`/table?branch_id=${1}`, 'GET', null, true);
        if (res['data']?.length) {
            await request('/api/table', 'POST', { deleteAll: 1 });
            for (const item of res['data']) {
                item['_id'] = item['id'];
                let create = await request('/api/table', 'POST', item);
            }
        }
        return res['data'];
    } catch (error) {
        console.log(error)
    }
}

export const submitOrder = async (values) => {
    let res = await request('/api/create', 'POST', values);
    return res['order'];
}
const calculatePrices = (details, details2) => {
    let cartTotal = 0;
    for (const item of details['cart']) {
        cartTotal += item['total'];
    }
    let totalAmount = cartTotal;
    details['discount'] = parseInt(details['discount'] ?? 0) + parseInt(details2['discount'] ?? 0);
    totalAmount -= details['discount'];

    if (details['tax'] || details2['tax']) {
        let taxPercent = parseFloat(process.env.NEXT_PUBLIC_TAX);
        details['tax'] = Math.round(totalAmount * taxPercent);
        totalAmount += details['tax'];
    }
    details['service'] = parseInt(details['service'] ?? 0) + parseInt(details2['service'] ?? 0);
    totalAmount += details['service'];
    details['tip'] = parseInt(details['tip'] ?? 0) + parseInt(details2['tip'] ?? 0);
    totalAmount += details['tip'];
    details['shipping_price'] = parseInt(details['shipping_price'] ?? 0) + parseInt(details2['shipping_price'] ?? 0);
    totalAmount += details['shipping_price'];

    details['payment_cash'] = parseInt(details['payment_cash'] ?? 0) + parseInt(details2['payment_cash'] ?? 0);
    details['payment_pos'] = parseInt(details['payment_pos'] ?? 0) + parseInt(details2['payment_pos'] ?? 0);
    details['payment_card'] = parseInt(details['payment_card'] ?? 0) + parseInt(details2['payment_card'] ?? 0);

    details['packaging'] = parseInt(details['packaging'] ?? 0) + parseInt(details2['packaging'] ?? 0);
    totalAmount += details['packaging'];
    details['price'] = cartTotal;
    details['total'] = roundFinalPrice(totalAmount);
    details['priceDetails'] = {
        price: details['price'],
        service: details['service'],
        discount: details['discount'],
        tip: details['tip'],
        shipping_price: details['shipping_price'],
        packaging: details['packaging'],
        tax: details['tax'],
        total: details['total']
    }
    console.log(details)
    return details;
}
const mergeTwoTable = async (
    order,
    order2,
    tbl1,
    tbl2,
    order_data?: any
) => {
    let item_id = [];
    let keys = {};
    let details = order2['details'];
    details.cart.map((item, key) => {
        item_id.push(item['uniq_id']);
        keys[item['uniq_id']] = key;
    });
    order['details'].cart.map((item) => {
        if (!item_id.includes(item['uniq_id'])) {
            details.cart.push(item);
        } else {
            let qty = details.cart[keys[item['uniq_id']]].qty + item.qty;
            details.cart[keys[item['uniq_id']]].qty = qty;
            details.cart[keys[item['uniq_id']]].total = qty * details.cart[keys[item['uniq_id']]].price;
        }
    });
    details = calculatePrices(details, order['details']);

    details['customer_note'] = order['details']['customer_note'] ? `${details['customer_note']} ${order['details']['customer_note']}` : details['customer_note'];
    details['note'] = order['details']['note'] ? `${details['note']} ${order['details']['note']}` : details['note'];

    let r = await findOrder({ offline_id: tbl1, removeOrder: 1 }, 1);
    if (r["order"].acknowledged === true) {
        let res = await saveOrderOffline({ id: order2.offline_id, details: details })
        return res['order'];
        // if (res['order'] && order_data) print_merge_order(order_data);
    }
};
export const mergeTable = async (tbl1, tbl2) => {
    let t2 = await findOrder({ offline_id: tbl2 }, 1);
    let order2 = t2["order"];
    let t1 = await findOrder({ offline_id: tbl1 }, 1);
    let order = t1["order"];
    if (order.flag == 1) {
        let res = await removeOrder(order.offline_id);
        if (res) {
            return mergeTwoTable(order, order2, tbl1, tbl2, t1);
        }
    } else {
        return mergeTwoTable(order, order2, tbl1, tbl2);
    }
};

export const sendPrint = async (data: SendPrintType) => {
    try {
        const { printer, printType, order, p_bill, reprint, isUpdate } = data;
        console.log('p_bill', p_bill)
        let username = localStorage.getItem('username');
        let userData = await request('/api/branch', 'POST', { id: username });
        if (!userData['order']) return true;
        let token = userData['order']['token'];
        userData = userData['order']['userData'];
        let customPrinter = userData['custom_print_valuet'];
        let printers = userData['printer_id'] ? userData['printer_id'] : [];
        const prns = {};
        for (let i = 0; i < printers.length; i++) {
            const p = localStorage.getItem(printers[i]) || 0;
            if (printer && printer != printers[i]) continue;
            if (p) {
                prns[printers[i]] = p;
            }
        }
        let print_type = order['print_type'];
        if (printType) print_type = printType;
        let p_bar;
        if (order['table_id']) {
            let tables = await getTables(token);
            if (tables?.length) {
                for (const item of tables) {
                    for (const t of item['tables']) {
                        if (t['id'] == order['table_id']) {
                            p_bar = item.p_bar;
                            break;
                        }
                    }
                }
            }
        }
        let phone = userData['phone'] ? userData['phone'] : '';
        let borderSize = localStorage.getItem("borderSize")
            ? JSON.parse(localStorage.getItem("borderSize"))
            : 3;
        let fontSize = localStorage.getItem("fontSize")
            ? JSON.parse(localStorage.getItem("fontSize"))
            : 12;
        let pageWidth = localStorage.getItem("pageWidth")
            ? JSON.parse(localStorage.getItem("pageWidth"))
            : 90;
        let factor_text = localStorage.getItem("factor_text") ? localStorage.getItem("factor_text") : '';
        let raw_items = await request('/api/raw_items', 'POST', { find: 1 });
        printers = prns;
        let res = await request('/submit-order', 'POST', {
            order,
            printers,
            customPrinter,
            raw_items,
            print_type,
            p_bill,
            p_bar,
            phone,
            borderSize,
            fontSize,
            pageWidth,
            reprint,
            isUpdate,
            factor_text
        });
        return res;
    } catch (error) {
        console.log('error',error)
    }
}