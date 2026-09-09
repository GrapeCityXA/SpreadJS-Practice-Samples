## 一、Demo 概述

本示例演示了如何使用 SpreadJS 实现 Excel 模板的导出、填报和数据绑定功能。用户可以导出一个预设了数据绑定路径的 Excel 模板，在本地 Excel 中填写数据后，再将填写好的文件导入回 SpreadJS，系统会自动将填写的数据绑定到指定的数据源对象中。

这种方式特别适用于需要用户在熟悉的 Excel 环境中填写数据，然后将数据导入到 Web 应用中进行后续处理的场景，如数据采集、表单填报、批量数据录入等业务需求。

## 二、解决的问题

该示例解决了以下实际业务问题：

1. **Excel 模板填报**：允许用户在本地 Excel 中填写数据，而不是在 Web 界面中操作，提升用户体验
2. **数据绑定自动化**：通过预设的 bindingPath，导入数据时自动映射到数据源对象，无需手动解析
3. **离线数据采集**：支持用户离线填写数据，然后批量导入系统

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 预设数据绑定路径的模板

在模板 JSON 中，通过 `bindingPath` 属性为单元格预设数据绑定路径：

```javascript
"1": {
  "1": {"value": "姓名"},
  "2": {
    "style": {...},
    "bindingPath": "name"  // 绑定到数据源的 name 属性
  }
},
"3": {
  "1": {"value": "年龄"},
  "2": {
    "style": {...},
    "bindingPath": "age"   // 绑定到数据源的 age 属性
  }
}
```

这样设置后，当用户在 B2 单元格填写姓名、B4 单元格填写年龄时，导入后会自动映射到数据源对象的对应属性。

#### 3.1.2 导出 Excel 模板

使用 SpreadJS 的 `export` 方法将包含数据绑定信息的工作簿导出为 Excel 文件：

```javascript
document.getElementById("exportExcel").addEventListener("click", function () {
    spread.export(function (blob) {
        saveAs(blob, "模板.xlsx");
        document.getElementById("exportExcel").style.display = "none"
        document.getElementById("file").style.display = "inline-block"
    }, function (e) {
        console.log(e);
    }, {
        fileType: GC.Spread.Sheets.FileType.excel
    });
})
```

导出的 Excel 文件会保留 bindingPath 信息，用户在本地填写数据后保存。

#### 3.1.3 导入 Excel 并自动绑定数据

导入用户填写的 Excel 文件，读取数据后设置到当前工作表，并通过 `CellBindingSource` 自动完成数据绑定：

```javascript
document.getElementById("file").addEventListener("change", function () {
    let tempSpread = new GC.Spread.Sheets.Workbook()
    tempSpread.import(this.files[0], function () {
        let tempSheet = tempSpread.getActiveSheet()
        let ur = tempSheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data)
        let arr = tempSheet.getArray(ur.row, ur.col, ur.rowCount, ur.colCount)

        let curSheet = spread.getActiveSheet()
        curSheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({}))
        curSheet.setArray(ur.row, ur.col, arr)
        alert("请打开F12查看当前sheet的数据源")
        console.log(curSheet.getDataSource().getSource())
    }, function () { }, {
        fileType: GC.Spread.Sheets.FileType.excel
    })
})
```

关键步骤：
1. 创建临时工作簿导入 Excel 文件
2. 获取已使用区域的数据数组
3. 为当前工作表设置空的 `CellBindingSource`
4. 使用 `setArray` 将数据填充到工作表，SpreadJS 会根据预设的 bindingPath 自动更新数据源对象

#### 3.1.4 数据源对象的自动生成

通过 `CellBindingSource` 和预设的 bindingPath，SpreadJS 会自动将单元格数据映射到数据源对象：

```javascript
// 初始数据源为空对象
curSheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource({}))

// 填充数据后，数据源对象自动更新为：
// { name: "用户填写的姓名", age: "用户填写的年龄" }
console.log(curSheet.getDataSource().getSource())
```

