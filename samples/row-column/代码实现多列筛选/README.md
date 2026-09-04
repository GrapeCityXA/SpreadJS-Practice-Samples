## 一、Demo 概述

本示例演示了如何在 SpreadJS 中通过按钮点击事件实现多列数据的联合筛选功能。示例创建了一个包含地区和城市两列数据的表格，用户点击"filter"按钮后，系统会同时对两列应用筛选条件，只显示符合"地区为 North"且"城市为 TianJin"的数据行。

该示例适用于需要通过代码动态控制多列筛选条件的业务场景，例如根据用户选择的多个条件组合进行数据过滤。

## 二、解决的问题

- 如何通过代码方式而非 UI 交互实现数据筛选
- 如何同时对多个列应用不同的筛选条件
- 如何使用条件对象（Condition）定义精确的筛选规则
- 如何在筛选后正确刷新表格显示

## 三、实现思路

### 3.1 初始化行筛选器

使用 `HideRowFilter` 创建行筛选器对象，并指定筛选范围：

```javascript
var range = new GC.Spread.Sheets.Range(1, 0, 6, 2);
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);
```

这里定义了从第 1 行第 0 列开始，包含 6 行 2 列的筛选范围，并将筛选器绑定到工作表。

### 3.2 创建筛选条件对象

使用 `Condition` 对象定义文本匹配条件：

```javascript
var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
        expected: "North"
    }
);
var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
    GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition, 
    {
        compareType: GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
        expected: "TianJin"
    }
);
```

两个条件分别用于筛选第 0 列（地区）和第 1 列（城市）。

### 3.3 应用多列筛选

通过 `addFilterItem` 添加筛选条件，然后调用 `filter` 方法执行筛选：

```javascript
rowFilter.addFilterItem(0, condition1);  // 对第 0 列应用条件 1
rowFilter.addFilterItem(1, condition2);  // 对第 1 列应用条件 2
rowFilter.filter(0);  // 执行第 0 列筛选
rowFilter.filter(1);  // 执行第 1 列筛选
sheet.invalidateLayout();
sheet.repaint();
```

最后调用 `invalidateLayout` 和 `repaint` 刷新表格显示。

### 3.4 技术栈

- SpreadJS 15.0.0：核心表格组件
- jQuery 3.6.1：DOM 操作和事件绑定
- SystemJS：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

然后在浏览器中打开 `index.html` 文件。

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含地区和城市数据的表格
2. 点击页面上方的"filter"按钮
3. 表格将自动筛选，只显示地区为"North"且城市为"TianJin"的数据行（第 5 行）

## 五、功能特点

### 5.1 优点

- 支持通过代码精确控制筛选逻辑，无需用户手动操作筛选下拉框
- 可以同时对多个列应用不同的筛选条件，实现联合筛选
- 使用条件对象（Condition）定义筛选规则，支持多种比较类型（等于、包含、大于等）
- 筛选结果实时生效，自动隐藏不符合条件的行

### 5.2 局限性与扩展建议

当前实现的筛选条件是硬编码的，实际应用中可以考虑：
- 将筛选条件改为动态输入，例如通过下拉框或输入框获取用户选择
- 添加"清除筛选"按钮，调用 `rowFilter.unfilter()` 恢复所有数据显示
- 支持更复杂的筛选逻辑，例如使用 `OR` 条件或自定义筛选函数

## 六、关键代码片段

### 筛选器初始化与条件应用

```javascript
// 创建筛选范围和筛选器
var range = new GC.Spread.Sheets.Range(1, 0, 6, 2);
var rowFilter = new GC.Spread.Sheets.Filter.HideRowFilter(range);
sheet.rowFilter(rowFilter);

// 按钮点击事件
$("#filter").click(function () {
    // 定义第一列筛选条件（地区 = North）
    var condition1 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
        GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition, 
        {
            compareType: GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
            expected: "North"
        }
    );
    
    // 定义第二列筛选条件（城市 = TianJin）
    var condition2 = new GC.Spread.Sheets.ConditionalFormatting.Condition(
        GC.Spread.Sheets.ConditionalFormatting.ConditionType.textCondition, 
        {
            compareType: GC.Spread.Sheets.ConditionalFormatting.TextCompareType.equalsTo,
            expected: "TianJin"
        }
    );
    
    // 添加筛选条件并执行筛选
    rowFilter.addFilterItem(0, condition1);
    rowFilter.addFilterItem(1, condition2);
    rowFilter.filter(0);
    rowFilter.filter(1);
    
    // 刷新表格显示
    sheet.invalidateLayout();
    sheet.repaint();
});
```

## 七、总结

本示例展示了 SpreadJS 中通过代码实现多列联合筛选的完整流程，开发者可以从中学到：

1. 如何创建和配置 `HideRowFilter` 行筛选器
2. 如何使用 `Condition` 对象定义文本匹配条件
3. 如何通过 `addFilterItem` 和 `filter` 方法对多列应用筛选
4. 如何在筛选后正确刷新表格布局和显示

该方案适用于需要根据业务逻辑动态控制筛选条件的场景，例如报表系统中的多条件查询、数据分析工具中的快速筛选等。通过扩展条件对象的配置，还可以实现更复杂的筛选逻辑，如数值范围筛选、日期筛选等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/xyDUptslGkKb5nNuigvUCw/)）
