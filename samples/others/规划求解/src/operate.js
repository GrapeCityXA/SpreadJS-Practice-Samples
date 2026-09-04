import * as GC from "@grapecity-software/spread-sheets";

/**
 * 第三方线性规划求解库 javascript-lp-solver（v0.4.24）的浏览器打包版：
 * 已通过 index.html 中的 <script src="src/vendor/javascript-lp-solver/solver.js">
 * 提前加载，打包版在浏览器环境会把求解器实例挂到 window.solver 上。
 * 原 Vue 项目通过 `require("javascript-lp-solver/src/solver")` 获得的是同一个求解器实例。
 */
const mySolver = window.solver;

/**
 * 去掉范围字符串开头的 "="（RangeSelect 控件返回类似 "=C3" 的公式形式）
 * @param {string} str - 范围字符串
 * @returns {string|undefined} 去掉 "=" 后的范围字符串
 */
function getRangeStr(str) {
  if (str && str[0] === "=") {
    return str.substr(1);
  }
}

/**
 * “规划求解”命令的执行逻辑：
 * 1. 弹出规划求解对话框，由用户选择目标单元格、可变因素单元格与约束条件
 * 2. 读取所选单元格的数值，组装成 javascript-lp-solver 所需的 JSON 模型
 * 3. 求解后，把每个变量的最优数量写回“最终计算值”单元格
 * @param {Object} context - 设计器命令上下文
 */
function excelSolver(context) {
  var spread = context.getWorkbook();
  var option = {
    radioValue: "max",
    compare1: "max",
    compare2: "max",
    compare3: "max",
    target1: "请输入最优目标值1（容量）",
    target2: "请输入最优目标值2（容量）",
    optimalQuantity1: "最终计算值1单元格",
    optimalQuantity2: "最终计算值2单元格",
    person1: "请输入可容纳人数",
    person2: "请输入可容纳人数",
    cost1: "请输入运输成本",
    cost2: "请输入运输成本",
    dialogOption: {
      activeTab: "solverTab",
    },
  };
  // 打开对话框
  GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
    console.log("result:");
    console.log(result);
    if (!result) {
      return; // 用户点击取消
    }
    var sheet = spread.getActiveSheet();
    var range1 = sheet.getRange(getRangeStr(result.target1)); // 目标值1（容量）
    var range2 = sheet.getRange(getRangeStr(result.target2)); // 目标值2（容量）
    var range3 = sheet.getRange(getRangeStr(result.optimalQuantity1)); // 最终计算美国飞机数量
    var range4 = sheet.getRange(getRangeStr(result.person1));
    var range5 = sheet.getRange(getRangeStr(result.cost1));
    var range6 = sheet.getRange(getRangeStr(result.optimalQuantity2)); // 最终计算英国飞机数量
    var range7 = sheet.getRange(getRangeStr(result.person2));
    var range8 = sheet.getRange(getRangeStr(result.cost2));

    sheet.suspendPaint();
    var target1value = sheet.getValue(range1.row, range1.col);
    var target2value = sheet.getValue(range2.row, range2.col);
    var person1value = sheet.getValue(range4.row, range4.col);
    var cost1value = sheet.getValue(range5.row, range5.col);
    var person2value = sheet.getValue(range7.row, range7.col);
    var cost2value = sheet.getValue(range8.row, range8.col);
    sheet.resumePaint();

    // 赋值给 model
    var att1 = "capacity"; // 优化目标：容量
    var att2 = "plane"; // 约束：飞机总数量
    var att3 = "person"; // 约束：可容纳总人数
    var att4 = "cost"; // 约束：总费用
    // 约束条件 类型（<=、>=、=）
    var cons1Type = result.compare1; // 或 max、min、equal
    var cons2Type = result.compare2;
    var cons3Type = result.compare3;
    var cons1Value = Number(result.quantityNumber);
    var cons2Value = Number(result.personNumber);
    var cons3Value = Number(result.costNumber);
    // 优化类型
    var onTypeValue = result.radioValue;

    var myModel = {};
    // 优化，对应的变量名，如：利润 profit
    myModel.optimize = att1;
    // 优化类型，max 或 min
    myModel.opType = onTypeValue;

    // 变量，根据实际情况动态添加
    myModel.variables = {};

    var var1 = {};
    var1[att1] = target1value;
    var1[att2] = 1;
    var1[att3] = person1value;
    var1[att4] = cost1value;
    myModel.variables.var1Name = var1;

    var var2 = {};
    var2[att1] = target2value;
    var2[att2] = 1;
    var2[att3] = person2value;
    var2[att4] = cost2value;
    myModel.variables.var2Name = var2;

    // 约束条件
    myModel.constraints = {};

    var cons1Name = {};
    cons1Name[cons1Type] = cons1Value;
    myModel.constraints[att2] = cons1Name;

    var cons2Name = {};
    cons2Name[cons2Type] = cons2Value;
    myModel.constraints[att3] = cons2Name;

    var cons3Name = {};
    cons3Name[cons3Type] = cons3Value;
    myModel.constraints[att4] = cons3Name;

    var myResult = mySolver.Solve(myModel);
    console.log("myResult:");
    console.log(myResult);
    // 解析结果，给单元格赋值
    sheet.suspendPaint();
    sheet.setValue(range3.row, range3.col, myResult.var1Name);
    sheet.setValue(range6.row, range6.col, myResult.var2Name);
    sheet.resumePaint();
  });
}

// 新增“操作”选项卡
const operateRibbon = {
  id: "operate",
  text: "操作",
  buttonGroups: [],
};

// 定义点击“规划求解”按钮时对应的命令
const operateCommands = {
  solver: {
    title: "规划求解",
    commandName: "solver",
    execute: async (context) => {
      excelSolver(context);
    },
    iconClass: "ribbon-button-upload",
  },
};

// 新增“规划求解”按钮
const operateConfig = {
  label: "规划求解",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [
      {
        direction: "vertical",
        commands: ["solver"],
      },
    ],
  },
};

// 在 ribbon 中加入自定义的命令和按钮
operateRibbon.buttonGroups.push(operateConfig);

export { operateRibbon, operateCommands };