### 3.2 UI 交互流程

1. 用户点击"导出 excel"按钮 → 下载模板文件（模板.xlsx）
2. 导出按钮隐藏，文件选择控件显示
3. 用户在本地 Excel 中打开模板，填写姓名和年龄，保存文件
4. 用户点击文件选择控件，选择填写好的 Excel 文件
5. 系统导入文件，自动完成数据绑定
6. 弹出提示，用户可在控制台查看绑定后的数据源对象

### 3.3 技术栈

- **@grapecity/spread-sheets**: 16.0.1 - SpreadJS 核心库
- **@grapecity/spread-sheets-io**: 16.0.1 - Excel 导入导出功能
- **FileSaver.js**: 2.0.5 - 文件下载功能
- **SystemJS**: 0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 点击"导出 excel"按钮，下载模板文件
3. 在本地使用 Excel 打开下载的"模板.xlsx"文件
4. 在 B2 单元格填写姓名（如"张三"），在 B4 单元格填写年龄（如"25"）
5. 保存 Excel 文件
6. 返回浏览器，点击文件选择控件，选择刚才填写的 Excel 文件
7. 系统提示"请打开 F12 查看当前 sheet 的数据源"
8. 打开浏览器控制台，查看输出的数据源对象，应显示类似：`{ name: "张三", age: "25" }`

## 五、功能特点

### 5.1 优点

1. **用户体验友好**：允许用户在熟悉的 Excel 环境中填写数据，降低学习成本
2. **数据绑定自动化**：通过 bindingPath 预设绑定路径，导入时自动完成数据映射，无需手动解析
3. **实现简洁**：核心代码不到 40 行，易于理解和维护
4. **扩展性强**：可以轻松扩展到更复杂的表单结构和多字段绑定场景

### 5.2 局限性与扩展建议

**局限性**：
- 当前示例仅支持简单的键值对绑定，不支持嵌套对象或数组结构
- 没有数据验证机制，用户可能填写不符合要求的数据

**扩展建议**：
1. 添加数据验证规则，确保用户填写的数据符合业务要求
2. 支持更复杂的数据结构，如嵌套对象、数组等
3. 增加错误处理机制，对导入失败的情况给出友好提示
4. 支持批量导入多个 Excel 文件

## 六、关键代码片段

### 6.1 初始化工作簿并加载模板

```javascript
import * as GC from "@grapecity/spread-sheets";
import "@grapecity/spread-sheets-io";
import { template } from "./template.js"

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.fromJSON(template)
```

### 6.2 获取已使用区域并提取数据

```javascript
let tempSheet = tempSpread.getActiveSheet()
let ur = tempSheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data)
let arr = tempSheet.getArray(ur.row, ur.col, ur.rowCount, ur.colCount)
```

`getUsedRange` 方法可以自动识别包含数据的区域，避免手动指定范围。

## 七、总结

本示例展示了 SpreadJS 在 Excel 模板填报和数据绑定场景中的应用。通过预设 bindingPath，实现了从 Excel 文件到数据源对象的自动映射，大大简化了数据采集和导入的流程。

**学习价值**：
1. 掌握 SpreadJS 的 Excel 导入导出功能
2. 理解 CellBindingSource 的数据绑定机制
3. 学习如何通过 bindingPath 实现单元格与数据源的自动映射
4. 了解 getUsedRange 和 getArray 方法的使用

**适用场景**：
- 需要用户在 Excel 中填写数据的表单系统
- 批量数据采集和导入场景
- 离线数据填报后在线提交的业务流程
- 需要保留 Excel 操作习惯的 Web 应用

该方案特别适合需要结合 Excel 强大的编辑能力和 Web 应用数据处理能力的场景，可以作为企业级数据采集系统的技术参考。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/k1GwLjyhg0eQJzW1u8Cf2A/)）
