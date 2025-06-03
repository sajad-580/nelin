import apiUrl from "apiUrl";
import axios, { AxiosRequestConfig } from "axios";
import basUrl from 'baseU.js'
import { toast } from "react-toastify";

export const request = async (url?: string, method = 'get', data?: any, api = false) => {
    return new Promise((resolve, reject) => {
        const config: AxiosRequestConfig = {
            method: method,
            baseURL: api ? apiUrl[1] : basUrl,
            url: url,
            headers: {},
            data: data
        }
        axios(config).then(function (response) {
            resolve(response['data'])
        })
            .catch(function (error) {
                console.log(error)
                // setIsError(true)
                reject()
            })
    })
}
export const itemRequired = (name?: string, msg?: string) => {
    return [{ required: true, message: msg ? msg : `${name} اجباری میباشد.` }];
}
export const hidden = () => {
    return 'd-none d-md-block d-lg-block';
}
export const sendAlert = (success = false, msg) => {
    const option: any = {
        position: "bottom-right",
        style: { direction: "rtl", 'text-align': 'right', fontFamily: "Peyda-Medium", 'white-space': 'pre-line' },
        theme: 'colored'
    };
    if (success)
        toast.success(msg, option);
    else
        toast.error(msg, option);
}
export const getBranchId = (token) => {
    let branch_id = token.split('%')[1];
    return branch_id;
}
export const generateTableArr = (tables) => {
    let arr = [];
    for (const item of tables) {
        if (!item.tables?.length) continue;
        let tables = [];
        for (const t of item.tables) {
            tables.push({ label: t.name, value: t.id });
        }
        arr.push({ label: item['name'], options: tables });
    }
    return arr;
}
export const p2e = s => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
export const e2p = s => s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])

export function findIndexSelect(arr, value, field_name) {
    if (!arr)
        return false;
    let index = arr.findIndex(function (el) { return el[field_name] == value; })
    return (arr[index] ? arr[index] : '');
}

export function roundFinalPrice(totalPrice) {
    let text = totalPrice.toFixed();
    let replacement = "00";
    let result = text.substring(0, text.length - 2) + replacement;
    let finalPrice = parseInt(result);
    return finalPrice;
}
export const getTime = (time) => {
    let oldTime = new Date(time).getTime();
    let nowTime = new Date().getTime();
    let distanceTimes = nowTime - oldTime;

    let hours = Math.floor(
        (distanceTimes % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distanceTimes % (1000 * 60 * 60)) / (1000 * 60));
    let secends = Math.floor((distanceTimes % (1000 * 60)) / 1000);

    return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
        }:${secends < 10 ? "0" + secends : secends}`;
};
export const getNewDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");

    // Extract time components
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    // Create the formatted date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};