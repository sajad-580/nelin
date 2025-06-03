import express, { Request, Response } from "express";
import morgan from "morgan";
import next from "next";
import pdf from "pdf-creator-node";
import ptp from "pdf-to-printer";
import path from "path";

import basUrl from "../baseU";
import {
  billStyle,
  footer,
  headerStart,
  headerTemplate,
  headerTemplateDynamic,
  htmlStart,
  htmlStart2,
  tableHeader,
  tableStart,
  tableStart2
} from "./../helpers/bill-template";
import apiUrl from "../apiUrl";
// const dev = process.env.NODE_ENV !== 'production'
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();
function formatPrice2(price: number) {
  let price2 = price.toFixed();
  let formattedPrice = price2.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
}
function roundFinalPrice(totalPrice) {
  let text = (parseFloat(totalPrice) * 1000).toFixed();
  let replacement = "00";
  let result = text.substring(0, text.length - 2) + replacement;
  let finalPrice = parseInt(result) / 1000;
  return finalPrice;
}
const save_pdf = async (htmlContent, filePath, printers) => {
  var document = {
    html: htmlContent,
    path: filePath,
    data: {},
    type: "",
  };
  pdf
    .create(document, {
      width: "8cm",
      height: "29.7cm",
      timeout: "100000",
      // border: {
      //   top: '0cm',
      //   left: '1cm',
      //   right: '1cm',
      // }
    })
    .then((rs) => {
      // let printer = ptp.getDefaultPrinter()
      for (let i = 0; i < printers.length; i++) {
        console.log('printer', printers[i])
        const options = {
          printer: printers[i],
          unix: ["-o fit-to-page"],
          win32: ['-print-settings "noscale"'],
        };
        ptp
          .print(filePath, options)
          .then((res) => {
            return res;
          })
          .catch((err) => {
            return err;
          });
      }

      // return res.json({ success: true })
      console.log(rs);
    })
    .catch((error) => {
      // return res.json({ success: false })
      console.log(error);
    });
};
const port = 3000;

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.use(express.json());
    server.use(morgan("dev"));
    server.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    });

    // returns a list of all the available printers to the OS back to the client
    server.get("/get-printers", (req, res) => {
      ptp
        .getPrinters()
        .then((printers) => res.json({ printers }))
        .catch((err) => {
          console.log('tetetett')
          res.json({ err })
        });
    });

    server.get("/printChangeTable", async (req, res) => {
      const { prewTable, nextTable, printer, phone } = req.query;
      let htmlContent: string = `
      ${billStyle}
      ${htmlStart}
      ${headerTemplate}
      `;

      htmlContent += `<h3>ویرایش میز</h3>
      <table class="table table-bordered text-center">
        <thead>
          <tr class="c-head">
            <th style="padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;">میز قبلی</th>
            <th style="padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;">میز جدید</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;">${prewTable}</td>
            <td style="padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;">${nextTable}</td>
          </tr>
        </tbody>
      </table>`;

      htmlContent += `${footer(phone ? phone : "")}`;

      const filePath = path.join(
        "bills",
        `${prewTable + "-" + nextTable}-p2.pdf`
      );

      var document = {
        html: htmlContent,
        path: filePath,
        data: {},
        type: "",
      };

      pdf
        .create(document, {
          width: "8cm",
          height: "29.7cm",
          // border: {
          //   top: '0cm',
          //   left: '1cm',
          //   right: '1cm',
          // }
        })
        .then((rs) => {
          const options = {
            printer: printer.toString(),
            unix: ["-o fit-to-page"],
            win32: ['-print-settings "noscale"'],
          };
          ptp
            .print(filePath, options)
            .then((res) => {
              return res;
            })
            .catch((err) => {
              return err;
            });
          return res.json({ success: true });
        })
        .catch((error) => {
          return res.json({ success: false });
        });
    });
    server.post("/submit-order", async (req, res) => {
      let {
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
      } = req.body;
      let userType = {
        '1': 'آقا',
        '2': 'خانم'
      }
      let printType = print_type;
      if (printType == 3) return res.json({ success: true });
      let customer = order['customer'];
      let customerName = customer['name'] ? customer['name'] : "";
      if (customer['type'] && userType[customer['type']]) {
        customerName = `${userType[customer['type']]} ${customerName}`;
      }
      let customerPhone = customer['username'] ? customer['username'] : "";
      let htmlContent: string = `${billStyle}${htmlStart2(
        pageWidth
      )}${headerTemplateDynamic(
        order['_id'],
        customerName,
        1,
        reprint,
        order['delivery'],
        order['type'],
        isUpdate
      )}${tableStart(borderSize, fontSize, pageWidth)}`;
      let htmlContent2: string = `${billStyle}${htmlStart2(
        pageWidth
      )}${headerTemplateDynamic(order['_id'], customerName, 0, reprint, order['delivery'],
        order['type'], isUpdate)}${tableStart2(borderSize, fontSize, pageWidth)}`;
      let itemTotalPrice = 0;
      for (const item of order['cart']) {

        itemTotalPrice += item.total;
        let count = item.qty;
        if (item.old_qty && isUpdate) {
          if (item.old_qty == item.qty && printType != 4 && !item.remove)
            continue;
          if (printType != 4) {
            let new_count = item.qty - item.old_qty;
            if (item.remove) count = 0;
            else
              count =
                (new_count > 0 ? "+" + new_count : new_count) +
                "=>" +
                item.qty;
          }
          if (item.remove) count = 0;
        }
        let name2 = item.full_name + (item.note ? `<hr>${item.note}` : "");
        let item_price = item.price / 1000;
        let item_total_price = item.total / 1000;

        let discount_price = 0;
        let discount_total_price = 0;

        if (item['originalPrice']) {
          item_price = item['originalPrice'] / 1000;
          item_total_price = (item['originalPrice'] * item['qty']) / 1000;
          discount_price = item.price / 1000;
          discount_total_price = item.total / 1000;
        }
        if (item['discount_price'] && item['discount_price'] > 0) {
          item_price = item.price / 1000;
          discount_price = Math.round(item['discount_price'] / 1000);
        }
        if (item['discount_total'] && item['discount_total'] > 0) {
          item_total_price = item.total / 1000;
          discount_total_price = Math.round(item['discount_total'] / 1000);
        }


        htmlContent += `
            <tr class="">
              <td style="width:42%;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class="c-name">
              ${item.remove ? `<s>${item.full_name}</s>` : item.full_name}
              </td>
              <td style="width:10%;padding:5px;text-align:center;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class="c-qty">
              ${item.qty}
              </td>
              <td style="text-align:center;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma;"class="c-price">
                  ${discount_price > 0 ? `
                    <del>${item_price}</del>
                    <br/>
                    <span>${discount_price}</span>
                ` : item_price}
              </td>
              <td style="text-align:center;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma;"class="c-price">
                  ${discount_total_price > 0 ? `
                    <del>${item_total_price}</del>
                    <br/>
                    <span>${discount_total_price}</span>
                ` : item_total_price}
              </td>
            </tr>
            `;
        htmlContent2 += `
            <tr class="">
            <td style="width:90%;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class="c-name">
            ${item.remove ? `<s>${name2}</s>` : name2}
            </td>
            <td style="width:10%;padding:5px;text-align:center;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma;direction:ltr"class="c-qty">
            ${count}</td>
            </tr>
            `;
      };
      let foot =
        (order['note'] ? `<h4>توضیحات: ${order['note']}</h4>` : "") +
        (order['num_people'] ? `<h4>تعداد نفرات: ${order['num_people']}</h4>` : "");
      let prices = order['priceDetails'];
      htmlContent += `
      <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>جمع صورت حساب:</label>
        <span class="total" style="float:left;">${formatPrice2(
        itemTotalPrice * 10
      )} ریال</span>
        </td>
      </tr>
        ${prices['discount'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>تخفیف:</label>
        <span class="total" style="float:left;direction:ltr">-${formatPrice2(prices['discount'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['service'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>حق سروریس:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['service'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['tip'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>tip:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['tip'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['packaging'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>بسته بندی:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['packaging'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['shipping_price'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>ارسال:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['shipping_price'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['tax'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>مالیات بر ارزش افزوده VAT:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['tax'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        ${prices['credit_discount'] > 0
          ? `  
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>استفاده از اعتبار:</label>
        <span class="total" style="float:left;">${formatPrice2(prices['credit_discount'] * 10)}</span>
        </td> </tr>`
          : ""
        }
        <tr class="summary bgorgm" style="">
        <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
        class="total-action"colspan="5"><label>جمع قابل پرداخت:</label>
        <span class="total" style="float:left;">${formatPrice2(
          prices['total'] * 10
        )} ریال</span>
        </td>
        </tr>
        <tr></tr></table>${(order['table_id'] ? `<h2>شماره میز: ${order['table_name']}</h2>` : "") +
        `<h6>${order['offline_id']}</h6>` +
        (order['note'] ? `<h6>توضیحات: ${order['note']}</h6>` : "") +
        (customer['address'] && order['delivery'] ? `<h6>آدرس: ${customer['address']}</h6>` : "") +
        (customer['address'] && order['delivery'] && customer['lat_long'] && customer['lat_long']?.length
          ? `<img width="180px" src="${apiUrl[1]}/qr?lat=${customer['lat_long'][0]}&long=${customer['lat_long'][1]}"/>` : "") +
        (customerPhone ? `<h6>شماره تماس مشتری: ${customerPhone}</h6>` : "") +
        (order['branch_type_name'] ? `<h6>سالن: ${order['branch_type_name']}</h6>` : "") +
        (factor_text ? `<h6>${factor_text}</h6>` : "") +
        footer(phone)
        }`;

      htmlContent2 += `</table>
      ${(order['table_id'] ? `<h2>شماره میز: ${order['table_name']}</h2>` : "") + foot}` +
        (order['branch_type_name'] ? ` <h6>${order['branch_type_name']}</h6>` : "");

      let html2_footer = order['delivery']
        ? '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">بیرون بر</b>'
        : (order['type'] == 3 ?
          '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">دریافت حضوری</b>'
          : '');
      let setPrinter = [];
      let setPrinter2 = [];
      if (printers["p1"]) setPrinter.push(printers["p1"]);
      // if (printers["p0"]) setPrinter.push(printers["p0"]);

      ["p2", "p3", "p4", "p5"].map((item) => {
        if (printers[item]) setPrinter2.push(printers[item]);
      });
      if ([1, 4].includes(printType))
        save_pdf(
          htmlContent,
          path.join("bills", `${order['offline_id']}.pdf`),
          setPrinter
        );

      if (printType == 4) return res.json({ success: true });

      setPrinter = [];

      save_pdf(
        htmlContent2 + html2_footer,
        path.join("bills", `${order['offline_id']}_k.pdf`),
        setPrinter2
      );

      if (p_bill && printers["p" + p_bill])
        save_pdf(
          htmlContent,
          path.join("bills", `${order['offline_id']}_p${p_bill}.pdf`),
          [printers["p" + p_bill]]
        );
      if (p_bar && printers["p" + p_bar])
        save_pdf(
          htmlContent2+html2_footer,
          path.join("bills", `${order['offline_id']}_k_p${p_bar}.pdf`),
          [printers["p" + p_bar]]
        );

      let PO = {};
      let temp = [];

      Object.keys(customPrinter).forEach((i) => {
        temp = [];
        order['cart'].map((item, index) => {
          if (
            customPrinter[i].cat &&
            (customPrinter[i].cat.length || [])
          ) {
            let index = raw_items.findIndex(x => x._id === item.id);
            let raw_item = raw_items[index];
            if (
              raw_item &&
              customPrinter[i].cat.includes(
                raw_item.category_id.toString()
              )
            ) {
              let count = item.qty;
              if (item.old_qty && isUpdate) {
                if (item.old_qty == item.qty) return;
                let new_count = item.qty - item.old_qty;
                count =
                  item.qty +
                  "/" +
                  (new_count > 0 ? "+" + new_count : new_count);
              }
              temp.push(`
        <tr class="" >
          <td style="width:90%;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class="c-name" > ${(item.remove ? `<s>${item.full_name}</s>` : item.full_name) + (item.note ? `<hr>${item.note}` : "")
                } </td>
        <td style = "width:10%;padding:5px;text-align:center;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class="c-qty" >
          ${count} </td>
            </tr>
              `);
              PO[i] = temp;
              return;
            }
          }
        });
      });
      Object.keys(PO).forEach((i) => {
        setPrinter = [];
        htmlContent2 = `${billStyle}${htmlStart2(pageWidth)}${headerTemplateDynamic(order['_id'], customerName, 0, null, order['delivery'], order['type'], isUpdate) +
          "<h4>" +
          customPrinter[i].name +
          "</h4>"
          }${tableStart2(borderSize, fontSize, pageWidth)} `;
        PO[i].map((item) => {
          htmlContent2 += item;
        });
        htmlContent2 += `</table>${(order['table_id'] ? "<h2>شماره میز: " + order['table_name'] + "</h2 > " : "") + foot
          }`;
        if (printers[i]) setPrinter.push(printers[i]);
        save_pdf(
          htmlContent2+html2_footer,
          path.join("bills", `${order['offline_id']}_k_${i}.pdf`),
          setPrinter
        );
      });

      return res.json({ success: true });
    });
    server.post("/print-all-order", async (req, res) => {
      let {
        orders,
        pageWidth,
        startDate,
        endDate,
        borderSize,
        fontSize,
        totalAmount,
        printers,
      } = req.body;

      let htmlContent: string = `${billStyle}${headerStart(
        pageWidth,
        startDate,
        endDate
      )
        }${tableHeader(borderSize, fontSize, pageWidth)}`;

      for (const item of orders) {
        let date = "";
        if (item["date"]) {
          date = item["date"].split(" ")[1];
        }
        htmlContent += `
    <tr class= "" >
    <td style="width:42%;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class= "c-name" > ${item._id} </td>
    <td style = "width:10%;padding:5px;text-align:center;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma"class= "c-qty" >
    ${date}
    </td>
    <td style = "text-align:center;padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-weight:bold;font-family:tahoma;"class= "c-price" > ${item.total} </td>
    </tr>
      `;
      }
      // customer data
      // { id: 0, name: '123-ashkan' }
      htmlContent += `
              <tr class= "summary bgorgm" style = "" >
                  <td style="font-weight:bold;padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;"
                        class= "total-action" colspan = "3" >
                        <label>جمع کل: </label>
                         <span class= "total" style = "float:left;" > ${totalAmount} </span>
                  </td>
              </tr>
          </table>
      `;

      let setPrinter = [];
      setPrinter.push(printers["p1"]);
      save_pdf(htmlContent, path.join("bills", `all_factor.pdf`), setPrinter);
      return res.json({ success: true });
    });
    server.all("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on ${basUrl}`);
      require("child_process").exec(`start ${basUrl}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
