## 一、Demo 概述

本示例演示了如何在 SpreadJS 中动态修改单元格的字体样式。通过创建一个简单的交互界面，用户可以点击按钮来改变指定单元格的字体类型。该示例展示了 SpreadJS 样式系统的核心用法，以及如何通过 DOM 元素辅助处理复杂的 CSS 字体属性。

该示例适用于需要动态调整单元格外观的场景，例如根据用户偏好切换字体、实现主题切换功能，或根据数据类型应用不同的视觉样式。

## 二、解决的问题

* **复杂字体属性的局部修改**：CSS 的 `font` 属性是多个子属性（font-style、font-variant、font-weight、font-size、line-height、font-family）的简写形式，直接修改其中某一项（如 font-family）而保持其他属性不变具有一定复杂性
* **样式的动态更新**：在用户交互过程中，需要获取当前单元格样式、修改特定属性、再应用回单元格，整个流程需要正确处理样式对象
* **字体样式的精确控制**：展示如何在 SpreadJS 中设置包含多种装饰效果（斜体、小型大写字母、粗体、文本装饰线等）的复杂字体样式

## 三、实现思路

### 3.1 初始化工作簿和样式设置

示例首先创建 SpreadJS 工作簿实例，并在指定单元格（C3）设置初始的复杂字体样式：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

// 合并单元格区域
sheet.addSpan(2, 2, 3, 3);

// 创建包含多种样式的 Style 对象
let style = new GC.Spread.Sheets.Style();
style.font = 'italic small-caps bold 20pt/22pt Times New Roman,Georgia,Serif';
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
style.textDecoration = GC.Spread.Sheets.TextDecorationType.overline | GC.Spread.Sheets.TextDecorationType.underline;

sheet.setStyle(2, 2, style, GC.Spread.Sheets.SheetArea.viewport);
sheet.setValue(2, 2, 'SpreadJS');
```

这段代码展示了如何使用 CSS 简写语法设置字体，包括斜体（italic）、小型大写字母（small-caps）、粗体（bold）、字号（20pt）、行高（22pt）和字体族（Times New Roman）。同时设置了水平和垂直居中对齐，以及上划线和下划线装饰。

### 3.2 通过 DOM 辅助修改字体属性

这是本示例的核心技术点。由于 CSS `font` 属性是复合属性，直接字符串操作容易出错，示例采用了一种巧妙的方法——借助临时 DOM 元素来解析和修改字体属性：

```javascript
document.getElementById("changeFont").onclick = function() {
    // 1. 获取当前单元格样式
    let cssStyle = sheet.getStyle(2, 2) || new GC.Spread.Sheets.Style();
    
    // 2. 创建临时 DOM 元素
    let fontElement = document.createElement("span");
    
    // 3. 将单元格的 font 属性赋值给临时元素
    fontElement.style.font = cssStyle.font;
    
    // 4. 修改临时元素的 fontFamily 属性
    fontElement.style.fontFamily = "宋体";
    
    // 5. 将修改后的 font 属性读取回来
    cssStyle.font = fontElement.style.font;
    
    // 6. 应用修改后的样式到单元格
    sheet.setStyle(2, 2, cssStyle);
};
```

这种方法的优势在于：

* 利用浏览器的 CSS 解析引擎自动处理复杂的 `font` 简写属性
* 只需修改目标子属性（fontFamily），其他属性（font-size、font-weight 等）自动保持不变
* 避免手动解析和拼接字符串，减少出错可能

### 3.3 技术栈

* **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库，提供电子表格功能
* **SystemJS**: 0.19.22 - 模块加载器，用于动态加载 ES6 模块
* **TypeScript**: 4.1.2 - 类型支持（虽然示例使用 JavaScript，但配置了 TypeScript 环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 可以使用本地服务器（如 Live Server）或直接双击打开
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会显示一个 SpreadJS 表格和一个"点击改变字体"按钮
2. 初始状态下，C3 单元格（合并区域）显示 "SpreadJS" 文本，字体为 Times New Roman，带有斜体、粗体、上下划线等样式
3. 点击"点击改变字体"按钮
4. 观察 C3 单元格的字体从 Times New Roman 变为宋体，其他样式属性（斜体、粗体、字号、装饰线等）保持不变

## 五、功能特点

### 5.1 优点

* **技术方案巧妙**：利用 DOM 元素的 CSS 解析能力，避免手动处理复杂的字体属性字符串
* **代码简洁**：核心逻辑仅需 6 行代码，易于理解和维护
* **样式保持完整**：修改单一字体属性时，其他样式属性（字号、粗细、装饰等）不受影响
* **实用性强**：该方法可扩展到修改其他 CSS 复合属性，如 background、border 等

### 5.2 局限性与扩展建议

* **浏览器依赖**：依赖浏览器的 CSS 解析引擎，不同浏览器可能对某些字体属性的解析略有差异
* **扩展方向**：
    * 可以添加下拉菜单让用户选择不同字体
    * 可以扩展为字体工具栏，支持修改字号、颜色、粗细等多种属性
    * 可以应用到选中的多个单元格或整个区域

## 六、关键代码片段

### 样式对象的创建与应用

```javascript
// 创建样式对象
let style = new GC.Spread.Sheets.Style();

// 使用 CSS 简写语法设置复杂字体
style.font = 'italic small-caps bold 20pt/22pt Times New Roman,Georgia,Serif';

// 设置对齐方式
style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
style.vAlign = GC.Spread.Sheets.VerticalAlign.center;

// 使用位运算符组合多种文本装饰效果
style.textDecoration = GC.Spread.Sheets.TextDecorationType.overline | 
                       GC.Spread.Sheets.TextDecorationType.underline;

// 应用样式到指定单元格
sheet.setStyle(2, 2, style, GC.Spread.Sheets.SheetArea.viewport);
```

### DOM 辅助修改字体的完整流程

```javascript
// 获取当前样式（如果不存在则创建新样式）
let cssStyle = sheet.getStyle(2, 2) || new GC.Spread.Sheets.Style();

// 创建临时 DOM 元素作为 CSS 解析器
let fontElement = document.createElement("span");

// 将复合 font 属性赋值给 DOM 元素，浏览器会自动解析
fontElement.style.font = cssStyle.font;

// 修改特定子属性（fontFamily）
fontElement.style.fontFamily = "宋体";

// 读取修改后的 font 属性（浏览器会自动重新组合）
cssStyle.font = fontElement.style.font;

// 应用修改后的样式
sheet.setStyle(2, 2, cssStyle);
```

## 七、总结

本示例展示了 SpreadJS 中单元格样式系统的核心用法，特别是如何处理复杂的 CSS 字体属性。通过借助临时 DOM 元素来解析和修改复合 CSS 属性，开发者可以避免手动字符串操作的复杂性和易错性。

开发者可以从本示例中学到：

1. **SpreadJS 样式对象的创建和应用**：使用 `GC.Spread.Sheets.Style` 类创建样式，通过 `setStyle` 方法应用到单元格
2. **CSS 复合属性的处理技巧**：利用 DOM 元素的 CSS 解析能力来修改复合属性的子属性
3. **样式的获取和修改流程**：通过 `getStyle` 获取现有样式，修改后再应用回单元格
4. **文本装饰的位运算组合**：使用位或运算符（`|`）组合多种装饰效果

该方案适用于需要动态调整单元格外观的各类应用场景，代码简洁且易于扩展，可以作为实现字体选择器、样式工具栏等功能的基础。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
