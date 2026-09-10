## 一、Demo 概述

本示例在 SpreadJS 组件版设计器（SpreadJS Designer）中扩展出「操作」选项卡，并新增「规划求解」功能按钮。点击按钮会弹出设计器原生风格的自定义对话框，用户在其中指定目标系数、可变因素（决策变量）单元格以及约束条件，随后示例调用第三方线性规划求解库 `javascript-lp-solver` 完成求解，并把最优解写回表格。

该示例的典型应用场景是**在电子表格中完成运筹优化计算**：例如给定若干机型/供应商的容量、单机人数与成本，在飞机总数、总人数、总费用不超过限值的条件下，求容量（或利润）最大的组合方案。它演示的并不只是求解算法本身，更重要的是如何把「设计器 UI 扩展 — 声明式对话框 — 读取表格数据 — 回写计算结果」串成一条完整链路。

## 二、解决的问题

1. **设计器能力扩展**：SpreadJS 组件版设计器默认不提供规划求解之类的业务功能，需要一套可插拔的扩展方式，让开发者在不修改设计器源码的前提下加入自定义选项卡、按钮与命令。
2. **原生交互体验**：业务参数不能靠 `prompt()` 之类的简陋输入框采集。示例用设计器自身的对话框控件体系（`RangeSelect`、`Radio`、`ListComboEditor`、`TextEditor`）搭建界面，视觉与操作方式同 Excel「规划求解」加载项一致。
3. **表格数据与优化模型的双向转换**：线性规划模型需要结构化的变量、系数与约束，而用户的数据是散落在单元格里的。示例负责把选中的单元格数值翻译成求解器可识别的模型，再把最优解写回单元格。
4. **求解逻辑与界面解耦**：对话框的界面描述、命令的注册配置、求解的业务逻辑被拆到三个文件中，便于单独维护和替换求解器。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 三步扩展设计器：命令、Ribbon、对话框模板

设计器的扩展遵循「先注册、后实例化」的顺序。`src/designer-config.js` 在默认配置的深拷贝上做增量修改：把自定义命令挂到 `commandMap`，把新选项卡推进 `ribbon`，并在**创建 Designer 实例之前**注册对话框模板。

```javascript
import * as GC from "@grapecity-software/spread-sheets";
import { operateRibbon, operateCommands } from "./operate.js";
import { richSheetTagTemplate } from "./solver-dialog.js";

// 深拷贝默认配置，避免污染 Global 上的 DefaultConfig
const designerConfig = JSON.parse(
  JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig),
);

// 1) 注册命令到 commandMap
designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, operateCommands);

// 2) 把新增选项卡追加到 ribbon
designerConfig.ribbon.push(operateRibbon);

// 3) 注册模板（必须在创建 Designer 实例之前完成）
GC.Spread.Sheets.Designer.registerTemplate("newTab", richSheetTagTemplate);

export { designerConfig };
```

命令与按钮的定义集中在 `src/operate.js`，按钮通过 `commandName` 关联到命令的 `execute` 回调：

```javascript
// 新增“操作”选项卡（初始 buttonGroups 为空，随后 push 进按钮配置）
const operateRibbon = { id: "operate", text: "操作", buttonGroups: [] };

const operateCommands = {
  solver: {
    title: "规划求解",
    commandName: "solver",
    execute: async (context) => {
      excelSolver(context); // 业务逻辑入口
    },
    iconClass: "ribbon-button-upload", // 对应 index.html 中的内联 SVG 图标
  },
};

const operateConfig = {
  label: "规划求解",
  thumbnailClass: "ribbon-thumbnail-spreadsettings",
  commandGroup: {
    children: [{ direction: "vertical", commands: ["solver"] }],
  },
};

operateRibbon.buttonGroups.push(operateConfig);
```

按钮图标没有引入额外的图片文件，而是在 `index.html` 里以 base64 内联的 SVG 形式定义：

```css
.ribbon-button-upload {
    background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4w...");
}
```

#### 3.1.2 声明式对话框模板

对话框界面由一棵描述性的 JSON 树定义（`src/solver-dialog.js`），最外层是 `TabControl`，通过 `bindingPath: "dialogOption"` 与 `activeTab` 绑定以控制默认选中页；内容区由 `FlexContainer` 逐行排布控件。

关键的绑定路径（`bindingPath`）会在回调结果里原样返回，是 UI 与逻辑之间的契约：

