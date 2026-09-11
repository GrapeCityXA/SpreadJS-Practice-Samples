## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现一个带搜索功能的自定义下拉多选单元格类型。用户可以通过双击单元格打开自定义编辑器，在编辑器中输入关键字进行模糊搜索，并支持按住 Ctrl 键进行多项选择。该功能适用于需要从大量选项中快速筛选并选择多个值的场景，如标签选择、分类筛选等。 

## 二、解决的问题

* 在表格单元格中实现多选功能，允许用户一次性选择多个选项
* 提供搜索过滤能力，帮助用户从大量选项中快速定位目标项
* 自定义单元格编辑器的外观和交互行为，满足特定业务需求
* 实现选中值的可视化展示和数据持久化

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Base` 创建自定义单元格类型 `MySelector`，重写关键方法实现自定义行为：

```javascript
function MySelector() {
    this.typeName = 'MySelector';
}
MySelector.prototype = new GC.Spread.Sheets.CellTypes.Base();
```

### 3.2 自定义编辑器 UI

在 `createEditorElement` 方法中创建包含搜索输入框和多选列表的自定义编辑器：

```javascript
MySelector.prototype.createEditorElement = function () {
    // 容器以排布输入框和选择器
    var container = document.createElement('div');
    container.setAttribute('gcUIElement', 'gcEditingInput');
    container.style.backgroundColor = 'white';
    container.style.display = 'flex';
    container.style.minHeight = "200px";
    container.style.flexDirection = 'column';

    // 输入框，显示或输入检索数据
    var searchInput = document.createElement('input');
    searchInput.placeholder = '请输入';
    container.appendChild(searchInput);

    // 选择器，列举各选项
    var list = document.createElement('select');
    list.multiple = true;
    var listItems = [
        { text: '苹果', value: 'apple' },
        { text: '香蕉', value: 'banana' },
        // ... 更多选项
    ];
    listItems.forEach(item => {
        var listItem = document.createElement('option');
        listItem.textContent = item.text;
        listItem.value = item.value;
        list.appendChild(listItem);
    });
    container.appendChild(list);

    return container;
}
```

### 3.3 搜索过滤功能

通过监听输入框的 `input` 事件实现实时搜索过滤：

```javascript
searchInput.addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const options = list.options;
    for (let i = 0; i < options.length; i++) {
        const optionText = options[i].textContent.toLowerCase();
        if (optionText.includes(searchValue)) {
            options[i].style.display = 'block';
        } else {
            options[i].style.display = 'none';
        }
    }
});
```

### 3.4 多选值处理

监听选择列表的 `change` 事件，将选中的多个值以逗号分隔的形式显示在输入框中：

```javascript
list.addEventListener('change', function () {
    const selectedOptions = Array.from(this.selectedOptions);
    const selectedTexts = [];
    selectedOptions.forEach(option => {
        selectedTexts.push(option.value);
    });
    searchInput.value = selectedTexts.join(', ');
});
```

### 3.5 数据持久化

通过 `getEditorValue` 和 `setEditorValue` 方法实现单元格值的读取和设置：

```javascript
MySelector.prototype.getEditorValue = function (editorContext) {
    return { value: editorContext.children[0].value };
}

MySelector.prototype.setEditorValue = function (editorContext, value) {
    editorContext.children[0].value = value ? value.value : null;
    // 根据已保存的值恢复选中状态
    if (value && value.value) {
        var inputContent = value.value.split(', ');
        var selectList = editorContext.children[1];
        Array.from(selectList.options).forEach(item => {
            if (inputContent.includes(item.value)) {
                item.selected = true;
            }
        });
    }
}
```

### 3.6 技术栈

* SpreadJS 17.0.8：核心表格控件
* SpreadJS Designer 17.0.8：设计器组件
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，双击 B2 单元格进入编辑模式
2. 在输入框中输入关键字（如"苹"）进行搜索过滤
3. 按住 Ctrl 键在下拉列表中选择多个选项
4. 选中的值会自动显示在输入框中，以逗号分隔
5. 按 Tab 键或点击其他单元格完成编辑，值会保存到单元格中

## 五、功能特点

### 5.1 优点

* 支持实时搜索过滤，提升大数据量场景下的选择效率
* 支持多选操作，满足复杂业务需求
* 自定义编辑器高度和样式，提供良好的用户体验
* 数据持久化机制完善，支持编辑状态的恢复

### 5.2 局限性与扩展建议

* 当前选项列表是硬编码的，可扩展为支持动态数据源（如从 API 获取）
* 搜索功能仅支持简单的文本包含匹配，可增强为支持拼音搜索、正则匹配等
* 可添加"全选"、"清空"等快捷操作按钮
* 可优化大数据量场景下的渲染性能（如虚拟滚动）

## 六、关键代码片段

### 编辑器尺寸控制

```javascript
MySelector.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        editorContext.style.width = cellRect.width + 'px';
        editorContext.style.height = 200;
        return { height: 200 };
    }
}
```

### 键盘事件处理

```javascript
MySelector.prototype.isReservedKey = function (e) {
    // 保留 Tab 键用于退出编辑
    return (e.keyCode === GC.Spread.Commands.Key.tab && !e.ctrlKey && !e.shiftKey && !e.altKey);
}
```

### 应用自定义单元格类型

```javascript
sheet.setColumnWidth(1, 200);
sheet.setCellType(1, 1, new MySelector());
```

## 七、总结

本示例展示了 SpreadJS 自定义单元格类型的强大扩展能力。通过继承 `CellTypes.Base` 并重写关键方法，开发者可以实现任意复杂的单元格编辑器。该方案适用于需要在表格中集成复杂交互组件的场景，如级联选择器、日期范围选择器、富文本编辑器等。

开发者可以从中学到：

* 自定义单元格类型的完整实现流程
* 编辑器生命周期方法的使用（createEditorElement、updateEditor、getEditorValue、setEditorValue）
* DOM 事件监听与数据双向绑定
* 单元格渲染与编辑状态的分离处理
* 键盘事件的拦截与处理机制

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
