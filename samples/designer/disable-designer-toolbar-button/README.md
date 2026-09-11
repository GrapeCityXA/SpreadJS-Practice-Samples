## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中自定义图表插入命令，通过重写 `InsertChart` 命令的执行逻辑，实现对选择区域列数的限制。当用户选择的数据区域列数大于 2 列时，禁止插入图表并弹出提示信息。该功能适用于需要对图表数据源进行严格控制的业务场景，例如只允许创建简单的双列对比图表。

## 二、解决的问题

在某些业务场景中，需要限制用户创建图表时的数据源范围，避免因数据列过多导致图表过于复杂或不符合业务规范。本示例通过命令重写机制，实现了以下功能：

* 在用户尝试插入图表前，自动检测选择区域的列数
* 当列数超过限制时，阻止图表插入操作并给出明确提示
* 保持 Designer 其他功能的正常使用

## 三、实现思路

### 3.1 获取并重写 InsertChart 命令

通过 `GC.Spread.Sheets.Designer.getCommand()` 获取内置的图表插入命令对象，然后保存原始的 `execute` 方法，并用自定义逻辑替换：

```javascript
let newInsertChartCommand = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertChart
);
if (newInsertChartCommand) {
    var oldExecute = newInsertChartCommand.execute;
    newInsertChartCommand.execute = function (context, propertyName, args) {
        // 自定义逻辑
        console.log("重写插入图表逻辑");
        var activeSheet = context.getWorkbook().getActiveSheet();
        var sel = activeSheet.getSelections()[0];
        if (sel.colCount <= 2) {
            oldExecute.apply(this, arguments);
        } else {
            alert("数据大于两列，禁止插入");
        }
    }
}
```

这段代码的核心思路是：

* 保留原始命令的引用（`oldExecute`）
* 在新的 `execute` 方法中先进行列数检查
* 如果符合条件（列数 ≤ 2），调用原始方法完成图表插入
* 如果不符合条件，弹出警告并阻止操作

### 3.2 配置 Designer 使用自定义命令

创建 Designer 配置对象，并将重写后的命令映射到 `commandMap` 中：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertChart] = newInsertChartCommand;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

通过深拷贝默认配置并替换 `commandMap` 中的 `InsertChart` 命令，确保 Designer 在执行图表插入操作时使用自定义逻辑。

### 3.3 初始化示例数据

为了便于测试，示例中初始化了一个包含 4 列数据的表格：

```javascript
sheet.setArray(0, 0, [
    ["产品", "月份", "价格", "销量"],
    ["牙刷", "1月", 5, 100],
    ["牙膏", "1月", 15, 20],
    ["洗洁精", "1月", 20, 150],
    ["毛巾", "1月", 15, 78],
]);
```

用户可以选择不同的列范围进行测试：

* 选择 2 列或更少（如"产品"和"月份"）：允许插入图表
* 选择 3 列或更多（如"产品"、"月份"、"价格"）：禁止插入图表

### 3.4 技术栈

* SpreadJS 16.0.1（核心表格引擎）
* SpreadJS Designer 16.0.1（设计器组件）
* SpreadJS Charts 16.0.1（图表功能）
* SystemJS（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，会看到一个包含产品销售数据的表格
2. 使用鼠标框选数据区域（例如选择"产品"和"月份"两列）
3. 点击 Designer 工具栏中的"插入" → "图表"
4. 如果选择的列数 ≤ 2，图表插入对话框正常弹出
5. 如果选择的列数 > 2，会弹出警告"数据大于两列，禁止插入"，图表插入操作被阻止

## 五、功能特点

### 5.1 优点

* 实现简单，通过命令重写机制无需修改 Designer 源码
* 逻辑清晰，在命令执行前进行拦截判断
* 扩展性强，可以根据业务需求调整列数限制或添加其他校验规则
* 不影响 Designer 的其他功能

### 5.2 扩展建议

* 可以将列数限制改为可配置参数，支持动态调整
* 可以扩展为更复杂的校验规则，例如限制行数、检查数据类型等
* 可以将警告提示改为更友好的 UI 组件（如自定义对话框）
* 可以记录用户的操作日志，用于审计和分析

## 六、关键代码片段

### 命令重写核心逻辑

```javascript
// 获取原始命令
let newInsertChartCommand = GC.Spread.Sheets.Designer.getCommand(
    GC.Spread.Sheets.Designer.CommandNames.InsertChart
);

// 保存原始执行方法
var oldExecute = newInsertChartCommand.execute;

// 重写执行方法
newInsertChartCommand.execute = function (context, propertyName, args) {
    var activeSheet = context.getWorkbook().getActiveSheet();
    var sel = activeSheet.getSelections()[0]; // 获取第一个选择区域
    
    if (sel.colCount <= 2) {
        // 列数符合要求，调用原始方法
        oldExecute.apply(this, arguments);
    } else {
        // 列数超出限制，阻止操作
        alert("数据大于两列，禁止插入");
    }
}
```

### Designer 配置

```javascript
// 深拷贝默认配置
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));

// 替换命令映射
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertChart] = newInsertChartCommand;

// 创建 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

## 七、总结

本示例展示了 SpreadJS Designer 命令重写机制的实际应用，通过简单的代码实现了对图表插入功能的自定义控制。开发者可以从中学到：

* 如何获取和重写 Designer 内置命令
* 如何在命令执行前添加自定义校验逻辑
* 如何配置 Designer 使用自定义命令
* 如何通过选择区域对象获取列数等信息

该方案适用于需要对 Designer 功能进行精细化控制的场景，具有良好的扩展性和可维护性。开发者可以参考此思路，实现更多自定义的业务规则和交互逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
