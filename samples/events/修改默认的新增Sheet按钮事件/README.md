## 一、Demo 概述

本示例演示如何拦截和自定义 SpreadJS 中默认的新增 Sheet 按钮行为。在标准的 SpreadJS 应用中，点击 Sheet 标签栏的"+"按钮会自动创建新的工作表。本示例通过监听相关事件，实现了对这一默认行为的拦截和自定义处理，允许开发者在用户点击新增按钮时执行自定义逻辑，而不是直接创建新的工作表。

## 二、解决的问题

在实际业务场景中，可能需要对新增工作表的操作进行权限控制、数据验证或其他业务逻辑处理。例如：

- 限制用户创建工作表的数量或权限
- 在创建新工作表前弹出自定义配置对话框
- 根据业务规则决定是否允许创建新工作表
- 在创建工作表时自动应用特定的模板或初始化数据

默认的新增 Sheet 行为无法满足这些需求，因此需要拦截并自定义该操作。

## 三、实现思路

### 3.1 核心技术点

#### 监听 SheetTabClick 事件识别新增按钮点击

通过监听 `SheetTabClick` 事件，可以捕获用户对 Sheet 标签栏的点击操作。当 `info.sheetTabIndex` 为 `-1` 时，表示用户点击的是新增 Sheet 按钮（而非具体的某个 Sheet 标签）。此时设置标志位 `prevent` 为 `true`，用于后续的行为拦截。

```javascript
let prevent = false
spread.bind(GC.Spread.Sheets.Events.SheetTabClick, function (e, info) {
    // 如果index为-1，则点击的是新增按钮，需要阻止该行为
    if (info.sheetTabIndex == -1) {
        prevent = true
        setTimeout(() => {
            prevent = false
        }, 0);
    }
});
```

使用 `setTimeout` 将标志位重置操作放入下一个事件循环，确保 `ActiveSheetChanging` 事件能够正确读取到 `prevent` 的值。

#### 拦截 ActiveSheetChanging 事件阻止默认行为

当用户点击新增按钮后，SpreadJS 会自动创建一个新的工作表并触发 `ActiveSheetChanging` 事件。通过在该事件中检查 `prevent` 标志位，可以取消默认的切换行为，并手动删除已创建的工作表，从而实现对新增操作的完全拦截。

```javascript
spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanging, function (sender, args) {
    // 如果被阻止切换了，说明是点击了新增sheet的按钮，移除被新增的表，并将ActiveSheet设置为原值
    if (prevent) {
        args.cancel = true
        spread.removeSheet(spread.getSheetCount() - 1)        
        spread.setActiveSheet(args.oldSheet)
        // do something
        alert("新建sheet被阻止")
    }
});
```

关键操作包括：
- `args.cancel = true`：取消默认的工作表切换行为
- `spread.removeSheet(spread.getSheetCount() - 1)`：删除刚刚自动创建的工作表
- `spread.setActiveSheet(args.oldSheet)`：恢复到原来的活动工作表
- 执行自定义逻辑（示例中使用 `alert` 提示）

### 3.2 技术栈

- SpreadJS 17.0.8：核心电子表格组件
- SpreadJS Designer 17.0.8：设计器组件，提供完整的表格编辑界面
- SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

安装完成后，使用本地服务器打开 `index.html` 文件（不能直接双击打开，因为使用了 ES6 模块）。

### 4.2 操作步骤

1. 打开应用后，可以看到 SpreadJS Designer 界面，默认包含 3 个工作表
2. 点击 Sheet 标签栏最右侧的"+"按钮（新增 Sheet 按钮）
3. 系统会弹出提示"新建sheet被阻止"，新工作表不会被创建
4. 当前活动工作表保持不变

## 五、功能特点

### 5.1 优点

- 实现了对默认新增 Sheet 行为的完全控制
- 代码简洁，逻辑清晰，易于理解和维护
- 可以在拦截点插入任意自定义业务逻辑
- 不影响其他 Sheet 操作（如切换、删除等）

### 5.2 局限性与扩展建议

当前实现使用了标志位和异步操作的组合方式，虽然有效但略显复杂。在实际应用中，可以考虑以下扩展：

- 将 `alert` 替换为自定义对话框，提供更友好的用户交互
- 添加权限验证逻辑，根据用户角色决定是否允许创建工作表
- 实现自定义的工作表创建流程，例如弹出配置面板让用户输入工作表名称和初始设置
- 记录操作日志，追踪用户的工作表管理行为

## 六、总结

本示例展示了如何通过事件监听机制拦截和自定义 SpreadJS 的默认新增 Sheet 行为。开发者可以从中学到：

- `SheetTabClick` 事件的使用方法和 `sheetTabIndex` 的含义
- `ActiveSheetChanging` 事件的拦截机制（`args.cancel`）
- 如何通过标志位协调多个事件处理器
- 工作表的动态添加和删除操作

该方案适用于需要对工作表创建进行权限控制或业务逻辑验证的场景，具有良好的扩展性，可以根据实际需求进行定制化开发。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/oWuqEsPiXUWhUeGAzCDCdg/)）
