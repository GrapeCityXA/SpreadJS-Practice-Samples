## 一、Demo 概述

本示例演示了如何在 SpreadJS 中实现单元格的自定义格式化功能。通过创建自定义格式化器（Custom Formatter），实现了数值的显示值与真实值之间的转换逻辑：当用户在特定区域输入数字时，显示值为真实值的 1/1000，而存储的真实值则是输入值的 1000 倍。

该示例适用于需要对单元格数据进行特殊处理的场景，例如单位换算、数据脱敏、自定义显示格式等业务需求。

## 二、解决的问题

- **数据显示与存储分离**：允许单元格的显示值与实际存储值不同，满足特殊的业务展示需求
- **自动数值转换**：用户输入数据时自动进行单位换算（如将千位数转换为个位数显示）
- **非数值数据兼容**：对于非数值类型的输入，保持原样显示和存储，确保格式化器的健壮性

## 三、实现思路

### 3.1 自定义格式化器对象

创建一个自定义格式化器对象，继承自 `GC.Spread.Formatter.FormatterBase`，并实现 `format` 和 `parse` 两个核心方法：

```javascript
let customFormatterTest = {}
customFormatterTest.prototype = GC.Spread.Formatter.FormatterBase

// 数值显示值为真实值/1000
customFormatterTest.format = function (obj) {
    let num = obj / 1000
    if (isNaN(num)) {
        return obj.toString()
    }
    return num.toString()
}

// 数字映射为num*1000
customFormatterTest.parse = function (str) {
    if (!str) {
        return null
    }
    let num = parseFloat(str)
    if (isNaN(num)) {
        return str
    }
    return num * 1000
}
```

### 3.2 format 方法：控制显示逻辑

`format` 方法负责将单元格的真实值转换为显示值。当单元格包含数值时，将其除以 1000 后显示；如果是非数值类型，则直接返回字符串形式。

### 3.3 parse 方法：控制存储逻辑

`parse` 方法负责将用户输入的值转换为实际存储的值。当用户输入数字时，将其乘以 1000 后存储；如果输入为空或非数值，则保持原样。

### 3.4 应用格式化器到单元格区域

通过 `formatter()` 方法将自定义格式化器应用到指定的单元格区域，并设置背景色以便区分：

```javascript
sheet.getRange(0, 0, 3, 5).backColor('#456782').formatter(customFormatterTest)
sheet.getCell(0, 0).value(10000)
```

上述代码将格式化器应用到 A1:E3 区域，并在 A1 单元格设置初始值 10000（显示为 10）。

### 3.5 技术栈

- SpreadJS 15.0.0：核心表格控件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言（编译为 ES5）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到左上角 A1:E3 区域有蓝灰色背景
2. A1 单元格显示值为 "10"（真实值为 10000）
3. 在背景色区域的任意单元格输入数字（如输入 "5"）
4. 按回车后，单元格显示 "5"，但真实值已存储为 5000
5. 在背景色区域输入非数值内容（如 "test"），将保持原样显示和存储

## 五、功能特点

### 5.1 优点

- **灵活的数据转换**：通过自定义 format 和 parse 方法，可以实现任意复杂的数据转换逻辑
- **用户体验友好**：用户输入和查看数据时使用简化的显示值，而后台自动处理实际存储值
- **类型安全**：内置了非数值类型的判断和处理，避免格式化错误
- **易于扩展**：可以基于此模式实现更复杂的格式化需求，如日期转换、货币格式化等

### 5.2 局限性与扩展建议

- **当前实现仅支持简单的数值乘除运算**，可以扩展为支持更复杂的转换公式
- **建议添加格式化器的错误处理机制**，对异常输入进行更友好的提示
- **可以结合单元格验证功能**，限制用户只能在特定区域输入符合规则的数据

## 六、关键代码片段

### 自定义格式化器的完整实现

```javascript
// 创建自定义格式化器对象
let customFormatterTest = {}
customFormatterTest.prototype = GC.Spread.Formatter.FormatterBase

// format: 真实值 → 显示值（除以1000）
customFormatterTest.format = function (obj) {
    let num = obj / 1000
    if (isNaN(num)) {
        return obj.toString()
    }
    return num.toString()
}

// parse: 输入值 → 真实值（乘以1000）
customFormatterTest.parse = function (str) {
    if (!str) {
        return null
    }
    let num = parseFloat(str)
    if (isNaN(num)) {
        return str
    }
    return num * 1000
}

// 应用到单元格区域
sheet.getRange(0, 0, 3, 5).backColor('#456782').formatter(customFormatterTest)
```

## 七、总结

本示例展示了 SpreadJS 自定义格式化器的核心用法，通过实现 `format` 和 `parse` 方法，开发者可以完全控制单元格数据的显示和存储逻辑。这种机制在实际业务中非常实用，特别适用于以下场景：

- 单位换算（如米与千米、元与万元）
- 数据脱敏显示（如手机号中间四位显示为星号）
- 自定义日期时间格式
- 特殊业务规则的数据转换

该方案具有良好的扩展性，开发者可以根据实际需求定制更复杂的格式化逻辑，为用户提供更加灵活和友好的数据交互体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/EfU5e0c9YE6kH8jWeUVZQw/)）
