## 一、Demo 概述

本示例展示了如何在 SpreadJS 中创建自定义状态栏组件，实现根据用户输入动态更新状态栏显示内容的功能。通过继承 `StatusItem` 类并实现自定义的视图渲染和数据更新方法，开发者可以在状态栏中展示任意自定义信息，满足特定业务场景下的状态展示需求。

该示例适用于需要在表格底部实时显示自定义信息的场景，例如显示用户输入的参数、计算结果、操作提示等。

## 二、解决的问题

- 默认状态栏功能有限，无法满足特定业务场景下的自定义信息展示需求
- 需要在表格底部实时显示用户输入或计算的数据
- 需要扩展状态栏功能，添加自定义的交互元素和显示逻辑

## 三、实现思路

### 3.1 自定义状态栏组件的创建

通过 JavaScript 原型继承机制，创建一个继承自 `GC.Spread.Sheets.StatusBar.StatusItem` 的自定义状态栏组件类：

```javascript
//创建InputStatus的构造函数 返回StatusItem对象
function InputStatus(name, options) {
    GC.Spread.Sheets.StatusBar.StatusItem.call(this, name, options);
}
//为InputStatus的显式原型赋值为StatusItem对象【默认为空对象】
InputStatus.prototype = new GC.Spread.Sheets.StatusBar.StatusItem();
```

这种继承方式确保了自定义组件拥有 `StatusItem` 的所有基础功能，同时可以添加自定义的方法和属性。

### 3.2 自定义视图渲染

重写 `onCreateItemView` 方法，定义状态栏组件的 DOM 结构：

```javascript
//给InputStatus对象添加onCreateItemView方法：添加两个span标签
InputStatus.prototype.onCreateItemView = function (container) {
    let statusBarDiv = this.contentDiv = document.createElement('div');
    statusBarDiv.innerHTML = '<span>输入值：</span><span></span>';
    container.appendChild(statusBarDiv);
};
```

该方法在状态栏中创建一个包含标签和内容区域的 div 元素，第一个 span 显示固定文本，第二个 span 用于动态显示用户输入的内容。

### 3.3 动态更新状态栏内容

添加自定义的 `updateText` 方法，实现状态栏内容的动态更新：

```javascript
//给InputStatus对象添加updateText方法：动态更新第二个标签的文本内容
InputStatus.prototype.updateText = function (text) {
    this.contentDiv.children[1].innerText = text;
};
```

通过操作 DOM 元素的 `innerText` 属性，实现状态栏显示内容的实时更新。

### 3.4 状态栏的初始化与绑定

创建 SpreadJS 工作簿和状态栏实例，并将自定义组件添加到状态栏：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(document.getElementById('statusBar'));
//statusBar的上下文对象为WorkBook实例
statusBar.bind(spread);
//创建一个inputStatus对象，并添加到statusBar上
let inputStatus = new InputStatus('InputStatus', { tipText: 'InputStatus' });
statusBar.add(inputStatus);
```

通过 `bind` 方法将状态栏与工作簿关联，使用 `add` 方法将自定义组件添加到状态栏中。

### 3.5 用户交互处理

监听按钮点击事件，触发状态栏内容更新：

```javascript
//更新按钮触发状态栏信息的变更
document.getElementById('update').onclick = function () {
    inputStatus.updateText(document.getElementById('inputValue').value);
}
```

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装依赖后，在浏览器中打开 `index.html` 文件即可运行示例。

### 4.2 操作步骤

1. 在右侧输入框中输入任意文本或数值
2. 点击"更新"按钮
3. 观察表格底部状态栏中"输入值："后面的内容是否更新为输入的内容

## 五、功能特点

### 5.1 优点

- 灵活的扩展机制：通过原型继承可以轻松创建自定义状态栏组件
- 简单的 API 设计：只需重写 `onCreateItemView` 方法即可自定义视图
- 与工作簿无缝集成：状态栏自动绑定到工作簿实例，无需额外配置
- 支持多个自定义组件：可以同时添加多个不同的自定义状态栏项

### 5.2 局限性与扩展建议

当前实现仅展示了基本的文本显示功能，可以进一步扩展：

- 添加更复杂的 UI 元素（如进度条、图标、下拉菜单等）
- 监听工作簿事件（如单元格选择、数据变化），自动更新状态栏内容
- 实现状态栏项的点击交互，触发特定操作
- 添加样式定制，使状态栏组件与应用主题保持一致

## 六、总结

本示例展示了 SpreadJS 状态栏的扩展能力，开发者可以通过继承 `StatusItem` 类创建完全自定义的状态栏组件。该方案适用于需要在表格底部展示自定义信息的场景，具有良好的扩展性和灵活性。

通过学习本示例，开发者可以掌握：

- SpreadJS 状态栏的基本使用方法
- JavaScript 原型继承的实际应用
- 自定义 UI 组件的创建和集成
- DOM 操作与事件处理的结合使用

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/eXYmQKptt06BS14kGgexog/)）
