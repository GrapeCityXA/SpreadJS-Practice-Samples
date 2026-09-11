## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现跨工作簿的公式引用功能。通过导入包含外部引用的 Excel 文件，用户可以查看、管理和更新跨工作簿的公式链接，并动态更新外部数据源，实现多个工作簿之间的数据联动。

该功能适用于需要在多个独立工作簿之间建立数据关联的场景，例如财务报表汇总、多部门数据整合等业务需求。

## 二、解决的问题

* **跨工作簿数据引用**：支持在一个工作簿中引用另一个工作簿的单元格数据，实现多文件数据联动
* **外部引用管理**：提供可视化界面查看和管理所有外部工作簿引用关系
* **动态数据更新**：允许用户上传新的数据源文件（.xlsx 或 .ssjson 格式），实时更新引用的外部数据
* **公式自动生成**：通过选择外部工作簿的单元格区域，自动生成跨工作簿引用公式

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 导入包含外部引用的 Excel 文件

使用 SpreadJS 的 `import` 方法导入 Excel 文件，并在导入成功后调用 `showLinkList` 方法展示所有外部引用：

```javascript
spread.import(file, function(){
    showLinkList(spread);
},function(err){
    console.log(err)
},{fileType: GC.Spread.Sheets.FileType.excel})
```

#### 3.1.2 获取和展示外部引用列表

通过 `getExternalReferences()` 方法获取工作簿中的所有外部引用，并动态生成表格展示：

```javascript
function showLinkList(spread) {
    let table = document.getElementById("states-table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    spread.getExternalReferences().forEach(item => {
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.appendChild(document.createTextNode(item.name));
        tr.appendChild(td);
        // 添加文件路径和更新按钮
        // ...
        table.appendChild(tr);
   });
}
```

每个外部引用包含 `name`（文件名）和 `filePath`（文件路径）信息，并为每个引用提供文件上传控件用于更新数据源。

#### 3.1.3 更新外部引用数据

使用 `updateExternalReference` 方法更新外部工作簿的数据：

```javascript
function updateExternalLink(e, spread) {
    let item = JSON.parse(e.target.getAttribute("info"));
    selectedItem = item;
    readJSONFromFile(e.target, function(json) {
        spread.updateExternalReference(item.name, json, item.filePath);
    });
}
```

该方法接受三个参数：外部工作簿名称、工作簿 JSON 数据、文件路径。更新后，所有引用该外部工作簿的公式会自动重新计算。

#### 3.1.4 创建跨工作簿引用公式

通过选择外部工作簿的单元格区域，自动生成跨工作簿引用公式：

```javascript
function setExtFormula(spread, sub_spread){
    var targetSheet = spread.getActiveSheet();
    var extSheet = sub_spread.getActiveSheet();
    var selectedRanges = extSheet.getSelections();
    var formula = GC.Spread.Sheets.CalcEngine.rangesToFormula(
        selectedRanges, 0, 0, 
        GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allAbsolute
    );
    formula = `='${selectedItem.filePath}[${selectedItem.name}]${extSheet.name()}'!${formula}`;
    targetSheet.setFormula(
        targetSheet.getActiveRowIndex(), 
        targetSheet.getActiveColumnIndex(), 
        formula
    );
    
    spread.updateExternalReference(selectedItem.name, sub_spread.toJSON(), selectedItem.filePath);
}
```

公式格式为：`='文件路径[文件名]工作表名'!单元格引用`，例如 `='[Ext1.xlsx]Sheet1'!$A$1`。

#### 3.1.5 支持多种文件格式

示例支持导入 `.xlsx` 和 `.ssjson` 两种格式的文件作为外部数据源：

```javascript
function readJSONFromFile(input, callback) {
    var file = input.files[0];
    if (file) {
        var fileName = file.name;
        var suffix = fileName.substr(fileName.lastIndexOf('.')).toLowerCase();
        if (suffix === '.xlsx') {
            sub_spread.import(file, function () {
                let json = sub_spread.toJSON();
                callback(json);
            }, function (e) {
                console.log(e);
            }, {fileType: GC.Spread.Sheets.FileType.excel});
        } else if (suffix === '.ssjson') {
            var reader = new FileReader();
            reader.onload = function () {
                let json = JSON.parse(this.result)
                sub_spread.fromJSON(json)
                callback(json);
            };
            reader.readAsText(file);
        }
    }
}
```

### 3.2 UI 交互流程

1. 用户点击"导入"按钮，选择包含跨工作簿引用的 Excel 文件
2. 系统导入文件并在右侧面板展示所有外部引用列表
3. 用户可以在下方的子工作簿中选择单元格区域
4. 点击"Set External Formula"按钮，在主工作簿的当前单元格创建跨工作簿引用公式
5. 用户可以通过表格中的"Update source"列上传新的数据源文件
6. 系统自动更新外部引用数据，所有相关公式重新计算

### 3.3 技术栈

* SpreadJS 16.2.1：核心表格组件
* SpreadJS IO 16.2.1：文件导入导出功能
* SystemJS 0.19.22：模块加载器
* TypeScript 4.1.2：开发语言

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 准备一个包含跨工作簿引用的 Excel 文件（例如包含 `='[Ext1.xlsx]Sheet1'!A1` 这样的公式）
2. 点击"导入"按钮，选择该 Excel 文件
3. 导入成功后，右侧表格会显示所有外部引用的工作簿信息
4. 在下方的子工作簿中选择要引用的单元格区域
5. 点击"Set External Formula"按钮，在主工作簿的当前单元格创建引用公式
6. 如需更新外部数据源，点击表格中对应行的"Update source"列的文件选择按钮，上传新的 .xlsx 或 .ssjson 文件
7. 系统会自动更新数据并重新计算所有相关公式

## 五、功能特点

### 5.1 优点

* **完整的外部引用支持**：完全兼容 Excel 的跨工作簿引用语法，可以无缝导入和处理包含外部引用的 Excel 文件
* **可视化管理**：提供直观的界面查看和管理所有外部引用关系，避免手动编写复杂的引用公式
* **灵活的数据更新**：支持动态更新外部数据源，无需重新创建公式，适合数据频繁变化的场景
* **多格式支持**：同时支持 Excel 原生格式（.xlsx）和 SpreadJS 专有格式（.ssjson），提供更多选择

### 5.2 局限性与扩展建议

* **本地文件依赖**：当前实现依赖用户手动上传外部数据源文件，可以扩展为支持从服务器自动加载外部工作簿
* **引用路径管理**：文件路径信息需要手动维护，可以考虑实现自动路径解析和更新机制
* **性能优化**：对于大量外部引用的场景，可以考虑实现延迟加载和缓存机制

## 六、总结

本示例展示了 SpreadJS 强大的跨工作簿引用能力，开发者可以学到以下知识点：

1. 使用 `getExternalReferences()` 获取工作簿的外部引用信息
2. 使用 `updateExternalReference()` 动态更新外部数据源
3. 使用 `rangesToFormula()` 将单元格区域转换为公式字符串
4. 构建符合 Excel 规范的跨工作簿引用公式格式
5. 处理多种文件格式（.xlsx 和 .ssjson）的导入和转换

该方案适用于需要在多个工作簿之间建立数据关联的场景，具有良好的扩展性，可以根据实际需求进一步优化和定制。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
