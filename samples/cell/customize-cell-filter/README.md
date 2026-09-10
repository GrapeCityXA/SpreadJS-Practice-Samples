## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义单元格筛选按钮的外观和行为。通过使用 `cellButtons` 属性，将默认的筛选按钮替换为自定义的搜索图标按钮，并保持筛选对话框的完整功能。示例还演示了如何通过条件格式为不同区域和日期范围的数据添加视觉区分。 

该方案适用于需要统一 UI 风格、自定义筛选按钮样式或在特定单元格位置添加筛选功能的场景。

## 二、解决的问题

在实际业务场景中，开发者可能需要：

* 自定义筛选按钮的图标样式，使其与应用整体 UI 风格保持一致
* 在指定单元格位置添加筛选按钮，而不是使用默认的表头筛选按钮
* 保留筛选对话框的完整功能，同时改变触发方式
* 通过条件格式增强数据的可视化效果，便于用户快速识别不同类别的数据

## 三、实现思路

### 3.1 隐藏默认筛选按钮并添加自定义按钮

核心思路是先隐藏 SpreadJS 默认的筛选按钮，然后通过 `cellButtons` 属性在指定单元格添加自定义按钮。

```javascript
function changeButton() {
    var spread = GC.Spread.Sheets.findControl("ss");
    var sheet = spread.getActiveSheet();
    sheet.suspendPaint();
    
    // 隐藏默认筛选按钮
    sheet.rowFilter().filterButtonVisible(false);
    
    // 获取 B2 单元格样式
    var style = sheet.getStyle(1, 1);
    
    // 添加自定义搜索按钮
    style.cellButtons = [
        {
            imageType: GC.Spread.Sheets.ButtonImageType.search,
            command: (sheet, row, col, option) => {
                var filter = sheet.rowFilter();
                var cellRect = sheet.getCellRect(row, col);
                var filterButtonHitInfo = {
                    rowFilter: filter,
                    row: row, col: col,
                    sheetArea: GC.Spread.Sheets.SheetArea.viewport,
                    x: cellRect.x, y: cellRect.y,
                    width: cellRect.width,
                    height: cellRect.height
                };
                // 打开筛选对话框
                filter.openFilterDialog(filterButtonHitInfo);
            }
        }
    ];
    
    sheet.setStyle(1, 1, style);
    sheet.resumePaint();
}
```

关键点：

* `filterButtonVisible(false)` 隐藏所有默认筛选按钮
* `imageType: ButtonImageType.search` 使用搜索图标
* `command` 回调函数中通过 `openFilterDialog()` 手动打开筛选对话框
* `filterButtonHitInfo` 对象包含筛选对话框所需的位置和范围信息

### 3.2 初始化行筛选器

使用 `HideRowFilter` 创建筛选器，并指定筛选范围：

```javascript
var filter = new spreadNS.Filter.HideRowFilter(
    new spreadNS.Range(2, 1, salesData.length - 1, salesData[0].length)
);
sheet.rowFilter(filter);
```

筛选范围从第 3 行开始（索引 2），排除表头行，包含所有数据行和列。

### 3.3 条件格式增强数据可视化

示例使用条件格式为不同区域和日期范围添加颜色标识：

```javascript
// 为 Region 列添加颜色区分
var ranges = [new SpreadNS.Range(2, 3, 10, 1)];
var style1 = new SpreadNS.Style();
style1.foreColor = "Accent 2";
var rule1 = new SpreadNS.ConditionalFormatting.NormalConditionRule(
    1, ranges, style1, ComparisonOperators.equalsTo, "West", ""
);
sheet.conditionalFormats.addRule(rule1);

// 为 Birth 列添加背景色区分
var style2 = new SpreadNS.Style();
style2.backColor = "lightGreen";
var rule2 = new SpreadNS.ConditionalFormatting.NormalConditionRule(
    1, ranges, style2, ComparisonOperators.between, "1990/01/01", "2000/01/01"
);
sheet.conditionalFormats.addRule(rule2);
```

通过 `NormalConditionRule` 创建条件格式规则，根据单元格值自动应用不同的前景色或背景色。

### 3.4 技术栈

* SpreadJS 15.0.0 — 核心表格组件
* SystemJS 0.19.22 — 模块加载器
* TypeScript 4.1.2 — 类型支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含销售数据的表格
2. 注意 B2 单元格（SalesPers 列）显示搜索图标按钮，而不是默认的筛选按钮
3. 点击 B2 单元格的搜索按钮，会弹出筛选对话框
4. 在筛选对话框中可以选择要显示的销售人员，部分功能被禁用（如页面提示）
5. 观察不同区域（Region 列）的数据以不同颜色显示
6. 观察不同出生日期（Birth 列）的数据以不同背景色显示

## 五、功能特点

### 5.1 优点

* 灵活的按钮自定义：可以使用内置图标类型或自定义图标，满足不同 UI 需求
* 保留完整筛选功能：自定义按钮触发的筛选对话框与默认按钮功能一致
* 精确的位置控制：可以在任意单元格添加筛选按钮，不局限于表头行
* 增强的数据可视化：结合条件格式，提升数据的可读性和识别效率

### 5.2 局限性与扩展建议

* 当前实现仅在 B2 单元格添加了自定义按钮，如需为多个列添加，需要循环设置每个单元格的样式
* 可以扩展 `command` 回调函数，添加自定义的筛选逻辑或数据验证
* 可以结合 `cellClick` 事件，实现更复杂的交互逻辑

## 六、关键代码片段

### 自定义按钮的 command 回调

```javascript
command: (sheet, row, col, option) => {
    var filter = sheet.rowFilter();
    var cellRect = sheet.getCellRect(row, col);
    var filterButtonHitInfo = {
        rowFilter: filter,
        row: row, col: col,
        sheetArea: GC.Spread.Sheets.SheetArea.viewport,
        x: cellRect.x, y: cellRect.y,
        width: cellRect.width,
        height: cellRect.height
    };
    filter.openFilterDialog(filterButtonHitInfo);
}
```

该回调函数在用户点击自定义按钮时触发，通过构造 `filterButtonHitInfo` 对象并调用 `openFilterDialog()` 方法，手动打开筛选对话框。关键是提供正确的单元格位置和尺寸信息，确保对话框显示在合适的位置。

## 七、总结

本示例展示了 SpreadJS 中自定义筛选按钮的实现方法，通过 `cellButtons` 属性和 `openFilterDialog()` API，开发者可以灵活控制筛选按钮的外观和位置，同时保留完整的筛选功能。

开发者可以从中学到：

* 如何使用 `cellButtons` 属性添加自定义单元格按钮
* 如何手动触发筛选对话框
* 如何使用条件格式增强数据可视化
* 如何创建和配置 `HideRowFilter` 行筛选器

该方案适用于需要自定义 UI 风格的企业应用、数据分析工具或需要在特定位置提供筛选功能的场景。通过扩展 `command` 回调函数，还可以实现更复杂的业务逻辑和交互体验。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
