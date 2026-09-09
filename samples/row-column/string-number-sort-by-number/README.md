## 一、Demo 概述

本示例演示了如何在 SpreadJS 中对字符串类型的数字进行按数值大小排序的功能。在实际应用中，表格数据可能以字符串形式存储数字（如 "112"、"10"、"223"），默认的字符串排序会按字典序排列（"10" < "112" < "223"），而非数值大小（10 < 112 < 223）。本示例通过自定义排序函数，实现了字符串数字按实际数值大小进行排序。

## 二、解决的问题

在数据处理场景中，经常遇到以下问题：

- 数据源中的数字以字符串格式存储，直接排序会导致结果不符合预期（如 "10" 排在 "2" 之前）
- 需要对特定列应用自定义排序逻辑，而其他列保持默认排序行为
- 需要在用户点击列头排序时自动应用自定义排序规则

本示例提供了两种解决方案：通过重写命令执行函数或监听排序事件来实现自定义排序逻辑。

## 三、实现思路

### 3.1 数据准备与筛选器配置

示例首先创建了两列测试数据：A 列为字符串类型的数字（"112"、"10" 等），B 列为中文数字（"一一二"、"一零" 等）。通过 `HideRowFilter` 为数据区域添加筛选器，使列头显示排序按钮。

```javascript
sheet.setValue(0, 0, "112");
sheet.setValue(1, 0, "10");
sheet.setValue(2, 0, "223");
// ... 更多数据

let filter = new GC.Spread.Sheets.Filter.HideRowFilter(new GC.Spread.Sheets.Range(0, 0, 6, 2))
sheet.rowFilter(filter)
```

### 3.2 重写排序命令实现自定义排序

核心实现通过重写 `GC.Spread.Sheets.Commands.sortFilter.execute` 方法，拦截用户的排序操作。当检测到对第 0 列（A 列）进行排序时，使用自定义的数值比较函数；对其他列则调用原始排序逻辑。

```javascript
let oldFilter = GC.Spread.Sheets.Commands.sortFilter.execute
GC.Spread.Sheets.Commands.sortFilter.execute = function () {
    // 判断是否为第 0 列
    if (arguments[1].cmdOption.colIndex == 0) {
        // 自定义数值比较函数
        function strNumberSort(obj1, obj2) {
            return obj1 - obj2  // 字符串自动转换为数字进行比较
        }
        // 使用 sortRange 方法应用自定义排序
        sheet.sortRange(0, 0, 6, 2, true, [
            { index: 0, ascending: true, compareFunction: strNumberSort }
        ], { groupSort: GC.Spread.Sheets.GroupSort.full, ignoreHidden: true });
    } else {
        oldFilter.apply(this, arguments)  // 其他列使用默认排序
    }
}
```

关键点说明：
- `strNumberSort` 函数利用 JavaScript 的隐式类型转换，将字符串转为数字后进行比较
- `sortRange` 方法的 `compareFunction` 参数接受自定义比较函数
- 保留原始命令引用 `oldFilter`，确保其他列的排序功能正常工作

### 3.3 事件监听方式（备选方案）

示例代码中注释部分展示了另一种实现方式，通过监听 `RangeSorting` 事件动态修改排序行为：

```javascript
sheet.bind(GC.Spread.Sheets.Events.RangeSorting, function (info, data) {
    if (data.col == 0) {
        data.compareFunction = function (a, b) {
            return a - b
        }
    }
})
```

这种方式更加简洁，直接在排序事件触发时修改比较函数，无需重写命令执行逻辑。

### 3.4 技术栈

- SpreadJS 17.0.8：核心表格控件库
- SystemJS 0.19.22：模块加载器
- systemjs-plugin-babel 0.0.25：ES6 语法转译支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，可以看到 A 列和 B 列分别填充了字符串类型的数字和中文数字
2. 点击 A 列列头的排序按钮，观察数据按数值大小排序（10 → 20 → 30 → 112 → 223 → 334）
3. 点击 B 列列头的排序按钮，观察数据按字典序排序（"一一二" → "一零" → "三三四" → "三零" → "二二三" → "二零"）
4. 对比两列的排序结果，验证自定义排序逻辑仅对 A 列生效

## 五、功能特点

### 5.1 优点

- 精准控制：可针对特定列应用自定义排序逻辑，不影响其他列的默认行为
- 灵活扩展：提供了两种实现方式（命令重写和事件监听），可根据场景选择
- 性能优化：利用 JavaScript 原生类型转换，无需额外的字符串解析开销
- 用户友好：保持了 SpreadJS 原生的排序交互体验，用户无需学习新的操作方式

### 5.2 局限性与扩展建议

- 当前实现硬编码了列索引（第 0 列），实际应用中可改为配置化方式，支持多列自定义排序
- 对于包含非数字字符的字符串（如 "123abc"），`obj1 - obj2` 会返回 `NaN`，建议添加数据验证逻辑
- 可扩展为支持更复杂的排序规则，如自然排序（"file1.txt" < "file2.txt" < "file10.txt"）

## 六、关键代码片段

### 自定义比较函数的实现

```javascript
function strNumberSort(obj1, obj2) {
    return obj1 - obj2  // 利用 JavaScript 隐式转换
}

sheet.sortRange(0, 0, 6, 2, true, [
    { 
        index: 0,                      // 排序列索引
        ascending: true,               // 升序排列
        compareFunction: strNumberSort // 自定义比较函数
    }
], { 
    groupSort: GC.Spread.Sheets.GroupSort.full, 
    ignoreHidden: true 
});
```

说明：
- `sortRange` 的第三个参数为排序配置数组，支持多列排序
- `compareFunction` 返回负数表示 obj1 < obj2，返回正数表示 obj1 > obj2，返回 0 表示相等
- `groupSort` 参数控制分组排序行为，`ignoreHidden` 参数决定是否忽略隐藏行

## 七、总结

本示例展示了 SpreadJS 中自定义排序逻辑的实现方法，解决了字符串类型数字排序的常见问题。开发者可以从中学到：

1. 如何重写 SpreadJS 内置命令的执行逻辑
2. 如何使用 `sortRange` 方法实现自定义排序
3. 如何通过事件监听机制动态修改排序行为
4. 如何在保持原生交互体验的前提下扩展功能

该方案适用于需要对特定数据类型进行特殊排序处理的场景，如版本号排序、文件名自然排序、混合类型数据排序等。通过修改比较函数的实现，可以轻松扩展到更复杂的排序需求。


### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/PL5VBjpQR0CnW1elvkGWyA/)）
