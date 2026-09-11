## 一、Demo 概述

本示例展示了如何在 SpreadJS 表格中集成 ECharts 图表库，实现数据表格与可视化图表的联动展示，并支持将包含图表的工作表导出为 PDF 文件。示例中创建了三种类型的 ECharts 图表（柱状图、饼图、折线图），通过 SpreadJS 的浮动对象（FloatingObject）机制将图表嵌入到表格中，当用户修改表格数据时，图表会自动更新。 

该示例适用于需要在电子表格中展示动态数据可视化，并需要将可视化结果导出为 PDF 进行分享或存档的场景。

## 二、解决的问题

* **第三方图表库集成**：SpreadJS 内置图表功能有限，通过集成 ECharts 可以使用更丰富的图表类型和交互效果
* **数据与图表联动**：表格数据变化时，图表需要实时更新，保持数据一致性
* **图表导出 PDF**：ECharts 图表是基于 Canvas 渲染的，无法直接通过 SpreadJS 的 PDF 导出功能输出，需要特殊处理
* **懒加载优化**：大量图表同时渲染会影响性能，需要在用户滚动到图表位置时才进行加载

## 三、实现思路

### 3.1 使用浮动对象嵌入 ECharts 图表

SpreadJS 的 FloatingObject 允许在表格上层添加自定义 DOM 元素。通过创建包含 ECharts 容器的浮动对象，可以将图表精确定位到指定的单元格区域：

```javascript
function initFloatingObject(sheet, chart) {
    // 初始化浮动对象
    var customFloatingObject = new GC.Spread.Sheets.FloatingObjects.FloatingObject(chart.id);
    customFloatingObject.startRow(chart.startRow);
    customFloatingObject.startColumn(chart.startColumn);
    customFloatingObject.endColumn(chart.endColumn);
    customFloatingObject.endRow(chart.endRow);

    // 创建ECharts容器
    var div = document.createElement('div');
    div.innerHTML = '<div id="' + chart.id + '" style="width: 500px;height:300px; "></div>';
    $(div).css({
        background: "#FFFFFF"
    });
    // 将ECharts添加到浮动层中
    customFloatingObject.content(div);
    sheet.floatingObjects.add(customFloatingObject);
}
```

### 3.2 数据表格与图表的双向绑定

通过 SpreadJS 的 Table 功能创建数据源，并监听 `ValueChanged` 事件实现数据变化时图表的自动更新：

```javascript
// 创建数据表格
var chartTable = sheet.tables.addFromDataSource(
    chart.tableName, 
    chart.startRow + 1, 
    1, 
    chart.source, 
    GC.Spread.Sheets.Tables.TableThemes.medium2
);

// 监听数据变化事件
spread.bind(GC.Spread.Sheets.Events.ValueChanged, function (s, e) {
    var row = e.row;
    var col = e.col;

    for (var chart in charts) {
        var range = new GC.Spread.Sheets.Range(
            charts[chart].table.row, 
            charts[chart].table.col, 
            charts[chart].table.rowCount, 
            charts[chart].table.colCount
        );
        if (range.contains(row, col, 1, 1)) {
            refreshCharts(charts[chart].id, getChartDataFromTables(charts[chart].source));
            break;
        }
    }
});
```

### 3.3 懒加载机制优化性能

利用 `TopRowChanged` 事件监听滚动条位置，只在图表即将进入可视区域时才初始化 ECharts 实例：

```javascript
spread.bind(GC.Spread.Sheets.Events.TopRowChanged, function (s, e) {
    var newTopRow = e.newTopRow;

    if ((charts["bar"].startRow - defaultShowRows < newTopRow) && (!charts["bar"].echart)) {
        initCharts(charts["bar"]);
    }
    // 其他图表同理...
});
```

### 3.4 导出 PDF 时将图表转换为图片

由于 ECharts 图表无法直接导出到 PDF，需要先将图表转换为 Base64 图片，再替换浮动对象为 Picture 对象：

