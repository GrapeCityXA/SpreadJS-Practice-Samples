import * as GC from "@grapecity-software/spread-sheets";
GC.Spread.Sheets.LicenseKey = "";
/**
 * 实现思路：
 *  1. 后端分析目标导入文件，获取文件中sheet页的个数及名称；
 *  2. 前端加载时默认只加载第一页表单的数据，其它页签只显示名称，暂不加载数据；
 *  3. sheet页切换时加载目标sheet页的数据。
 **/

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
  calcOnDemand: true,
});
//这里是由后端分析出的文件中的sheet名称
const sheetList = [
  "明细表检查",
  "00 其他财务及法律文件",
  "填表说明",
  "公司列表",
  "CJE Post ",
  "CJE Summary",
  "财务报表",
  "01银行存款明细表",
  " 01-1银行存款",
  "01-2其他货币资金",
  "01-3函证信息收集表",
  "02预付税金及递延所得税项",
  "03 应收账款账龄",
  "03-1应收票据",
  "04 其他应收款账龄",
  "05 预付账款",
  "06长期股权投资",
  "06-1股权付款明细 ",
  "07固定资产明细表 ",
  "07-1长期待摊费用明细表 ",
  "07-2投资性房地产明细表 ",
  "08无形资产明细表",
  "09借款披露表格",
  "09-1借款明细表 ",
  "09-2借款利息费用明细账",
  "09-3应付利息明细表",
  "09-4借款函证信息收集表",
  "10应付账款账龄",
  "10-1应付票据",
  "11预收帐款",
  "12应交税费",
  "12-1应交增值税明细表",
  "12-2税金",
  "税率表",
  "13 其他应付款账龄",
  "14所得税调节表",
  "15其他业务利润",
  "16销售费用",
  "17管理费用",
  "17-2研发费用",
  "18财务费用",
  "19营业外收支、其他收益",
  "20员工成本",
  "20-1员工成本明细",
  "20-2应付职工薪酬变动表",
  "21资本性支出承诺",
  "22租赁合同明细表",
  "22-1物业出租合同明细表",
  "23销售收入",
  "23销售成本",
  "25内部往来余额",
  "25-1 关联方-集团外",
  "26关联方交易",
  "27存货",
  "28所有者权益",
  "28-1未分配利润",
  "28-2股利分配&amp;投资收益",
  "29开办费",
  "30其他长期资产及其他长期负债",
  "31金融资产",
  "32资产减值损失",
  "33以前年度损益调整",
  "37科目余额表",
  "40固定资产卡片",
  "40-1本期减少固定资产卡片",
  "41持有待售",
];
//标志已经加载数据的sheet集合
let loadDataSheets = [];
//标志当前活动的表单名称
let activeName = "";
spread.removeSheet(0);
sheetList.forEach((v, index) => {
  spread.addSheet(0, new GC.Spread.Sheets.Worksheet(v));
});
activeName = "明细表检查";
spread.setActiveSheet("明细表检查");
// spread && loadSheetData()
function loadSheetData() {
  let sheetIndex = spread.getSheetIndex(activeName);
  /**
   * 由于测试Demo不含数据库，因此将异步请求sheet页数据的请求代替为setValue
   * 实际项目中，可以发送请求：
   * let sheetJson = await getSheetJson(urlinfo)
   * **/
  spread.options.calcOnDemand = true;
  spread.suspendCalcService(true);

  spread.getSheet(sheetIndex).setValue(0, 0, activeName);
  /**
   * loading 动效实际项目中可自己实现或借助三方库
   * **/
  console.log("loaded...");
  //恢复计算，但不重新计算公式
  spread.resumeCalcService(false);
  //激活绘制
  spread.resumePaint();
}

//切换sheet触发事件
spread.bind(GC.Spread.Sheets.Events.SheetTabClick, (e, args) => {
  activeName = args.sheetName;
  //第一次切换到该sheet,加载数据进行初始化
  if (loadDataSheets.indexOf(activeName) === -1) {
    spread.suspendPaint();
    loadSheetData();
    loadDataSheets.push(activeName);
  }
});
