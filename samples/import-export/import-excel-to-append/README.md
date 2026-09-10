## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中实现 Excel 文件的追加导入功能。当用户导入新的 Excel 文件时，系统会弹出确认对话框询问是否使用"文件追加模式"，如果选择追加，则将新文件的所有工作表添加到当前工作簿中，而不是替换现有内容。这种方式适用于需要合并多个 Excel 文件到同一个工作簿的场景。 

## 二、解决的问题

该示例主要解决以下实际业务问题：

* **多文件合并需求**：在实际业务中，经常需要将多个 Excel 文件的内容合并到一个工作簿中进行统一管理和分析
* **数据保留问题**：传统的文件导入会覆盖现有内容，而追加模式可以保留原有数据
* **灵活的导入方式**：通过用户确认机制，允许用户根据实际需求选择覆盖或追加模式

## 三、实现思路

### 3.1 核心技术点

#### 监听文件加载事件

通过监听 `FileLoading` 事件拦截文件导入流程，在文件实际加载前进行自定义处理：

```javascript
designer.bind(GC.Spread.Sheets.Designer.Events.FileLoading, (event, args) => {
    let isAdd = confirm("是否使用文件追加模式？")
    if (isAdd) {
        // 自定义处理逻辑
        args.cancel = true  // 取消默认的文件加载行为
        designer.setData("FileMenu_show", false);
    }
})
```

#### 中间工作簿转换

使用临时的 `midSpread` 工作簿作为中转，先将导入的文件数据加载到临时工作簿，再逐个工作表复制到目标工作簿：

```javascript
let midSpread = new GC.Spread.Sheets.Workbook()

midSpread.fromJSON(args.data)
for (let i = 0; i < midSpread.getSheetCount(); i++) {
    let sheet = new GC.Spread.Sheets.Worksheet('newsheet')
    sheet.fromJSON(midSpread.getSheet(i).toJSON())
    spread.addSheet(0, sheet)
}
```

这种方式通过 JSON 序列化和反序列化实现工作表的深度复制，确保数据完整性。

#### 初始化源数据

在 Designer 初始化时创建一个名为"源文件"的工作表并填充示例数据，方便用户测试追加功能：

```javascript
let spread = designer.getWorkbook()
let activeSheet = spread.getActiveSheet()
activeSheet.name("源文件")
activeSheet.setArray(0, 0, [[123, 34, 890], [899, 221, 990]])
```

### 3.2 技术栈

* SpreadJS 15.0.0：核心电子表格引擎
* SpreadJS Designer 15.0.0：可视化设计器组件
* SpreadJS ExcelIO 15.0.0：Excel 文件导入导出功能
* TypeScript 4.1.2：开发语言
* SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，会看到一个名为"源文件"的工作表，其中包含初始数据
2. 点击 Designer 工具栏的"文件"菜单，选择"打开"
3. 选择一个 Excel 文件进行导入
4. 系统弹出确认对话框："是否使用文件追加模式？"
    * 点击"确定"：新文件的所有工作表将追加到当前工作簿中
    * 点击"取消"：使用默认的覆盖模式，新文件将替换当前内容
5. 追加成功后，可以在工作表标签栏看到新增的工作表

## 五、功能特点

### 5.1 优点

* **用户友好**：通过确认对话框让用户自主选择导入模式
* **数据安全**：追加模式不会覆盖现有数据，避免数据丢失
* **实现简洁**：通过事件拦截和 JSON 序列化实现，代码量少且易于理解

### 5.2 局限性与扩展建议

**当前局限性**：

如代码注释所述，合并工作簿是一个复杂的需求，本示例仅提供基础实现方案，存在以下限制：

* 未处理工作表名称冲突（多个文件可能有同名工作表）
* 未处理公式引用问题（跨工作表的公式引用可能失效）
* 未处理图表、表格等对象的名称冲突
* 未处理样式空间的依赖关系

**扩展建议**：

* 添加工作表名称去重逻辑（如自动添加后缀）
* 实现公式引用的自动更新机制
* 添加冲突检测和提示功能
* 参考官方论坛的详细解决方案：https://gcdn.grapecity.com.cn/forum.php?mod=viewthread&tid=142037

## 六、总结

本示例展示了 SpreadJS Designer 中实现文件追加导入的基本方法，开发者可以从中学到：

* 如何监听和拦截 Designer 的文件加载事件
* 如何使用中间工作簿实现工作表的复制和转移
* 如何通过 JSON 序列化实现工作表的深度克隆
* 文件合并场景中需要注意的潜在冲突问题

该方案适用于简单的文件合并场景，对于复杂的业务需求，建议在此基础上添加更完善的冲突处理机制。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