```javascript
$("#exportPDF").click(function () {
    // 深拷贝工作簿，避免影响原始数据
    tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON({
        includeBindingSource: true
    }))));
    
    let tempSheet = tempSpread.getSheet(0);

    for (var chart in charts) {
        // 删除浮动对象
        tempSheet.floatingObjects.remove(charts[chart].id);
        
        // 确保图表已初始化
        if (!charts[chart].echart) {
            sheet.showCell(charts[chart].startRow, charts[chart].startColumn, 
                GC.Spread.Sheets.VerticalPosition.top, 
                GC.Spread.Sheets.HorizontalPosition.left);
            initCharts(charts[chart]);
        }
        
        // 获取图表的 Base64 图片
        var img = charts[chart].echart.getDataURL();
        
        // 添加图片到相同位置
        var picture = tempSheet.pictures.add(charts[chart].id, img, 0, 0, 100, 100);
        picture.startRow(charts[chart].startRow);
        picture.startColumn(charts[chart].startColumn);
        picture.endColumn(charts[chart].endColumn);
        picture.endRow(charts[chart].endRow);
    }

    // 导出 PDF
    tempSpread.savePDF(
        function (blob) {
            saveAs(blob, 'download.pdf');
        },
        function (error) {
            console.log(error);
        }
    );
});
```

### 3.5 技术栈

* **SpreadJS 15.0.0** — 核心表格引擎
* **@grapecity/spread-sheets-pdf 15.0.0** — PDF 导出功能
* **@grapecity/spread-sheets-print 15.0.0** — 打印功能
* **ECharts latest** — 图表可视化库
* **file-saver 2.0.5** — 文件下载工具
* **jQuery 3.6.1** — DOM 操作辅助库

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在本地服务器中打开 index.html
# 或使用 VS Code Live Server 等工具运行
```

### 4.2 操作步骤

1. 打开页面后，会自动加载三个数据表格（柱状图、饼图、折线图对应的数据源）
2. 滚动页面，当图表区域进入可视范围时，ECharts 图表会自动渲染
3. 修改表格中的数据，对应的图表会实时更新
4. 点击"导出 PDF"按钮，系统会将当前工作表（包含图表）导出为 PDF 文件

## 五、功能特点

### 5.1 优点

* **灵活的图表类型**：通过 ECharts 可以使用数百种图表样式，远超 SpreadJS 内置图表
* **性能优化**：懒加载机制避免了一次性渲染大量图表导致的性能问题
* **数据联动**：表格数据与图表自动同步，无需手动刷新
* **完整的导出方案**：解决了第三方图表库无法直接导出 PDF 的技术难题

### 5.2 局限性与扩展建议

* **中文字体问题**：导出 PDF 时可能出现中文乱码，需要配置 `PDFFontsManager.fallbackFont` 指定字体文件（代码中已注释相关方案）
* **图表动画**：为了确保导出时图表完整渲染，所有图表配置中设置了 `animation: false`
* **扩展建议**：可以添加更多图表类型（如雷达图、散点图等），或支持用户自定义图表配置

## 六、关键代码片段

### 数据格式转换

将表格数据源转换为 ECharts 所需的格式：

```javascript
function getChartDataFromTables(tableSource) {
    var categoriesArr = [];
    var dataArr = [];
    for (var prop in tableSource[0]) {
        categoriesArr.push(prop);
        dataArr.push(tableSource[0][prop]);
    }
    var barData = {
        categories: categoriesArr,
        data: dataArr
    };
    return barData;
}
```

### 图表刷新逻辑

根据不同图表类型更新数据：

```javascript
function refreshCharts(id, data) {
    var myChart = echarts.getInstanceByDom(document.getElementById(id));
    if (myChart) {
        switch (id) {
            case "barChart":
                myChart.setOption({
                    xAxis: { data: data.categories },
                    series: [{ data: data.data }]
                });
                break;
            case "pieChart":
                var dataArr = [];
                for (var i = 0; i < data.categories.length; i++) {
                    dataArr.push({
                        value: data.data[i],
                        name: data.categories[i]
                    });
                }
                myChart.setOption({
                    legend: { data: data.categories },
                    series: [{ data: dataArr }]
                });
                break;
            // 其他图表类型...
        }
    }
}
```

## 七、总结

本示例展示了如何在 SpreadJS 中集成第三方可视化库，并解决了图表导出 PDF 的技术难题。开发者可以从中学到：

* SpreadJS 浮动对象的使用方法
* 表格数据与第三方组件的联动机制
* 懒加载优化大量图表的性能策略
* Canvas 图表转换为图片并导出 PDF 的完整方案
* ECharts 与 SpreadJS 的集成最佳实践

该方案适用于需要在电子表格中展示复杂数据可视化的场景，特别是需要导出为 PDF 进行报告分享的业务需求。通过深拷贝工作簿并替换图表为图片的方式，既保证了原始数据不受影响，又实现了完整的导出功能。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
