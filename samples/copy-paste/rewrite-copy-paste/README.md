## 一、Demo 概述

本示例展示了如何在 SpreadJS 中重写默认的复制粘贴命令，实现自定义的内部复制粘贴逻辑。通过禁用浏览器原生的 Ctrl+C/Ctrl+V 快捷键，并注册自定义命令来替代 SpreadJS 的默认 copy/paste 行为，从而实现对复制粘贴操作的完全控制。这种方案适用于需要在复制粘贴过程中添加自定义逻辑、验证或限制的场景。

## 二、解决的问题

- **禁用外部剪贴板交互**：阻止用户通过系统剪贴板将数据复制到外部应用或从外部粘贴数据，确保数据仅在 SpreadJS 内部流转
- **自定义复制粘贴逻辑**：在复制粘贴操作前后插入自定义业务逻辑，如权限验证、数据过滤、操作日志记录等
- **安全性控制**：防止敏感数据通过剪贴板泄露到外部系统

## 三、实现思路

### 3.1 核心技术点

#### 禁用浏览器原生快捷键

通过监听 DOM 元素的 `keydown` 事件，拦截 Ctrl+C（keyCode 67）和 Ctrl+V（keyCode 86）的默认行为：

```javascript
document.getElementById('ss').onkeydown = function () {
    if (event.ctrlKey && (window.event.keyCode == 67 || window.event.keyCode == 86)) {
        alert("禁止：" + window.event.keyCode);
        return false;
    }
}
```

返回 `false` 可以阻止事件的默认行为和冒泡，从而禁用浏览器的原生复制粘贴功能。

#### 注册自定义 Copy 命令

使用 `commandManager().register()` 注册名为 `myCopy` 的自定义命令，并在其中调用 SpreadJS 原生的 `copy` 命令：

```javascript
spread.commandManager().register("myCopy", {
    canUndo: true,
    execute: function (context, options, isUndo) {
        setTimeout(function () {
            options.cmd = "copy";
            alert("myCopy")
            spread.commandManager().execute(options);
            options.cmd = "myCopy";
        }, 10);
    }
});
```

关键点：
- `canUndo: true` 表示该命令支持撤销操作
- 使用 `setTimeout` 延迟 10ms 执行，为 SpreadJS 内部处理留出时间窗口
- 临时修改 `options.cmd` 为 `"copy"` 来调用原生命令，执行后恢复为 `"myCopy"`

#### 重新绑定快捷键

先清除原生 `copy` 命令的快捷键绑定，再将 Ctrl+C 绑定到自定义的 `myCopy` 命令：

```javascript
// 清除原生 copy 命令的快捷键
spread.commandManager().setShortcutKey(
    "copy", null, false, false, false, false
);

// 将 Ctrl+C 绑定到 myCopy
spread.commandManager().setShortcutKey(
    "myCopy", GC.Spread.Commands.Key.c, true, false, false, false
);
```

参数说明：`setShortcutKey(commandName, key, ctrl, shift, alt, meta)`

#### 注册自定义 Paste 命令

与 Copy 命令类似，注册 `myPaste` 命令并绑定到 Ctrl+V：

```javascript
spread.commandManager().register("myPaste", {
    canUndo: true,
    execute: function (context, options, isUndo) {
        var innerPaste = "paste";
        options.cmd = innerPaste;
        alert("myPaste")
        setTimeout(function () {
            spread.commandManager().execute(options);
        }, 10);
    }
});

// 清除原生 paste 命令的快捷键
spread.commandManager().setShortcutKey(
    "paste", null, false, false, false, false
);

// 将 Ctrl+V 绑定到 myPaste
spread.commandManager().setShortcutKey(
    "myPaste", GC.Spread.Commands.Key.v, true, false, false, false
);
```

#### 监听剪贴板事件

通过绑定 `ClipboardPasting` 事件可以监控粘贴操作的详细信息：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    console.log(args);
});
```

### 3.2 技术栈

- **@grapecity/spread-sheets**: 15.0.0 - SpreadJS 核心库
- **TypeScript**: ^4.1.2 - 类型支持（虽然示例使用 JavaScript）
- **SystemJS**: ^0.19.22 - 模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，表格中会显示预设的 3x3 数据矩阵
2. 选中任意单元格区域，按 Ctrl+C 进行复制
3. 系统会弹出 "myCopy" 提示框，确认自定义复制命令已执行
4. 选择目标单元格，按 Ctrl+V 进行粘贴
5. 系统会弹出 "myPaste" 提示框，确认自定义粘贴命令已执行
6. 尝试使用浏览器原生快捷键时，会弹出 "禁止：67" 或 "禁止：86" 的提示

## 五、功能特点

### 5.1 优点

- **完全控制复制粘贴流程**：可以在复制粘贴的任意阶段插入自定义逻辑
- **数据安全性增强**：阻止数据通过系统剪贴板流向外部应用
- **支持撤销重做**：自定义命令设置了 `canUndo: true`，保持了 SpreadJS 的撤销功能
- **实现简单**：通过命令注册和快捷键重绑定即可实现，无需修改 SpreadJS 核心代码

### 5.2 局限性与扩展建议

- **用户体验影响**：alert 弹窗会打断用户操作流程，生产环境建议替换为静默日志或非阻塞式提示
- **仅限内部复制**：当前实现完全禁用了外部剪贴板交互，如需支持部分外部粘贴（如纯文本），需要在 `myPaste` 中添加条件判断
- **浏览器兼容性**：使用了 `window.event`，在某些现代浏览器中建议改为标准的事件参数传递方式

扩展建议：
- 在自定义命令中添加权限验证逻辑
- 记录复制粘贴操作日志到服务器
- 根据单元格内容类型实现差异化的复制粘贴策略

## 六、关键代码片段

### 命令执行时序控制

```javascript
setTimeout(function () {
    options.cmd = "copy";
    spread.commandManager().execute(options);
    options.cmd = "myCopy";
}, 10);
```

这段代码的关键在于 `setTimeout` 的使用。SpreadJS 的命令系统需要一个时间窗口来处理内部状态，直接同步调用可能导致命令执行失败。通过 10ms 的延迟，确保了：
1. 自定义命令的上下文已正确设置
2. SpreadJS 内部状态已准备就绪
3. 原生命令可以正常执行

### 快捷键解绑与重绑

```javascript
// 解绑原生命令
spread.commandManager().setShortcutKey("copy", null, false, false, false, false);

// 绑定自定义命令
spread.commandManager().setShortcutKey("myCopy", GC.Spread.Commands.Key.c, true, false, false, false);
```

这种"先解绑再重绑"的模式确保了快捷键不会同时触发多个命令，避免了命令冲突。

## 七、总结

本示例展示了 SpreadJS 命令系统的灵活性和可扩展性。通过重写 Copy/Paste 命令，开发者可以实现对数据流转的精细控制，适用于以下场景：

- **企业级应用**：需要对敏感数据的复制粘贴进行审计和限制
- **协同编辑系统**：需要在复制粘贴时同步操作到其他用户
- **数据验证场景**：粘贴前需要对数据格式进行校验和转换

开发者可以从中学到：
- SpreadJS 命令管理器的使用方法
- 自定义命令的注册和执行机制
- 快捷键的动态绑定技术
- 事件监听与命令系统的协同工作方式

该方案具有良好的扩展性，可以在此基础上实现更复杂的业务逻辑，如数据加密、格式转换、权限控制等功能。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/rvsZlHzxcUuCh4niPrGKHA/)）
