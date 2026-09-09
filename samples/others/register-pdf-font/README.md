## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 环境中注册自定义中文字体（宋体）并解决导出 PDF 时的中文乱码问题。通过异步加载字体文件并注册到 PDF 字体管理器，实现了中文内容在 PDF 导出时的正确渲染。该方案适用于需要在 Web 环境中导出包含中文或特殊字体的 Excel 文件为 PDF 格式的场景。

## 二、解决的问题

- **PDF 导出中文乱码**：默认情况下，SpreadJS 导出 PDF 时无法正确渲染中文字符，会出现乱码或空白。通过注册中文字体文件到 PDF 字体管理器，确保中文在 PDF 中正常显示。
- **自定义字体支持**：除了解决乱码问题，还支持在 Designer 工具栏中添加自定义字体选项，使用户可以在编辑时直接选择已注册的中文字体。
- **字体备用机制**：提供 fallback 字体机制，当某个字体未注册时，自动使用备用字体进行渲染，避免导出失败。

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 异步加载字体文件

使用 `fetch` API 异步加载存放在 `static` 目录中的 TTF 字体文件，并转换为 `ArrayBuffer` 格式供 PDF 引擎使用：

```javascript
const fontUrls = ['./static/simsun.ttf', './static/simsun-bold.ttf']
const registerServerFont = async () => {
    let promises = fontUrls.map(url => fetch(url))
    let results = await Promise.all(promises)
    let fontData = await Promise.all(results.map(res => res.arrayBuffer()))
    // ...注册字体
}
```

#### 3.1.2 注册字体到 PDF 字体管理器

通过 `PDFFontsManager.registerFont` API 注册字体，需要指定字体名称及其不同样式（normal、bold）对应的字体数据：

```javascript
GC.Spread.Sheets.PDF.PDFFontsManager.registerFont("宋体", {
    "normal": fontData[0],   // 常规宋体
    "bold": fontData[1]      // 粗体宋体
})
```

#### 3.1.3 配置备用字体

设置 `fallbackFont` 函数，当遇到未注册的字体时，返回备用字体数据：

```javascript
GC.Spread.Sheets.PDF.PDFFontsManager.fallbackFont = function () {
    return fontData[0]  // 使用常规宋体作为备用字体
}
```

#### 3.1.4 自定义 Designer 字体下拉列表

获取默认配置，修改 `fontFamily` 命令的下拉列表，在列表开头添加自定义中文字体：

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let fontFamilyCmd = GC.Spread.Sheets.Designer.getCommand("fontFamily");
let customCNFont = [
    { value: "宋体", text: "宋体" }
];
fontFamilyCmd.dropdownList = customCNFont.concat(fontFamilyCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["fontFamily"] = fontFamilyCmd
```

#### 3.1.5 设置默认主题字体

将 SpreadJS 的默认主题字体修改为宋体，确保新建工作簿时使用中文字体：

```javascript
GC.Spread.Sheets.Themes.Office.bodyFont("宋体")
```

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地 Web 服务器打开 `index.html` 文件（由于涉及 `fetch` 请求字体文件，需要在 HTTP/HTTPS 环境下运行，不能直接通过 `file://` 协议打开）。

### 4.2 操作步骤

1. 打开页面后，SpreadJS Designer 将自动初始化
2. 在表格中可以看到预设的中文内容（"你好"和"葡萄城"）
3. 在 Designer 工具栏的字体下拉列表中，可以选择"宋体"字体
4. 输入或编辑中文内容后，点击工具栏中的"导出为 PDF"功能
5. 导出的 PDF 文件中，中文字符将正常显示，不会出现乱码

## 五、功能特点

### 5.1 优点

- **解决中文乱码问题**：彻底解决 SpreadJS 导出 PDF 时中文显示异常的问题
- **支持字体样式**：同时支持常规和粗体样式，保证文本格式的完整性
- **无缝集成 Designer**：字体注册后，用户可在 Designer 界面中直接选择和使用
- **容错机制完善**：通过 `fallbackFont` 提供兜底方案，避免因字体缺失导致导出失败

### 5.2 局限性与扩展建议

- **字体文件体积**：TTF 字体文件通常较大（如宋体约 10MB+），会增加页面加载时间。建议对字体文件进行压缩或使用 WOFF2 格式，并配置 CDN 加速。
- **字体数量限制**：示例中仅注册了宋体，如需支持更多中文字体（如黑体、楷体等），需要额外加载并注册相应字体文件。
- **异步加载处理**：当前实现在页面加载时立即注册字体，但未等待注册完成。建议在用户执行导出操作前，确保字体已完全加载完成（可通过 Promise 机制或状态标志控制）。

## 六、关键代码片段

完整的字体注册流程：

```javascript
// 字体文件路径
const fontUrls = ['./static/simsun.ttf', './static/simsun-bold.ttf']

const registerServerFont = async () => {
    // 1. 并行加载所有字体文件
    let promises = fontUrls.map(url => fetch(url))
    let results = await Promise.all(promises)
    
    // 2. 将响应转换为 ArrayBuffer
    let fontData = await Promise.all(results.map(res => res.arrayBuffer()))
    
    // 3. 注册字体到 PDF 字体管理器
    GC.Spread.Sheets.PDF.PDFFontsManager.registerFont("宋体", {
        "normal": fontData[0],   // 常规字体
        "bold": fontData[1]      // 粗体字体
    })

    // 4. 设置备用字体
    GC.Spread.Sheets.PDF.PDFFontsManager.fallbackFont = function () {
        return fontData[0]
    }
}

// 执行注册
registerServerFont()
```

## 七、总结

本示例展示了在 SpreadJS 中注册自定义 PDF 字体的完整流程，是解决中文导出乱码问题的标准方案。开发者可以从中学到：

1. 使用 `PDFFontsManager.registerFont` API 注册自定义字体
2. 通过 `fetch` API 异步加载二进制字体文件
3. 配置 `fallbackFont` 提供字体备用机制
4. 自定义 Designer 工具栏的字体下拉列表
5. 设置 SpreadJS 主题的默认字体

该方案适用于所有需要在 Web 端导出 PDF 且包含非西文字符的场景，通过简单的配置即可确保导出文档的字体正确渲染。在实际应用中，建议根据业务需求优化字体加载策略（如按需加载、懒加载等），以平衡功能完整性和页面性能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/HI4cOpFAEEGPewCiEMvVaA/)）
