export function formatPrice(price: number) {
  let formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice + " تومان";
}
export function formatPrice2(price: number) {
  price = price;
  let price2 = price.toFixed();
  let formattedPrice = price2.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
}

export function cartTotalPrice(cart: any, tax?: string) {
  let totalPrice = cart
    .map((item) => item.product.price * item.count)
    .reduce((prev, next) => prev + next, 0);
  if (tax === "1") {
    let taxPercent = parseFloat(process.env.NEXT_PUBLIC_TAX);
    let taxPrice = totalPrice * taxPercent;
    totalPrice += taxPrice;
  }
  let finalPrice = formatPrice(roundFinalPrice(totalPrice));
  return finalPrice;
}
export function roundFinalPrice(totalPrice) {
  let text = totalPrice.toFixed();
  let replacement = "00";
  let result = text.substring(0, text.length - 2) + replacement;
  let finalPrice = parseInt(result);
  return finalPrice;
}
export function cartTotalPrice2(cart: any) {
  const totalPrice = cart
    .map((item) => item.product.price * item.count)
    .reduce((prev, next) => prev + next, 0);
  return totalPrice;
}
export function cartTotalTax(totalPrice, tax, tip?: any, packaging?: any) {
  if (tip) totalPrice -= parseInt(tip);
  if (packaging) totalPrice -= parseInt(packaging);
  if (tax !== "1") return 0;
  let taxPercent = parseFloat(process.env.NEXT_PUBLIC_TAX);
  let taxPrice = totalPrice * taxPercent;
  taxPrice = taxPrice;

  return taxPrice;
}
export const p2e = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
export const e2p = (s) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export const parseInputValue = (value, number = false) => {
  if (value) {
    value = p2e(value);
    if (/\D/g.test(value) && number) {
      value = value.replace(/[^0-9.-]/g, "");
    }
    return value;
  }
  return value;
};
export function numberFormat(price, showZero = false) {
  let formattedPrice = price
    ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : (showZero ? 0 : "");

  return formattedPrice;
}
export function maskm(val) {
  val = val.toString();
  val = p2e(val).replace(/\D/g, "");
  val = val.replace(/,/g, "");
  val = numberFormat(val);
  return val;
}
