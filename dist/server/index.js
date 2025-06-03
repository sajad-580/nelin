"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var morgan_1 = __importDefault(require("morgan"));
var next_1 = __importDefault(require("next"));
var pdf_creator_node_1 = __importDefault(require("pdf-creator-node"));
var pdf_to_printer_1 = __importDefault(require("pdf-to-printer"));
var path_1 = __importDefault(require("path"));
var baseU_1 = __importDefault(require("../baseU"));
var bill_template_1 = require("./../helpers/bill-template");
var apiUrl_1 = __importDefault(require("../apiUrl"));
// const dev = process.env.NODE_ENV !== 'production'
var dev = false;
var app = (0, next_1.default)({ dev: dev });
var handle = app.getRequestHandler();
function formatPrice2(price) {
    var price2 = price.toFixed();
    var formattedPrice = price2.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedPrice;
}
function roundFinalPrice(totalPrice) {
    var text = (parseFloat(totalPrice) * 1000).toFixed();
    var replacement = "00";
    var result = text.substring(0, text.length - 2) + replacement;
    var finalPrice = parseInt(result) / 1000;
    return finalPrice;
}
var save_pdf = function (htmlContent, filePath, printers) { return __awaiter(void 0, void 0, void 0, function () {
    var document;
    return __generator(this, function (_a) {
        document = {
            html: htmlContent,
            path: filePath,
            data: {},
            type: "",
        };
        pdf_creator_node_1.default
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
            .then(function (rs) {
            // let printer = ptp.getDefaultPrinter()
            for (var i = 0; i < printers.length; i++) {
                console.log('printer', printers[i]);
                var options = {
                    printer: printers[i],
                    unix: ["-o fit-to-page"],
                    win32: ['-print-settings "noscale"'],
                };
                pdf_to_printer_1.default
                    .print(filePath, options)
                    .then(function (res) {
                    return res;
                })
                    .catch(function (err) {
                    return err;
                });
            }
            // return res.json({ success: true })
            console.log(rs);
        })
            .catch(function (error) {
            // return res.json({ success: false })
            console.log(error);
        });
        return [2 /*return*/];
    });
}); };
var port = 3000;
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, app.prepare()];
            case 1:
                _a.sent();
                server = (0, express_1.default)();
                server.use(express_1.default.json());
                server.use((0, morgan_1.default)("dev"));
                server.use(function (req, res, next) {
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    next();
                });
                // returns a list of all the available printers to the OS back to the client
                server.get("/get-printers", function (req, res) {
                    pdf_to_printer_1.default
                        .getPrinters()
                        .then(function (printers) { return res.json({ printers: printers }); })
                        .catch(function (err) {
                        console.log('tetetett');
                        res.json({ err: err });
                    });
                });
                server.get("/printChangeTable", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, prewTable, nextTable, printer, phone, htmlContent, filePath, document;
                    return __generator(this, function (_b) {
                        _a = req.query, prewTable = _a.prewTable, nextTable = _a.nextTable, printer = _a.printer, phone = _a.phone;
                        htmlContent = "\n      ".concat(bill_template_1.billStyle, "\n      ").concat(bill_template_1.htmlStart, "\n      ").concat(bill_template_1.headerTemplate, "\n      ");
                        htmlContent += "<h3>\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0645\u06CC\u0632</h3>\n      <table class=\"table table-bordered text-center\">\n        <thead>\n          <tr class=\"c-head\">\n            <th style=\"padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;\">\u0645\u06CC\u0632 \u0642\u0628\u0644\u06CC</th>\n            <th style=\"padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;\">\u0645\u06CC\u0632 \u062C\u062F\u06CC\u062F</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td style=\"padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;\">".concat(prewTable, "</td>\n            <td style=\"padding:5px;border:3px solid #000;font-size:12px;font-weight:bold;font-family:tahoma;width:30%;\">").concat(nextTable, "</td>\n          </tr>\n        </tbody>\n      </table>");
                        htmlContent += "".concat((0, bill_template_1.footer)(phone ? phone : ""));
                        filePath = path_1.default.join("bills", "".concat(prewTable + "-" + nextTable, "-p2.pdf"));
                        document = {
                            html: htmlContent,
                            path: filePath,
                            data: {},
                            type: "",
                        };
                        pdf_creator_node_1.default
                            .create(document, {
                            width: "8cm",
                            height: "29.7cm",
                            // border: {
                            //   top: '0cm',
                            //   left: '1cm',
                            //   right: '1cm',
                            // }
                        })
                            .then(function (rs) {
                            var options = {
                                printer: printer.toString(),
                                unix: ["-o fit-to-page"],
                                win32: ['-print-settings "noscale"'],
                            };
                            pdf_to_printer_1.default
                                .print(filePath, options)
                                .then(function (res) {
                                return res;
                            })
                                .catch(function (err) {
                                return err;
                            });
                            return res.json({ success: true });
                        })
                            .catch(function (error) {
                            return res.json({ success: false });
                        });
                        return [2 /*return*/];
                    });
                }); });
                server.post("/submit-order", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, order, printers, customPrinter, raw_items, print_type, p_bill, p_bar, phone, borderSize, fontSize, pageWidth, reprint, isUpdate, factor_text, userType, printType, customer, customerName, customerPhone, htmlContent, htmlContent2, itemTotalPrice, _i, _b, item, count, new_count, name2, item_price, item_total_price, discount_price, discount_total_price, foot, prices, html2_footer, setPrinter, setPrinter2, PO, temp;
                    var _c;
                    return __generator(this, function (_d) {
                        _a = req.body, order = _a.order, printers = _a.printers, customPrinter = _a.customPrinter, raw_items = _a.raw_items, print_type = _a.print_type, p_bill = _a.p_bill, p_bar = _a.p_bar, phone = _a.phone, borderSize = _a.borderSize, fontSize = _a.fontSize, pageWidth = _a.pageWidth, reprint = _a.reprint, isUpdate = _a.isUpdate, factor_text = _a.factor_text;
                        userType = {
                            '1': 'آقا',
                            '2': 'خانم'
                        };
                        printType = print_type;
                        if (printType == 3)
                            return [2 /*return*/, res.json({ success: true })];
                        customer = order['customer'];
                        customerName = customer['name'] ? customer['name'] : "";
                        if (customer['type'] && userType[customer['type']]) {
                            customerName = "".concat(userType[customer['type']], " ").concat(customerName);
                        }
                        customerPhone = customer['username'] ? customer['username'] : "";
                        htmlContent = "".concat(bill_template_1.billStyle).concat((0, bill_template_1.htmlStart2)(pageWidth)).concat((0, bill_template_1.headerTemplateDynamic)(order['_id'], customerName, 1, reprint, order['delivery'], order['type'], isUpdate)).concat((0, bill_template_1.tableStart)(borderSize, fontSize, pageWidth));
                        htmlContent2 = "".concat(bill_template_1.billStyle).concat((0, bill_template_1.htmlStart2)(pageWidth)).concat((0, bill_template_1.headerTemplateDynamic)(order['_id'], customerName, 0, reprint, order['delivery'], order['type'], isUpdate)).concat((0, bill_template_1.tableStart2)(borderSize, fontSize, pageWidth));
                        itemTotalPrice = 0;
                        for (_i = 0, _b = order['cart']; _i < _b.length; _i++) {
                            item = _b[_i];
                            itemTotalPrice += item.total;
                            count = item.qty;
                            if (item.old_qty && isUpdate) {
                                if (item.old_qty == item.qty && printType != 4 && !item.remove)
                                    continue;
                                if (printType != 4) {
                                    new_count = item.qty - item.old_qty;
                                    if (item.remove)
                                        count = 0;
                                    else
                                        count =
                                            (new_count > 0 ? "+" + new_count : new_count) +
                                                "=>" +
                                                item.qty;
                                }
                                if (item.remove)
                                    count = 0;
                            }
                            name2 = item.full_name + (item.note ? "<hr>".concat(item.note) : "");
                            item_price = item.price / 1000;
                            item_total_price = item.total / 1000;
                            discount_price = 0;
                            discount_total_price = 0;
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
                            htmlContent += "\n            <tr class=\"\">\n              <td style=\"width:42%;padding:5px;border:".concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class=\"c-name\">\n              ").concat(item.remove ? "<s>".concat(item.full_name, "</s>") : item.full_name, "\n              </td>\n              <td style=\"width:10%;padding:5px;text-align:center;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class=\"c-qty\">\n              ").concat(item.qty, "\n              </td>\n              <td style=\"text-align:center;padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma;\"class=\"c-price\">\n                  ").concat(discount_price > 0 ? "\n                    <del>".concat(item_price, "</del>\n                    <br/>\n                    <span>").concat(discount_price, "</span>\n                ") : item_price, "\n              </td>\n              <td style=\"text-align:center;padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma;\"class=\"c-price\">\n                  ").concat(discount_total_price > 0 ? "\n                    <del>".concat(item_total_price, "</del>\n                    <br/>\n                    <span>").concat(discount_total_price, "</span>\n                ") : item_total_price, "\n              </td>\n            </tr>\n            ");
                            htmlContent2 += "\n            <tr class=\"\">\n            <td style=\"width:90%;padding:5px;border:".concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class=\"c-name\">\n            ").concat(item.remove ? "<s>".concat(name2, "</s>") : name2, "\n            </td>\n            <td style=\"width:10%;padding:5px;text-align:center;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma;direction:ltr\"class=\"c-qty\">\n            ").concat(count, "</td>\n            </tr>\n            ");
                        }
                        ;
                        foot = (order['note'] ? "<h4>\u062A\u0648\u0636\u06CC\u062D\u0627\u062A: ".concat(order['note'], "</h4>") : "") +
                            (order['num_people'] ? "<h4>\u062A\u0639\u062F\u0627\u062F \u0646\u0641\u0631\u0627\u062A: ".concat(order['num_people'], "</h4>") : "");
                        prices = order['priceDetails'];
                        htmlContent += "\n      <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u062C\u0645\u0639 \u0635\u0648\u0631\u062A \u062D\u0633\u0627\u0628:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(itemTotalPrice * 10), " \u0631\u06CC\u0627\u0644</span>\n        </td>\n      </tr>\n        ").concat(prices['discount'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u062A\u062E\u0641\u06CC\u0641:</label>\n        <span class=\"total\" style=\"float:left;direction:ltr\">-").concat(formatPrice2(prices['discount'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['service'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u062D\u0642 \u0633\u0631\u0648\u0631\u06CC\u0633:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['service'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['tip'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>tip:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['tip'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['packaging'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u0628\u0633\u062A\u0647 \u0628\u0646\u062F\u06CC:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['packaging'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['shipping_price'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u0627\u0631\u0633\u0627\u0644:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['shipping_price'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['tax'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u0645\u0627\u0644\u06CC\u0627\u062A \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062F\u0647 VAT:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['tax'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        ").concat(prices['credit_discount'] > 0
                            ? "  \n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0627\u0632 \u0627\u0639\u062A\u0628\u0627\u0631:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['credit_discount'] * 10), "</span>\n        </td> </tr>")
                            : "", "\n        <tr class=\"summary bgorgm\" style=\"\">\n        <td style=\"font-weight:bold;padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n        class=\"total-action\"colspan=\"5\"><label>\u062C\u0645\u0639 \u0642\u0627\u0628\u0644 \u067E\u0631\u062F\u0627\u062E\u062A:</label>\n        <span class=\"total\" style=\"float:left;\">").concat(formatPrice2(prices['total'] * 10), " \u0631\u06CC\u0627\u0644</span>\n        </td>\n        </tr>\n        <tr></tr></table>").concat((order['table_id'] ? "<h2>\u0634\u0645\u0627\u0631\u0647 \u0645\u06CC\u0632: ".concat(order['table_name'], "</h2>") : "") +
                            "<h6>".concat(order['offline_id'], "</h6>") +
                            (order['note'] ? "<h6>\u062A\u0648\u0636\u06CC\u062D\u0627\u062A: ".concat(order['note'], "</h6>") : "") +
                            (customer['address'] && order['delivery'] ? "<h6>\u0622\u062F\u0631\u0633: ".concat(customer['address'], "</h6>") : "") +
                            (customer['address'] && order['delivery'] && customer['lat_long'] && ((_c = customer['lat_long']) === null || _c === void 0 ? void 0 : _c.length)
                                ? "<img width=\"180px\" src=\"".concat(apiUrl_1.default[1], "/qr?lat=").concat(customer['lat_long'][0], "&long=").concat(customer['lat_long'][1], "\"/>") : "") +
                            (customerPhone ? "<h6>\u0634\u0645\u0627\u0631\u0647 \u062A\u0645\u0627\u0633 \u0645\u0634\u062A\u0631\u06CC: ".concat(customerPhone, "</h6>") : "") +
                            (order['branch_type_name'] ? "<h6>\u0633\u0627\u0644\u0646: ".concat(order['branch_type_name'], "</h6>") : "") +
                            (factor_text ? "<h6>".concat(factor_text, "</h6>") : "") +
                            (0, bill_template_1.footer)(phone));
                        htmlContent2 += "</table>\n      ".concat((order['table_id'] ? "<h2>\u0634\u0645\u0627\u0631\u0647 \u0645\u06CC\u0632: ".concat(order['table_name'], "</h2>") : "") + foot) +
                            (order['branch_type_name'] ? " <h6>".concat(order['branch_type_name'], "</h6>") : "");
                        html2_footer = order['delivery']
                            ? '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">بیرون بر</b>'
                            : (order['type'] == 3 ?
                                '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">دریافت حضوری</b>'
                                : '');
                        setPrinter = [];
                        setPrinter2 = [];
                        if (printers["p1"])
                            setPrinter.push(printers["p1"]);
                        // if (printers["p0"]) setPrinter.push(printers["p0"]);
                        ["p2", "p3", "p4", "p5"].map(function (item) {
                            if (printers[item])
                                setPrinter2.push(printers[item]);
                        });
                        if ([1, 4].includes(printType))
                            save_pdf(htmlContent, path_1.default.join("bills", "".concat(order['offline_id'], ".pdf")), setPrinter);
                        if (printType == 4)
                            return [2 /*return*/, res.json({ success: true })];
                        setPrinter = [];
                        save_pdf(htmlContent2 + html2_footer, path_1.default.join("bills", "".concat(order['offline_id'], "_k.pdf")), setPrinter2);
                        if (p_bill && printers["p" + p_bill])
                            save_pdf(htmlContent, path_1.default.join("bills", "".concat(order['offline_id'], "_p").concat(p_bill, ".pdf")), [printers["p" + p_bill]]);
                        if (p_bar && printers["p" + p_bar])
                            save_pdf(htmlContent2 + html2_footer, path_1.default.join("bills", "".concat(order['offline_id'], "_k_p").concat(p_bar, ".pdf")), [printers["p" + p_bar]]);
                        PO = {};
                        temp = [];
                        Object.keys(customPrinter).forEach(function (i) {
                            temp = [];
                            order['cart'].map(function (item, index) {
                                if (customPrinter[i].cat &&
                                    (customPrinter[i].cat.length || [])) {
                                    var index_1 = raw_items.findIndex(function (x) { return x._id === item.id; });
                                    var raw_item = raw_items[index_1];
                                    if (raw_item &&
                                        customPrinter[i].cat.includes(raw_item.category_id.toString())) {
                                        var count = item.qty;
                                        if (item.old_qty && isUpdate) {
                                            if (item.old_qty == item.qty)
                                                return;
                                            var new_count = item.qty - item.old_qty;
                                            count =
                                                item.qty +
                                                    "/" +
                                                    (new_count > 0 ? "+" + new_count : new_count);
                                        }
                                        temp.push("\n        <tr class=\"\" >\n          <td style=\"width:90%;padding:5px;border:".concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class=\"c-name\" > ").concat((item.remove ? "<s>".concat(item.full_name, "</s>") : item.full_name) + (item.note ? "<hr>".concat(item.note) : ""), " </td>\n        <td style = \"width:10%;padding:5px;text-align:center;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class=\"c-qty\" >\n          ").concat(count, " </td>\n            </tr>\n              "));
                                        PO[i] = temp;
                                        return;
                                    }
                                }
                            });
                        });
                        Object.keys(PO).forEach(function (i) {
                            setPrinter = [];
                            htmlContent2 = "".concat(bill_template_1.billStyle).concat((0, bill_template_1.htmlStart2)(pageWidth)).concat((0, bill_template_1.headerTemplateDynamic)(order['_id'], customerName, 0, null, order['delivery'], order['type'], isUpdate) +
                                "<h4>" +
                                customPrinter[i].name +
                                "</h4>").concat((0, bill_template_1.tableStart2)(borderSize, fontSize, pageWidth), " ");
                            PO[i].map(function (item) {
                                htmlContent2 += item;
                            });
                            htmlContent2 += "</table>".concat((order['table_id'] ? "<h2>شماره میز: " + order['table_name'] + "</h2 > " : "") + foot);
                            if (printers[i])
                                setPrinter.push(printers[i]);
                            save_pdf(htmlContent2 + html2_footer, path_1.default.join("bills", "".concat(order['offline_id'], "_k_").concat(i, ".pdf")), setPrinter);
                        });
                        return [2 /*return*/, res.json({ success: true })];
                    });
                }); });
                server.post("/print-all-order", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, orders, pageWidth, startDate, endDate, borderSize, fontSize, totalAmount, printers, htmlContent, _i, orders_1, item, date, setPrinter;
                    return __generator(this, function (_b) {
                        _a = req.body, orders = _a.orders, pageWidth = _a.pageWidth, startDate = _a.startDate, endDate = _a.endDate, borderSize = _a.borderSize, fontSize = _a.fontSize, totalAmount = _a.totalAmount, printers = _a.printers;
                        htmlContent = "".concat(bill_template_1.billStyle).concat((0, bill_template_1.headerStart)(pageWidth, startDate, endDate)).concat((0, bill_template_1.tableHeader)(borderSize, fontSize, pageWidth));
                        for (_i = 0, orders_1 = orders; _i < orders_1.length; _i++) {
                            item = orders_1[_i];
                            date = "";
                            if (item["date"]) {
                                date = item["date"].split(" ")[1];
                            }
                            htmlContent += "\n    <tr class= \"\" >\n    <td style=\"width:42%;padding:5px;border:".concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class= \"c-name\" > ").concat(item._id, " </td>\n    <td style = \"width:10%;padding:5px;text-align:center;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma\"class= \"c-qty\" >\n    ").concat(date, "\n    </td>\n    <td style = \"text-align:center;padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-weight:bold;font-family:tahoma;\"class= \"c-price\" > ").concat(item.total, " </td>\n    </tr>\n      ");
                        }
                        // customer data
                        // { id: 0, name: '123-ashkan' }
                        htmlContent += "\n              <tr class= \"summary bgorgm\" style = \"\" >\n                  <td style=\"font-weight:bold;padding:5px;border:".concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\"\n                        class= \"total-action\" colspan = \"3\" >\n                        <label>\u062C\u0645\u0639 \u06A9\u0644: </label>\n                         <span class= \"total\" style = \"float:left;\" > ").concat(totalAmount, " </span>\n                  </td>\n              </tr>\n          </table>\n      ");
                        setPrinter = [];
                        setPrinter.push(printers["p1"]);
                        save_pdf(htmlContent, path_1.default.join("bills", "all_factor.pdf"), setPrinter);
                        return [2 /*return*/, res.json({ success: true })];
                    });
                }); });
                server.all("*", function (req, res) {
                    return handle(req, res);
                });
                server.listen(port, function (err) {
                    if (err)
                        throw err;
                    console.log("> Ready on ".concat(baseU_1.default));
                    require("child_process").exec("start ".concat(baseU_1.default));
                });
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                console.error(e_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
