## 一、Demo 概述

本示例演示如何在 SpreadJS Designer 设计器中添加自定义的下拉选择框（ComboBox）组件。通过扩展设计器的 Ribbon 工具栏，开发者可以在设计器界面中添加自定义的下拉控件，实现与单元格数据的双向绑定。当用户从下拉框中选择选项时，选中的值会自动填充到当前活动单元格中；同时，下拉框会根据当前单元格的值动态显示对应的选项文本。

## 二、解决的问题

* 在 SpreadJS Designer 中扩展自定义 UI 控件，满足特定业务场景的交互需求
* 实现下拉选择框与工作表单元格数据的双向同步
* 为设计器工具栏添加自定义命令和交互逻辑

## 三、实现思路

### 3.1 扩展设计器 Ribbon 配置

通过修改 `GC.Spread.Sheets.Designer.DefaultConfig` 对象，在 Ribbon 工具栏的第一个选项卡中添加新的按钮组：

```javascript
let config = GC.Spread.Sheets.Designer.DefaultConfig
config.ribbon[0].buttonGroups.unshift({
    label: "NewDesigner",
    thumbnailClass: "your-class",
    commandGroup: {
        children: [
            {
                commands: ["CustomDropdownSelect"],
            }
        ],
    }
})
```

使用 `unshift` 方法将自定义按钮组插入到工具栏的最前面，确保用户能够快速访问。

### 3.2 定义自定义 ComboBox 命令

在 `config.commandMap` 中注册 `CustomDropdownSelect` 命令，配置下拉框的属性和行为：

```javascript
config.commandMap = {
    CustomDropdownSelect: {
        text: "自定义下拉选择",
        comboWidth: 150,
        commandName: "CustomDropdownSelect",
        type: "comboBox",
        dropdownList: [{
            text: "选项1",
            value: 1
        }, {
            text: "选项2",
            value: 2
        }, {
            text: "选项3",
            value: 3
        }],
        execute: function (context, selectValue, value) {
            if (selectValue && value) {
                let spread = context.getWorkbook();
                let sheet = spread.getActiveSheet();
                sheet.setValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), value);
            }
        },
        getState: function (context, cmdOptions) {
            let sheet = context.getWorkbook().getActiveSheet();
            let row = sheet.getActiveRowIndex();
            let col = sheet.getActiveColumnIndex();
            let dropdownList = cmdOptions.dropdownList.filter((item) => {
                return item.value === sheet.getValue(row, col) || item.text === sheet.getValue(row, col)
            });
            return dropdownList[0].text || cmdOptions.text;
        }
    }
}
```

关键配置项说明：

* `type: "comboBox"`：指定控件类型为下拉选择框
* `dropdownList`：定义下拉选项的文本和值
* `execute`：当用户选择选项时触发，将选中的值写入当前单元格
* `getState`：根据当前单元格的值动态更新下拉框显示的文本

### 3.3 双向数据绑定机制

**写入数据（execute 方法）**：
当用户从下拉框中选择选项时，`execute` 方法获取当前工作簿和活动工作表，通过 `setValue` 方法将选中的值写入当前活动单元格。

**读取数据（getState 方法）**：
`getState` 方法在下拉框渲染时被调用，它读取当前单元格的值，并在 `dropdownList` 中查找匹配的选项，返回对应的文本作为下拉框的显示内容。如果没有匹配项，则显示默认文本。

### 3.4 技术栈

* SpreadJS Designer 17.0.8：提供设计器核心功能和扩展 API
* SystemJS 0.19.22：模块加载器，支持 ES6 模块语法
* Babel：通过 systemjs-plugin-babel 实现 ES6 代码转译

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 index.html 文件，SpreadJS Designer 设计器将加载
2. 在 Ribbon 工具栏的第一个选项卡中找到"NewDesigner"按钮组
3. 点击"自定义下拉选择"下拉框，选择任意选项（如"选项1"）
4. 观察当前活动单元格，选中的值（如 1）会自动填充到单元格中
5. 切换到其他单元格，下拉框会根据单元格的值动态显示对应的选项文本

## 五、功能特点

### 5.1 优点

* 灵活的扩展机制：通过配置对象即可扩展设计器功能，无需修改核心代码
* 双向数据绑定：下拉框与单元格数据自动同步，提升用户体验
* 易于维护：命令配置集中管理，逻辑清晰

### 5.2 局限性与扩展建议

* 当前实现的下拉选项是静态配置的，可以扩展为从服务器动态加载选项数据
* 可以添加更多的验证逻辑，例如限制某些单元格只能通过下拉框输入
* 可以结合单元格样式，为不同的选项值设置不同的显示效果

## 六、总结

本示例展示了如何通过 SpreadJS Designer 的扩展 API 添加自定义的下拉选择框控件。开发者可以学习到：

* 如何扩展设计器的 Ribbon 工具栏
* 如何定义自定义命令并实现交互逻辑
* 如何实现 UI 控件与工作表数据的双向绑定
* 如何使用 `execute` 和 `getState` 方法控制命令的行为和状态

该方案适用于需要在设计器中添加自定义交互控件的场景，具有良好的扩展性，可以根据实际业务需求定制更复杂的控件和逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
