import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio";
import "@grapecity-software/spread-sheets-charts";
import "@grapecity-software/spread-sheets-print";
import "@grapecity-software/spread-sheets-pdf";
import "@grapecity-software/spread-sheets-barcode";
import "@grapecity-software/spread-sheets-languagepackages";
import "@grapecity-software/spread-sheets-shapes";
import "@grapecity-software/spread-sheets-pivot-addon";
import "@grapecity-software/spread-sheets-designer-resources-en";
import "@grapecity-software/spread-sheets-designer";

GC.Spread.Sheets.Designer.LicenseKey = "";
GC.Spread.Sheets.LicenseKey = "";

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
let sheet = spread.getActiveSheet();

function rtd() {
  this.maxArgs = 3;
  this.minArgs = 1;
  this.name = "rtd";
  this.typeName = "ASUM_TYPE";
}

rtd.prototype = new GC.Spread.CalcEngine.Functions.AsyncFunction(
  "RTD",
  1,
  255,
  {
    description: "两个数值相加后，异步增加另一个随机值",
  },
);
rtd.prototype.acceptsReference = function (idx) {
  // 设定前两个参数可以接受引用值
  return idx == 0 || idx == 1;
};
rtd.prototype.defaultValue = function () {
  return "Loading...";
};
rtd.prototype.evaluateAsync = function (context, arg1, arg2) {
  let uuid = genUuid();
  let v1 = arg1
    .getSource()
    .getSheet()
    .getValue(arg1.getRow(0), arg1.getColumn(0));
  let v2 = arg2
    .getSource()
    .getSheet()
    .getValue(arg2.getRow(0), arg2.getColumn(0));
  fetchData(uuid, v1 + v2, function (res) {
    context.setAsyncResult(res);
  });
};

sheet.addCustomFunction(new rtd());
const originalGetType = GC.Spread.Sheets.getTypeFromString;
GC.Spread.Sheets.getTypeFromString = function (typeString) {
  console.log(typeString);
  if (typeString === "ASUM_TYPE") {
    return rtd; // 返回自定义类型
  }
  return originalGetType.apply(this, arguments);
};

function genUuid() {
  let timestamp = new Date().getTime();
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = ((timestamp + Math.random() * 16) % 16) | 0;
      timestamp = Math.floor(timestamp / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}

let tempRes = {};
let timer = null;

function fetchData(uuid, arg, callback) {
  tempRes[uuid] = {
    arg: arg,
    callback: callback,
  };
  clearTimeout(timer);
  // 1秒没有新的变动，则请求接口，即最多1秒请求一次
  timer = setTimeout(() => {
    // 模拟接口请求  1秒后返回数据
    setTimeout(() => {
      console.log("请求了！");
      Object.keys(tempRes).forEach((uuid) => {
        tempRes[uuid].callback(Math.random() + tempRes[uuid].arg);
      });
      tempRes = {};
      timer = null;
    }, 1000);
  }, 1000);
}

sheet.setValue(1, 0, 1);
sheet.setValue(2, 0, 2);
sheet.setValue(3, 0, 3);
sheet.setValue(1, 1, 4);
sheet.setValue(2, 1, 5);
sheet.setValue(3, 1, 6);
sheet.setValue(0, 2, "C=A+B+随机数");
setTimeout(() => {
  sheet.setFormula(1, 2, "=RTD(A2, B2)");
  sheet.setFormula(2, 2, "=RTD(A3, B3)");
  sheet.setFormula(3, 2, "=RTD(A4, B4)");
}, 1000);
