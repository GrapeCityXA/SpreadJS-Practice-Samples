## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现表格数据的滚动加载功能。通过监听工作表的滚动事件，当用户滚动到表格底部时，自动追加新的数据行到已绑定的表格中，实现类似"无限滚动"的效果。这种方式适用于需要展示大量数据但又希望避免一次性加载所有数据的场景，可以有效提升页面性能和用户体验。

## 二、解决的问题

- **大数据量展示性能优化**：避免一次性加载大量数据导致的页面卡顿，采用按需加载的方式提升初始加载速度
- **用户体验优化**：通过滚动触发数据加载，提供流畅的浏览体验，用户无需手动翻页
- **数据绑定动态更新**：演示如何在表格绑定场景下动态追加数据并自动刷新视图

## 三、实现思路

### 3.1 配置滚动条行为

为了实现精确的滚动加载触发，需要配置 SpreadJS 的滚动条选项：

```javascript
spread.options.scrollbarMaxAlign = true;
spread.options.scrollbarShowMax = true;
```

- `scrollbarMaxAlign`：设置为 true 时，滚动条的最大值与实际行数对齐
- `scrollbarShowMax`：设置为 true 时，滚动条显示实际的最大行数

这两个配置确保滚动条能够准确反映当前数据的行数，便于判断是否滚动到底部。

### 3.2 表格数据绑定

使用 SpreadJS 的 CellBindingSource 和表格绑定机制实现数据与视图的关联：

```javascript
// 准备数据源
var data = {
    bindPath_table: [
        { f1: 1, f2: 2, f3: 3 },
        { f1: "a", f2: "b", f3: "c" }
        // ... 更多数据
    ]
};

// 使用 CellBindingSource 包装数据
var dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(data);

// 创建表格
var table = sheet.tables.add("Table1", 3, 0, 1, 3, GC.Spread.Sheets.Tables.TableThemes.light6);
table.autoGenerateColumns(false);
table.expandBoundRows(true);

// 配置表格列与数据字段的映射
var tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn(1);
tableColumn1.name("字段1");
tableColumn1.dataField("f1");
// ... 配置其他列

table.bindColumns([tableColumn1, tableColumn2, tableColumn3]);
table.bindingPath("bindPath_table");
sheet.setDataSource(dataSource);
```

关键点：
- `expandBoundRows(true)`：允许表格根据绑定数据自动扩展行数
- `bindingPath`：指定表格绑定到数据源的哪个字段（这里是 `bindPath_table` 数组）

### 3.3 监听滚动事件实现动态加载

通过监听 `TopRowChanged` 事件检测滚动位置，当滚动到底部时追加数据：

```javascript
sheet.bind(GC.Spread.Sheets.Events.TopRowChanged, function (sender, args) {
    var sheet = args.sheet;
    var rowCount = sheet.getRowCount();
    var bottomRow = sheet.getViewportBottomRow(1);
    
    // 判断是否滚动到最后一行
    if (bottomRow === rowCount - 1) {
        if (rowCount < 10000) {  // 设置最大行数限制
            setTimeout(function(){
                // 向数据源追加新数据
                data.bindPath_table.push({
                    f1: rowCount,
                    f2: rowCount,
                    f3: rowCount
                });
                data.bindPath_table.push({
                    f1: "a",
                    f2: "b",
                    f3: "c"
                });
                // 重新绑定触发视图更新
                table.bindingPath("bindPath_table");
            }, 50);
        }
    }
});
```

实现要点：
- `getViewportBottomRow(1)`：获取当前视口中可见的最后一行索引
- 通过比较 `bottomRow` 和 `rowCount - 1` 判断是否滚动到底部
- 使用 `setTimeout` 延迟 50ms 执行，避免频繁触发
- 直接修改原始数据源数组，然后重新调用 `bindingPath` 触发表格更新

### 3.4 技术栈

- SpreadJS 15.0.0：核心电子表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 3 列的表格，初始显示约 18 行数据
2. 使用鼠标滚轮或拖动滚动条向下滚动
3. 当滚动到表格底部时，系统会自动追加 2 行新数据
4. 继续滚动可以持续加载数据，直到达到 10000 行的上限

## 五、功能特点

### 5.1 优点

- **性能优化**：按需加载数据，避免一次性渲染大量行导致的性能问题
- **用户体验流畅**：无需手动翻页，滚动即可自动加载，符合现代 Web 应用的交互习惯
- **实现简单**：利用 SpreadJS 的数据绑定机制，只需监听滚动事件并修改数据源即可
- **可控性强**：可以灵活设置加载触发条件、每次加载的数据量和最大行数限制

### 5.2 局限性与扩展建议

- **当前实现为同步追加数据**：实际应用中通常需要从后端 API 异步获取数据，可以在 `setTimeout` 中改为 `fetch` 或 `axios` 请求
- **缺少加载状态提示**：建议添加 loading 指示器，告知用户数据正在加载
- **可以优化触发逻辑**：当前是滚动到最后一行才触发，可以改为提前触发（如滚动到倒数第 5 行时），提升体验

扩展建议：
```javascript
// 提前触发加载
if (bottomRow >= rowCount - 5) {
    // 加载数据
}

// 异步加载示例
if (bottomRow === rowCount - 1 && !isLoading) {
    isLoading = true;
    fetch('/api/data?offset=' + rowCount)
        .then(res => res.json())
        .then(newData => {
            data.bindPath_table.push(...newData);
            table.bindingPath("bindPath_table");
            isLoading = false;
        });
}
```

## 六、总结

本示例展示了 SpreadJS 中实现表格滚动加载的核心技术方案。开发者可以从中学到：

1. 如何使用 `CellBindingSource` 和表格绑定机制实现数据与视图的双向关联
2. 通过 `TopRowChanged` 事件监听滚动行为并获取视口位置
3. 动态修改数据源并通过重新绑定 `bindingPath` 触发视图更新
4. 滚动条配置选项对滚动加载功能的影响

该方案适用于需要展示大量数据的报表、数据分析工具等场景，通过按需加载的方式有效提升应用性能。开发者可以在此基础上扩展为异步数据加载、虚拟滚动等更复杂的功能。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Table%20Binding%20Rolling%20Load%20Data.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/H-LCL_JDhEisD0Skkq50cA/)）
