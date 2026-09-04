## 一、Demo 概述

本示例展示了如何在 SpreadJS 中为复制粘贴操作添加自定义动效和加载提示。通过拦截和重写默认的粘贴命令，在用户执行粘贴操作时显示一个加载动画模态框，提升用户体验并提供视觉反馈。该方案适用于需要在粘贴过程中执行额外处理（如数据验证、格式转换）或希望增强交互体验的场景。

## 二、解决的问题

- **缺乏操作反馈**：默认的复制粘贴操作没有明显的视觉反馈，用户无法感知操作是否正在进行
- **自定义粘贴流程**：需要在粘贴前后插入自定义逻辑（如显示加载动画、数据处理、日志记录）
- **跨平台快捷键适配**：Mac 和 Windows 系统的粘贴快捷键不同（Command+V vs Ctrl+V），需要统一处理

## 三、实现思路

### 3.1 自定义粘贴命令

通过 SpreadJS 的命令管理器（CommandManager）注册自定义粘贴命令，拦截默认粘贴行为并添加自定义逻辑：

```javascript
var command = {
    canUndo: true,
    execute: function(spread, options, isUndo) {
        document.getElementById("loadingModal").style.display = "block"
        spread.execute({
            cmd: "paste",
            sheetName: options.sheetName
        })
    }
};
var commandManager = spread.commandManager();
// 根据操作系统注册不同的快捷键
isMac() ?
commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, false, false, false, true)
:
commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, true, false, false, false)
```

关键点：
- `canUndo: true` 使命令支持撤销操作
- `execute` 方法中先显示加载框，再执行原生粘贴命令
- 通过 `commandManager.register` 注册命令并绑定快捷键（最后一个参数 `true` 表示 Command 键，`false` 表示 Ctrl 键）

### 3.2 粘贴事件监听

监听 SpreadJS 的粘贴事件，在粘贴完成后触发自定义命令并隐藏加载框：

```javascript
spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function(){
    console.log("ClipboardPasting")
})        
spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, function(e,info){
    console.log("ClipboardPasted")
    commandManager.execute({
        cmd: "myPasteCommand",
        sheetName: info.sheet.name()
    })
    setTimeout(function() {
        document.getElementById("loadingModal").style.display = "none"
    }, 1000)
})
```

事件流程：
1. `ClipboardPasting`：粘贴操作开始前触发
2. `ClipboardPasted`：粘贴操作完成后触发，此时执行自定义命令并延迟 1 秒隐藏加载框

### 3.3 跨平台快捷键适配

通过检测用户代理字符串判断操作系统，动态注册不同的快捷键：

```javascript
function isMac(){
    var agent = navigator.userAgent.toLowerCase();
    var isMac = /macintosh|mac os x/i.test(agent);
    return isMac ? true : false
}
```

### 3.4 技术栈

- SpreadJS 15.0.0：核心表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：类型支持（项目配置）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
# 使用本地服务器打开 index.html（如 Live Server）
```

### 4.2 操作步骤

1. 打开页面后，表格会自动填充 30 行 5 列的随机数据
2. 选中任意单元格区域，按 Ctrl+C（Windows）或 Command+C（Mac）复制
3. 选择目标单元格，按 Ctrl+V（Windows）或 Command+V（Mac）粘贴
4. 观察左上角出现紫色加载框，显示 "loading..." 提示
5. 1 秒后加载框自动消失，粘贴完成

## 五、功能特点

### 5.1 优点

- **用户体验增强**：通过视觉反馈让用户明确感知操作状态
- **灵活扩展**：可在自定义命令中添加任意业务逻辑（数据校验、格式转换、日志记录等）
- **跨平台兼容**：自动适配 Mac 和 Windows 的快捷键差异
- **不破坏原生功能**：通过事件监听和命令重写，保留 SpreadJS 的原生粘贴能力

### 5.2 局限性与扩展建议

- **固定延迟时间**：当前使用 1 秒固定延迟，实际应用中可根据数据量动态调整
- **加载框样式简单**：可替换为更专业的 Loading 组件（如 Spinner、进度条）
- **扩展方向**：
  - 根据粘贴数据量动态计算加载时间
  - 添加粘贴进度显示
  - 支持粘贴失败时的错误提示
  - 集成数据验证逻辑（如格式检查、范围限制）

## 六、关键代码片段

### 命令注册与事件绑定完整流程

```javascript
function initSpread(spread) {
    // 1. 定义自定义粘贴命令
    var command = {
        canUndo: true,
        execute: function(spread, options, isUndo) {
            document.getElementById("loadingModal").style.display = "block"
            spread.execute({
                cmd: "paste",
                sheetName: options.sheetName
            })
        }
    };
    
    // 2. 注册命令并绑定快捷键
    var commandManager = spread.commandManager();
    isMac() ?
    commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, false, false, false, true)
    :
    commandManager.register('myPasteCommand', command, GC.Spread.Commands.Key.v, true, false, false, false)
    
    // 3. 监听粘贴完成事件
    spread.bind(GC.Spread.Sheets.Events.ClipboardPasted, function(e,info){
        commandManager.execute({
            cmd: "myPasteCommand",
            sheetName: info.sheet.name()
        })
        setTimeout(function() {
            document.getElementById("loadingModal").style.display = "none"
        }, 1000)
    })
}
```

## 七、总结

本示例展示了 SpreadJS 命令系统的灵活性，通过自定义命令和事件监听机制，开发者可以轻松扩展表格的交互行为。该方案的核心价值在于：

- **学习 SpreadJS 命令管理器的使用方法**：理解如何注册、执行自定义命令
- **掌握事件驱动的交互设计模式**：通过事件监听实现业务逻辑解耦
- **了解跨平台快捷键适配技巧**：处理不同操作系统的键盘事件差异

该方案适用于需要在标准操作（复制、粘贴、删除等）中插入自定义逻辑的场景，如数据审计、权限控制、操作日志记录等。开发者可以基于此思路扩展更多自定义命令，构建符合业务需求的表格交互体验。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/1SeqmMBTL0ue--A-tU09Hg/)）
