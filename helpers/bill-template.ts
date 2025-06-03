import basUrl from "../baseU.js";

const getTime = () => {
  const date = new Date()
    .toLocaleDateString("fa-IR")
    .replace("،", " ")
    .replace(/([۰-۹])/g, (token) =>
      String.fromCharCode(token.charCodeAt(0) - 1728)
    );
  const time = new Date()
    .toLocaleTimeString("fa-IR")
    .replace("،", " ")
    .replace(/([۰-۹])/g, (token) =>
      String.fromCharCode(token.charCodeAt(0) - 1728)
    );
  return [date, time];
};
export const billStyle = `<style>
          @media print {
              @page {
                  size: 10mm 20mm;
              }
              table {
                  vertical-align: top;
              }
          }
          *{
              font-family: tahoma;
          }
          span.toman_price {
              font-size: 10px;
              float: right;
              position: relative;
              top: 3px;
              direction: ltr;
          }
          img.stamp {
              position: absolute;
              width: 72px;
              left: 6px;
              transform: rotate(
                  348deg
                  );
              margin-top: -1px;
          }
          tr.lovina{
              height: 52px;
          }
      </style>`;
export const htmlStart = `<div style="width: 100%;"><div class="area-title bdr"></div><div class="table-area" style="direction:rtl;"><div class="table-responsive">`;
export const htmlStart2 = (width) => {
  return `<div style="width: ${width}%;margin-top:-20px;"><div class="area-title bdr"></div><div class="table-area" style="direction:rtl;"><div class="table-responsive">`;
};
export const headerTemplate = `<div><b style="text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;">${process.env.NEXT_PUBLIC_DOMAIN
  }</b><br><span style="float:left;margin-left:5px;">Dear Guest</span><br><div style="text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;"><div><span>
${getTime()[0]}</span><span style="float:right">${getTime()[1]
  }</span></div></div></div>`;
export const headerTemplate2 = `<div><b style="text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;">${process.env.NEXT_PUBLIC_DOMAIN
  }</b><br><span style="float:left;margin-left:5px;">Dear Guest</span><br><div style="text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;"><div><span>
${getTime()[0]}</span><span style="float:right">${getTime()[1]
  }</span></div></div></div>`;

export const tableStart = (borderSize, fontSize, pageWidth) => {
  return `<table class="table table-bordered text-center" style="width:${pageWidth}%;margin-left:6px">
    <thead>
         <tr class="c-head">
            <th style="padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-family:tahoma;width:30%;">نام محصول</th>
            <th style="padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;">تعداد</th>
            <th style="padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;">قیمت</th>
            <th style="padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;">مجموع</th>
         </tr>
    </thead>`;
};
export const tableStart2 = (borderSize, fontSize, pageWidth) => {
  return `
            <table class="table table-bordered text-center" style="width:100%">
                <thead>
                    <tr class="c-head">
                        <th style="padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-family:tahoma;width:90%;">
                          ITEM
                        </th>
                        <th style="padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-family:tahoma;width:10%;">
                          Q
                        </th>
                    </tr>
                </thead>`;
};
export const headerTemplateDynamic = (
  number?: any,
  customerName?: any,
  img?: number,
  reprint?: any,
  delivery?: any,
  type?: any,
  isUpdate?: any,
) => {
  console.log(`${basUrl}/images/logo/${process.env.NEXT_PUBLIC_LOGO}`);
  return `<div>${img == 1
    ? `<img src="${basUrl}/images/logo/${process.env.NEXT_PUBLIC_LOGO}" style="display:block;margin:0 auto;width:60px;"/><br>`
    : ""
    }<b style="text-align:center;width:100%;display:block;font-size:12px;">${process.env.NEXT_PUBLIC_DOMAIN
    }</b><br>
    ${reprint == 1
      ? '<b style="text-align:center;width:100%;display:block;font-size:12px;">چاپ مجدد</b>'
      : ""
    }
    ${isUpdate
      ? '<b style="text-align:center;width:100%;display:block;font-size:12px;border:4px solid #000;margin-bottom:10px;">فیش اصلاحی</b>'
      : ""
    }
    ${delivery
      ? '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">بیرون بر</b>'
      : (type == 3 ?
        '<b style="margin-bottom:5px;border:4px solid #000;text-align:center;width:100%;display:block;font-size:12px;">دریافت حضوری</b>'
        : '')
    }
    <span style="display:block;margin-left:5px;text-align:left;"><span style="border:4px solid #000;padding: 4px 10px; width:50%">${number}</span></span><br>
    <span style="float:left;margin-left:5px;">${customerName ? customerName : "Dear Guest"
    }</span><br>
    <div style="text-align:left;margin-left:5px;margin-bottom:10px;direction:ltr;"><div><span>
                ${getTime()[0]}</span><span style="float:right">${getTime()[1]
    }</span></div></div></div>`;
};
export const footer = (phone) => {
  return `<div style="float:right;"><span style="direction:ltr!important;float:left;width:100%;margin-top:5px;text-align:right;"><img src="${basUrl}/images/phone.jpg" style="width:34px;width:18px;position:relative;top:-1px;float:right;right:-1px;"> ${phone}</span></div><div style="float:left;"><div style="float:left;width:100%;text-align:left;"><b>${process.env.NEXT_PUBLIC_DOMAIN}</b><img src="${basUrl}/images/insta.jpg" style="width:30px;position:relative;top:9px; margin-right:4px"/></div></div></div></div></div>`;
};
export const headerStart = (width, start_date, end_date) => {
  return `
      <div style="width: ${width}%;margin-top:-20px;"><div class="area-title bdr"></div><div class="table-area" style="direction:rtl;"><div class="table-responsive">
        <div>
            <b style="text-align:center;width:100%;display:block;font-size:12px;margin-top:-17px;">c2c.cafe</b>
            <br>
            <span style="float:left;margin-left:5px;">${start_date}</span>
            <br>
            <span style="float:left;margin-left:5px;">${end_date}</span>
        </div>
        `;
};

export const tableHeader = (borderSize, fontSize, pageWidth) => {
  return `<table class="table table-bordered text-center" style="width:${pageWidth}%;margin-left:6px">
        <thead>
             <tr class="c-head">
                <th style="padding:5px;border:${borderSize}px solid #000;font-size:${fontSize}px;font-family:tahoma;width:30%;">شناسه</th>
                <th style="padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;">تاریخ</th>
                <th style="padding:5px;border:${borderSize}px solid #000;font-family:tahoma;font-size:${fontSize}px;">قیمت</th>
             </tr>
        </thead>`;
};
