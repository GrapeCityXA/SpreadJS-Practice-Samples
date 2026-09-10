## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中自定义文件上传功能，通过在单元格中嵌入按钮控件，实现用户友好的文件选择和上传交互。该方案将传统的 HTML 文件上传控件与 SpreadJS 的单元格按钮类型结合，使文件上传功能无缝集成到表格应用中。 

## 二、解决的问题

* 在表格应用中需要用户上传文件时，传统的 HTML `<input type="file">` 控件与表格界面风格不统一
* 需要在表格内部直接触发文件选择操作，而不是跳转到外部界面
* 需要将选中的文件信息直接显示在表格单元格中，方便用户查看和管理
* 需要为上传操作提供独立的触发按钮，实现选择和上传的分离控制

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 单元格按钮类型定义

使用 SpreadJS 的 `CellTypes.Button` 创建两个按钮单元格，分别用于文件选择和上传操作：

```javascript
var b1 = new GC.Spread.Sheets.CellTypes.Button();
b1.text('选择文件');
sheet.setCellType(3, 3, b1, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(3);
sheet.autoFitRow(3);

var b2 = new GC.Spread.Sheets.CellTypes.Button();
b2.text('上传');
sheet.setCellType(3, 4, b2, GC.Spread.Sheets.SheetArea.viewport);
sheet.autoFitColumn(4);
```

#### 3.1.2 按钮点击事件处理

通过监听 `ButtonClicked` 事件，根据按钮文本判断用户操作，触发相应的功能：

```javascript
spread.bind(GC.Spread.Sheets.Events.ButtonClicked, function (e, args) {
    var sheet = args.sheet, row = args.row, col = args.col;
    var cellType = sheet.getCellType(row, col);
    if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
        if(cellType.text()=="选择文件"){
            $("#file").click();  // 触发隐藏的文件选择控件
        }
        if(cellType.text()=="上传"){
            alert("test ok")  // 执行上传逻辑
        }
    }
});
```

#### 3.1.3 文件信息展示

监听文件选择控件的 `change` 事件，将选中的文件名批量写入表格单元格，并添加边框样式：

```javascript
$("#file").change(function () {
    spread.suspendPaint();  // 暂停绘制以提升性能
    var uploadFileArr = document.getElementById("file").files;
    for(var i=0; i<uploadFileArr.length; i++){
        sheet.setValue(3+i, 2, uploadFileArr[i].name);
        sheet.getCell(3+i, 2, GC.Spread.Sheets.SheetArea.viewport)
            .setBorder(new GC.Spread.Sheets.LineBorder("black", 
                GC.Spread.Sheets.LineStyle.thick), { all:true }, 3);
    }
    sheet.autoFitColumn(2);
    spread.resumePaint();  // 恢复绘制
});
```

### 3.2 UI 交互流程

用户点击"选择文件"按钮 → 触发隐藏的 `<input type="file">` 控件 → 用户在系统文件选择对话框中选择文件 → 文件名自动显示在表格单元格中 → 用户点击"上传"按钮 → 执行上传逻辑

### 3.3 技术栈

* SpreadJS 15.0.0（核心表格引擎）
* jQuery 3.6.1（DOM 操作和事件处理）
* SystemJS 0.19.22（模块加载）
* TypeScript 4.1.2（开发语言支持）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，在表格的 D4 单元格可以看到"选择文件"按钮，E4 单元格可以看到"上传"按钮
2. 点击"选择文件"按钮，系统会弹出文件选择对话框
3. 选择一个或多个文件（支持多选）
4. 选中的文件名会自动显示在 C4 及以下单元格中，每个文件占一行
5. 点击"上传"按钮，触发上传逻辑（当前为测试提示）

## 五、功能特点

### 5.1 优点

* 界面统一：文件上传功能完全集成在表格界面中，无需额外的 UI 组件
* 用户体验好：通过单元格按钮触发文件选择，操作直观自然
* 支持多文件：可以一次选择多个文件，并自动在表格中逐行展示
* 性能优化：使用 `suspendPaint` 和 `resumePaint` 批量更新单元格，避免频繁重绘

### 5.2 局限性与扩展建议

* 当前上传按钮仅为演示，实际应用需要实现真实的文件上传逻辑（如使用 FormData 和 AJAX）
* 文件信息展示较简单，可以扩展显示文件大小、类型、上传进度等
* 可以添加文件删除功能，允许用户移除已选择的文件
* 可以增加文件类型和大小的验证逻辑

## 六、关键代码片段

### 隐藏的文件选择控件

```html
<input id="file" type="file" multiple="multiple" style="display:none"/>
```

通过 `display:none` 隐藏原生文件选择控件，通过 jQuery 的 `click()` 方法在需要时触发，实现了界面的统一性。

## 七、总结

本示例展示了如何将传统的 HTML 文件上传功能与 SpreadJS 表格控件深度集成，开发者可以从中学到：

* SpreadJS 单元格按钮类型的使用方法
* 如何通过事件监听实现按钮交互逻辑
* 如何将外部 DOM 元素与 SpreadJS 结合使用
* 批量更新单元格时的性能优化技巧

该方案适用于需要在表格应用中集成文件上传功能的场景，如批量导入数据、附件管理等。通过扩展上传逻辑和文件信息展示，可以构建完整的文件管理系统。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
