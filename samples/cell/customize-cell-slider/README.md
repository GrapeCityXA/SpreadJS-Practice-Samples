## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义的数字滑动条筛选功能。通过重写默认的筛选对话框，使用 HTML5 的 range 输入控件（滑动条）替代传统的筛选界面，用户可以通过拖动滑块来动态筛选数值范围内的数据。该方案提供了更直观、更友好的数据筛选交互体验，特别适合需要对数值列进行范围筛选的场景。 

## 二、解决的问题

* 传统的筛选对话框操作步骤较多，用户需要手动输入数值或勾选多个选项，交互效率较低
* 对于数值型数据的范围筛选，缺少直观的可视化操作方式
* 需要提供一种更符合现代 UI 交互习惯的筛选方式，提升用户体验

## 三、实现思路

### 3.1 核心技术点

#### 重写筛选对话框

通过重写 `GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog` 方法，拦截默认的筛选对话框打开行为，替换为自定义的滑动条筛选界面：

```javascript
GC.Spread.Sheets.Filter.HideRowFilter.prototype.openFilterDialog = function (filterButtonHitInfo) {
    var sheet = GC.Spread.Sheets.findControl("ss").getActiveSheet();
    var filterDialog = new customFilterDialog(sheet, filterButtonHitInfo);
    filterDialog.open();
}
```

#### 自定义筛选对话框类

创建 `customFilterDialog` 类来管理滑动条的生命周期和筛选逻辑：

```javascript
function customFilterDialog(sheet, filterHitInfo) {
    this._sheet = sheet;
    this._filterHitInfo = filterHitInfo;
    this._container = null;
    this.init();
}
```

该类包含以下核心方法：

* `init()`: 初始化滑动条 UI 元素
* `open()`: 显示滑动条并绑定事件
* `close()`: 关闭对话框并保存状态
* `doFilter()`: 执行筛选逻辑

#### 动态创建滑动条 UI

使用 jQuery 动态创建 HTML5 range 输入控件，并设置样式和位置：

```javascript
customFilterDialog.prototype.init = function () {
    var $overlay = $("<div><input type='range' style='position: absolute;width:200px;height:30px' min='0' max='100' /></div>");
    $overlay.css("width", 100000);
    $overlay.css("height", 100000);
    $overlay.css("z-index", 100000);
    $overlay.css("position", "absolute");
    this._container = $overlay[0];
    $overlay.appendTo($(document.body));
}
```

#### 条件筛选逻辑

使用 SpreadJS 的条件格式化 API 构建复合筛选条件，实现数值范围筛选：

```javascript
customFilterDialog.prototype.doFilter = function () {
    var colIndex = this._filterHitInfo.col;
    var drf = this._filterHitInfo.rowFilter;
    drf.removeFilterItems(colIndex);

    // 创建最小值条件（大于 0）
    var minCondition = new ns.ConditionalFormatting.Condition(
        ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.greaterThan,
        expected: +$(this._container).children()[0].min
    });
    
    // 创建最大值条件（小于滑块值）
    var maxCondition = new ns.ConditionalFormatting.Condition(
        ns.ConditionalFormatting.ConditionType.cellValueCondition, {
        compareType: ns.ConditionalFormatting.GeneralComparisonOperators.lessThan,
        expected: +$(this._container).children().val()
    });
    
    // 使用 AND 逻辑组合两个条件
    var relationCondition = new ns.ConditionalFormatting.Condition(
        ns.ConditionalFormatting.ConditionType.relationCondition, {
        compareType: ns.ConditionalFormatting.LogicalOperators.and,
        item1: minCondition,
        item2: maxCondition
    });
    
    drf.addFilterItem(colIndex, relationCondition);
    drf.filter(colIndex);
}
```

#### 事件监听与状态保存

监听滑动条的 `change` 事件实时触发筛选，并使用全局变量保存滑块位置：

```javascript
$(self._container).children().bind("change", function () {
    self.doFilter();
});

customFilterDialog.prototype.close = function () {
    window.filterMaxValue = +$(this._container).children().val();
    $(this._container).remove();
}
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心表格控件
* jQuery 3.6.1：DOM 操作和事件处理
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格会自动加载并在 D 列（第 4 列）显示一组数值数据（-20 到 90）
2. 点击 D4 单元格右侧的筛选按钮图标
3. 弹出的滑动条默认范围为 0-100
4. 拖动滑块，表格会实时筛选出小于滑块值的数据行
5. 点击滑动条外的区域关闭筛选对话框，滑块位置会被保存
6. 再次打开筛选时，滑块会恢复到上次的位置

## 五、功能特点

### 5.1 优点

* 交互直观：使用滑动条替代传统输入框，操作更符合现代 UI 习惯
* 实时反馈：拖动滑块时立即显示筛选结果，无需点击确认按钮
* 状态保持：关闭后再次打开时保留上次的滑块位置
* 扩展性强：可以轻松修改滑块范围、步长等参数以适应不同场景

### 5.2 局限性与扩展建议

* 当前实现仅支持单列筛选，可扩展为多列联动筛选
* 滑块范围固定为 0-100，可改进为根据列数据的实际最大最小值动态设置
* 可以添加数值显示标签，让用户清楚看到当前筛选的数值
* 可以支持双向滑块（range slider），实现更灵活的区间筛选

## 六、关键代码片段

### 滑动条定位逻辑

```javascript
customFilterDialog.prototype.open = function () {
    var sheet = this._sheet, tempSpread = sheet.getParent(), self = this;
    
    $(self._container).css("display", "display");
    // 计算滑动条位置：筛选按钮右下角
    var x = self._filterHitInfo.x + self._filterHitInfo.width + tempSpread.getHost().offsetLeft;
    var y = self._filterHitInfo.y + self._filterHitInfo.height + tempSpread.getHost().offsetTop;
    $(self._container).children().css({ "left": x, "top": y });
    
    // 恢复上次保存的滑块值
    if (window.filterMaxValue) {
        $(self._container).children().val(window.filterMaxValue);
    }
}
```

### 筛选执行优化

```javascript
this._sheet.suspendPaint(true);  // 暂停绘制
drf.filter(colIndex);             // 执行筛选
this._sheet.resumePaint(false);   // 恢复绘制
```

通过 `suspendPaint` 和 `resumePaint` 方法避免筛选过程中的多次重绘，提升性能。

## 七、总结

本示例展示了如何通过重写 SpreadJS 的内置方法来实现自定义筛选交互。开发者可以从中学到：

* 如何重写 SpreadJS 的原型方法以扩展功能
* 如何使用条件格式化 API 构建复杂的筛选条件
* 如何结合 jQuery 创建自定义 UI 组件并与 SpreadJS 集成
* 如何使用 `suspendPaint` 优化批量操作的性能

该方案适用于需要对数值型数据进行范围筛选的场景，特别是在数据分析、报表展示等领域。通过类似的思路，开发者可以扩展实现日期选择器筛选、颜色选择器筛选等更多自定义筛选方式。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
