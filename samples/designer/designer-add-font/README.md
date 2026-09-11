## 一、Demo 概述

本示例演示如何在 SpreadJS Designer（设计器）中自定义字体列表，将中文字体（如微软雅黑、黑体、新宋体）添加到设计器的多个字体选择位置。通过修改设计器配置、对话框模板和资源文件，实现在工具栏字体下拉框、单元格格式对话框、富文本编辑器等多个入口统一显示自定义字体。

该示例适用于需要在 SpreadJS 设计器中使用特定字体（尤其是中文字体）的场景，确保用户在不同操作入口都能方便地选择和应用这些字体。

## 二、解决的问题

* **中文字体缺失**：SpreadJS Designer 默认字体列表以英文字体为主，中文用户需要快速访问常用中文字体
* **多入口一致性**：设计器中有多个字体选择入口（工具栏、右键菜单、格式对话框、富文本编辑器），需要在所有位置统一添加自定义字体
* **字体顺序优化**：将常用字体置于列表顶部，提升用户体验

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 工具栏字体下拉框自定义

通过修改 `fontFamily` 命令的 `dropdownList` 属性，在工具栏的字体下拉框中添加自定义字体：

```javascript
// 获取默认配置并深拷贝
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let fontFamilyCmd = GC.Spread.Sheets.Designer.getCommand("fontFamily");

// 定义自定义中文字体
let customCNFont = [
    { value: "微软雅黑", text: "微软雅黑" },
    { value: "黑体", text: "黑体" },
    { value: "新宋体", text: "新宋体" }
];

// 将自定义字体添加到原有列表前面
fontFamilyCmd.dropdownList = customCNFont.concat(fontFamilyCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["fontFamily"] = fontFamilyCmd;

// 使用自定义配置创建设计器
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig);
```

**关键点**：使用 `concat` 方法将自定义字体置于列表前端，确保用户优先看到常用字体。

#### 3.1.2 单元格格式对话框字体列表自定义

通过修改格式对话框模板，在"单元格格式"对话框的字体选择器中添加自定义字体：

```javascript
// 获取格式对话框模板
let formatDialogTemplateName = GC.Spread.Sheets.Designer.TemplateNames.FormatDialogTemplate;
var formatDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(formatDialogTemplateName);

// 通过深层路径访问字体列表项，使用 unshift 添加到列表开头
formatDialogTemplate.content[0].children[2].children[0].children[0].children[0].children[1].items.unshift(
    { value: "微软雅黑", text: "微软雅黑" },
    { value: "黑体", text: "黑体" },
    { value: "新宋体", text: "新宋体" }
);

// 重新注册模板
GC.Spread.Sheets.Designer.registerTemplate(formatDialogTemplateName, formatDialogTemplate);
```

**关键点**：通过 `unshift` 方法将字体添加到列表开头，需要准确定位模板的嵌套路径。

#### 3.1.3 富文本编辑器字体资源自定义

通过修改设计器资源文件，在富文本编辑器中添加自定义字体：

```javascript
// 获取设计器资源
let resource = GC.Spread.Sheets.Designer.getResources();

// 添加自定义字体到资源的 fontFamilies 对象
resource.ribbon.fontFamilies['ff24'] = {
    name: "微软雅黑", text: "微软雅黑",
};
resource.ribbon.fontFamilies['ff25'] = {
    name: "黑体", text: "黑体",
};
resource.ribbon.fontFamilies['ff26'] = {
    name: "新宋体", text: "新宋体",
};

// 应用修改后的资源
GC.Spread.Sheets.Designer.setResources(resource);
```

**关键点**：使用唯一的键名（如 `ff24`、`ff25`）添加字体，避免与现有字体冲突。

### 3.2 技术栈

* SpreadJS v17.1.10：核心电子表格引擎
* SpreadJS Designer v17.1.10：可视化设计器组件
* SystemJS：模块加载器
* TypeScript 4.1.2：类型支持（配置环境）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html（推荐使用 Live Server 或类似工具）
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 在设计器界面中验证自定义字体：
    * **工具栏**：点击"开始"选项卡中的字体下拉框，查看列表顶部是否显示"微软雅黑"、"黑体"、"新宋体"
    * **单元格格式**：右键单击单元格 → 选择"单元格格式" → 切换到"字体"选项卡，查看字体列表
    * **富文本编辑器**：右键单击单元格 → 选择"编辑富文本"，在富文本编辑器的字体下拉框中查看
    * **图表格式**：选中图表 → 右键"设置格式" → "文本"选项，查看字体列表

## 五、功能特点

### 5.1 优点

* **全面覆盖**：在设计器的所有字体选择入口统一添加自定义字体，确保用户体验一致
* **灵活扩展**：可以轻松添加更多自定义字体，只需按照相同模式修改配置
* **优先显示**：自定义字体置于列表顶部，减少用户查找时间

### 5.2 版本优化建议

代码中注释部分（第 55-71 行）提供了 V18.1.0 及以后版本的简化方法，通过重组 `fontFamilies` 对象实现更简洁的字体列表管理：

```javascript
// V18.1.0+ 推荐方式
var res = GC.Spread.Sheets.Designer.getResources();
let reorganizeFontFamilies = [];
reorganizeFontFamilies.push({ name: "微软雅黑", text: "微软雅黑" });
// ... 添加更多字体
Object.keys(res.ribbon.fontFamilies).forEach(function (key) {
    reorganizeFontFamilies.push(res.ribbon.fontFamilies[key]);
});
res.ribbon.fontFamilies = {};
reorganizeFontFamilies.forEach(function (item, index) {
    res.ribbon.fontFamilies['ff' + (1 + index)] = item;
});
GC.Spread.Sheets.Designer.setResources(res);
```

这种方式避免了手动指定键名（如 `ff24`），通过循环自动生成键名，代码更易维护。

## 六、总结

本示例展示了如何在 SpreadJS Designer 中全面自定义字体列表，涵盖工具栏、格式对话框和富文本编辑器三个核心入口。开发者可以学到：

* 如何修改设计器命令配置（`commandMap`）
* 如何操作设计器模板（`Template`）的深层嵌套结构
* 如何管理设计器资源（`Resources`）中的字体定义
* 不同 SpreadJS 版本的 API 差异和最佳实践

该方案适用于需要定制化字体列表的企业应用，特别是中文环境下的电子表格系统，可以根据实际需求扩展更多字体或调整字体顺序。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
