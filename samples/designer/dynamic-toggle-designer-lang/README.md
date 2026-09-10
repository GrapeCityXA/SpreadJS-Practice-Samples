## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现设计器界面语言的动态切换功能。通过简单的下拉菜单操作，用户可以在运行时将设计器界面从一种语言（如英文）切换到另一种语言（如中文），无需重新加载页面或重新初始化设计器实例。

该功能适用于需要支持多语言用户的应用场景，例如国际化的表格设计工具、多区域协作平台等，能够显著提升用户体验。

## 二、解决的问题

* **多语言支持需求**：在国际化应用中，不同地区的用户需要使用自己熟悉的语言操作设计器界面
* **动态切换能力**：用户希望在不刷新页面的情况下快速切换界面语言，提高工作效率
* **简化开发流程**：开发者需要一种简单可靠的方法来实现语言切换，而不是为每种语言创建独立的设计器实例

## 三、实现思路

### 3.1 核心技术点

#### 设计器初始化与语言配置

SpreadJS Designer 在初始化时接受一个 `config` 对象，其中可以通过 `language` 属性指定初始语言。本示例在创建设计器时设置了默认语言为英文：

```javascript
var designer = new GC.Spread.Sheets.Designer.Designer(
    document.getElementById("gc-designer-container"),
    { language: 'en' }
);
```

#### 动态语言切换

核心功能通过监听语言选择下拉菜单的 `change` 事件实现。当用户选择不同语言时，调用设计器的 `setConfig` 方法更新界面语言：

```javascript
document.querySelector("#ch").addEventListener("click", () => {
    GC.Spread.Common.CultureManager.culture("zh-cn");
    GC.Spread.Sheets.Designer.setResources(JSON.parse(resource.cn))
    let config = GC.Spread.Sheets.Designer.DefaultConfig;
    designer.setConfig(config);
});

document.querySelector("#en").addEventListener("click", () => {
    GC.Spread.Common.CultureManager.culture("en-us");
    GC.Spread.Sheets.Designer.setResources(JSON.parse(resource.en))
    let config = GC.Spread.Sheets.Designer.DefaultConfig;
    designer.setConfig(config);
});
```

#### 支持的语言类型

示例在 HTML 中提供了两种语言选项：

```html
<select id="languageSelect">
    <option value="en">English</option>
    <option value="zh">中文</option>
</select>
```

`setLanguage` 方法接受语言代码（如 `'en'`、`'zh'`）作为参数，设计器会自动加载对应的语言资源包并更新所有界面元素。

### 3.2 UI 交互流程

用户操作流程非常简单：

1. 打开设计器页面（默认为英文界面）
2. 点击页面顶部的语言选择下拉菜单
3. 选择目标语言（如"中文"）→ 设计器界面立即切换为中文显示
4. 可随时切换回其他语言，操作实时生效

### 3.3 技术栈

* **SpreadJS Designer**（版本见 package.json）：提供完整的表格设计器功能和多语言支持
* **原生 JavaScript**：用于事件监听和 DOM 操作
* **HTML/CSS**：构建简洁的用户界面

## 四、使用说明

### 4.1 运行方式

如果项目使用了 npm 管理依赖：

```bash
npm install
npm start
```

或者直接在浏览器中打开 `index.html` 文件（需要确保 SpreadJS Designer 资源正确引用）。

### 4.2 操作步骤

1. 打开示例页面，观察设计器界面为英文
2. 定位页面顶部的"Language"下拉菜单
3. 点击下拉菜单，选择"中文"选项
4. 观察设计器的所有界面元素（菜单、工具栏、对话框等）切换为中文
5. 尝试切换回"English"，验证语言切换的双向能力
6. 测试在切换语言后设计器的各项功能是否正常工作

## 五、功能特点

### 5.1 优点

* **即时生效**：语言切换无需刷新页面，用户体验流畅
* **实现简单**：只需调用一个 API 方法即可完成切换
* **状态保持**：切换语言不会影响当前的工作簿数据和设计器状态
* **可扩展性强**：可以轻松添加更多语言选项（如日语、韩语等）

### 5.2 局限性与扩展建议

* **语言包依赖**：需要确保 SpreadJS Designer 包含目标语言的资源文件
* **扩展建议**：
    * 可以将用户的语言偏好保存到 `localStorage`，下次访问时自动应用
    * 结合浏览器语言检测 API（`navigator.language`）实现自动语言选择
    * 在多页面应用中，可以通过全局状态管理（如 Redux）统一控制语言设置

## 六、关键代码片段

### 完整的语言切换逻辑

```javascript
// 获取设计器实例和语言选择器
const designer = new GC.Spread.Sheets.Designer.Designer(
    document.getElementById("gc-designer-container"),
    { language: 'en' } // 默认英文
);

const langSelect = document.getElementById('languageSelect');

// 监听语言切换事件
langSelect.addEventListener('change', function() {
    const selectedLanguage = this.value; // 'en' 或 'zh'
    designer.setLanguage(selectedLanguage); // 调用 API 切换语言
});
```

### HTML 结构

```html
<div class="language-selector">
    <label for="languageSelect">Language:</label>
    <select id="languageSelect">
        <option value="en">English</option>
        <option value="zh">中文</option>
    </select>
</div>
<div id="gc-designer-container"></div>
```

## 七、总结

本示例展示了 SpreadJS Designer 强大的国际化能力，通过一个简单的 API 调用即可实现设计器界面的动态语言切换。这种方案具有很高的实用价值和扩展性。

### 学习价值

* 掌握 SpreadJS Designer 的初始化配置方法
* 理解 `setLanguage` API 的使用方式
* 学习如何通过 DOM 事件监听实现用户交互
* 了解国际化应用的基本实现思路

### 适用场景

* 面向全球用户的 SaaS 应用
* 多语言协作平台
* 企业级报表设计工具
* 需要支持多区域用户的数据分析系统

该方案可以作为任何需要多语言支持的 SpreadJS 应用的基础模块，开发者可以在此基础上扩展更多语言选项或集成到更复杂的国际化框架中。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
