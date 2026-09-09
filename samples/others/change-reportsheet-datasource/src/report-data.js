/**
 * 示例数据源：演示“更换报表数据源”时使用的两套数据。
 * 报表初始从远程数据源（用函数模拟）加载数据，点击按钮后替换为本地数据。
 */

/** 第一套数据：模拟远程数据源返回的销售数据 */
export const datasetA = [
  { region: "华东", product: "笔记本电脑", quantity: 120, amount: 960000, salesperson: "张伟" },
  { region: "华北", product: "显示器", quantity: 200, amount: 400000, salesperson: "李娜" },
  { region: "华南", product: "键盘", quantity: 500, amount: 150000, salesperson: "王强" },
  { region: "华东", product: "鼠标", quantity: 800, amount: 80000, salesperson: "赵敏" },
  { region: "西南", product: "服务器", quantity: 15, amount: 450000, salesperson: "陈杰" },
];

/** 第二套数据：更换后的本地数据源 */
export const datasetB = [
  { region: "华东", product: "平板电脑", quantity: 180, amount: 540000, salesperson: "刘洋" },
  { region: "东北", product: "打印机", quantity: 90, amount: 135000, salesperson: "周芳" },
  { region: "华北", product: "交换机", quantity: 60, amount: 240000, salesperson: "吴磊" },
  { region: "华南", product: "显示器", quantity: 260, amount: 520000, salesperson: "孙悦" },
  { region: "华中", product: "摄像头", quantity: 400, amount: 120000, salesperson: "郑洁" },
  { region: "华东", product: "服务器", quantity: 12, amount: 360000, salesperson: "马超" },
];

/** 报表展示的列定义：字段名与中文表头 */
export const reportColumns = [
  { field: "region", header: "地区", width: 90 },
  { field: "product", header: "产品", width: 110 },
  { field: "quantity", header: "数量", width: 80 },
  { field: "amount", header: "金额", width: 110 },
  { field: "salesperson", header: "销售员", width: 100 },
];