| 控件类型 | bindingPath | 含义 |
|---|---|---|
| `RangeSelect` | `target1` / `target2` | 优化目标的系数单元格（容量） |
| `Radio` | `radioValue` | 优化方向，`max` / `min` |
| `RangeSelect` | `optimalQuantity1` / `optimalQuantity2` | 决策变量结果的落点单元格 |
| `RangeSelect` | `person1` / `person2` | 单机可容纳人数的系数单元格 |
| `RangeSelect` | `cost1` / `cost2` | 单机费用的系数单元格 |
| `ListComboEditor` | `compare1` ~ `compare3` | 约束比较符，`max`(<=) / `min`(>=) / `equal`(=) |
| `TextEditor` | `quantityNumber` / `personNumber` / `costNumber` | 约束右端常量 |

`RangeSelect` 的 `absoluteReference: true` 使得用户选取区域后返回的是绝对引用形式（如 `=$C$3`），`needSheetName: false` 则只返回单元格地址、不带工作表名，简化了后续解析。

```javascript
{
  type: "ColumnSet",
  children: [
    { type: "TextBlock", text: "总费用", style: "width: 50px", margin: "5px 15px" },
    {
      type: "ListComboEditor",
      bindingPath: "compare3",
      style: "width: 120px",
      margin: "5px",
      items: [
        { text: "<=", value: "max" },
        { text: ">=", value: "min" },
        { text: "=",  value: "equal" },
      ],
    },
    { type: "TextEditor", bindingPath: "costNumber", style: "width: 120px", margin: "5px" },
  ],
}
```

对话框打开时通过 `option` 对象为每个 `bindingPath` 预置初始值，其中 `dialogOption.activeTab` 指定默认激活的标签页：

```javascript
var option = {
  radioValue: "max",
  compare1: "max", compare2: "max", compare3: "max",
  target1: "请输入最优目标值1（容量）",
  optimalQuantity1: "最终计算值1单元格",
  // ...其余字段同理
  dialogOption: { activeTab: "solverTab" },
};

GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
  if (!result) {
    return; // 用户点击取消
  }
  // result 中即为各 bindingPath 对应的用户输入
});
```

#### 3.1.3 从单元格读数到线性规划模型

`RangeSelect` 返回的字符串可能带前导 `=`，需要一个小的归一化函数把 `"=C3"` 转成 `"C3"` 再交给 `sheet.getRange()`：

```javascript
function getRangeStr(str) {
  if (str && str[0] === "=") {
    return str.substr(1);
  }
}

var range3 = sheet.getRange(getRangeStr(result.optimalQuantity1)); // 结果落点
var range1 = sheet.getRange(getRangeStr(result.target1));          // 目标系数
```

取值阶段用 `sheet.suspendPaint()` / `resumePaint()` 包住，避免多次重绘；随后按 `javascript-lp-solver` 的模型约定组装对象：`optimize` 指定目标维度名，`opType` 指定最大/最小化，`variables` 描述每个变量在各维度上的系数，`constraints` 描述每个维度的约束。

```javascript
var att1 = "capacity"; // 优化目标：容量
var att2 = "plane";    // 约束：飞机总数量
var att3 = "person";   // 约束：可容纳总人数
var att4 = "cost";     // 约束：总费用

var myModel = {};
myModel.optimize = att1;
myModel.opType = result.radioValue;   // max 或 min
myModel.variables = {};

// 变量 1：以 att1..att4 为维度，逐项填入从单元格读到的系数
var var1 = {};
var1[att1] = target1value;  // 容量系数（如 30000）
var1[att2] = 1;             // 数量系数固定为 1，使 plane 约束等于各型号数量之和
var1[att3] = person1value;  // 单机人数系数
var1[att4] = cost1value;    // 单机费用系数
myModel.variables.var1Name = var1;
// var2 同理写入 myModel.variables.var2Name

// 约束：以 "max"/"min"/"equal" 作为键表达 <=、>=、=
myModel.constraints = {};
var cons1Name = {};
cons1Name[result.compare1] = Number(result.quantityNumber);
myModel.constraints[att2] = cons1Name;
// att3、att4 同理
```

其中 `var1[att2] = 1` 是模型成立的关键：把每个变量的「数量」维度系数固定为 1，`plane <= 44` 这类约束才能表达成「各型号飞机数量之和不超过 44」。

#### 3.1.4 求解与结果回写

