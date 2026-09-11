## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中添加自定义水印效果。通过结合 html2canvas 库将 HTML 元素转换为图片，然后将其设置为 SpreadJS 的背景图，并配置为平铺模式，实现了类似文档水印的视觉效果。该方案适用于需要在电子表格中添加版权标识、保密标记或用户身份信息的场景。

## 二、解决的问题

* **版权保护需求**：在导出或打印的表格中添加版权标识，防止未经授权的使用
* **保密标记**：为敏感文档添加"机密"、"内部使用"等水印提示
* **用户身份追溯**：在表格中显示操作者姓名，便于文档溯源和责任追踪
* **自定义样式水印**：支持旋转角度、字体大小、颜色等样式定制，满足不同场景需求

## 三、实现思路

### 3.1 HTML 元素作为水印模板

通过在 HTML 中创建一个隐藏的 div 元素，使用 CSS 样式定义水印的外观（旋转角度、字体、颜色等）：

```html
<div id="capture">
    <p class="fillText">ZhangGuoGuo<p>
</div>
```

```css
#capture {
    background: #eee;
    width: 400px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    z-index: -5;  /* 隐藏在页面后方 */
}
.fillText {
    width: 160px;
    height: 160px;
    line-height: 160px;
    transform: rotate(-30deg);  /* 旋转 -30 度 */
    font-size: 30px;
    color: #fff;
}
```

### 3.2 html2canvas 转换为图片

使用 html2canvas 库将 HTML 元素渲染为 Canvas，然后转换为 Base64 格式的图片数据：

```javascript
import html2canvas from 'html2canvas';

html2canvas(document.getElementById("capture")).then(function (canvas) {
    pic = canvas.toDataURL();  // 转换为 Base64 图片
});
```

### 3.3 设置为 SpreadJS 背景图并平铺

将生成的图片设置为 SpreadJS 工作簿的背景图，并通过 DOM 操作实现平铺效果：

```javascript
spread.options.backgroundImage = pic;
spread.options.backgroundImageLayout = GC.Spread.Sheets.ImageLayout.none;

setTimeout(() => {
    document.getElementById("ssvp_vp").style.backgroundRepeat = "repeat";
}, 10);
```

关键点说明：

* `backgroundImageLayout` 设置为 `none` 避免默认的拉伸或居中布局
* 通过 `setTimeout` 延迟执行，确保 SpreadJS 渲染完成后再修改 DOM
* 直接操作 SpreadJS 内部视口元素 `ssvp_vp` 的 CSS 属性实现平铺

### 3.4 技术栈

* **@grapecity/spread-sheets**: 15.0.0（核心表格组件）
* **@grapecity/spread-sheets-print**: 15.0.0（打印功能支持）
* **html2canvas**: 1.4.1（HTML 转 Canvas 库）
* **SystemJS**: 0.19.22（模块加载器）
* **TypeScript**: 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 直接在浏览器中打开 index.html 文件
# 或使用本地服务器（推荐）
npx http-server -p 8080
```

### 4.2 操作步骤

1. 打开 index.html 文件，页面会自动加载 SpreadJS 表格
2. 水印会在页面加载后自动生成并平铺显示在表格背景中
3. 可以正常编辑表格内容，水印始终保持在背景层
4. 修改 HTML 中的 `fillText` 内容可以更改水印文字
5. 调整 CSS 样式可以自定义水印的旋转角度、颜色、大小等

## 五、功能特点

### 5.1 优点

* **灵活的样式定制**：通过 HTML/CSS 可以轻松实现复杂的水印样式（渐变、阴影、多行文字等）
* **无需额外图片资源**：动态生成水印图片，不依赖外部图片文件
* **与表格内容分离**：水印作为背景层，不影响表格数据的编辑和操作
* **打印支持**：配合 spread-sheets-print 插件，水印可以在打印时保留

### 5.2 局限性与扩展建议

**局限性**：

* 直接操作 SpreadJS 内部 DOM 元素（`ssvp_vp`）可能在版本升级时失效
* 水印是静态的，无法根据用户操作动态更新（如需要显示当前时间）

**扩展建议**：

* 封装为独立的水印工具类，支持动态更新水印内容
* 使用 SpreadJS 的自定义绘制 API（如 `CustomFloatingObject`）替代 DOM 操作，提高稳定性
* 添加水印透明度配置，平衡可见性和内容可读性
* 支持多水印模式（如四角水印 + 中心水印）

## 六、关键代码片段

### 完整的水印生成流程

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-print";
import html2canvas from 'html2canvas';

// 初始化 SpreadJS 工作簿
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 将 HTML 元素转换为图片并设置为背景
let pic;
html2canvas(document.getElementById("capture")).then(function (canvas) {
    pic = canvas.toDataURL();
    spread.options.backgroundImage = pic;
    spread.options.backgroundImageLayout = GC.Spread.Sheets.ImageLayout.none;
    
    // 延迟设置平铺模式，确保 DOM 已渲染
    setTimeout(() => {
        document.getElementById("ssvp_vp").style.backgroundRepeat = "repeat";
    }, 10);
});
```

## 七、总结

本示例展示了一种巧妙的水印实现方案，通过组合使用 html2canvas 和 SpreadJS 的背景图功能，实现了灵活且易于定制的水印效果。开发者可以从中学到：

1. **HTML 转图片技术**：使用 html2canvas 将任意 HTML 元素转换为图片资源
2. **SpreadJS 背景图配置**：通过 `backgroundImage` 和 `backgroundImageLayout` API 设置工作簿背景
3. **DOM 操作技巧**：直接操作 SpreadJS 内部元素实现特殊效果
4. **异步处理**：使用 Promise 和 setTimeout 处理渲染时序问题

该方案适用于需要快速实现水印功能的场景，特别是当水印样式需要频繁调整时，通过修改 HTML/CSS 即可实现，无需重新生成图片资源。对于生产环境，建议进一步封装并考虑使用 SpreadJS 官方 API 替代 DOM 操作以提高稳定性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
