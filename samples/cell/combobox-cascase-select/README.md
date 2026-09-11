## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现级联下拉选择功能。通过监听单元格值变化事件，根据第一个下拉框的选择动态设置第二个下拉框的选项，实现省市二级联动效果。该功能常用于表单填写、数据录入等需要层级关联选择的场景。 

## 二、解决的问题

* 实现下拉选择的级联联动，根据上级选择动态更新下级选项
* 提升数据录入的准确性和用户体验，避免无效的选项组合
* 简化复杂层级数据的选择流程

## 三、实现思路

### 3.1 创建 ComboBox 单元格类型

使用 SpreadJS 的 `CellTypes.ComboBox` 创建下拉选择框，并为不同层级配置对应的选项数据：

```javascript
// 创建省份下拉框
const comboProvince = new GC.Spread.Sheets.CellTypes.ComboBox()
comboProvince.items([
    { text: '123 陕西', value: '123 陕西' },
    { text: '456 广东', value: '456 广东' },
])

// 创建陕西城市下拉框
const comboShannxi = new GC.Spread.Sheets.CellTypes.ComboBox()
comboShannxi.items([
    { text: '123 西安', value: '123 西安' },
    { text: '456 宝鸡', value: '456 宝鸡' },
])

// 创建广东城市下拉框
const comboGuangdong = new GC.Spread.Sheets.CellTypes.ComboBox()
comboGuangdong.items([
    { text: '123 广州', value: '123 广州' },
    { text: '456 深圳', value: '456 深圳' },
])
```

### 3.2 设置初始单元格类型

将省份下拉框应用到 A1 单元格：

```javascript
sheet.setCellType(0, 0, comboProvince, GC.Spread.Sheets.SheetArea.viewport)
```

### 3.3 监听值变化事件实现级联

通过 `ValueChanged` 事件监听 A1 单元格的值变化，根据选择的省份动态设置 B1 单元格的城市下拉框：

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, (e, info) => {
    if (info.row === 0 && info.col === 0) {
        const value = info.newValue
        if (value === '123 陕西') {
            sheet.setCellType(0, 1, comboShannxi, GC.Spread.Sheets.SheetArea.viewport)
        } else if (value === '456 广东') {
            sheet.setCellType(0, 1, comboGuangdong, GC.Spread.Sheets.SheetArea.viewport)
        }
    }
})
```

### 3.4 技术栈

* @grapecity/spread-sheets: 17.0.8（核心表格组件）
* SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，点击 A1 单元格的下拉箭头
2. 选择一个省份（如"123 陕西"或"456 广东"）
3. 点击 B1 单元格，会自动显示对应省份的城市下拉选项
4. 选择具体城市完成二级联动选择

## 五、功能特点

### 5.1 优点

* 实现简单，代码逻辑清晰易懂
* 动态响应用户选择，提升交互体验
* 可扩展性强，易于添加更多层级或选项

### 5.2 局限性与扩展建议

* 当前实现使用硬编码的选项数据，实际应用中建议从后端 API 或配置文件动态加载
* 仅支持二级联动，如需三级或更多层级，需要扩展事件监听逻辑
* 可以考虑添加清空下级选项的逻辑，当上级选项变更时重置下级单元格的值

## 六、关键代码片段

完整的级联逻辑实现：

```javascript
// 设置省份下拉框
sheet.setCellType(0, 0, comboProvince, GC.Spread.Sheets.SheetArea.viewport)

// 监听值变化事件
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, (e, info) => {
    // 判断是否为目标单元格（A1）
    if (info.row === 0 && info.col === 0) {
        const value = info.newValue
        // 根据省份选择设置对应的城市下拉框
        if (value === '123 陕西') {
            sheet.setCellType(0, 1, comboShannxi, GC.Spread.Sheets.SheetArea.viewport)
        } else if (value === '456 广东') {
            sheet.setCellType(0, 1, comboGuangdong, GC.Spread.Sheets.SheetArea.viewport)
        }
    }
})
```

## 七、总结

本示例展示了 SpreadJS 中实现级联下拉选择的核心技术。开发者可以学到：

* ComboBox 单元格类型的创建和配置方法
* ValueChanged 事件的监听和处理机制
* 动态设置单元格类型的 API 使用方式

该方案适用于需要层级关联选择的数据录入场景，如地区选择、分类筛选、产品规格选择等。通过扩展事件监听逻辑和数据源配置，可以轻松实现多级联动和更复杂的业务需求。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
