## 一、Demo 概述

本示例演示了如何在 SpreadJS 中自定义导出和打印功能的默认选项配置。通过修改 `GC.Spread.Sheets.IO` 和 `GC.Spread.Sheets.Print` 的默认设置，开发者可以在执行导出和打印操作时自动应用预设的配置参数，而无需每次手动指定，从而提高代码的简洁性和可维护性。

该示例展示了如何设置导出 Excel、PDF 和打印操作的默认选项，包括密码保护、是否包含绑定源、行列标题显示、页边距、水印等常用配置项。

## 二、解决的问题

* **简化导出和打印代码**：通过预设默认选项，避免在每次调用 `export` 或 `print` 方法时重复传递相同的配置参数
* **统一配置管理**：在应用初始化时集中配置导出和打印选项，便于统一管理和维护
* **提高代码可读性**：减少重复的配置代码，使业务逻辑更加清晰
* **标准化输出格式**：确保应用中所有导出和打印操作使用一致的格式和样式

## 三、实现思路

### 3.1 核心技术点

#### 配置导出 Excel 的默认选项

通过修改 `GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption` 方法，可以设置导出 Excel 文件时的默认参数：

```javascript
let getFileMenuOption = GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption;
GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption = function (context) {
    let fileMenuSetting = (context.getData("fileMenuSetting") || {});
    let option = getFileMenuOption.apply(this, arguments);
    // 可以打印option查看其他选项
    console.log(option)
    option.exportXlsxOptions.includeBindingSource = fileMenuSetting.exportXlsxOptions_includeBindingSource !== undefined ? fileMenuSetting.exportXlsxOptions_includeBindingSource : true;
    option.exportXlsxOptions.includeFormulas = false
    return option;
}
```

**关键说明**：

* `includeBindingSource`：控制是否导出数据绑定源信息
* `<span class="hljs-property" style="box-sizing: content-box; margin: 0px; padding: 0px; transition: filter 0.5s ease-in-out; line-height: 21.76px; color: rgb(33, 37, 41); font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 13.6px; font-style: normal; font-variant-ligatures: none; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: pre-wrap; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;">includeFormulas</span>`：控制是否保留公式

#### 配置导出 PDF 的打印配置：

通过修改 `GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel)` 命令，可以设置导出 PDF 文件时的打印配置项：

```javascript
var fileMenuPanelCommand = GC.Spread.Sheets.Designer.getCommand(GC.Spread.Sheets.Designer.CommandNames.FileMenuPanel);
var oldGetStateFn = fileMenuPanelCommand.getState;
fileMenuPanelCommand.getState = function () {
    var result = oldGetStateFn.apply(this, arguments);
    result.printSetting.printArea = 1;
    return result;
}
var config = GC.Spread.Sheets.Designer.DefaultConfig;
config.commandMap = {
    fileMenuPanel: fileMenuPanelCommand
}
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
```

### 3.2 技术栈

* **SpreadJS**：核心电子表格组件库
* **GC.Spread.Excel.IO**：Excel 文件导入导出模块
* **FileSaver.js**：浏览器端文件下载库

## 四、使用说明

### 4.1 运行方式

本示例为纯前端 HTML 示例，运行方式：

1. 直接在浏览器中打开 `index.html` 文件
2. 或使用本地 HTTP 服务器（如 `python -m http.server` 或 `live-server`）打开

### 4.2 操作步骤

1. **打开示例页面**：在浏览器中加载 `index.html`
2. **导出 Excel**：点击"Export"按钮，下载生成的 Excel 文件（默认带密码保护"123"）
3. **导出 PDF**：点击"Export PDF"按钮，下载生成的 PDF 文件（包含默认元数据）
4. **打印**：点击"Print"按钮，打开打印预览对话框（自动应用默认的页边距和水印设置）

**测试建议**：

* 打开导出的 Excel 文件，验证密码保护是否生效
* 查看导出的 PDF 文件的属性，确认元数据是否正确
* 在打印预览中检查水印、边距和网格线的显示效果

## 五、功能特点

### 5.1 优点

* **代码简洁**：通过全局默认配置，大幅减少导出和打印操作的代码量
* **易于维护**：集中管理默认选项，修改配置时只需调整一处代码
* **统一标准**：确保应用中所有导出和打印操作使用一致的格式和样式
* **灵活可扩展**：默认选项可在运行时动态修改，支持根据业务需求调整

### 5.2 局限性与扩展建议

**局限性**：

* 默认选项是全局配置，如果需要针对不同场景使用不同的导出/打印选项，仍需在调用时传递自定义参数
* 水印图片路径为相对路径，需要确保图片资源可访问

**扩展建议**：

* 可以根据用户角色或业务场景，动态切换不同的默认配置方案
* 可以将默认选项配置存储在配置文件或服务端，实现远程配置管理
* 可以提供 UI 界面让用户自定义导出和打印的默认选项

## 

## 六、总结

本示例展示了 SpreadJS 中修改导出和打印选项默认值的实用技巧，通过简单的全局配置即可实现：

**学习价值**：

1. 掌握 `GC.Spread.Sheets.IO.defaultExportOptions` 的配置方法
2. 了解 `GC.Spread.Sheets.IO.defaultPDFExportOptions` 的元数据设置
3. 学习 `GC.Spread.Sheets.Print.defaultPrintOptions` 的打印选项配置
4. 理解如何通过默认配置简化代码和统一应用标准

**适用场景**：

* 需要在企业应用中统一导出和打印格式的场景
* 需要为导出文件添加固定的密码保护或元数据的场景
* 需要减少重复配置代码，提高代码可维护性的场景

该方案简单高效，适合在项目初始化阶段进行配置，后续的导出和打印操作将自动应用这些默认设置，显著提升开发效率。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
