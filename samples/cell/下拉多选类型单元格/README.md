## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现自定义的下拉多选单元格类型。通过继承 `GC.Spread.Sheets.CellTypes.Text` 并集成第三方多选组件 xm-select，实现了在单元格中进行多项选择的功能。用户双击单元格后，会弹出一个美观的多选下拉框，可以同时选择多个选项，选中的结果以逗号分隔的形式显示在单元格中。

该示例适用于需要在表格中进行多项数据选择的场景，如标签选择、分类筛选、权限配置等业务需求。

## 二、解决的问题

- **多选需求**：SpreadJS 原生的下拉列表只支持单选，无法满足需要同时选择多个选项的业务场景
- **用户体验**：通过集成专业的多选组件（xm-select），提供了更友好的交互界面和视觉反馈
- **数据存储**：通过 `setTag` 方法存储选中项的索引值，通过 `setValue` 存储显示文本，实现了数据与显示的分离

## 三、实现思路

### 3.1 自定义单元格类型

通过继承 `GC.Spread.Sheets.CellTypes.Text` 创建自定义单元格类型 `DropdownMultiSelect`，这是实现自定义编辑器的基础：

```javascript
function DropdownMultiSelect() { };
DropdownMultiSelect.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

然后将自定义类型应用到指定单元格：

```javascript
sheet.setCellType(1, 1, new DropdownMultiSelect());
```

### 3.2 创建编辑器容器

重写 `createEditorElement` 方法，创建一个 div 容器作为 xm-select 组件的挂载点：

```javascript
DropdownMultiSelect.prototype.createEditorElement = function () {
    let div = document.createElement("div");
    let $div = $(div);
    $div.attr('id', 'xm-select-container');
    return div;
};
```

### 3.3 激活编辑器并初始化多选组件

重写 `activateEditor` 方法，在用户双击单元格时初始化 xm-select 组件。该方法包含以下核心逻辑：

1. 解析当前单元格的文本值，提取已选中的选项
2. 根据已选中的选项名称，找到对应的索引值
3. 渲染 xm-select 组件并设置初始选中状态

```javascript
DropdownMultiSelect.prototype.activateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        let $editor = $(editorContext);
        GC.Spread.Sheets.CellTypes.Base.prototype.activateEditor.apply(this, arguments);
        $editor.attr('gcUIElement', 'gcEditingInput');
        
        // 解析当前单元格的值，获取已选中的选项
        let index = [];
        let disList = trimSpace(sheet.getText(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex()).split(','));
        for (let js = 0; js < selectList.length; ++js) {
            if (disList.indexOf(selectList[js].name) != -1) {
                index.push(selectList[js].value)
            }
        };
        
        // 渲染 xm-select 组件
        xmSelect.render({
            el: '#xm-select-container',
            autoRow: true,
            direction: 'down',
            language: 'zn',
            data: selectList,
            initValue: index,
            pageSize: 3,
            toolbar: {
                show: true,
                list: ['ALL']
            },
            on: function (data) {
                let arr = data.arr;
                let nameStr = '';
                let indexList = [];
                for (let i = 0; i < arr.length; ++i) {
                    nameStr += arr[i].name + ',';
                    indexList.push(arr[i].value)
                };
                nameStr = nameStr.substr(0, nameStr.length - 1);
                // 存储索引值到 tag
                sheet.setTag(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), indexList);
                // 存储显示文本到单元格
                sheet.setValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), nameStr)
            },
        });
    }
};
```

### 3.4 数据存储机制

示例采用了双重存储策略：

- **显示层**：通过 `setValue` 将选中项的名称以逗号分隔的形式存储在单元格中（如 "MUL1,MUL2"）
- **数据层**：通过 `setTag` 将选中项的索引值数组存储在单元格的 tag 属性中（如 [0, 1]）

这种设计使得数据的读取和处理更加灵活，既能直观显示，又能方便地进行数据操作。

### 3.5 技术栈

- **SpreadJS 17.0.8**：核心表格控件
- **xm-select 0.0.3**：第三方多选下拉组件
- **jQuery 3.7.1**：DOM 操作和事件处理
- **layui 2.6.2**：UI 样式库
- **SystemJS 0.19.22**：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到 A2 单元格显示提示文本 "双击B2测试➡️"
2. 双击 B2 单元格，会弹出多选下拉框
3. 在下拉框中勾选需要的选项（可以选择多个）
4. 点击下拉框外部区域或按 Enter 键确认选择
5. 单元格中会显示选中的选项名称，以逗号分隔（如 "MUL1,MUL2,MUL3"）
6. 再次双击单元格，可以看到之前选中的选项已被勾选

## 五、功能特点

### 5.1 优点

- **灵活的多选功能**：支持同时选择多个选项，满足复杂的业务需求
- **良好的用户体验**：集成专业的 xm-select 组件，提供美观的 UI 和流畅的交互
- **数据与显示分离**：通过 tag 存储原始数据，通过 value 存储显示文本，便于后续数据处理
- **可扩展性强**：可以轻松修改 selectList 数据源，适配不同的业务场景

### 5.2 局限性与扩展建议

- **依赖外部库**：依赖 jQuery、layui 和 xm-select 等第三方库，增加了项目体积
- **性能考虑**：如果表格中有大量多选单元格，频繁渲染可能影响性能，建议按需加载
- **扩展建议**：
  - 可以将 selectList 改为动态加载，支持从服务器获取选项数据
  - 可以添加搜索功能，方便在大量选项中快速定位
  - 可以支持分组显示，提升选项的组织性

## 六、关键代码片段

### 6.1 数据清洗工具函数

用于清除数组中的空值、null 和 undefined：

```javascript
function trimSpace(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == "" || array[i] == null || typeof (array[i]) == "undefined") {
            array.splice(i, 1);
            i = i - 1;
        }
    }
    return array;
};
```

### 6.2 编辑器尺寸更新

重写 `updateEditor` 方法，设置编辑器的宽度和高度：

```javascript
DropdownMultiSelect.prototype.updateEditor = function (editorContext, cellStyle, cellRect) {
    if (editorContext) {
        let $editor = $(editorContext); 
        $editor.css('width', cellRect.width); 
        return { height: 300 };
    }
};
```

## 七、总结

本示例展示了如何通过继承 SpreadJS 的单元格类型来实现自定义的多选下拉功能。开发者可以从中学到：

1. **自定义单元格类型的实现方法**：通过继承和重写关键方法来扩展 SpreadJS 的功能
2. **第三方组件的集成技巧**：如何将外部 UI 组件嵌入到 SpreadJS 的编辑器中
3. **数据存储策略**：使用 tag 和 value 分别存储原始数据和显示文本的设计模式
4. **编辑器生命周期管理**：理解 createEditorElement、activateEditor、updateEditor 等方法的调用时机

该方案适用于需要在表格中实现复杂交互控件的场景，具有良好的可扩展性。开发者可以参考这个思路，集成其他类型的自定义编辑器，如日期选择器、颜色选择器、富文本编辑器等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/_qGq9uDIuE_7Gl-lyFjUhA/)）