求解调用被封装在 `mySolver.Solve(model)` 中，返回值以变量名为键给出各决策变量的最优取值，直接写入用户指定的「最终计算值」单元格即可。由于 `C5` 是由 `D3`、`D4` 参与计算的公式单元格，SpreadJS 的计算引擎会在写值后自动重算合计。

```javascript
var myResult = mySolver.Solve(myModel);

sheet.suspendPaint();
sheet.setValue(range3.row, range3.col, myResult.var1Name); // 美国机型的最优数量
sheet.setValue(range6.row, range6.col, myResult.var2Name); // 英国机型的最优数量
sheet.resumePaint();
```

求解器实例来自 `index.html` 中提前加载的浏览器打包版：该 UMD 包在检测到 `window` 对象时会把 `new Solver()` 挂到 `window.solver`，因此业务代码只需 `const mySolver = window.solver;` 即可获得与 Node 环境 `require` 完全一致的求解器实例。

#### 3.1.5 示例数据的初始化

`src/app.js` 在创建设计器后写入演示数据与格式化样式，用于验证整条链路：

```javascript
const designer = new Designer.Designer("gc-designer-container", designerConfig);
const spread = designer.getWorkbook();
const sheet = spread.getActiveSheet();

const sampleData = [
  ["飞机", "容量", "容纳人数", "费用"],
  ["美国", 30000, 16, 9000],
  ["英国", 20000, 8, 5000],
  ["总", null, null, null],
];
sheet.setArray(1, 1, sampleData);
// 合计行的容量（C5）= 美国容量×数量 + 英国容量×数量
sheet.setFormula(4, 2, "=C3*D3+C4*D4");

// 约束条件参考值，供用户填入对话框
sheet.setValue(8, 1, "飞机数量<="); sheet.setValue(8, 2, 44);
sheet.setValue(9, 1, "人数<=");     sheet.setValue(9, 2, 512);
sheet.setValue(10, 1, "总花费<=");  sheet.setValue(10, 2, 300000);
```

配套的单元格格式（表头绿底白字、区域边框、列宽）也在此处一次性设置。

### 3.2 UI 交互流程

打开示例页面 → 点击 Ribbon 上的「操作」选项卡 → 点击「规划求解」按钮 → 在弹出的对话框中依次选择目标系数单元格、优化方向、可变因素单元格 → 选择三组约束的比较符并填入限值 → 点击确定 → 求解结果写入「最终计算值」单元格，`C5` 合计公式自动重算。

### 3.3 技术栈

| 依赖 | 版本 | 作用 |
|---|---|---|
| SpreadJS（spread-sheets 及全套插件） | 19.0.3 | 表格内核、计算引擎、Excel IO、图表、透视表等 |
| SpreadJS Designer | 19.0.3 | 组件版设计器，提供 Ribbon 与对话框框架 |
| javascript-lp-solver | 0.4.24 | 线性规划求解器，已内置于 `src/vendor/` |
| SystemJS | ^0.19.22 | 浏览器端 ES Module 加载（配合在线 TypeScript 转译） |
| TypeScript | ^4.1.2 | SystemJS 的 `transpiler`，用于即时编译模块 |

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

由于模块通过 SystemJS 以 HTTP 方式加载，需在项目根目录启动一个静态服务器（任选其一）：

```bash
npx http-server -p 8080
# 或
python -m http.server 8080
```

然后访问 `http://localhost:8080/index.html`。所有 SpreadJS 模块与样式表均从 `cdn.grapecity.com.cn` 加载，需保证网络连通。

### 4.2 操作步骤

1. 页面加载后可见 SpreadJS 组件版设计器，活动工作表中已有航班运输示例表格（B2:E5）与条件参考区（B8:C11）。
2. 切换到「操作」选项卡，点击「规划求解」。
3. 在对话框中填写：
   - **设置目标**：目标系数两个单元格分别填 `C3`（美国机型容量）、`C4`（英国机型容量）；方向选择「最大值」。
   - **可变因素**：`最终计算值1` 填 `D3`、`最终计算值2` 填 `D4`，作为最优数量的落点；`可容纳人数` 与 `运输成本` 分别引用对应系数单元格（示例表中为 D、E 两列）。
   - **约束条件**：总数量 `<=` 44、总人数 `<=` 512、总费用 `<=` 300000（数值可直接参考 B8:C11 区域）。
4. 点击确定。D3、D4 被写入求解得到的最优数量，C5 的合计容量随之更新。
5. 可反复调整约束阈值重新求解，观察最优解的变化；点击取消则不会修改工作表。

## 五、功能特点

### 5.1 优点

