## 一、Demo 概述

本示例演示了如何在 SpreadJS 中判断当前单元格是否为富文本格式。通过监听单元格双击事件，获取单元格的值类型，并根据 `richText` 属性判断该单元格是否包含富文本内容，从而实现对富文本单元格的识别和处理。 

该功能适用于需要区分普通文本和富文本单元格的场景，例如数据导出、格式校验、内容编辑等业务需求。

## 二、解决的问题

* **富文本识别需求**：在电子表格应用中，用户可能需要区分哪些单元格包含富文本格式（如加粗、斜体、多种字体等），哪些是普通文本
* **数据处理差异化**：富文本和普通文本在导出、复制、编辑时的处理逻辑不同，需要提前识别单元格类型
* **用户交互反馈**：通过双击单元格即可快速判断其格式类型，提升用户体验

## 三、实现思路

### 3.1 核心技术点

#### 设置富文本单元格

使用 `setValue` 方法设置富文本内容，通过传入包含 `richText` 数组的对象来定义富文本格式：

```javascript
sheet.setValue(0, 2, {
    richText: [{
        style: { font: 'bold 12px Arial' },
        text: 'SpreadJS'
    }]
}, GC.Spread.Sheets.SheetArea.viewport);
```

每个富文本对象包含 `style` 和 `text` 属性，`style` 定义字体样式，`text` 定义文本内容。

#### 监听单元格双击事件

通过 `bind` 方法监听 `CellDoubleClick` 事件，获取用户双击的单元格位置：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellDoubleClick, function(sender, args) {
    var col = args.col;
    var row = args.row;
    // 处理逻辑
});
```

#### 获取单元格富文本值

使用 `getValue` 方法并指定 `ValueType.richText` 参数来获取单元格的富文本数据：

```javascript
var rich = sheet.getValue(
    row, 
    col, 
    GC.Spread.Sheets.SheetArea.viewport, 
    GC.Spread.Sheets.ValueType.richText
);
```

#### 判断富文本格式

通过检查返回值的 `richText` 属性及其长度来判断是否为富文本：

```javascript
if (rich.richText) {
    if (rich.richText.length > 0) {
        alert('富文本');
    }
    return;
} else {
    alert('非富文本');
}
```

如果 `richText` 属性存在且数组长度大于 0，则为富文本单元格；否则为普通文本单元格。

### 3.2 技术栈

* **@grapecity/spread-sheets**: 15.0.0（SpreadJS 核心库）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（类型支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，表格中会显示预设的富文本单元格（C1、C2、C3）和普通文本单元格（C4）
2. 双击任意单元格
3. 系统会弹出提示框，显示该单元格是"富文本"还是"非富文本"
4. 可以尝试双击不同的单元格来验证判断逻辑

## 五、功能特点

### 5.1 优点

* **实现简单**：通过 SpreadJS 提供的 API 即可轻松实现富文本判断
* **交互直观**：双击单元格即可查看结果，操作便捷
* **准确可靠**：基于 `ValueType.richText` 参数获取准确的富文本数据

### 5.2 局限性与扩展建议

* **当前实现仅支持双击触发**：可以扩展为右键菜单、工具栏按钮等多种触发方式
* **提示方式单一**：可以将 `alert` 替换为更友好的 UI 提示（如 Toast、Badge 标记等）
* **功能可扩展**：可以进一步显示富文本的详细样式信息（字体、颜色、大小等）

## 六、关键代码片段

完整的富文本判断逻辑：

```javascript
sheet.bind(GC.Spread.Sheets.Events.CellDoubleClick, function(sender, args) {
    var col = args.col;
    var row = args.row;
    
    // 获取单元格的富文本值
    var rich = sheet.getValue(
        row, 
        col, 
        GC.Spread.Sheets.SheetArea.viewport, 
        GC.Spread.Sheets.ValueType.richText
    );
    
    // 判断是否为富文本
    if (rich.richText) {
        if (rich.richText.length > 0) {
            alert('富文本');
        }
        return;
    } else {
        alert('非富文本');
    }
});
```

## 七、总结

本示例展示了 SpreadJS 中判断单元格富文本格式的基本方法，开发者可以从中学到：

1. 如何使用 `setValue` 方法设置富文本单元格
2. 如何监听 `CellDoubleClick` 事件获取用户操作
3. 如何使用 `getValue` 方法并指定 `ValueType.richText` 获取富文本数据
4. 如何通过 `richText` 属性判断单元格格式类型

该方案适用于需要区分富文本和普通文本的各类场景，可以作为数据校验、格式转换、内容编辑等功能的基础实现。开发者可以在此基础上扩展更多交互方式和功能细节。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
