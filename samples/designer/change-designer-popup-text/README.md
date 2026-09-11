## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义工作表保护状态下的错误提示弹出框。当用户尝试编辑受保护工作表中的锁定单元格时，系统会弹出提示框，该示例展示了如何修改弹出框的标题和提示内容，使其符合业务需求。

该功能适用于需要自定义用户交互体验的场景，特别是在多语言环境或需要特定品牌化提示信息的应用中。

## 二、解决的问题

* **自定义错误提示内容**：默认的保护状态提示信息可能不符合业务需求，需要修改为更友好或更具体的提示文字
* **品牌化界面**：通过修改弹出框标题，可以将设计器标题改为企业品牌名称或自定义标识
* **多语言适配**：在已有中文资源包的基础上，进一步定制特定的提示文案

## 三、实现思路

### 3.1 修改设计器弹出框标题

通过 `GC.Spread.Sheets.Designer.getResources()` 获取设计器资源对象，修改其 `title` 属性，然后使用 `setResources()` 应用修改。

```javascript
let resources = GC.Spread.Sheets.Designer.getResources()
resources.title = "**设计器"
GC.Spread.Sheets.Designer.setResources(resources)
```

这种方式可以修改设计器相关弹出框的标题栏文字，实现品牌化定制。

### 3.2 修改保护状态错误提示内容

通过 `GC.Spread.Common.CultureManager` 获取当前语言的资源对象，修改 `Exp_InvalidOperationInProtect` 属性来自定义保护状态下的错误提示文字。

```javascript
let culture = GC.Spread.Common.CultureManager.getResources("zh-cn")
culture.Sheets.Exp_InvalidOperationInProtect = "不支持对锁定单元格进行修改"
GC.Spread.Common.CultureManager.addCultureInfo("zh-cn", null, culture)
```

该方法修改了文化资源中的错误提示信息，当用户尝试编辑受保护的单元格时，会显示自定义的提示内容。

### 3.3 设置工作表保护状态

为了演示效果，示例代码创建了一个受保护的工作表，并设置了红色背景区域作为视觉提示。

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.getRange(0,0,5,5).backColor("#ff5764")
sheet.options.isProtected = true
```

通过 `sheet.options.isProtected = true` 启用工作表保护，此时双击红色区域会触发自定义的错误提示弹出框。

### 3.4 技术栈

* SpreadJS 16.0.1（核心表格组件）
* SpreadJS Designer 16.0.1（设计器组件）
* SpreadJS 中文资源包 16.0.1
* SystemJS（模块加载器）
* TypeScript 4.1.2

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地服务器（如 Live Server）打开 `index.html` 文件。

### 4.2 操作步骤

1. 在浏览器中打开示例页面
2. 页面会显示 SpreadJS 设计器，左上角有一个 5x5 的红色区域
3. 双击红色区域中的任意单元格
4. 系统会弹出自定义的错误提示框，显示"不支持对锁定单元格进行修改"
5. 弹出框标题显示为"\*\*设计器"（已被自定义修改）

## 五、功能特点

### 5.1 优点

* **简单易用**：只需修改资源对象的属性即可实现自定义，无需复杂的 DOM 操作
* **国际化友好**：基于 SpreadJS 的文化管理机制，可以针对不同语言环境进行定制
* **样式可扩展**：代码注释中提到可以通过重写 CSS 类进一步定制弹出框样式（如 `.gc-sjs-designer-dialog`、`.dialog-titlebar` 等）

### 5.2 扩展建议

* 可以通过自定义 CSS 进一步修改弹出框的视觉样式（颜色、字体、尺寸等）
* 可以扩展到修改其他类型的提示信息，如公式错误、数据验证失败等场景
* 可以结合业务逻辑，根据不同的保护场景显示不同的提示内容

## 六、关键代码片段

完整的资源修改流程：

```javascript
// 1. 设置中文语言环境
GC.Spread.Common.CultureManager.culture("zh-cn")

// 2. 修改设计器标题
let resources = GC.Spread.Sheets.Designer.getResources()
resources.title = "**设计器"
GC.Spread.Sheets.Designer.setResources(resources)

// 3. 修改保护状态错误提示
let culture = GC.Spread.Common.CultureManager.getResources("zh-cn")
culture.Sheets.Exp_InvalidOperationInProtect = "不支持对锁定单元格进行修改"
GC.Spread.Common.CultureManager.addCultureInfo("zh-cn", null, culture)

// 4. 创建设计器并设置保护
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.getRange(0,0,5,5).backColor("#ff5764")
sheet.options.isProtected = true
```

## 七、总结

本示例展示了 SpreadJS 中自定义保护状态弹出框的实现方法，通过修改设计器资源和文化资源，开发者可以轻松实现界面文案的定制化。

开发者可以从中学到：

1. 如何使用 `GC.Spread.Sheets.Designer.getResources()` 和 `setResources()` 修改设计器界面文字
2. 如何通过 `GC.Spread.Common.CultureManager` 管理和修改多语言资源
3. 如何设置工作表保护状态并触发相关提示
4. SpreadJS 资源管理机制的基本使用方法

该方案适用于需要自定义用户提示信息的所有 SpreadJS 应用场景，具有良好的可维护性和扩展性。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
