## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中自定义 Ribbon 菜单，添加一个区域选择功能。通过该功能，用户可以在设计器界面中点击自定义按钮，弹出区域选择对话框，选择单元格区域后自动在当前活动单元格中生成 SUM 求和公式。

该示例适用于需要在 SpreadJS 设计器中扩展自定义操作菜单的场景，特别是需要与用户进行交互式区域选择的业务需求。

## 二、解决的问题

* **自定义设计器菜单**：在 SpreadJS Designer 的 Ribbon 界面中添加自定义操作选项卡和按钮
* **交互式区域选择**：通过弹窗方式让用户选择单元格区域，提升用户体验
* **自动公式生成**：根据用户选择的区域自动生成求和公式并填充到指定单元格

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义 Ribbon 菜单

通过修改 `GC.Spread.Sheets.Designer.DefaultConfig` 配置对象，在 Ribbon 中添加自定义选项卡和按钮组：

```javascript
const designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
// 定义菜单
designerConfig.ribbon.push({
    "id": 'operate',
    "text": '自定义操作',
    "buttonGroups": [
        {
            "label": '区域',
            "thumbnailClass": '',
            "commandGroup": {
                "children": [
                    { commands: ['selectRangeCommand'], direction: "vertical" },
                ]
            }
        }
    ],
});
```

这段代码在 Ribbon 中添加了一个名为"自定义操作"的选项卡，其中包含一个"区域"按钮组。

#### 3.1.2 定义命令处理逻辑

创建命令对象，定义按钮点击后的执行逻辑：

```javascript
const operateCommands = {
    selectRangeCommand: {
        title: "选择区域",
        text: "选择区域",
        iconClass: "ribbon-button-upload",
        bigButton: "true",
        commandName: "selectRangeCommand",
        execute: async (context) => {
            var spread = context.getWorkbook();
            var sheet = spread.getSheet(0);
            var option = { target1: "请选择一个表/区域" }
            GC.Spread.Sheets.Designer.showDialog("newTab", option, (result) => {
                console.log("result:", result);
                var rangesStr = result.target1.replace('=', '');
                // 使用选定区域创建公式
                var formula = "=Sum(" + rangesStr + ")";
                console.log(formula)
                // 在表单的单元格中设置公式
                sheet.setFormula(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), formula, GC.Spread.Sheets.SheetArea.viewport);
            })
        },
    }
}

designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, operateCommands);
```

命令的 `execute` 方法中调用 `showDialog` 显示自定义对话框，并在回调函数中处理用户选择的区域，生成 SUM 公式并设置到当前活动单元格。

#### 3.1.3 注册自定义对话框模板

使用 `registerTemplate` 方法注册一个包含 RangeSelect 组件的对话框模板：

```javascript
const rangeTemplate = {
    title: "获取单元格区域",
    content: [{
        type: "FlexContainer",
        children: [
            {
                type: "ColumnSet",
                children: [
                    {
                        type: "RangeSelect",
                        needSheetName: false,
                        absoluteReference: true,
                        bindingPath: "target1",
                        style: "width: 300px",
                        margin: "5px 15px"
                    }
                ]
            },
        ]
    }]
}
GC.Spread.Sheets.Designer.registerTemplate("newTab", rangeTemplate);
```

模板中的 `RangeSelect` 组件提供了区域选择功能，`bindingPath` 指定了数据绑定路径，`absoluteReference` 设置为绝对引用模式。

### 3.2 UI 交互流程

用户点击"自定义操作"选项卡中的"选择区域"按钮 → 弹出"获取单元格区域"对话框 → 用户在 RangeSelect 组件中选择单元格区域 → 点击确认 → 系统在当前活动单元格中自动生成 SUM 公式

### 3.3 技术栈

* SpreadJS v17.0.8：核心电子表格引擎
* SpreadJS Designer v17.0.8：设计器组件
* SystemJS v0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`，SpreadJS Designer 界面将加载
2. 点击 Ribbon 中的"自定义操作"选项卡
3. 点击"区域"按钮组中的"选择区域"按钮
4. 在弹出的对话框中，点击 RangeSelect 输入框右侧的选择按钮
5. 在工作表中拖动鼠标选择需要求和的单元格区域（例如 A1:A2）
6. 点击对话框的"确定"按钮
7. 系统将在当前活动单元格中自动生成 SUM 公式（例如 `=Sum(A1:A2)`）

## 五、功能特点

### 5.1 优点

* **扩展性强**：通过配置化方式轻松扩展设计器功能，无需修改核心代码
* **用户体验好**：提供可视化的区域选择界面，降低用户操作难度
* **代码简洁**：使用 Designer API 的模板系统，代码结构清晰易维护
* **灵活配置**：RangeSelect 组件支持多种配置选项（绝对引用、是否包含工作表名等）

### 5.2 局限性与扩展建议

* **当前限制**：示例中硬编码了 SUM 函数，实际应用中可能需要支持更多函数类型
* **扩展建议**：
    * 可以在对话框中添加下拉菜单让用户选择不同的函数（SUM、AVERAGE、COUNT 等）
    * 支持多区域选择，生成更复杂的公式
    * 添加公式预览功能，让用户在确认前查看生成的公式

## 六、关键代码片段

### 配置初始化与设计器创建

```javascript
// 创建设计器实例并应用自定义配置
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()

// 初始化示例数据
sheet.setValue(0, 0, 1)
sheet.setValue(1, 0, 9)
sheet.setValue(1, 1, 5)
```

这段代码创建了设计器实例，并在工作表中填充了一些示例数据供测试使用。

## 七、总结

本示例展示了 SpreadJS Designer 的扩展能力，开发者可以学到以下知识点：

* 如何自定义 Designer 的 Ribbon 菜单结构
* 如何定义和注册自定义命令
* 如何使用 `registerTemplate` 创建自定义对话框
* 如何使用 RangeSelect 组件实现区域选择功能
* 如何通过 API 动态设置单元格公式

该方案适用于需要在 SpreadJS 设计器中添加自定义业务逻辑的场景，具有良好的扩展性。开发者可以基于此示例实现更复杂的自定义功能，如数据导入、批量处理、自定义计算等。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
