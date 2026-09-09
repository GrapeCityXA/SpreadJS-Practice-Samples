## 一、Demo 概述

本示例展示了如何在 SpreadJS 中自定义数值格式化器，解决极小数值（如 0.00000001）在单元格中自动显示为科学计数法的问题。通过继承 `GeneralFormatter` 类并重写格式化逻辑，实现了数值始终以普通小数形式展示，同时保证最少显示指定位数的小数（默认两位）。

该方案适用于需要精确展示小数值的场景，如金融计算、科学数据展示、精密测量等领域。

## 二、解决的问题

- **科学计数法自动转换问题**：当单元格输入极小或极大的数值时，SpreadJS 默认会将其转换为科学计数法（如 1e-8），影响数据的直观性和可读性
- **小数位数控制需求**：需要保证数值至少显示指定位数的小数（如两位），同时当实际小数位数更多时保留原始精度
- **千分位分隔符需求**：在保持普通小数格式的同时，需要为整数部分添加千分位分隔符，提升大数值的可读性

## 三、实现思路

### 3.1 自定义格式化器类

通过继承 `GC.Spread.Formatter.GeneralFormatter` 创建自定义格式化器 `NumericFomatter`，重写 `format` 方法实现自定义格式化逻辑：

```javascript
class NumericFomatter extends GC.Spread.Formatter.GeneralFormatter {
    constructor(decimalDisplay = 2) {
        super()
        this._decimalDisplay = decimalDisplay
    }

    format(value) {
        if (isNaN(value) || value === null) {
            return value
        }
        
        value = this.toNonExponential(value)
        let arr = (value + "").split(".")
        let before = arr[0].length
        let after
        if (arr[1]) {
            after = arr[1].length
        } else {
            after = 0
        }
        let pattern = "#,##0."
        for (let i = 0; i < after || i < this._decimalDisplay; i++) {
            pattern += "0"
        }
        let formatter = new GC.Spread.Formatter.GeneralFormatter(pattern);
        return formatter.format(value)
    }
}
```

构造函数接收 `decimalDisplay` 参数（默认为 2），用于指定最少显示的小数位数。

### 3.2 科学计数法转换为普通小数

核心方法 `toNonExponential` 将科学计数法表示的数值转换为普通小数字符串：

```javascript
toNonExponential(num) {
    let _num = parseFloat(num)
    let m = _num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return _num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}
```

实现原理：
1. 将数值转换为科学计数法字符串（如 `1.0e-8`）
2. 使用正则表达式提取尾数小数位数和指数部分
3. 计算需要的小数位数：`尾数小数位数 - 指数值`
4. 使用 `toFixed` 方法生成指定小数位数的普通小数字符串

### 3.3 动态生成格式化模式

根据实际小数位数和最小显示位数，动态构建格式化模式字符串：

```javascript
let pattern = "#,##0."
for (let i = 0; i < after || i < this._decimalDisplay; i++) {
    pattern += "0"
}
```

- `#,##0.` 表示整数部分使用千分位分隔符，小数点后至少一位
- 循环添加 `0` 确保小数位数满足 `max(实际位数, 最小显示位数)`

### 3.4 应用格式化器到列

使用 `setFormatter` 方法将自定义格式化器应用到指定列：

```javascript
sheet.setFormatter(-1, 0, new NumericFomatter(2))
```

参数说明：
- `-1` 表示应用到整列（所有行）
- `0` 表示第一列
- `new NumericFomatter(2)` 创建最少显示两位小数的格式化器实例

### 3.5 技术栈

- SpreadJS 17.0.8：核心表格组件库
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言（编译为 JavaScript）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开 `index.html` 文件，页面会自动加载 SpreadJS 表格
2. 观察第一列的两个单元格：
   - 第一行显示 `0.00000001`（极小数值，以普通小数形式展示）
   - 第二行显示 `100.00`（整数自动补齐两位小数）
3. 尝试在第一列的其他单元格输入不同的数值，验证格式化效果：
   - 输入 `0.000000123456` 会显示为 `0.000000123456`（保留原始精度）
   - 输入 `1234567.8` 会显示为 `1,234,567.80`（千分位 + 两位小数）
   - 输入 `5` 会显示为 `5.00`（补齐两位小数）

## 五、功能特点

### 5.1 优点

- **避免科学计数法**：彻底解决极小/极大数值自动转换为科学计数法的问题，保证数据直观展示
- **灵活的小数位控制**：既能保证最少显示位数，又能在实际位数更多时保留完整精度
- **千分位分隔符**：自动为整数部分添加千分位分隔符，提升大数值的可读性
- **可复用性强**：通过构造函数参数可灵活配置最小小数位数，适应不同业务场景

### 5.2 局限性与扩展建议

- **性能考虑**：每次格式化都会进行字符串解析和正则匹配，对于大量数据可能存在性能开销，建议在数据量较大时进行性能测试
- **精度限制**：JavaScript 的 `Number` 类型基于 IEEE 754 双精度浮点数，最多支持约 15-17 位有效数字，超出范围可能丢失精度
- **扩展建议**：
  - 可添加最大小数位数限制，避免显示过长的小数
  - 可支持自定义千分位分隔符和小数点符号，适配不同地区的数字格式习惯
  - 可添加负数格式化样式（如红色显示、括号包裹等）

## 六、关键代码片段

### 科学计数法转换核心算法

```javascript
toNonExponential(num) {
    let _num = parseFloat(num)
    // 将数值转为科学计数法并提取关键信息
    // 正则匹配示例：1.0e-8 -> ["1.0e-8", "0", "-8"]
    let m = _num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    // 计算需要的小数位数：尾数小数位 - 指数
    // 例如：1.0e-8 -> (1 - (-8)) = 9 位小数
    return _num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
}
```

该方法巧妙利用了科学计数法的数学特性：指数的绝对值决定了小数点移动的位数，通过 `toFixed` 方法可以精确控制输出的小数位数。

## 七、总结

本示例展示了 SpreadJS 自定义格式化器的强大能力，通过继承 `GeneralFormatter` 并重写格式化逻辑，成功解决了科学计数法显示问题。开发者可以从中学到：

1. **自定义格式化器的实现方式**：继承 `GeneralFormatter` 并重写 `format` 方法
2. **科学计数法与普通小数的转换技巧**：利用正则表达式和 `toFixed` 方法
3. **动态格式化模式的构建**：根据数据特征生成合适的格式化字符串
4. **格式化器的应用方法**：使用 `setFormatter` 方法应用到单元格、行或列

该方案适用于金融、科学计算、数据分析等需要精确展示数值的场景，具有良好的可扩展性和实用价值。开发者可以根据实际需求调整最小小数位数、添加最大位数限制或自定义分隔符样式，打造符合业务需求的数值格式化方案。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/ImvXsR-XtUGiUA5Y6f1KXA/)）
