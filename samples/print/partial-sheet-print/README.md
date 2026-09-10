## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现选择性打印工作表的功能。用户可以通过输入框指定需要打印的 Sheet 页码（支持多个，用逗号分隔），系统会仅打印指定的工作表，而不是打印整个工作簿。这在实际业务中非常实用，尤其是当工作簿包含大量工作表，但用户只需要打印其中部分内容时。 

## 二、解决的问题

在实际应用中，一个 SpreadJS 工作簿可能包含多个工作表，但用户往往只需要打印其中的部分工作表。直接调用 `spread.print()` 会打印所有可见的工作表，造成纸张浪费和打印时间增加。本示例通过以下方式解决这个问题：

* 提供灵活的工作表选择机制，用户可以自定义打印哪些 Sheet
* 避免打印不必要的工作表内容，节省打印资源
* 保持原工作簿状态不变，不影响用户的正常操作

## 三、实现思路

### 3.1 核心技术点

#### 工作簿克隆与可见性控制

本示例的核心思路是创建一个临时工作簿副本，通过控制工作表的可见性来实现选择性打印。具体实现如下：

```javascript
function myprint(index) {
    if (index == null) {
        // 打印所有工作表
        spread.print();
    } else {
        // 创建临时工作簿副本
        let tempSpread = new GC.Spread.Sheets.Workbook();
        tempSpread.fromJSON(JSON.parse(JSON.stringify(spread.toJSON())));
        
        // 先将所有工作表设置为不可见
        for (let i = 0; i < tempSpread.getSheetCount(); i++) {
            let visibleSheet = tempSpread.getSheet(i);
            visibleSheet.visible(false);
        }
        
        // 仅将指定的工作表设置为可见
        for (let i = 0; i < index.length; i++) {
            let visibleSheet = tempSpread.getSheet(parseInt(index[i]));
            visibleSheet.visible(true);
        }
        
        // 打印临时工作簿
        tempSpread.print();
    }
}
```

这种方法的优势在于：

* 不修改原工作簿的状态，用户界面不受影响
* 通过 JSON 序列化实现深拷贝，确保数据完整性
* 利用工作表的 `visible()` 方法控制打印范围

#### 用户输入解析

通过简单的字符串分割实现多工作表选择：

```javascript
document.getElementById("print").onclick = function() {
    let printSheets = document.getElementById("printSheet").value;
    if (printSheets.length != 0) {
        let printSheetArr = printSheets.split(',');
        myprint(printSheetArr);
    } else {
        myprint(null);
    }
}
```

用户可以输入 `0,2,4` 来打印第 0、2、4 个工作表，输入为空时打印所有工作表。

### 3.2 技术栈

* @grapecity/spread-sheets: 15.0.0（核心表格组件）
* @grapecity/spread-sheets-print: 15.0.0（打印功能模块）
* @grapecity/spread-sheets-resources-zh: 15.0.0（中文资源包）
* SystemJS: 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到一个包含 5 个工作表的 SpreadJS 实例
2. 在输入框中输入需要打印的工作表索引（从 0 开始），多个索引用逗号分隔，例如：`0,2,4`
3. 点击"打印"按钮
4. 系统会弹出打印预览窗口，仅显示指定的工作表内容
5. 如果输入框为空，则打印所有工作表

## 五、功能特点

### 5.1 优点

* 实现简单，代码量少，易于理解和维护
* 不修改原工作簿状态，用户体验友好
* 支持灵活的工作表选择，满足不同打印需求
* 通过深拷贝确保数据安全，避免副作用

### 5.2 局限性与扩展建议

当前实现存在以下局限性：

* 输入验证不够严格，用户输入非法索引（如超出范围的数字）可能导致错误
* 不支持工作表名称选择，只能通过索引选择
* 对于大型工作簿，JSON 序列化可能影响性能

扩展建议：

* 添加输入验证，检查索引范围和格式
* 提供下拉列表或复选框，让用户通过工作表名称选择
* 对于大型工作簿，考虑使用更高效的克隆方式

## 六、关键代码片段

### 工作簿初始化与数据填充

```javascript
let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 5
});

let sheet1 = spread.getSheet(0);
let sheet2 = spread.getSheet(1);
let sheet3 = spread.getSheet(2);

// Sheet1 中使用公式引用 Sheet3 的数据
sheet1.setValue(0, 0, "SUM:");
sheet1.setFormula(0, 1, "=SUM(Sheet3!A1:Sheet3!A5)");
sheet1.setValue(1, 0, "AVERAGE:");
sheet1.setFormula(1, 1, "=AVERAGE(Sheet3!A1:Sheet3!A5)");

// Sheet3 中填充原始数据
sheet3.setValue(0, 0, 1);
sheet3.setValue(1, 0, 2);
sheet3.setValue(2, 0, 3);
sheet3.setValue(3, 0, 4);
sheet3.setValue(4, 0, 5);
```

这段代码展示了如何创建多个工作表，并在不同工作表之间建立公式引用关系。

## 七、总结

本示例展示了一种简单而实用的 SpreadJS 部分工作表打印方案。通过工作簿克隆和可见性控制，开发者可以轻松实现选择性打印功能，而无需修改原工作簿状态。

开发者可以从中学到：

* 如何使用 `toJSON()` 和 `fromJSON()` 实现工作簿深拷贝
* 如何通过 `visible()` 方法控制工作表的可见性
* 如何使用 SpreadJS 的打印 API
* 如何处理用户输入并转换为打印参数

该方案适用于需要灵活控制打印内容的场景，如报表系统、数据分析工具等。开发者可以在此基础上扩展更多功能，如打印预览、打印设置、批量打印等。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
