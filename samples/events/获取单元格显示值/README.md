## 一、Demo 概述

本示例演示了如何在 SpreadJS 中获取单元格的显示内容（格式化后的文本），而非单元格的原始值。这在处理日期、数字格式化等场景时尤为重要，因为用户看到的内容往往是经过格式化处理的显示文本，而非底层存储的原始数据。

该示例通过一个简单的交互界面，让用户选择单元格后点击按钮，即可获取该单元格的显示内容。特别针对日期类型的单元格，示例展示了如何正确获取其格式化后的文本信息。

## 二、解决的问题

- **区分显示值与原始值**：在电子表格应用中，单元格的显示内容和实际存储值可能不同（如日期格式化、数字千分位等），开发者需要准确获取用户看到的显示文本
- **日期格式化处理**：日期类型的单元格在 JavaScript 中以 Date 对象存储，但用户看到的是格式化后的字符串（如 "2026-02-11"），需要特殊处理才能获取显示文本

## 三、实现思路

### 3.1 核心技术点

#### 初始化工作簿并设置数据

示例首先创建 SpreadJS 工作簿实例，并在单元格中设置不同类型的数据，包括日期和普通文本：

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();
let date = new Date()
sheet.setValue(0,0,date)
sheet.setColumnWidth(0,120)
//设置日期格式
sheet.getCell(0,0).formatter('YYYY-MM-DD')
//给区域赋值
sheet.setArray(0,1,[['test',123],[5566,900,'grapecity']])
```

这里使用 `setValue()` 设置日期值，并通过 `formatter()` 方法为日期单元格设置格式化规则，使其显示为 "YYYY-MM-DD" 格式。

#### 获取单元格显示值的核心逻辑

关键在于区分日期类型和其他类型的单元格，使用不同的方法获取显示内容：

```javascript
function getValue(row,col){
     let value = sheet.getValue(row,col)
     //日期获取其格式化文本信息
    if(value && value instanceof Date){
        value = sheet.getText(row,col)
    }
    alert(value)
}
```

- 对于普通类型（字符串、数字等），`getValue()` 方法返回的就是显示值
- 对于日期类型，`getValue()` 返回的是 Date 对象，需要使用 `getText()` 方法获取格式化后的文本

#### 获取用户选择的单元格

通过 `getSelections()` 方法获取用户当前选中的单元格区域，并提取第一个选区的行列坐标：

```javascript
document.getElementById("btn").addEventListener("click", function() {
    let selection = sheet.getSelections()
    if(!selection || !selection[0]) {
        alert("请先选择单元格")
        return
    }
    getValue(selection[0].row, selection[0].col)
})
```

### 3.2 技术栈

- **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
- **SystemJS**: 0.19.22 - 模块加载器
- **TypeScript**: 4.1.2 - 类型支持（项目配置支持，但本示例使用 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到表格中已预置了一些数据（第一列是格式化的日期，其他列是文本和数字）
2. 用鼠标点击选择任意单元格
3. 点击页面顶部的"获取"按钮
4. 弹窗将显示该单元格的显示内容（对于日期单元格，显示的是格式化后的文本，如 "2026-02-11"）

## 五、功能特点

### 5.1 优点

- **准确获取显示值**：正确区分了原始值和显示值，特别是对日期类型的特殊处理
- **代码简洁**：核心逻辑仅需几行代码，易于理解和集成到实际项目中
- **实用性强**：在数据导出、报表生成等场景中，获取显示值是常见需求

### 5.2 局限性与扩展建议

- **仅处理单个单元格**：当前实现只获取选区的第一个单元格，可扩展为批量获取多个单元格的显示值
- **格式化类型有限**：示例仅演示了日期格式化，实际应用中还可能涉及数字格式化（货币、百分比等），可根据 `getCellType()` 进一步扩展判断逻辑

## 六、关键代码片段

### 核心方法：区分 getValue 和 getText

```javascript
function getValue(row,col){
     let value = sheet.getValue(row,col)
     //日期获取其格式化文本信息
    if(value && value instanceof Date){
        value = sheet.getText(row,col)
    }
    alert(value)
}
```

这段代码是整个示例的核心，展示了 SpreadJS 中获取显示值的关键技巧：
- `getValue()` 返回单元格的原始数据类型
- `getText()` 返回单元格的格式化显示文本
- 通过 `instanceof Date` 判断是否为日期类型，决定使用哪个方法

## 七、总结

本示例虽然简单，但揭示了 SpreadJS 中一个重要的概念：单元格的原始值（value）与显示文本（text）的区别。开发者可以从中学到：

- 如何使用 `getValue()` 和 `getText()` 方法
- 如何判断单元格数据类型并做相应处理
- 如何获取用户选中的单元格区域

该方案适用于所有需要获取单元格显示内容的场景，如数据导出、内容复制、报表生成等。代码可直接复用到实际项目中，并根据需要扩展为批量处理或支持更多格式化类型。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/BlLV_vAPmEys0rOJ23dYqw/)）
