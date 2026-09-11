## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中实现真正的科学计数法格式化功能。与传统的科学计数法（如 1.23e+4）不同，该示例将指数部分转换为上标形式（如 1.23×10⁴），使数据展示更符合数学书写规范。通过自定义单元格格式化器和 Designer 工具栏按钮，用户可以灵活设置科学计数法的小数位数。

## 二、解决的问题

* **数学规范展示**：传统的科学计数法使用 "e" 表示指数（如 1.23e+4），不符合数学书写习惯。该示例将其转换为标准的数学表示法（1.23×10⁴），使用上标字符显示指数。
* **灵活的精度控制**：允许用户自定义科学计数法的小数位数（1-16 位），满足不同精度需求。
* **Designer 集成**：将自定义格式化功能无缝集成到 SpreadJS Designer 工具栏中，提供友好的用户交互界面。

## 三、实现思路

### 3.1 自定义单元格格式化器

核心技术是通过继承 `GC.Spread.Formatter.FormatterBase` 创建自定义格式化器 `MyFormatter`，实现数字到科学计数法的转换：

```javascript
function MyFormatter(format, cultureName) {
    GC.Spread.Formatter.FormatterBase.apply(this, arguments);
    this.typeName = 'MyScientificFormatter';
    if (format) {
        this.num = Number(format.text); // 保存小数位数配置
    }
}
MyFormatter.prototype = new GC.Spread.Formatter.FormatterBase();

MyFormatter.prototype.format = function (obj, conditionalForeColor) {
    if ((typeof obj === 'number' || (Number(obj) && !isNaN(Number(obj)))) && this.num !== 0) {
        let inputNum = Number(obj);
        let num = inputNum.toExponential(this.num); // 转换为标准科学计数法
        
        // 提取指数部分并转换为上标
        let index = num.indexOf('+') !== -1 ? num.indexOf('+') + 1 : num.indexOf('-') + 1;
        let cornerMark = num.slice(index);
        let nowNumArray = cornerMark.split('');
        
        let newNum = '';
        nowNumArray.forEach(item => {
            newNum = newNum + numMap[item]; // 使用 Unicode 上标字符映射
        });
        
        if (num.indexOf('-') !== -1) {
            newNum = minus + newNum; // 添加负号上标
        }
        
        let returnNum = num.slice(0, index - 1);
        let returnData = (returnNum + newNum).replace('e', '×10');
        return returnData;
    } else {
        return obj;
    }
};
```

### 3.2 Unicode 上标字符映射

使用 Unicode 字符集中的上标数字和符号实现指数的上标显示：

```javascript
const numMap = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
const minus = '⁻';
```

### 3.3 Designer 工具栏集成

通过自定义 Ribbon 按钮和对话框，将格式化功能集成到 Designer 界面：

```javascript
let customerRibbon = {
    "id": "settings",
    "text": "自定义",
    "buttonGroups": [{
        label: '自定义',
        commandGroup: {
            children: [{
                direction: 'vertical',
                commands: ['scientificCountingMethod'],
            }],
        },
    }]
};

let ribbonFileCommands = {
    "scientificCountingMethod": {
        iconClass: "ribbon-button-download",
        title: '科学计数法',
        text: '科学计数法',
        commandName: "scientificCountingMethod",
        execute: async (context) => {
            var spread = context.getWorkbook();
            var sheet = spread.getActiveSheet();
            var cell = sheet.getActualStyle(
                sheet.getSelections()[0].row,
                sheet.getSelections()[0].col,
                GC.Spread.Sheets.SheetArea.viewport,
                true
            );
            
            // 显示对话框让用户输入小数位数
            GC.Spread.Sheets.Designer.showDialog(
                'setText',
                { text: cell?.formatter?.num || '', isCenter: false },
                result => {
                    if (!result) return;
                    var cell = sheet.getCell(
                        sheet.getSelections()[0].row,
                        sheet.getSelections()[0].col
                    );
                    cell.formatter(new MyFormatter(result));
                }
            );
        },
    },
};
```

### 3.4 自定义格式化器注册

重写 `getTypeFromString` 方法，使 SpreadJS 能够识别和序列化自定义格式化器：

```javascript
let oldFun = GC.Spread.Sheets.getTypeFromString;
GC.Spread.Sheets.getTypeFromString = function (typeString) {
    switch (typeString) {
        case 'MyScientificFormatter':
            return MyFormatter;
        default:
            return oldFun.apply(this, arguments);
    }
};
```

### 3.5 技术栈

* SpreadJS 15.0.0（核心表格组件）
* SpreadJS Designer 15.0.0（设计器组件）
* SystemJS 0.19.22（模块加载器）
* TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，Designer 会自动加载，B2 单元格已预设值 12347.57
2. 选中 B2 单元格
3. 点击工具栏中的"自定义"选项卡
4. 点击"科学计数法"按钮
5. 在弹出的对话框中输入小数位数（1-16 的正整数）
6. 确认后，单元格将以真正的科学计数法格式显示（如 1.2348×10⁴）

## 五、功能特点

### 5.1 优点

* **符合数学规范**：使用 Unicode 上标字符，展示效果更专业
* **精度可控**：支持 1-16 位小数精度配置
* **无缝集成**：自定义格式化器可与 Designer 的其他功能协同工作
* **可序列化**：通过重写 `getTypeFromString`，自定义格式可以保存和加载

### 5.2 局限性与扩展建议

* **字体依赖**：上标字符的显示效果依赖于字体支持，部分字体可能显示不佳
* **扩展方向**：可以添加更多数学符号支持（如分数、根号等），构建完整的数学公式格式化系统

## 六、关键代码片段

### 指数转换逻辑

```javascript
// 提取指数符号和数值
let index = 0;
let numType = 'add';
if (num.indexOf('+') !== -1) {
    index = num.indexOf('+') + 1;
} else if (num.indexOf('-') !== -1) {
    index = num.indexOf('-') + 1;
    numType = 'minus';
}

let cornerMark = num.slice(index);
let nowNumArray = cornerMark.split('');

// 转换为上标字符
let newNum = '';
nowNumArray.forEach(item => {
    newNum = newNum + numMap[item];
});

if (numType === 'minus') {
    newNum = minus + newNum;
}
```

### 自定义对话框模板

```javascript
var setTextTemplate = {
    title: '小数位数',
    content: [{
        type: 'TextEditor',
        margin: '0 0 0 10px',
        bindingPath: 'text',
    }],
};
GC.Spread.Sheets.Designer.registerTemplate('setText', setTextTemplate);
```

## 七、总结

本示例展示了 SpreadJS 强大的扩展能力，通过自定义格式化器实现了符合数学规范的科学计数法显示。开发者可以从中学习到：

* 如何继承 `FormatterBase` 创建自定义单元格格式化器
* 如何使用 Unicode 字符实现特殊排版效果
* 如何扩展 SpreadJS Designer 的工具栏和对话框
* 如何注册自定义类型以支持序列化

该方案适用于需要专业数学或科学数据展示的场景，如科研报告、教育软件、工程计算等领域。通过类似的技术，还可以扩展实现更多自定义格式化需求。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
