## 一、Demo 概述

本示例演示了如何在 SpreadJS Designer 中监听数据源关闭事件。通过拦截和扩展 Designer 的内置命令，开发者可以在用户关闭数据管理器时执行自定义逻辑，例如记录日志、清理资源或触发其他业务流程。

## 二、解决的问题

在使用 SpreadJS Designer 进行数据源管理时，开发者可能需要在数据源关闭时执行特定操作，例如：

- 记录用户操作日志，追踪数据源的使用情况
- 清理与数据源相关的临时资源或缓存
- 触发数据保存或同步操作
- 更新 UI 状态或通知其他模块

SpreadJS Designer 默认不提供直接的数据源关闭事件监听接口，本示例通过命令拦截机制实现了这一需求。

## 三、实现思路

### 3.1 命令拦截机制

SpreadJS Designer 采用命令模式管理所有操作，通过获取并重写 `insertDataManager` 命令的 `execute` 方法，可以在命令执行前后插入自定义逻辑。

```javascript
let idm = GC.Spread.Sheets.Designer.getCommand("insertDataManager")
let oldF = idm.execute
idm.execute = function() {
    if(!arguments[2]) {
        // 当第三个参数为 false 或 undefined 时，表示关闭数据源
        console.log("关闭数据源")
    }
    oldF.apply(this, arguments)
}
```

关键点：
- `getCommand("insertDataManager")` 获取数据管理器命令对象
- 保存原始 `execute` 方法到 `oldF`
- 重写 `execute` 方法，在调用原始方法前检查参数
- `arguments[2]` 为 `false` 或 `undefined` 时表示关闭操作

### 3.2 自定义 Designer 配置

将修改后的命令注册到 Designer 配置中，确保自定义逻辑生效。

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertDataManager] = idm;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
```

关键点：
- 深拷贝默认配置避免污染全局配置
- 通过 `commandMap` 映射自定义命令
- 使用 `CommandNames.InsertDataManager` 常量确保命名准确

### 3.3 技术栈

- SpreadJS 17.0.8：核心表格组件
- SpreadJS Designer 17.0.8：可视化设计器
- SpreadJS TableSheet 17.0.8：数据表功能支持
- SystemJS 0.19.22：模块加载器

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 使用本地服务器打开 index.html
# 例如使用 VS Code 的 Live Server 插件
```

### 4.2 操作步骤

1. 在浏览器中打开 `index.html`
2. 在 Designer 界面中打开数据管理器（通常在功能区的"数据"选项卡）
3. 添加或选择一个数据源
4. 关闭数据管理器面板
5. 打开浏览器控制台，查看输出的 "关闭数据源" 日志

## 五、功能特点

### 5.1 优点

- 无侵入性：通过命令拦截实现，不修改 Designer 核心代码
- 灵活扩展：可在拦截逻辑中添加任意自定义操作
- 兼容性好：基于 Designer 官方 API，升级版本时风险较低

### 5.2 局限性与扩展建议

当前实现仅通过参数判断关闭操作，可能存在误判风险。建议扩展方向：

- 结合 Designer 的其他事件（如 `CommandExecuted`）进行二次验证
- 记录数据源的打开和关闭时间，计算使用时长
- 将日志发送到服务器进行持久化存储

## 六、关键代码片段

### 命令拦截完整实现

```javascript
// 获取数据管理器命令
let idm = GC.Spread.Sheets.Designer.getCommand("insertDataManager")
let oldF = idm.execute

// 重写执行方法
idm.execute = function() {
    if(!arguments[2]) {
        // 关闭数据源时的自定义逻辑
        console.log("关闭数据源")
        // 可在此处添加更多操作：
        // - 发送分析数据
        // - 清理缓存
        // - 更新 UI 状态
    }
    // 调用原始方法，保持原有功能
    oldF.apply(this, arguments)
}

// 注册到 Designer 配置
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.InsertDataManager] = idm;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
```

## 七、总结

本示例展示了 SpreadJS Designer 命令拦截机制的实际应用，开发者可以从中学到：

- 如何获取和重写 Designer 内置命令
- 命令参数的含义和判断方法
- 自定义 Designer 配置的正确方式
- 在不修改源码的前提下扩展 Designer 功能

该方案适用于需要监听 Designer 内部操作的场景，可扩展到其他命令的拦截和定制，为构建企业级表格应用提供了灵活的扩展能力。

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
