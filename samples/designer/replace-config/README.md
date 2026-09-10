## 一、Demo 概述

本示例演示了如何通过自定义模板来修改 SpreadJS Designer 的内置对话框。具体实现了对"查找"对话框的定制化改造，包括修改对话框标题和隐藏部分功能选项。该功能适用于需要简化设计器界面、定制用户交互体验的场景。

## 二、解决的问题

在实际应用中，开发者可能需要根据业务需求对 SpreadJS Designer 的内置功能进行定制化调整，例如：

* 简化对话框界面，隐藏不常用的功能选项
* 修改对话框标题以符合企业品牌或业务术语
* 限制用户可访问的功能范围，避免误操作

本示例通过模板注册机制实现了对内置对话框的灵活定制，无需修改源码即可实现界面调整。

## 三、实现思路

### 3.1 获取内置对话框模板

通过 `GC.Spread.Sheets.Designer.getTemplate()` 方法获取内置对话框的模板对象。模板对象包含了对话框的结构定义，包括标题、内容区域、按钮等元素。

```javascript
let findDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate
);
```

### 3.2 修改模板内容

获取模板后，可以直接修改模板对象的属性来定制对话框。本示例实现了两个关键修改：

1. 修改对话框标题
2. 删除内容区域的第二个子元素（隐藏替换功能）

```javascript
// 修改标题
findDialogTemplate.title = "查找_自定义菜单名称";

// 删除内容区域的第二个子元素（索引为1）
findDialogTemplate.content[0].children.splice(1, 1);
```

### 3.3 注册自定义模板

使用 `GC.Spread.Sheets.Designer.registerTemplate()` 方法将修改后的模板重新注册到设计器中，替换原有的默认模板。

```javascript
GC.Spread.Sheets.Designer.registerTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate, 
  findDialogTemplate
);
```

**重要提示**：模板注册必须在创建 Designer 实例之前完成，否则修改不会生效。

### 3.4 技术栈

* SpreadJS v15.0.0：核心表格组件
* SpreadJS Designer v15.0.0：设计器组件
* SystemJS：模块加载器
* TypeScript v4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 推荐使用 Live Server 或其他 HTTP 服务器
```

### 4.2 操作步骤

1. 在浏览器中打开 index.html
2. 按下 `Ctrl+F` 快捷键打开查找对话框
3. 观察对话框标题已变更为"查找\_自定义菜单名称"
4. 对话框中原有的"替换"功能选项已被隐藏

## 五、功能特点

### 5.1 优点

* 无需修改源码即可定制内置对话框
* 通过模板机制实现灵活的界面调整
* 可以根据业务需求隐藏或修改任意对话框元素
* 代码简洁，易于维护和扩展

### 5.2 局限性与扩展建议

**局限性**：

* 需要了解模板对象的内部结构才能准确定位要修改的元素
* 模板注册必须在 Designer 实例化之前完成

**扩展建议**：

* 可以应用相同的方法定制其他内置对话框（如格式化对话框、插入对话框等）
* 可以通过修改 `content` 数组添加自定义的 UI 元素
* 结合事件监听机制实现更复杂的交互逻辑

## 六、关键代码片段

完整的模板定制流程：

```javascript
// 1. 获取内置模板
let findDialogTemplate = GC.Spread.Sheets.Designer.getTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate
);

// 2. 修改模板属性
findDialogTemplate.title = "查找_自定义菜单名称";
findDialogTemplate.content[0].children.splice(1, 1);

// 3. 注册自定义模板（必须在创建 Designer 之前）
GC.Spread.Sheets.Designer.registerTemplate(
  GC.Spread.Sheets.Designer.TemplateNames.FindDialogTemplate, 
  findDialogTemplate
);

// 4. 创建 Designer 实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
```

## 七、总结

本示例展示了 SpreadJS Designer 的模板定制能力，开发者可以学到：

* 如何获取和修改内置对话框模板
* 模板注册机制的使用方法和时机
* 通过数组操作隐藏或调整 UI 元素的技巧

该方案适用于需要定制设计器界面的场景，具有良好的扩展性。通过类似的方法，可以对 Designer 的其他内置对话框进行定制化改造，满足不同的业务需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
