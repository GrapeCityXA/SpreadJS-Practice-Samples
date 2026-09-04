## 一、Demo 概述

本示例演示了如何在 SpreadJS 中为单元格按钮设置自定义背景图片。通过配置 `cellButtons` 属性，可以将单元格中的按钮替换为自定义的图片资源，实现更加个性化的 UI 展示效果。该功能常用于需要在表格中嵌入图标、Logo 或特定视觉元素的场景。

## 二、解决的问题

在实际业务中，默认的单元格按钮样式可能无法满足特定的视觉设计需求。本示例解决了以下问题：

- 如何在单元格中显示自定义图片而非标准按钮样式
- 如何控制图片的尺寸和显示效果
- 如何在保护工作表的情况下禁用按钮交互，仅作为视觉元素展示

## 三、实现思路

### 3.1 核心技术点

#### 创建自定义单元格按钮样式

通过 `GC.Spread.Sheets.Style` 对象的 `cellButtons` 属性配置自定义按钮。关键配置项包括：

- `useButtonStyle: false` - 禁用默认按钮样式
- `imageType: GC.Spread.Sheets.ButtonImageType.custom` - 指定使用自定义图片
- `imageSrc` - 图片资源 URL
- `imageSize` - 图片显示尺寸
- `enabled: false` - 禁用按钮交互

```javascript
let style = new GC.Spread.Sheets.Style();
style.locked = true;
style.cellButtons = [
    {
        useButtonStyle: false,
        imageType: GC.Spread.Sheets.ButtonImageType.custom,
        imageSrc: "https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/spread/source/SPJS.svg",
        imageSize: {
            height: 15,
            width: 30
        },
        enabled: false
    }
];
```

#### 应用样式到指定单元格

使用 `setStyle` 方法将配置好的样式应用到目标单元格：

```javascript
sheet.setStyle(1, 1, style);
```

#### 工作表保护配置

为了防止用户误操作，示例中配置了工作表保护，并设置默认单元格为未锁定状态，仅锁定包含自定义按钮的单元格：

```javascript
let defaultStyle = new GC.Spread.Sheets.Style();
defaultStyle.locked = false;
sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.viewport);
sheet.options.isProtected = true;
```

### 3.2 技术栈

- SpreadJS v17.0.8 - 核心表格组件
- SpreadJS Designer v17.0.8 - 设计器组件
- SystemJS v0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，SpreadJS Designer 会自动加载
2. 在单元格 B2（行索引 1，列索引 1）位置可以看到自定义的 SVG 图片
3. 由于工作表已保护且按钮已禁用，该图片仅作为视觉元素展示，无法点击交互
4. 其他单元格保持可编辑状态

## 五、功能特点

### 5.1 优点

- 实现简单，仅需配置 `cellButtons` 属性即可完成自定义
- 支持多种图片格式（SVG、PNG、JPG 等）
- 可精确控制图片尺寸和显示位置
- 与工作表保护机制无缝集成

### 5.2 局限性与扩展建议

当前实现将按钮设置为 `enabled: false`，仅作为静态图片展示。如需实现可交互的图片按钮，可以：

- 将 `enabled` 设置为 `true`
- 监听 `ButtonClicked` 事件处理用户点击
- 根据业务需求执行相应的操作逻辑

## 六、关键代码片段

完整的单元格按钮配置代码：

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer";

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
let spread = designer.getWorkbook();
let sheet = spread.getActiveSheet();

// 创建包含自定义按钮的样式
let style = new GC.Spread.Sheets.Style();
style.locked = true;
style.cellButtons = [
    {
        useButtonStyle: false,  // 不使用默认按钮样式
        imageType: GC.Spread.Sheets.ButtonImageType.custom,  // 自定义图片类型
        imageSrc: "https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/spread/source/SPJS.svg",
        imageSize: {
            height: 15,
            width: 30
        },
        enabled: false  // 禁用交互
    }
];

// 设置默认样式为未锁定
let defaultStyle = new GC.Spread.Sheets.Style();
defaultStyle.locked = false;
sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.viewport);

// 应用自定义按钮样式到单元格 B2
sheet.setStyle(1, 1, style);

// 启用工作表保护
sheet.options.isProtected = true;
```

## 七、总结

本示例展示了 SpreadJS 中单元格按钮的自定义能力，开发者可以从中学到：

- `cellButtons` 属性的配置方法和参数含义
- 如何使用自定义图片替代默认按钮样式
- 工作表保护与单元格锁定的配合使用
- 图片尺寸和显示效果的精确控制

该方案适用于需要在表格中嵌入品牌 Logo、状态图标或装饰性图片的场景，通过简单的配置即可实现丰富的视觉效果。如需扩展为可交互的图片按钮，只需启用按钮并添加事件监听即可。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/W5VzC-NvZEe-b3VEnPtH4Q/)）
