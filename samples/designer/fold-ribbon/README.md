## 一、Demo 概述

本示例演示如何在初始化 SpreadJS Designer（设计器）时，将功能区（Ribbon）工具栏设置为默认折叠状态。通过调用 `setData` 方法配置 `isRibbonCollapse` 参数，可以在设计器加载时自动收起工具栏，为用户提供更大的工作区域，适用于需要最大化表格显示空间的应用场景。

## 二、解决的问题

在使用 SpreadJS Designer 时，默认情况下功能区工具栏是完全展开的，占据较多的垂直空间。对于某些应用场景，用户可能希望：

* 初始加载时最大化表格显示区域，减少工具栏占用的空间
* 为小屏幕设备或嵌入式应用提供更紧凑的界面布局
* 让用户根据需要手动展开工具栏，而不是默认全部显示

## 三、实现思路

### 3.1 核心技术点

#### 设置设计器工具栏折叠状态

通过 Designer 实例的 `setData` 方法，传入 `isRibbonCollapse` 配置项，可以控制功能区工具栏的折叠状态。该方法需要在创建 Designer 实例之后、用户交互之前调用。

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

// 默认折叠工具栏
designer.setData("isRibbonCollapse", true)

let spread = designer.getWorkbook()
```

关键说明：

* `setData("isRibbonCollapse", true)` 将工具栏设置为折叠状态
* 设置为 `false` 则保持默认展开状态
* 用户仍可通过点击工具栏标签手动展开或折叠

### 3.2 技术栈

* SpreadJS Designer 15.0.0：提供完整的电子表格设计器功能
* SpreadJS 核心库及扩展模块（ExcelIO、Charts、Print、PDF、Barcode、Shapes、Pivot 等）
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html` 文件
2. 页面加载后，设计器会自动显示，功能区工具栏处于折叠状态
3. 点击任意工具栏标签（如"开始"、"插入"等）可以展开对应的功能区
4. 再次点击标签或点击工作区可以重新折叠工具栏

## 五、功能特点

### 5.1 优点

* 实现简单，只需一行代码即可控制工具栏折叠状态
* 提供更大的工作区域，适合数据密集型应用
* 不影响设计器的完整功能，用户可随时展开工具栏
* 适用于响应式布局和小屏幕设备

## 六、总结

本示例展示了如何通过 `setData` 方法控制 SpreadJS Designer 的功能区工具栏折叠状态。开发者可以从中学到：

* Designer 实例的 `setData` 方法的使用方式
* 如何优化设计器的初始界面布局
* 如何为用户提供更灵活的工作空间配置

该方案适用于需要最大化表格显示区域的应用场景，特别是在嵌入式应用、小屏幕设备或数据密集型界面中。通过简单的配置即可实现工具栏的默认折叠，提升用户体验。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
