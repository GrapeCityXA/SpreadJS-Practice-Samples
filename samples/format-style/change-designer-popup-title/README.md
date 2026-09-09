## 一、Demo 概述

本示例演示如何自定义 SpreadJS Designer（设计器）的标题文本。通过调用 `GC.Spread.Sheets.Designer.getResources()` 和 `setResources()` API，开发者可以修改设计器界面中显示的标题，实现品牌定制或个性化需求。

该示例适用于需要将 SpreadJS 设计器集成到自有系统中，并希望修改默认界面文本以符合企业品牌形象的场景。

## 二、解决的问题

- **品牌定制需求**：企业在集成 SpreadJS 设计器时，需要将默认标题替换为自己的产品名称或品牌标识
- **多语言本地化**：在已有中文资源包的基础上，进一步定制特定文本内容
- **界面个性化**：根据不同的应用场景，动态调整设计器的标题显示

## 三、实现思路

### 3.1 核心技术点

#### 获取和修改设计器资源

SpreadJS 设计器的所有界面文本资源都存储在一个资源对象中，可以通过以下步骤进行修改：

```javascript
// 获取设计器的默认资源对象
var res = GC.Spread.Sheets.Designer.getResources()
console.log(res)

// 修改标题属性
res.title = "SpreadJS NO.1---定制标题"

// 应用修改后的资源
GC.Spread.Sheets.Designer.setResources(res)
```

**关键点说明**：
- `getResources()` 返回包含所有界面文本的资源对象
- 修改 `res.title` 属性即可更改设计器标题
- 必须在创建 Designer 实例之前调用 `setResources()`，否则修改不会生效

#### 初始化设计器

在设置完资源后，创建设计器实例并进行基本配置：

```javascript
// 创建设计器实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

// 获取工作簿对象
let spread = designer.getWorkbook()

// 设置工作表数量
spread.setSheetCount(5)

// 获取活动工作表并设置初始数据
let sheet = spread.getActiveSheet()
sheet.setValue(0, 0, 'grapecity')
```

### 3.2 技术栈

- **SpreadJS Designer**: v15.0.0（设计器组件）
- **SpreadJS Core**: v15.0.0（核心表格引擎）
- **中文资源包**: `@grapecity/spread-sheets-designer-resources-cn` v15.0.0
- **模块加载器**: SystemJS 0.19.20
- **开发语言**: JavaScript（支持 TypeScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
# 或使用本地服务器（如 Live Server）运行
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，观察设计器标题已变更为"SpreadJS NO.1---定制标题"
2. 按照页面提示，在单元格中输入错误的公式（如 `=sum()`）
3. 查看错误提示弹框的标题，验证资源修改是否生效
4. 可以在设计器中进行正常的表格编辑操作

## 五、功能特点

### 5.1 优点

- **简单易用**：只需两行代码即可完成标题修改
- **灵活性高**：可以修改资源对象中的任意文本属性，不仅限于标题
- **无侵入性**：不需要修改 SpreadJS 源码，通过 API 即可实现定制

### 5.2 扩展建议

- 可以进一步修改资源对象中的其他属性，如菜单项文本、工具提示等
- 结合动态配置，根据用户权限或应用场景加载不同的资源文本
- 参考官方文档实现更全面的本地化定制：https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/features/culture/custom-localization/purejs

## 六、关键代码片段

### 资源修改的完整流程

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-designer-resources-cn"
import "@grapecity/spread-sheets-designer"

// 设置中文语言环境
GC.Spread.Common.CultureManager.culture("zh-cn");

// 获取设计器资源
var res = GC.Spread.Sheets.Designer.getResources()

// 修改标题（必须在创建 Designer 之前）
res.title = "SpreadJS NO.1---定制标题"
GC.Spread.Sheets.Designer.setResources(res)

// 创建设计器实例
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
```

**注意事项**：
- 资源修改必须在 `new GC.Spread.Sheets.Designer.Designer()` 之前执行
- 需要先引入中文资源包 `@grapecity/spread-sheets-designer-resources-cn`
- 使用 `CultureManager.culture("zh-cn")` 设置语言环境

## 七、总结

本示例展示了 SpreadJS 设计器资源定制的基本方法，开发者可以学到：

1. 如何获取和修改设计器的资源对象
2. 资源修改的正确时机（必须在创建 Designer 实例之前）
3. 设计器的基本初始化流程
4. 中文资源包的引入和使用方法

该方案适用于所有需要对 SpreadJS 设计器进行界面文本定制的场景，具有良好的扩展性。开发者可以在此基础上，进一步定制菜单、工具栏、对话框等更多界面元素的文本内容。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/nmAvZgPKeEGd896ryBTNZA/)）
