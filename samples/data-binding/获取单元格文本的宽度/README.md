## 一、Demo 概述

本示例展示了如何在 SpreadJS 中搭建基础的电子表格应用环境。虽然示例标题为"获取单元格文本宽度"，但当前代码提供的是一个最小化的 SpreadJS 工作簿初始化框架，包含了基本的 HTML 页面结构、SystemJS 模块加载配置以及 SpreadJS 实例的创建。

该示例适用于初学者了解 SpreadJS 的基本项目结构和初始化流程，为后续添加单元格文本宽度测量等高级功能奠定基础。

## 二、解决的问题

本示例解决了以下基础问题：

- 如何在 Web 项目中正确引入和初始化 SpreadJS 组件
- 如何使用 SystemJS 进行模块化开发
- 如何配置 SpreadJS 的基本运行环境

## 三、实现思路

### 3.1 项目结构搭建

示例采用标准的前端项目结构，使用 SystemJS 作为模块加载器。主要文件包括：

- `index.html` - 页面入口，引入样式和脚本
- `src/app.js` - 应用主逻辑
- `systemjs.config.js` - SystemJS 配置文件
- `package.json` - 依赖管理

### 3.2 SpreadJS 初始化

在 `src/app.js` 中完成 SpreadJS 工作簿的创建和配置：

```javascript
import * as GC from "@grapecity/spread-sheets";
import { getData } from "./data.js";

// 设置许可证密钥
GC.Spread.Sheets.LicenseKey = "...";

// 创建工作簿实例
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

// 获取活动工作表
const sheet = spread.getActiveSheet();

// 设置数据源
sheet.setDataSource(getData());
```

核心步骤包括：
1. 导入 SpreadJS 核心库
2. 配置许可证密钥（生产环境必需）
3. 将工作簿绑定到 DOM 元素
4. 获取工作表实例并设置数据源

### 3.3 SystemJS 模块配置

`systemjs.config.js` 配置了模块加载规则：

```javascript
System.config({
  transpiler: 'systemjs-plugin-babel',
  babelOptions: {
    es2015: true
  },
  paths: {
    '*': './node_modules/*'
  },
  packageConfigPaths: [
    './node_modules/*/package.json', 
    "./node_modules/@grapecity/*/package.json"
  ],
  packages: {
    "node_modules": {
      defaultExtension: 'js'
    }
  }
});
```

该配置支持 ES6 语法转译，并自动解析 node_modules 中的依赖包。

### 3.4 技术栈

- SpreadJS 17.0.8 - 核心电子表格组件
- SystemJS 0.19.22 - 模块加载器
- systemjs-plugin-babel 0.0.25 - ES6 转译插件

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 推荐使用 Live Server 或其他静态服务器
```

### 4.2 操作步骤

1. 确保已安装所有依赖包
2. 使用 HTTP 服务器打开 `index.html`（不能直接双击打开，因为 SystemJS 需要 HTTP 协议）
3. 页面将显示一个空白的 SpreadJS 工作簿

注意：由于代码中引用的 `data.js` 文件缺失，当前版本可能无法正常加载数据。

## 五、功能特点

### 5.1 优点

- 项目结构清晰，易于理解和扩展
- 使用模块化开发方式，代码组织规范
- 全屏布局设计，充分利用浏览器空间

### 5.2 局限性与扩展建议

当前示例存在以下局限：

- 缺少 `src/data.js` 文件，导致数据源无法加载
- 未实现标题所述的"获取单元格文本宽度"功能

扩展建议：

1. 补充 `data.js` 文件，提供示例数据
2. 添加文本宽度测量功能，可使用 Canvas API 的 `measureText()` 方法
3. 实现单元格宽度自适应调整功能

示例代码（文本宽度测量）：

```javascript
// 获取单元格文本宽度的示例实现
function getCellTextWidth(sheet, row, col) {
  const cell = sheet.getCell(row, col);
  const text = cell.text();
  const font = cell.font();
  
  // 使用 Canvas 测量文本宽度
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  
  return metrics.width;
}
```

## 六、总结

本示例提供了一个 SpreadJS 项目的基础框架，展示了如何使用 SystemJS 进行模块化开发。虽然当前代码未完整实现"获取单元格文本宽度"的功能，但为开发者提供了清晰的项目结构参考。

开发者可以从中学到：

- SpreadJS 的基本初始化流程
- SystemJS 模块加载器的配置方法
- ES6 模块化开发的项目组织方式

该框架适合作为 SpreadJS 项目的起点，可在此基础上添加单元格操作、数据处理、样式设置等高级功能。建议补充缺失的数据文件和文本宽度测量逻辑，以实现完整的功能演示。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/cYW0t0wmqE2b0NbvaT7j_g/?defaultOpen=%7B%22OpenedFileName%22%3A%5B%22%2Findex.html%22%2C%22%2Fsrc%2Fapp.js%22%5D%2C%22ActiveFile%22%3A%22%2Fsrc%2Fapp.js%22%7D)）
