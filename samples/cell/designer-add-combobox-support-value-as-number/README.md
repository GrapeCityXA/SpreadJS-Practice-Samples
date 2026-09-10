## 一、Demo 概述

本示例演示了如何在 SpreadJS 设计器中为组合框单元格类型设置数字类型的值。在 V18 版本之前，通过设计器界面添加的组合框项目值默认为字符串类型，即使输入的是数字。本示例通过监听 `CellChanged` 事件，自动将组合框项目中的数字字符串转换为真正的数字类型，确保数据类型的准确性。 

该功能适用于需要在设计器中配置组合框，并且要求组合框的值为数字类型的场景，例如状态码选择、等级评分等业务需求。

## 二、解决的问题

在 SpreadJS 设计器中使用组合框单元格类型时，存在以下问题：

* 通过设计器 UI 界面添加的组合框项目，其值（value）默认被存储为字符串类型
* 即使用户在界面上输入的是纯数字（如 "1"、"2"），实际存储的仍然是字符串 "1"、"2"
* 这会导致后续的数据处理、计算或比较时出现类型不匹配的问题
* 在 V18 版本之前，没有原生的方式在设计器中直接设置数字类型的值

本示例通过事件监听和自动类型转换，解决了这一问题，确保组合框的值类型与业务需求一致。

## 三、实现思路

### 3.1 核心技术点

#### 监听单元格样式变化事件

通过监听 `CellChanged` 事件，捕获单元格类型的设置操作。当用户在设计器中为单元格设置组合框类型时，事件会被触发：

```javascript
spread.bind(GC.Spread.Sheets.Events.CellChanged, function (e, info) {
    if (info.propertyName != "[styleinfo]") {
        return
    }
    if (info.newValue && info.newValue.cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
        // 处理组合框类型转换
    }
});
```

关键点：

* `propertyName` 为 `"[styleinfo]"` 表示单元格样式信息发生变化
* 通过 `instanceof` 判断新设置的单元格类型是否为组合框

#### 自动转换数字字符串为数字类型

获取组合框的项目列表，遍历每个项目，将可以转换为数字的字符串值转换为真正的数字类型：

```javascript
info.sheet.suspendEvent()
let comboBox = info.sheet.getCellType(info.row, info.col)
comboBox.items(comboBox.items().map(v => {
    if (!isNaN(Number(v.value))) {
        v.value = Number(v.value)
    }
    return v
}))
info.sheet.setCellType(info.row, info.col, comboBox)
info.sheet.resumeEvent()
```

关键点：

* `suspendEvent()` 和 `resumeEvent()` 用于暂停和恢复事件触发，避免递归调用
* 使用 `isNaN(Number(v.value))` 判断值是否可以转换为数字
* 使用 `Number(v.value)` 进行类型转换
* 通过 `setCellType()` 重新设置单元格类型，应用转换后的配置

### 3.2 技术栈

* SpreadJS v17.0.8：核心表格组件
* SpreadJS Designer v17.0.8：设计器组件
* SystemJS：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，SpreadJS 设计器会自动加载
2. 选中单元格 B2
3. 在设计器顶部菜单中，依次点击"开始" → "样式" → "单元格编辑器" → "单元格类型" → "组合框"
4. 在组合框配置面板中，将"编辑值类型"设置为"值"
5. 添加两个或多个项目，其中至少一个项目的值设置为纯数字（如 1）
6. 点击"确定"按钮
7. 此时，代码会自动将数字字符串转换为数字类型
8. 可以通过控制台或后续操作验证值的类型已经是 `number` 而非 `string`

## 五、功能特点

### 5.1 优点

* 自动化处理：无需手动编写代码设置每个组合框的值类型，事件监听机制自动完成转换
* 类型准确性：确保数字值以正确的数据类型存储，避免后续数据处理中的类型错误
* 设计器友好：用户可以继续使用设计器的可视化界面配置组合框，无需切换到代码模式
* 兼容性好：适用于 V18 之前的版本，V18 及以后版本已原生支持此功能

### 5.2 局限性与扩展建议

* 本示例仅处理数字类型转换，如果需要支持其他类型（如布尔值、日期等），需要扩展转换逻辑
* 事件监听会在每次设置组合框时触发，如果有大量单元格需要设置，可能会有轻微的性能影响
* V18 及以后版本已原生支持数字类型值，建议升级到最新版本以获得更好的性能和原生支持

扩展建议：

* 可以添加配置选项，允许用户指定哪些列或区域需要自动转换
* 可以扩展支持更多数据类型的自动识别和转换
* 可以添加日志记录，方便调试和追踪转换过程

## 六、关键代码片段

### 完整的事件监听和类型转换逻辑

```javascript
// V18版本已原生支持，不需要以下代码
spread.bind(GC.Spread.Sheets.Events.CellChanged, function (e, info) {
    // 只处理样式信息变化
    if (info.propertyName != "[styleinfo]") {
        return
    }
    // 判断是否为组合框类型
    if (info.newValue && info.newValue.cellType instanceof GC.Spread.Sheets.CellTypes.ComboBox) {
        info.sheet.suspendEvent()  // 暂停事件，避免递归触发
        let comboBox = info.sheet.getCellType(info.row, info.col)
        // 遍历所有项目，转换数字字符串为数字类型
        comboBox.items(comboBox.items().map(v => {
            if (!isNaN(Number(v.value))) {
                v.value = Number(v.value)
            }
            return v
        }))
        info.sheet.setCellType(info.row, info.col, comboBox)  // 重新设置单元格类型
        info.sheet.resumeEvent()  // 恢复事件
    }
});
```

## 七、总结

本示例展示了如何通过事件监听机制，在 SpreadJS 设计器中实现组合框数字类型值的自动转换。开发者可以从中学到：

* SpreadJS 的 `CellChanged` 事件监听机制及其应用场景
* 如何判断和处理单元格类型变化
* 组合框单元格类型的配置和修改方法
* 事件暂停和恢复的使用技巧，避免递归触发
* 数据类型转换的实践方法

该方案适用于需要在设计器中配置组合框，并且对数据类型有严格要求的场景。对于 V18 及以后版本的用户，建议直接使用原生支持的功能。对于 V18 之前版本的用户，本示例提供了一个简洁有效的解决方案。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
