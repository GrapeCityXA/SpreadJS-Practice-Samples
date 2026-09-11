## 一、Demo 概述

本示例展示了如何使用 SpreadJS 将多个 Excel 文件的 ActiveSheet 合并导入到同一个工作簿中。用户可以通过文件选择器一次性选择多个 Excel 文件，点击导入按钮后，系统会自动将每个文件的活动工作表提取出来，并按顺序添加到当前工作簿的不同 Sheet 中。同时支持导出整个工作簿或仅导出当前活动工作表。

该示例适用于需要整合多个 Excel 文件数据的场景，例如汇总不同部门的报表、合并多个数据源等业务需求。

## 二、解决的问题

- **批量文件导入**：支持一次性选择多个 Excel 文件进行导入，避免逐个文件手动操作
- **智能工作表提取**：自动提取每个文件的 ActiveSheet，无需手动选择工作表
- **工作簿合并**：将多个文件的工作表整合到一个工作簿中，便于统一查看和管理
- **灵活导出**：支持导出完整工作簿或单独导出当前活动工作表，满足不同的导出需求

## 三、实现思路

### 3.1 递归导入多文件

核心实现采用递归方式逐个处理文件列表，确保每个文件的导入操作完成后再处理下一个文件。

```javascript
function importExcels(spread, index, files, count) {
    let file = files[index];
    var tempSpread = new GC.Spread.Sheets.Workbook();
    tempSpread.import(file, function () {
        var tempSheet = tempSpread.getActiveSheet();
        tempSheet.name("Sheet" + (index + 1));
        spread.getSheet(index).fromJSON(tempSheet.toJSON())
        if (index < count) {
            importExcels(spread, index + 1, files, count);
        } else {
            spread.setActiveSheetIndex(0)
        }
    })
}
```

该函数通过以下步骤实现批量导入：
1. 创建临时工作簿对象用于加载单个文件
2. 使用 `import()` 方法异步导入文件
3. 获取临时工作簿的 ActiveSheet 并重命名
4. 通过 `toJSON()` 和 `fromJSON()` 将工作表数据复制到目标工作簿
5. 递归调用处理下一个文件，直到所有文件处理完成

### 3.2 动态调整工作表数量

在导入前根据选择的文件数量动态设置工作簿的 Sheet 数量，确保有足够的工作表容纳所有导入的数据。

```javascript
$("#loadExcel").click(function () {
    var excelFiles = document.getElementById("fileDemo").files;
    if (excelFiles.length > 0) {
        spread.setSheetCount(excelFiles.length);
        importExcels(spread, 0, excelFiles, excelFiles.length)
    }
});
```

### 3.3 单工作表导出实现

导出 ActiveSheet 时，通过创建临时工作簿并删除其他工作表的方式实现单表导出。

```javascript
$("#saveActiveSheet").click(function () {
    var fileName = $("#exportFileName").val();
    if (fileName.substr(-5, 5) !== '.xlsx') {
        fileName += '.xlsx';
    }
    var json = JSON.stringify(spread.toJSON());
    
    var tempSpread = new GC.Spread.Sheets.Workbook();
    tempSpread.fromJSON(JSON.parse(json));
    var index = tempSpread.getActiveSheetIndex();
    // 删除活动工作表之后的所有工作表
    for (var i = tempSpread.getSheetCount() - 1; i > index; i--) {
        tempSpread.removeSheet(i);
    }
    // 删除活动工作表之前的所有工作表
    for (var i = 0; i < index; i++) {
        tempSpread.removeSheet(0);
    }
    tempSpread.export(function (blob) {
        saveAs(blob, fileName);
    }, function (e) {
        // process error
    });
});
```

### 3.4 技术栈

- SpreadJS 16.2.0：核心表格组件
- @grapecity/spread-sheets-io 16.2.0：Excel 文件导入导出模块
- jQuery 3.6.1：DOM 操作和事件处理
- FileSaver.js：文件下载保存
- SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 点击"选择文件"按钮，在文件选择器中按住 Ctrl 或 Shift 键选择多个 Excel 文件
2. 点击"导入 Excel"按钮，系统会自动将所有文件的 ActiveSheet 导入到工作簿中
3. 查看和编辑导入的工作表数据
4. 在"请输入导出文件名称"输入框中输入文件名（可选，默认为 export.xlsx）
5. 点击"导出 WorkBook"导出完整工作簿，或点击"导出 ActiveSheet"仅导出当前活动工作表

## 五、功能特点

### 5.1 优点

- **批量处理效率高**：支持一次性导入多个文件，大幅提升工作效率
- **自动化程度高**：自动提取 ActiveSheet 并重命名，无需手动干预
- **数据整合便捷**：将分散的数据源集中到一个工作簿中，便于对比分析
- **导出方式灵活**：支持全量导出和单表导出两种模式

### 5.2 局限性与扩展建议

- **工作表命名简单**：当前使用 Sheet1、Sheet2 等默认命名，可以考虑使用原文件名作为工作表名称
- **错误处理不完善**：缺少文件格式校验和导入失败的错误提示
- **扩展建议**：
  - 添加导入进度提示，显示当前处理的文件和进度百分比
  - 支持选择导入特定工作表而非仅限 ActiveSheet
  - 增加文件大小和数量限制，避免浏览器内存溢出

## 六、关键代码片段

### 6.1 文件选择器配置

```html
<input type="file" id="fileDemo" class="input" multiple="multiple" 
       accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
```

通过 `multiple` 属性支持多文件选择，`accept` 属性限制只能选择 Excel 文件。

### 6.2 工作簿导出

```javascript
$("#saveExcel").click(function () {
    var fileName = $("#exportFileName").val();
    if (fileName.substr(-5, 5) !== '.xlsx') {
        fileName += '.xlsx';
    }
    spread.export(function (blob) {
        saveAs(blob, fileName);
    }, function (e) {
        // process error
    });
});
```

使用 SpreadJS 的 `export()` 方法将工作簿导出为 Excel 文件，通过 FileSaver.js 触发浏览器下载。

## 七、总结

本示例展示了 SpreadJS 在批量文件处理场景中的应用，通过递归导入、JSON 序列化和临时工作簿等技术手段，实现了多文件合并和灵活导出功能。开发者可以从中学习到：

- SpreadJS 的文件导入导出 API 使用方法
- 异步操作的递归处理模式
- 工作表的 JSON 序列化和反序列化技术
- 临时工作簿在数据处理中的应用技巧

该方案适用于需要整合多个 Excel 文件的数据汇总场景，具有良好的扩展性，可以根据实际需求添加更多的数据处理和校验逻辑。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
