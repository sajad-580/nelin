import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useProductContext } from "./Products";
import Sidebar from "./Sidebar";
import { CartContextType, CartType, PriceType } from "interfaces/cart";
import { findIndexSelect, request, roundFinalPrice } from "util/util";
import { findOrder, saveOrderOffline } from "services/order";
import { sendPrint } from "helpers/helper";
import { isMobile } from 'react-device-detect';


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }) => {
  const router = useRouter();
  const [seconds, setSeconds] = useState(0);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [cart, setCart] = useState<CartType[]>([]);
  const [rawItems, setRawItems] = useState([]);
  const [updateData, setUpdateData] = useState<any>({});
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [sidebarPrice, setSidebarPrice] = useState<PriceType>({});
  const { tax, discountList } = useProductContext();
  const [useDiscountCode, setUseDiscountCode] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const createUniqId = (data) => {
    data["uniq_id"] = data["id"];
    data['raw_price'] = data['price'];
    if (data["options"]) {
      let optionId = [];
      for (const item of data["options"]) {
        optionId.push(item["id"]);
        data["price"] += findIndexSelect(rawItems, item['id'], '_id')['price'] * 1000;
      }
      var sortedData = [...optionId].sort((a, b) => a - b);
      if (sortedData.length) data["uniq_id"] += "_" + sortedData.join("-");
      data["option_id"] = optionId;
      data["full_name"] = `${data.name}${(
        data['options']?.length ? `(${data['options']
          .map((option) => option['name'])
          .join("-")})` : ''
      )}`;
    }

    return data;
  };
  const calculateTotal = (items) => {
    let total = 0;
    let count = 0;
    for (const item of items) {
      total += item["total"];
      count += item['qty'];
    }
    setCartCount(count);
    setCartTotal(total)
    interval();
  };
  const addToCart = (data, options) => {
    let rawItem = findIndexSelect(rawItems, data['id'], '_id');
    addItems({
      id: data['id'],
      price: rawItem['price'] * 1000,
      name: data['name'],
      qty: 1,
      originalPrice: rawItem['original_price'] ? rawItem['original_price'] * 1000 : null
    }, options);
  };

  const addItems = (data, options) => {
    data["options"] = options?.length ? options : [];
    data = createUniqId(data);
    data["total"] = parseInt(data["price"]) * parseInt(data["qty"]);
    let items = [];
    if (cart?.length) {
      let newItem = true;
      for (const item of cart) {
        if (item.uniq_id == data["uniq_id"]) {
          item["qty"] += parseInt(data["qty"]);
          item["price"] = data["price"];
          item["name"] = data["name"];
          item["total"] = item["price"] * item["qty"];
          newItem = false;
        }
        items.push(item);
      }
      if (newItem) items.push(data);
    } else {
      items.push(data);
    }
    setNewCart(items);
    return { success: true };
  }
  const setNewCart = (items) => {
    calculateTotal(items)
    setCart(items);
    interval();
  };
  const changeCart = (items) => {
    for (const k in items) {
      items[k]["total"] = items[k]["price"] * items[k]["qty"];
    }
    setNewCart(items);
    interval();
  };
  const removeItem = (uniq_id) => {
    let items = [];
    for (const item of cart) {
      if (item["uniq_id"] != uniq_id) items.push(item);
    }
    setNewCart(items);
    interval();
  };
  const interval = () => {
    const interval_id = setInterval(() => {
      setSeconds(seconds + 1);
      clearInterval(interval_id);
    }, 100);
  };

  const emptyCart = () => {
    setCart([]);
    setCartCount(0);
    setCartTotal(0);
    setSidebarPrice({});
    setUpdateData({});
    interval();
    return true;
  };

  useEffect(() => {
    if (router.pathname == '/login')
      emptyCart();
  }, [router]);
  useEffect(() => {
    if (cartCount > 0) {
      if (!isMobile)
        setOpenSidebar(true)
    } else {
      setOpenSidebar(false);
      emptyCart();
    }
  }, [cartCount]);
  useEffect(() => {
    if (!rawItems?.length)
      getRawItems()
  }, [router]);
  const getRawItems = async () => {
    try {
      let res: any = await request('/api/raw_items', 'POST', { find: 1 });
      setRawItems(res)
    } catch (error) {

    }
  }
  const calculateDiscount = (id) => {
    let discount = findIndexSelect(discountList, id, 'value');
    let price = 0;
    if (discount && discount['percent'] > 0) {
      price = cartTotal * (discount['percent'] / 100);
    }
    return price;
  }
  const calculateOrderPrices = (values) => {
    let discount = 0;
    let taxPrice = 0;
    let totalAmount = cartTotal;
    if (values['use_discount']) {
      discount = calculateDiscount(values['use_discount']);
      totalAmount -= discount;
    }
   
    if (values['discountPercent']) {
      let d = totalAmount * (values['discountPercent'] / 100);
      discount += d;
      totalAmount -= d;
    }
    if (discountValue) {
      discount = discountValue;
      totalAmount -= discountValue;
    }
    if (tax) {
      let taxPercent = parseFloat(process.env.NEXT_PUBLIC_TAX);
      taxPrice = roundFinalPrice(Math.round(totalAmount * taxPercent));
      totalAmount += taxPrice;
    }
    if (values['service'])
      totalAmount += values['service'];
    if (values['tip']) totalAmount += values['tip'];
    if (values['shipping_price']) totalAmount += values['shipping_price'];
  
    if (values['packaging']) totalAmount += values['packaging'];
 
    values['discount'] = discount;
    values['tax'] = taxPrice;
    let final_price = totalAmount;
    if (values['credit_discount'])
      totalAmount -= values['credit_discount'];
    if (totalAmount < 0)
      totalAmount = 0;

    setSidebarPrice({
      price: cartTotal,
      service: values['service'],
      discount: values['discount'],
      tip: values['tip'],
      shipping_price: values['shipping_price'],
      packaging: values['packaging'],
      tax: values['tax'],
      total: roundFinalPrice(totalAmount),
      credit_discount: values['credit_discount'],
      final_price: final_price
    })
    interval();
  }
  const updateOrder = async (offline_id, status = null) => {
    try {
      let res = await findOrder({ offline_id: offline_id }, 1);
      res = res['order'];
      if (!res || [5, 6, 20].includes(res['status']))
        return true;

      res['details']['status'] = status ? status : res['status'];
      res['details']['table_id'] = res['table_id'];
      res['details']['_id'] = res['_id'];
      res['details']['id'] = res['offline_id'];
      let newCart = [];

      for (let item of res['details']['cart']) {
        item['price'] = findIndexSelect(rawItems, item['id'], '_id')['price'] * 1000;
        item = createUniqId(item);
        item['total'] = parseInt(item["price"]) * parseInt(item["qty"]);
        item['old'] = item['qty'];
        newCart.push(item)
      }

      setNewCart(newCart)
      setUpdateData(res['details']);
      setOpenSidebar(true)
      router.push('/')
      interval();
    } catch (error) {

    }
  }

  // useEffect(() => {
  //   if (clickUpdate) setUpdateOrder(clickUpdate)
  // }, [clickUpdate])

  const printOrder = async (offline_id?: any, reprint?: boolean, print_type?: number, printer?: string, p_bill?: any, change_status = false) => {
    let res = await findOrder({ offline_id: offline_id }, 1);
    if (res['order']) {
      res = res['order'];
      res['details']['_id'] = res['_id'];
      res['details']['status'] = res['status'];
      if ((res['status'] == 1 || res['status'] == 2) && change_status) {
        saveOrderOffline({
          id: res['offline_id'],
          status: 4,
        }).then(() => router.push('/tables'));
      }
      sendPrint({
        order: res['details'],
        reprint: reprint,
        printType: print_type,
        isUpdate: false,
        printer: printer
      });
    }

  }
  const cartContextValue: CartContextType = {
    cart,
    setCart,
    addToCart,
    removeItem,
    interval,
    emptyCart,
    changeCart,
    openSidebar,
    setOpenSidebar,
    cartCount,
    setCartCount,
    cartTotal,
    calculateOrderPrices,
    sidebarPrice,
    getRawItems,
    rawItems,
    setRawItems,
    updateOrder,
    printOrder,
    updateData,
    setUpdateData,
    useDiscountCode,
    setUseDiscountCode,
    discountValue,
    setDiscountValue
  };
  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
      <Sidebar />
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
