## 一、Demo 概述

本示例展示了如何使用 SpreadJS 将多个报表文件（.sjs 格式）合并导出为单个 Excel 文件。该功能通过加载多个报表模板，将每个报表渲染为分页预览模式，然后将所有生成的工作表合并到一个新的工作簿中，最终导出为 Excel 文件。

这个示例特别适用于需要批量处理多个报表并统一导出的业务场景，例如月度财务报表汇总、多部门数据报告合并等。

## 二、解决的问题

- **多报表统一导出**：在实际业务中，经常需要将多个独立的报表文件合并成一个 Excel 文件进行分发或归档，手动操作效率低下
- **报表分页处理**：ReportSheet 需要先渲染为分页预览模式，才能正确生成可导出的工作表
- **数据源管理**：多个报表可能共享相同的数据源，需要在每次加载报表时重新注册数据管理器
- **异步加载协调**：多个报表文件的加载和处理是异步操作，需要合理的流程控制确保所有报表处理完成后再进行合并

## 三、实现思路

### 3.1 核心技术点

#### 数据管理器注册

在加载每个报表文件之前，需要先注册数据管理器，确保报表能够正确绑定数据源：

```javascript
const addDataManager = () => {
  let tableName = "orders"
  let dba = spread.dataManager()
  dba.addTable(tableName, { data })
}
```

这个函数将订单数据注册为名为 "orders" 的数据表，供报表模板使用。

#### 报表文件加载与渲染

核心函数 `loadFile2` 负责加载单个报表文件并将其渲染为可导出的工作表：

```javascript
const loadFile2 = async (file, current, allSheet) => {
  return new Promise((resolve, reject) => {
    spread.open(file, () => {
      addDataManager()
      setTimeout(() => {
        let sheetTab = spread.getActiveSheetTab();
        if (sheetTab && sheetTab instanceof GC.Spread.Report.ReportSheet) {
          sheetTab.renderMode("PaginatedPreview");
          let name = sheetTab.name();
          let pageSheet = sheetTab.generatePageSheets(
            false,
            (i) => `${current}${name}${i}`
          )
          resolve(allSheet.concat(pageSheet));
        }
      }, 0)
    })
  })
}
```

关键步骤：
1. 使用 `spread.open()` 打开报表文件
2. 重新注册数据管理器
3. 将 ReportSheet 设置为 "PaginatedPreview" 渲染模式
4. 调用 `generatePageSheets()` 生成分页工作表，并使用自定义命名规则
5. 将生成的工作表追加到总工作表数组中

#### 递归批量处理报表

使用递归函数 `genarateWorksheets` 依次加载和处理多个报表文件：

```javascript
const genarateWorksheets = async (current, total, allSheet) => {
  let response = await fetch(`./static/rp${current}.sjs`);
  let blob = await response.blob();
  let file = new File([blob], `rp${current}.sjs`)
  let returnsheets = await loadFile2(file, current, allSheet)
  current++
  if (current <= total) {
    return await genarateWorksheets(current, total, returnsheets)
  } else {
    return returnsheets
  }
};
```

该函数通过递归方式依次加载 `rp1.sjs`、`rp2.sjs` 等报表文件，并累积所有生成的工作表。

#### 工作表合并与导出

将所有生成的工作表合并到一个新的工作簿中，并提供导出功能：

```javascript
const getMergeExcel = async () => {
  let totalSheet = await genarateWorksheets(1, 2, [])
  tempSpread = new GC.Spread.Sheets.Workbook()
  tempSpread.setSheetCount(1);
  let len = totalSheet.length;
  for (let i = 0; i < len; i++) {
    tempSpread.addSheet(i, totalSheet[i]);
  }
  tempSpread.removeSheet(tempSpread.getSheetCount() - 1);
}

document.getElementById("btn").addEventListener("click", function () {
  tempSpread.export((blob) => {
    saveAs(blob, "test.xlsx");
  });
})
```

创建一个临时工作簿，将所有工作表添加进去，最后移除默认的空白工作表，点击按钮时导出为 Excel 文件。

### 3.2 UI 交互流程

页面加载 → 自动加载并处理多个报表文件 → 用户点击"导出合并的Excel"按钮 → 下载合并后的 Excel 文件

### 3.3 技术栈

- SpreadJS 17.1.2（核心表格引擎）
- @grapecity/spread-sheets-designer（设计器组件）
- @grapecity/spread-sheets-reportsheet-addon（报表功能）
- @grapecity/spread-excelio（Excel 导入导出）
- FileSaver.js（文件下载）
- SystemJS（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在本地服务器中打开 index.html
# 可以使用 VS Code 的 Live Server 插件或其他本地服务器工具
```

### 4.2 操作步骤

1. 在浏览器中打开 index.html
2. 页面加载时会自动加载 `static/rp1.sjs` 和 `static/rp2.sjs` 两个报表文件
3. 等待报表处理完成（可以在设计器中看到加载的报表）
4. 点击页面顶部的"导出合并的Excel"按钮
5. 浏览器会自动下载名为 `test.xlsx` 的合并后的 Excel 文件

## 五、功能特点

### 5.1 优点

- **自动化处理**：无需手动打开和合并多个报表文件，提高工作效率
- **灵活扩展**：通过修改 `genarateWorksheets` 函数的参数，可以轻松调整要合并的报表数量
- **保留格式**：导出的 Excel 文件完整保留了报表的格式、样式和数据
- **异步处理**：使用 Promise 和 async/await 确保异步操作的正确执行顺序

### 5.2 局限性与扩展建议

- **固定文件名**：当前实现中报表文件名是硬编码的（rp1.sjs、rp2.sjs），可以改为从配置文件或用户输入中读取
- **错误处理**：缺少对文件加载失败、报表渲染异常等情况的错误处理机制
- **进度提示**：处理多个报表时没有进度提示，用户体验可以进一步优化
- **性能优化**：对于大量报表的场景，可以考虑使用 Web Worker 进行后台处理

## 六、关键代码片段

### 报表渲染模式设置

```javascript
let sheetTab = spread.getActiveSheetTab();
if (sheetTab && sheetTab instanceof GC.Spread.Report.ReportSheet) {
  sheetTab.renderMode("PaginatedPreview");
  let pageSheet = sheetTab.generatePageSheets(false, (i) => `${current}${name}${i}`)
}
```

这段代码是整个流程的核心，必须先将 ReportSheet 设置为分页预览模式，才能调用 `generatePageSheets()` 生成可导出的普通工作表。

### 工作簿导出

```javascript
tempSpread.export((blob) => {
  saveAs(blob, "test.xlsx");
});
```

使用 SpreadJS 的 `export()` 方法将工作簿导出为 Blob 对象，然后通过 FileSaver.js 的 `saveAs()` 方法触发浏览器下载。

## 七、总结

本示例展示了 SpreadJS 在多报表合并导出场景中的应用，核心价值在于自动化处理复杂的报表合并流程。开发者可以从中学到：

- ReportSheet 的渲染模式切换和分页工作表生成
- 异步文件加载和 Promise 链式处理
- 工作簿的动态创建和工作表管理
- Excel 文件的导出实现

该方案适用于需要批量处理和合并多个报表的企业应用场景，具有良好的扩展性，可以根据实际需求调整报表数量、命名规则和导出格式。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/VkR8BDzdZU6iwneo2j8nug/)）
