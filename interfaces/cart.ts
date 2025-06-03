
export interface CartType {
  id: number,
  name: string,
  option_id?: [],
  options?: [],
  price: number,
  qty: number,
  total: number,
  uniq_id: string | number,
}
export interface PriceType {
  price?: number,
  service?: number,
  discount?: number,
  tip?: number,
  shipping_price?: number,
  packaging?: number,
  total?: number,
  tax?: number,
  credit_discount?: number,
  final_price?: number,
  useDiscountCode?: any,
  setUseDiscountCode?: any,
  discountValue?: any,
  setDiscountValue?: any
}
export interface CartContextType {
  cart: CartType[],
  setCart: (e) => void,
  addToCart: (data?: any, options?: any) => void,
  removeItem: (uniq_id) => void,
  interval: () => void,
  emptyCart: () => void,
  changeCart: (items) => void,
  openSidebar: boolean,
  setOpenSidebar: (e) => void,
  cartCount: number,
  setCartCount: (e) => void
  cartTotal: number,
  calculateOrderPrices: (values) => void,
  sidebarPrice: any,
  getRawItems: () => void,
  rawItems: any,
  setRawItems: (e) => void,
  updateOrder: (item, status?) => void,
  printOrder: (offline_id?: any, reprint?: boolean, print_type?: number, printer?: string, p_bill?: any, change_status?: boolean) => void,
  updateData: object,
  setUpdateData: (e) => void,
  useDiscountCode: any,
  setUseDiscountCode: (e) => void,
  discountValue: any,
  setDiscountValue: (e) => void
}
