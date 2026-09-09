## 一、Demo 概述

本示例演示了如何在 SpreadJS 中禁止用户通过鼠标右键点击 Sheet 标签页来切换工作表。在默认情况下，用户可以通过左键或右键点击 Sheet 标签页来切换工作表，但在某些业务场景中，需要限制右键点击的切换行为，以避免与自定义的右键菜单功能产生冲突。

该示例通过监听 Sheet 切换事件和鼠标事件，实现了对右键点击切换行为的精确拦截，同时保留了左键点击的正常切换功能。

## 二、解决的问题

在实际应用中，开发者可能需要在 Sheet 标签页上实现自定义的右键菜单功能，例如重命名、删除、复制工作表等操作。如果不禁止右键切换行为，会导致以下问题：

- 右键点击时会同时触发工作表切换和右键菜单，造成用户体验混乱
- 无法准确判断用户是想切换工作表还是打开右键菜单
- 自定义右键菜单的上下文可能因为工作表切换而失效

本示例提供了一种简洁的解决方案，通过事件监听和标志位控制，实现了右键点击时仅触发自定义逻辑而不切换工作表。

## 三、实现思路

### 3.1 核心技术点

#### 监听 ActiveSheetChanging 事件

通过监听 `ActiveSheetChanging` 事件，可以在工作表切换发生之前进行拦截。当检测到是右键点击触发的切换时，通过设置 `args.cancel = true` 来取消切换操作。

```javascript
let rightClick = false
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanging, function (sender, args) {
    //取消表单切换
    if (rightClick) {
        args.cancel = true
    }
    rightClick = false
});
```

#### 监听 Sheet 标签页的鼠标事件

通过模糊查询找到 Sheet 标签页的 DOM 元素（id 包含 "tabStrip"），并监听其 `mouseup` 事件。当检测到鼠标右键点击（`button == 2`）时，设置标志位 `rightClick = true`，并在 50 毫秒后自动重置标志位。

```javascript
idFuzzySelect("tabStrip").addEventListener("mouseup", function (arg) {
    console.log(arg)
    // 鼠标右键点击
    if (arg.button == 2) {
        rightClick = true
        setTimeout(() => {
            rightClick = false
        }, 50);
    }
})
```

#### DOM 元素模糊查询工具函数

由于 SpreadJS 生成的 Sheet 标签页 DOM 元素的 id 是动态生成的，无法直接通过固定 id 获取。因此实现了一个模糊查询函数，通过 id 包含特定字符串来定位元素。

```javascript
function idFuzzySelect(str) {
    let all = document.querySelectorAll('*')
    
    for (let i = 0; i < all.length; i++) {
        if (all[i].id.indexOf(str) > -1) {
            return all[i]
        }
    }
}
```

### 3.2 技术栈

- @grapecity/spread-sheets: 17.0.8（SpreadJS 核心库）
- SystemJS: 0.19.22（模块加载器）
- systemjs-plugin-babel: 0.0.25（ES6 转译支持）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开示例页面，可以看到包含 3 个工作表（Sheet1、Sheet2、Sheet3）的 SpreadJS 实例
2. 使用鼠标左键点击 Sheet2 或 Sheet3 标签页，可以正常切换工作表
3. 使用鼠标右键点击 Sheet2 或 Sheet3 标签页，工作表不会切换，保持在当前工作表
4. 打开浏览器控制台，可以看到右键点击时输出的鼠标事件信息

## 五、功能特点

### 5.1 优点

- 实现简洁，代码量少，易于理解和维护
- 精确拦截右键点击切换行为，不影响左键点击的正常功能
- 使用标志位和定时器机制，确保事件处理的时序正确性
- 为后续扩展自定义右键菜单功能预留了空间

### 5.2 局限性与扩展建议

当前实现使用了 DOM 元素模糊查询的方式来定位 Sheet 标签页，这种方式存在一定的局限性：

- 依赖于 SpreadJS 内部生成的 DOM 结构，如果 SpreadJS 版本升级导致 DOM 结构变化，可能需要调整查询逻辑
- `querySelectorAll('*')` 会遍历页面所有元素，在复杂页面中可能存在性能问题

扩展建议：

- 可以在右键点击事件中添加自定义右键菜单的显示逻辑
- 可以使用更精确的 DOM 选择器（如 class 名称）来定位 Sheet 标签页
- 可以将该功能封装为可复用的工具函数或插件

## 六、关键代码片段

### 完整的事件处理逻辑

```javascript
let rightClick = false

// 监听工作表切换事件
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanging, function (sender, args) {
    //取消表单切换
    if (rightClick) {
        args.cancel = true
    }
    rightClick = false
});

// 监听 Sheet 标签页的鼠标事件
idFuzzySelect("tabStrip").addEventListener("mouseup", function (arg) {
    console.log(arg)
    // 鼠标右键点击
    if (arg.button == 2) {
        rightClick = true
        setTimeout(() => {
            rightClick = false
        }, 50);
    }
})
```

这段代码的核心逻辑是：

1. 使用全局标志位 `rightClick` 来标记是否是右键点击
2. 在 `mouseup` 事件中检测到右键点击时，设置标志位为 `true`
3. 在 `ActiveSheetChanging` 事件中检查标志位，如果为 `true` 则取消切换
4. 使用 50 毫秒的延时重置标志位，确保事件处理完成后恢复正常状态

## 七、总结

本示例展示了如何通过事件监听和标志位控制来实现对 SpreadJS 工作表切换行为的精确控制。开发者可以从中学到以下知识点：

- SpreadJS 的 `ActiveSheetChanging` 事件及其取消机制
- 鼠标事件的 `button` 属性判断（0=左键，1=中键，2=右键）
- 使用标志位和定时器协调多个异步事件的处理时序
- 通过 DOM 操作与 SpreadJS 内部元素进行交互

该方案适用于需要在 Sheet 标签页上实现自定义右键菜单或其他右键交互功能的场景，具有良好的扩展性。开发者可以在此基础上添加更多的自定义逻辑，例如显示上下文菜单、执行工作表操作等。


### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/TsTNuzkoCEy58skxSkOhWA/)）