- **零侵入扩展**：全部通过 `commandMap`、`ribbon`、`registerTemplate` 三个公开入口完成，不修改设计器内部实现，升级 SpreadJS 版本时迁移成本低。
- **界面与逻辑分离**：对话框模板（`solver-dialog.js`）、扩展配置（`designer-config.js`）、求解逻辑（`operate.js`）各自独立，替换求解器或调整界面互不影响。
- **复用设计器原生控件**：`RangeSelect` 让用户直接在表格中框选区域，省去手写单元格地址的易错环节，交互体验与 Excel 加载项保持一致。
- **计算引擎联动**：结果只写决策变量单元格，依赖公式的汇总单元格由 SpreadJS 自动重算，无需手动触发。

### 5.2 局限性与扩展建议

- **变量数量写死为 2**：模型固定生成 `var1Name`、`var2Name` 两个变量，新增机型需要改写 `excelSolver`。建议把「可变因素」改为多行可增删的动态区域，循环生成 `variables` 条目。
- **约束固定为三组**：对话框模板中硬编码了「总数量 / 总人数 / 总费用」三行约束。可参考 `RangeSelect` 的区域选择能力，让用户一次框选多行约束区，再批量转换为模型。
- **输入健壮性不足**：`getRangeStr` 对不以 `=` 开头的字符串返回 `undefined`，若用户未修改预置的提示文案（如「最终计算值1单元格」）就点击确定，`sheet.getRange(undefined)` 会抛错。建议在 `showDialog` 回调开头做一次校验，对未填写项给出提示并中止。
- **约束常量未与工作表联动**：条件区的 44 / 512 / 300000 目前只是给人看的参考值，需手动抄进对话框。可在打开对话框时读取这些单元格作为 `option` 的默认值。
- **仅支持线性模型**：`javascript-lp-solver` 处理的是线性规划/混合整数规划问题，非线性的业务目标（如分段定价、整数倍批量约束）需要换用其他求解器。
- **表头语义与公式不一致**：示例表头写的是「容纳人数」，而 `C5` 公式 `=C3*D3+C4*D4` 与代码注释把该列当作「数量」使用。实际改造时应统一列语义，避免维护时产生歧义。

## 六、关键代码片段

求解器最终收到的模型对象结构如下（以「最大化容量、飞机总数不超过 44」为例），理解这个结构即可自行调整优化目标：

```javascript
{
  optimize: "capacity",        // 目标所在维度
  opType: "max",               // 最大化
  variables: {
    var1Name: { capacity: 30000, plane: 1, person: 16, cost: 9000 }, // 美国机型
    var2Name: { capacity: 20000, plane: 1, person: 8,  cost: 5000 }  // 英国机型
  },
  constraints: {
    plane:  { max: 44 },       // 数量之和 <= 44
    person: { max: 512 },      // 人数之和 <= 512
    cost:   { max: 300000 }    // 费用之和 <= 300000
  }
}
```

调用 `mySolver.Solve(model)` 后，返回值中 `var1Name`、`var2Name` 即为两种机型各自的最优数量，分别写回用户指定的结果单元格。

## 七、总结

本示例的价值在于把「表格软件的业务扩展」这一常见需求拆解成了一套可复用的模式：用公开 API 扩展 Ribbon 与命令，用声明式模板描述对话框，用 `bindingPath` 作为界面与逻辑的契约，最后把表格数据翻译成算法库需要的输入格式并回写结果。

开发者可以从中学习到：

1. SpreadJS 组件版设计器的扩展三要素——`commandMap`、`ribbon`、`registerTemplate` 的注册时机与顺序（模板必须在实例化 Designer 之前注册）。
2. 利用 `RangeSelect` 等对话框控件构建与 Excel 加载项观感一致的参数采集界面，以及 `bindingPath` 的数据回传机制。
3. `suspendPaint` / `resumePaint` 在批量读写单元格时的性能意义。
4. 线性规划模型的标准结构（目标维度、变量系数、约束比较符），以及如何把业务表格映射到该结构。
5. 浏览器环境下引入 CommonJS/UMD 第三方库的方式——打包版自动挂载到 `window` 对象，与 Node 端 `require` 得到同一实例。

该模式适用于任何「需要用户输入结构化参数、再对表格数据做批量计算」的场景，例如成本优化、排产排班、投资组合配置等；只需替换 `excelSolver` 中的模型构建逻辑与目标算法库，UI 与扩展骨架都可以原样复用。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
