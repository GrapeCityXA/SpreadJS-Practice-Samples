## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 的文件菜单中添加自定义的"保存"选项，并响应用户的点击操作。通过扩展 Designer 的文件菜单模板和事件处理机制，开发者可以实现自定义的文件保存逻辑，例如将数据保存到服务器、本地存储或其他自定义位置。

该示例适用于需要自定义文件保存流程的场景，如企业内部系统集成、云端存储对接等。

## 二、解决的问题

* **自定义保存逻辑**：默认的 Designer 文件菜单不包含自定义保存选项，本示例展示如何添加自定义菜单项并实现自定义保存逻辑
* **菜单扩展机制**：演示如何通过模板注册机制扩展 Designer 的内置菜单
* **事件拦截与处理**：展示如何拦截文件菜单的属性变化事件，实现自定义业务逻辑

## 三、实现思路

### 3.1 获取并修改文件菜单模板

通过 `GC.Spread.Sheets.Designer.getTemplate()` 获取文件菜单的模板对象，然后向其中添加自定义菜单项：

```javascript
var fileMenu = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate);
// 添加分隔线
fileMenu.content[0].children[0].children[0].children[0].children.push({
    type: "LabelLine", 
    margin: "5px 0 0 0", 
    className: 'seprater-line'
});
// 添加保存选项
fileMenu.content[0].children[0].children[0].children[0].children.push({
    type: 'List', 
    className: 'file-menu-category-list', 
    bindingPath: "saveServer", 
    items:[{text: "保存(自定义)"}]
});
```

关键点：

* `bindingPath: "saveServer"` 定义了该菜单项的唯一标识符，用于后续事件处理
* `type: 'List'` 指定组件类型为列表项
* 通过 `push()` 方法将新菜单项添加到现有菜单结构中

### 3.2 注册修改后的模板

使用 `registerTemplate()` 方法将修改后的模板重新注册到 Designer 中：

```javascript
GC.Spread.Sheets.Designer.registerTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, 
    fileMenu
);
```

### 3.3 拦截并处理菜单事件

通过重写 `FileMenuHandler.processPropertyChanged` 方法来拦截菜单项的点击事件：

```javascript
let oldProcessPropertyChanged = GC.Spread.Sheets.Designer.FileMenuHandler.processPropertyChanged;
GC.Spread.Sheets.Designer.FileMenuHandler.processPropertyChanged = function(context, propertyName, newValue){
    if(propertyName === "saveServer"){
        alert("Save");
        // 这里可以实现自定义保存逻辑，如调用服务器 API
    }
    else if(propertyName === "newWithTemplate"){
        alert("newWithTemplate" + newValue);
        GC.Spread.Sheets.Designer.FileMenuHandler.hideFileMenu(context);
    }
    else{
        oldProcessPropertyChanged.apply(this, arguments);
    }
}
```

关键点：

* 保存原始的 `processPropertyChanged` 方法引用，确保其他菜单项的功能不受影响
* 通过 `propertyName` 参数判断是哪个菜单项被点击
* 对于自定义菜单项，执行自定义逻辑；对于其他菜单项，调用原始方法

### 3.4 技术栈

* SpreadJS Designer 16.1.4
* SpreadJS Core 16.1.4
* TypeScript 4.1.2
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，Designer 组件会自动加载
2. 点击 Designer 左上角的"文件"按钮
3. 在文件菜单中可以看到新增的"保存(自定义)"选项
4. 点击该选项，会弹出 "Save" 提示框（实际应用中可替换为服务器保存逻辑）

## 五、功能特点

### 5.1 优点

* **无侵入式扩展**：通过模板注册机制扩展菜单，不影响 Designer 的其他功能
* **灵活的事件处理**：可以根据 `bindingPath` 区分不同的自定义菜单项
* **易于集成**：可以方便地集成到现有的 SpreadJS Designer 应用中

### 5.2 扩展建议

* 将 `alert()` 替换为实际的保存逻辑，如调用 RESTful API 将工作簿数据保存到服务器
* 可以添加加载状态提示，提升用户体验
* 可以结合 SpreadJS 的序列化 API（如 `toJSON()`）获取工作簿数据进行保存

## 六、关键代码片段

### 自定义组件注册（templateListComponent.js）

示例中还包含了一个自定义组件 `TemplateListComponent` 的实现，展示了如何创建自定义的 Designer 组件：

```javascript
function TemplateListComponent() {
    GC.Spread.Sheets.Designer.AtomicComponentBase.call(this, ...arguments);
}
TemplateListComponent.prototype = new GC.Spread.Sheets.Designer.AtomicComponentBase();

TemplateListComponent.prototype.getTemplate = function (template) {
    var innerHTML = "<div class=\"gc-file-menu-list-new gc-flexcontainer fileMenu-list\">" +
        "<div class=\"new-sheet-temmplate-container OFL\">" +
        "<div class=\"template-thumb-icon gc-template-thumb-blank\"></div>" +
        "<label class=\"tempalte-thumb-text\">日程表</label>" +
        "</div></div>";
    return innerHTML;
}

TemplateListComponent.prototype.onMounted = function (host) {
    host.onclick = (e) => {
        this._value = (e.target || e.srcElement).toString();
        this.raiseValueChanged();
    }
}
```

该组件继承自 `AtomicComponentBase`，通过 `getTemplate()` 定义 HTML 结构，通过 `onMounted()` 添加事件监听。

## 七、总结

本示例展示了 SpreadJS Designer 的菜单扩展能力，开发者可以学到：

* 如何获取和修改 Designer 的内置模板
* 如何注册自定义菜单项
* 如何拦截和处理菜单事件
* 如何创建自定义 Designer 组件

该方案适用于需要自定义文件操作流程的场景，具有良好的扩展性。开发者可以基于此方案实现更复杂的自定义菜单功能，如添加多级菜单、图标、快捷键等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
