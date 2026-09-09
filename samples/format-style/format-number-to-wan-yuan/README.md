## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现自定义数字格式化器，将单元格中的金额数值自动转换为"万元"单位显示。当用户在单元格中输入数字时，系统会自动将其除以 10000 并添加"万"单位后缀，同时保留原始数值用于计算。这种格式化方式在财务报表、数据分析等场景中非常实用，能够提升大额数据的可读性。

## 二、解决的问题

在实际业务场景中，财务数据往往涉及较大的金额数值，直接显示完整数字会降低可读性。本示例解决了以下问题：

- **数据可读性**：将大额数字（如 7980 元）自动转换为更易读的"万元"格式（0.80万）
- **显示与存储分离**：保持单元格存储原始数值，仅在显示层进行格式化，不影响公式计算
- **统一格式化**：通过自定义格式化器，可以批量应用到整个工作表或指定区域

## 三、实现思路

### 3.1 核心技术点

#### 自定义格式化器类

通过继承 `GC.Spread.Formatter.FormatterBase` 创建自定义格式化器，实现数值的转换和格式化逻辑：

```javascript
function CustomNumberFormat(formatstr) {
    this.formatstr = formatstr;
}

CustomNumberFormat.prototype = new GC.Spread.Formatter.FormatterBase();

CustomNumberFormat.prototype.format = function (obj, formattedData) {
    if (typeof obj === "number") {
        return formatNumber(obj, formattedData, this.formatstr);
    } else if (typeof obj === "string") {
        if (Number.isFinite(+obj)) {
            return formatNumber(parseFloat(obj), formattedData, this.formatstr);
        }
    }
    return obj ? obj.toString() : "";
};
```

关键点：
- `format` 方法负责将原始数值转换为显示文本
- 支持数字和字符串类型的输入
- 对于非数字类型，直接返回原始值的字符串形式

#### 数值转换逻辑

核心转换函数将数值除以 10000，并应用指定的格式字符串：

```javascript
function formatNumber(value, formattedData, formatstr) {
    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(formatstr);
    // 将值除以10000，然后应用传入的格式字符串做格式化
    console.log(value / 10000);
    return generalformatter.format(value / 10000, formattedData);
}
```

这里使用了 SpreadJS 内置的 `GeneralFormatter` 来处理数字格式化（如千分位、小数位等），确保转换后的数值仍然符合标准的数字格式规范。

#### 解析方法实现

`parse` 方法用于将用户输入的格式化文本转换回原始数值：

```javascript
CustomNumberFormat.prototype.parse = function (str) {
    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(this.formatstr);
    console.log(generalformatter.parse(str))
    return generalformatter.parse(str);
};
```

#### 应用格式化器到工作表

使用 `getRange` 方法将自定义格式化器应用到整个工作表：

```javascript
sheet.getRange(-1, -1, -1, -1).formatter(new CustomNumberFormat("#,##0.00万"));
```

参数说明：
- `getRange(-1, -1, -1, -1)` 表示选择整个工作表的所有单元格
- `"#,##0.00万"` 是格式字符串，定义了千分位分隔符、保留两位小数以及"万"单位后缀

### 3.2 技术栈

- **@grapecity/spread-sheets**: 16.0.1 - SpreadJS 核心库
- **TypeScript**: ^4.1.2 - 类型支持（虽然示例使用 JavaScript）
- **SystemJS**: ^0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
# 或使用本地服务器（推荐）
npx http-server .
```

### 4.2 操作步骤

1. 打开 `index.html` 文件
2. 在任意单元格中输入数字（例如：7980）
3. 观察单元格显示效果，数值会自动转换为"万元"格式（0.80万）
4. 尝试输入不同的数值，验证格式化效果
5. 可以在单元格中使用公式引用，计算时使用的是原始数值

## 五、功能特点

### 5.1 优点

- **显示与计算分离**：格式化仅影响显示层，单元格存储的仍是原始数值，不影响公式计算
- **灵活的格式控制**：通过修改格式字符串，可以自定义小数位数、千分位等显示样式
- **批量应用**：一次性应用到整个工作表或指定区域，无需逐个单元格设置
- **类型兼容**：支持数字和字符串类型的输入，自动进行类型转换

### 5.2 扩展建议

- **动态单位切换**：可以扩展为支持"元"、"万元"、"亿元"等多种单位的动态切换
- **条件格式化**：根据数值大小自动选择合适的单位（如小于 10000 显示"元"，大于 10000 显示"万元"）
- **双向转换优化**：完善 `parse` 方法，支持用户输入"0.80万"时自动转换回 7980

## 六、关键代码片段

### 完整的自定义格式化器实现

```javascript
function CustomNumberFormat(formatstr) {
    this.formatstr = formatstr;
}

CustomNumberFormat.prototype = new GC.Spread.Formatter.FormatterBase();

CustomNumberFormat.prototype.format = function (obj, formattedData) {
    if (typeof obj === "number") {
        return formatNumber(obj, formattedData, this.formatstr);
    } else if (typeof obj === "string") {
        if (Number.isFinite(+obj)) {
            return formatNumber(parseFloat(obj), formattedData, this.formatstr);
        }
    }
    return obj ? obj.toString() : "";
};

function formatNumber(value, formattedData, formatstr) {
    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(formatstr);
    return generalformatter.format(value / 10000, formattedData);
}

CustomNumberFormat.prototype.parse = function (str) {
    var generalformatter = new GC.Spread.Formatter.GeneralFormatter();
    generalformatter.formatString(this.formatstr);
    return generalformatter.parse(str);
};

// 应用到整个工作表
sheet.getRange(-1, -1, -1, -1).formatter(new CustomNumberFormat("#,##0.00万"));
```

## 七、总结

本示例展示了 SpreadJS 自定义格式化器的强大功能，通过继承 `FormatterBase` 类并实现 `format` 和 `parse` 方法，开发者可以实现任意复杂的数值格式化需求。

开发者可以从中学到：

- 如何创建自定义格式化器类
- 如何利用 `GeneralFormatter` 处理标准数字格式
- 如何将格式化器应用到工作表的指定区域
- 显示层格式化与数据层存储分离的设计思想

该方案适用于需要自定义数值显示格式的场景，特别是财务报表、数据分析等领域。通过扩展该方案，可以实现更复杂的格式化需求，如多级单位转换、条件格式化等。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/LDz_triG80mZjlcROOR-yQ/)）
