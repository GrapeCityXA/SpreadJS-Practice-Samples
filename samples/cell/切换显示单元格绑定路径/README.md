## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现设计模式和运行模式的切换功能。在设计模式下，单元格显示数据绑定路径（如 `[name]`、`[address.postcode]`），方便开发者配置数据绑定关系；在运行模式下，单元格显示实际的数据值。通过自定义单元格类型（CellType），实现了绑定路径的可视化编辑和自动解析功能。

该示例适用于需要动态配置数据绑定的场景，例如报表设计器、表单设计器等工具，让用户可以直观地看到和编辑单元格与数据源的绑定关系。

## 二、解决的问题

- **绑定路径可视化**：在设计阶段，开发者需要清楚地看到每个单元格绑定了数据源的哪个字段，而不是显示实际数据值
- **双模式切换**：提供设计模式和运行模式的快速切换，设计模式用于配置绑定关系，运行模式用于预览实际数据效果
- **绑定路径编辑**：支持通过直接编辑单元格内容（输入 `[字段路径]` 格式）来设置或修改数据绑定关系
- **嵌套对象支持**：支持绑定嵌套对象的属性，如 `address.postcode`

## 三、实现思路

### 3.1 核心技术点

#### 自定义 BindingPathCellType 单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型，重写 `paint`、`getEditorValue` 和 `setEditorValue` 方法，实现绑定路径的显示和编辑功能。

```javascript
function BindingPathCellType(fields) {
    this.fields = fields;
}
BindingPathCellType.prototype = new GC.Spread.Sheets.CellTypes.Text()

// 重写 paint 方法，在单元格值为空时显示绑定路径
BindingPathCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
    let arg = arguments
    if (value === null || value === undefined) {
        let sheet = context.sheet,
            row = context.row,
            col = context.col;
        if (sheet && (row === 0 || !!row) && (col === 0 || !!col)) {
            let bindingPath = sheet.getBindingPath(row, col);
            if (bindingPath) {
                arg[1] = "[" + bindingPath + "]";  // 显示为 [字段名] 格式
            }
        }
    }
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arg);
};
```

#### 绑定路径的编辑和解析

通过 `getEditorValue` 方法，检测用户输入的内容是否为 `[字段路径]` 格式，如果是则自动设置为绑定路径，否则作为普通文本值处理。

```javascript
BindingPathCellType.prototype.getEditorValue = function (editorContext, context) {
    let text = GC.Spread.Sheets.CellTypes.Text.prototype.getEditorValue.apply(this, arguments);
    let sheet = context.sheet,
        row = context.row,
        col = context.col;
    // 检测是否为 [xxx] 格式
    if (text && text.indexOf("[") === 0 && text.indexOf("]") === text.length - 1) {
        sheet.setBindingPath(row, col, text.substring(1, text.length - 1));
        return null;  // 返回 null，单元格不显示实际值
    }
    sheet.setBindingPath(row, col, null);
    return text;
};
```

#### 设计模式与运行模式切换

通过按钮点击事件切换两种模式。设计模式下应用自定义 CellType 并移除数据源，运行模式下恢复标准 CellType 并绑定数据源。

```javascript
document.getElementById("btn").addEventListener("click", function () {
    if (this.innerText == "Design") {
        // 切换到设计模式
        let fields = [];
        getFields(fields, data, "");
        let defaultStyle = new GC.Spread.Sheets.Style();
        defaultStyle.cellType = new BindingPathCellType(fields);
        sheet.setDefaultStyle(defaultStyle);
        this.innerText = "Run";
        sheet.setDataSource(null);  // 移除数据源
    } else {
        // 切换到运行模式
        this.innerText = "Design";
        let defaultStyle = new GC.Spread.Sheets.Style();
        defaultStyle.cellType = new GC.Spread.Sheets.CellTypes.Text();
        sheet.setDefaultStyle(defaultStyle);
        sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(data));  // 绑定数据源
    }
})
```

#### 递归提取数据源字段

通过递归函数 `getFields` 遍历数据对象，提取所有可绑定的字段路径（包括嵌套对象）。

```javascript
function getFields(fields, source, parentName) {
    if (toString.call(source) === "[object String]") return;
    if (toString.call(source) === "[object Array]") return;
    if (parentName !== "") parentName = parentName + ".";
    for (let propertyName in source) {
        fields.push("[" + parentName + propertyName + "]");
        getFields(fields, source[propertyName], parentName + propertyName);
    }
}
```

### 3.2 技术栈

- SpreadJS 16.0.1：核心电子表格组件
- SystemJS：模块加载器
- TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，默认处于运行模式，单元格显示实际数据值（如"张三"、25、"男"等）
2. 点击页面顶部的 "Design" 按钮，切换到设计模式
3. 在设计模式下，已绑定的单元格会显示绑定路径（如 `[name]`、`[address.postcode]`）
4. 双击单元格可以编辑绑定路径，输入 `[字段名]` 格式即可设置新的绑定关系
5. 点击 "Run" 按钮切换回运行模式，查看绑定后的实际数据效果

## 五、功能特点

### 5.1 优点

- **直观的绑定配置**：通过可视化的方式显示和编辑数据绑定路径，降低配置难度
- **灵活的模式切换**：一键切换设计和运行模式，方便开发和调试
- **支持嵌套对象**：可以绑定多层嵌套的对象属性，如 `address.postcode`
- **简洁的实现方式**：通过自定义 CellType 实现，代码结构清晰，易于扩展

### 5.2 局限性与扩展建议

- **当前限制**：不支持数组类型的数据绑定，仅支持对象属性
- **扩展建议**：
  - 可以添加下拉列表，显示所有可用的绑定字段，提升用户体验
  - 支持绑定路径的语法高亮和自动补全功能
  - 增加绑定路径的验证机制，防止输入无效的字段名

## 六、总结

本示例展示了如何通过自定义 CellType 实现 SpreadJS 中数据绑定路径的可视化编辑功能。开发者可以从中学到：

- 如何继承和扩展 SpreadJS 的内置 CellType
- 如何使用 `getBindingPath` 和 `setBindingPath` API 管理单元格绑定关系
- 如何通过 `setDataSource` 动态切换数据源
- 如何递归遍历对象结构提取字段路径

该方案适用于需要提供数据绑定配置界面的应用场景，具有良好的扩展性，可以根据实际需求添加更多的交互功能和验证机制。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/oxfTOVe1lUmHd34QU6BQGA/)）
