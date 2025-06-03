"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableHeader = exports.headerStart = exports.footer = exports.headerTemplateDynamic = exports.tableStart2 = exports.tableStart = exports.headerTemplate2 = exports.headerTemplate = exports.htmlStart2 = exports.htmlStart = exports.billStyle = void 0;
var baseU_js_1 = __importDefault(require("../baseU.js"));
var getTime = function () {
    var date = new Date()
        .toLocaleDateString("fa-IR")
        .replace("،", " ")
        .replace(/([۰-۹])/g, function (token) {
        return String.fromCharCode(token.charCodeAt(0) - 1728);
    });
    var time = new Date()
        .toLocaleTimeString("fa-IR")
        .replace("،", " ")
        .replace(/([۰-۹])/g, function (token) {
        return String.fromCharCode(token.charCodeAt(0) - 1728);
    });
    return [date, time];
};
exports.billStyle = "<style>\n          @media print {\n              @page {\n                  size: 10mm 20mm;\n              }\n              table {\n                  vertical-align: top;\n              }\n          }\n          *{\n              font-family: tahoma;\n          }\n          span.toman_price {\n              font-size: 10px;\n              float: right;\n              position: relative;\n              top: 3px;\n              direction: ltr;\n          }\n          img.stamp {\n              position: absolute;\n              width: 72px;\n              left: 6px;\n              transform: rotate(\n                  348deg\n                  );\n              margin-top: -1px;\n          }\n          tr.lovina{\n              height: 52px;\n          }\n      </style>";
exports.htmlStart = "<div style=\"width: 100%;\"><div class=\"area-title bdr\"></div><div class=\"table-area\" style=\"direction:rtl;\"><div class=\"table-responsive\">";
var htmlStart2 = function (width) {
    return "<div style=\"width: ".concat(width, "%;margin-top:-20px;\"><div class=\"area-title bdr\"></div><div class=\"table-area\" style=\"direction:rtl;\"><div class=\"table-responsive\">");
};
exports.htmlStart2 = htmlStart2;
exports.headerTemplate = "<div><b style=\"text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;\">".concat(process.env.NEXT_PUBLIC_DOMAIN, "</b><br><span style=\"float:left;margin-left:5px;\">Dear Guest</span><br><div style=\"text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;\"><div><span>\n").concat(getTime()[0], "</span><span style=\"float:right\">").concat(getTime()[1], "</span></div></div></div>");
exports.headerTemplate2 = "<div><b style=\"text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;\">".concat(process.env.NEXT_PUBLIC_DOMAIN, "</b><br><span style=\"float:left;margin-left:5px;\">Dear Guest</span><br><div style=\"text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;\"><div><span>\n").concat(getTime()[0], "</span><span style=\"float:right\">").concat(getTime()[1], "</span></div></div></div>");
var tableStart = function (borderSize, fontSize, pageWidth) {
    return "<table class=\"table table-bordered text-center\" style=\"width:".concat(pageWidth, "%;margin-left:6px\">\n    <thead>\n         <tr class=\"c-head\">\n            <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-family:tahoma;width:30%;\">\u0646\u0627\u0645 \u0645\u062D\u0635\u0648\u0644</th>\n            <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\">\u062A\u0639\u062F\u0627\u062F</th>\n            <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\">\u0642\u06CC\u0645\u062A</th>\n            <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\">\u0645\u062C\u0645\u0648\u0639</th>\n         </tr>\n    </thead>");
};
exports.tableStart = tableStart;
var tableStart2 = function (borderSize, fontSize, pageWidth) {
    return "\n            <table class=\"table table-bordered text-center\" style=\"width:100%\">\n                <thead>\n                    <tr class=\"c-head\">\n                        <th style=\"padding:5px;border:".concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-family:tahoma;width:90%;\">\n                          ITEM\n                        </th>\n                        <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-family:tahoma;width:10%;\">\n                          Q\n                        </th>\n                    </tr>\n                </thead>");
};
exports.tableStart2 = tableStart2;
var headerTemplateDynamic = function (number, customerName, img, reprint, delivery, type, isUpdate) {
    console.log("".concat(baseU_js_1.default, "/images/logo/").concat(process.env.NEXT_PUBLIC_LOGO));
    return "<div>".concat(img == 1
        ? "<img src=\"".concat(baseU_js_1.default, "/images/logo/").concat(process.env.NEXT_PUBLIC_LOGO, "\" style=\"display:block;margin:0 auto;width:60px;\"/><br>")
        : "", "<b style=\"text-align:center;width:100%;display:block;font-size:12px;\">").concat(process.env.NEXT_PUBLIC_DOMAIN, "</b><br>\n    ").concat(reprint == 1
        ? '<b style="text-align:center;width:100%;display:block;font-size:12px;">چاپ مجدد</b>'
        : "", "\n    ").concat(isUpdate
        ? '<b style="text-align:center;width:100%;display:block;font-size:12px;border:4px solid #000;margin-bottom:10px;">فیش اصلاحی</b>'
        : "", "\n    ").concat(delivery
        ? '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">بیرون بر</b>'
        : (type == 3 ?
            '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">دریافت حضوری</b>'
            : ''), "\n    <span style=\"display:block;margin-left:5px;text-align:left;\"><span style=\"border:4px solid #000;padding: 4px 10px; width:50%\">").concat(number, "</span></span><br>\n    <span style=\"float:left;margin-left:5px;\">").concat(customerName ? customerName : "Dear Guest", "</span><br>\n    <div style=\"text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;\"><div><span>\n                ").concat(getTime()[0], "</span><span style=\"float:right\">").concat(getTime()[1], "</span></div></div></div>");
};
exports.headerTemplateDynamic = headerTemplateDynamic;
var footer = function (phone) {
    return "<div style=\"float:right;\"><span style=\"direction:ltr!important;float:left;width:100%;margin-top:5px;text-align:right;\"><img src=\"".concat(baseU_js_1.default, "/images/phone.jpg\" style=\"width:34px;width:18px;position:relative;top:-1px;float:right;right:-1px;\"> ").concat(phone, "</span></div><div style=\"float:left;\"><div style=\"float:left;width:100%;text-align:left;\"><b>").concat(process.env.NEXT_PUBLIC_DOMAIN, "</b><img src=\"").concat(baseU_js_1.default, "/images/insta.jpg\" style=\"width:30px;position:relative;top:9px; margin-right:4px\"/></div></div></div></div></div>");
};
exports.footer = footer;
var headerStart = function (width, start_date, end_date) {
    return "\n      <div style=\"width: ".concat(width, "%;margin-top:-20px;\"><div class=\"area-title bdr\"></div><div class=\"table-area\" style=\"direction:rtl;\"><div class=\"table-responsive\">\n        <div>\n            <b style=\"text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;\">c2c.cafe</b>\n            <br>\n            <span style=\"float:left;margin-left:5px;\">").concat(start_date, "</span>\n            <br>\n            <span style=\"float:left;margin-left:5px;\">").concat(end_date, "</span>\n        </div>\n        ");
};
exports.headerStart = headerStart;
var tableHeader = function (borderSize, fontSize, pageWidth) {
    return "<table class=\"table table-bordered text-center\" style=\"width:".concat(pageWidth, "%;margin-left:6px\">\n        <thead>\n             <tr class=\"c-head\">\n                <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-size:").concat(fontSize, "px;font-family:tahoma;width:30%;\">\u0634\u0646\u0627\u0633\u0647</th>\n                <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\">\u062A\u0627\u0631\u06CC\u062E</th>\n                <th style=\"padding:5px;border:").concat(borderSize, "px solid #000;font-family:tahoma;font-size:").concat(fontSize, "px;\">\u0642\u06CC\u0645\u062A</th>\n             </tr>\n        </thead>");
};
exports.tableHeader = tableHeader;
