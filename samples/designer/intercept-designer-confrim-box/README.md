## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中拦截和扩展内置命令的执行逻辑。具体实现了在报表设计器中拦截"生成页面"（GeneratePages）命令的确认框操作，并在命令执行完成后自动为生成的工作表名称添加自定义后缀。

该示例适用于需要在设计器标准操作流程中插入自定义业务逻辑的场景，例如批量修改生成的工作表属性、添加审计日志、或执行额外的数据处理。

## 二、解决的问题

在使用 SpreadJS Designer 的报表功能时，用户点击"报表设计 → 分页 → 拆分每一页"后，系统会根据报表模板生成多个工作表。默认情况下，这些工作表的命名规则是固定的，无法满足某些业务场景下的自定义需求。

本示例解决了以下问题：

* 如何拦截设计器内置命令的执行流程
* 如何在命令执行完成后插入自定义逻辑
* 如何批量修改生成的工作表名称

## 三、实现思路

### 3.1 命令拦截机制

SpreadJS Designer 提供了 `getCommand` 方法来获取内置命令对象，通过重写命令的 `execute` 方法可以实现拦截和扩展。

```javascript
let GeneratePages = GC.Spread.Sheets.Designer.getCommand(
  GC.Spread.Sheets.Designer.CommandNames.GeneratePages
)

let oldF = GeneratePages.execute
GeneratePages.execute = function () {
   oldF.apply(this, arguments).then(function() {
        // 在原命令执行完成后插入自定义逻辑
        let curReportSheet = spread.getActiveSheet()
        let name = curReportSheet.name().split("-")[0]
        spread.sheets.forEach(s => {
            let n = s.name()
            if (n.indexOf(name) == 0) {
                s.name(n + "自定义内容")
            }
        })
   })
}
```

关键点：

* 保存原始的 `execute` 方法引用（`oldF`）
* 使用 `apply` 调用原方法并传递所有参数
* 原方法返回 Promise，使用 `.then()` 在执行完成后处理

### 3.2 自定义命令配置注入

通过修改设计器配置的 `commandMap`，将自定义的命令对象注入到设计器实例中。

```javascript
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
designerConfig.commandMap = {};
designerConfig.commandMap[GC.Spread.Sheets.Designer.CommandNames.GeneratePages] = GeneratePages;

let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
```

这里使用深拷贝（`JSON.parse(JSON.stringify())`）确保不影响全局默认配置。

### 3.3 工作表名称批量修改

在命令执行完成后，遍历所有工作表，找到与当前报表相关的工作表并修改名称。

```javascript
let curReportSheet = spread.getActiveSheet()
let name = curReportSheet.name().split("-")[0]  // 提取报表名称前缀
spread.sheets.forEach(s => {
    let n = s.name()
    if (n.indexOf(name) == 0) {  // 匹配同一报表生成的工作表
        s.name(n + "自定义内容")  // 添加后缀
    }
})
```

### 3.4 技术栈

* SpreadJS v17.0.8（核心表格控件）
* SpreadJS Designer v17.0.8（设计器组件）
* SpreadJS ReportSheet Addon v17.0.8（报表功能扩展）
* SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开
# 直接打开 index.html 文件（需要本地 Web 服务器）
```

### 4.2 操作步骤

1. 打开页面后，设计器会自动加载一个包含报表模板的工作簿
2. 按照页面提示操作：点击"报表设计 → 分页 → 拆分每一页"
3. 在弹出的确认框中点击"是"
4. 观察生成的工作表名称，会发现所有新生成的工作表名称末尾都添加了"自定义内容"后缀

## 五、功能特点

### 5.1 优点

* 无侵入式扩展：不修改 SpreadJS 源码，通过配置注入实现功能扩展
* 灵活性高：可以在命令执行前后插入任意自定义逻辑
* 可复用性强：该模式可应用于任何设计器内置命令的拦截

### 5.2 局限性与扩展建议

当前实现仅针对 `GeneratePages` 命令，如需拦截其他命令（如保存、导出等），可以参考相同的模式进行扩展。建议将命令拦截逻辑封装为独立的工具函数，方便管理多个命令的拦截配置。

## 六、总结

本示例展示了 SpreadJS Designer 命令拦截机制的核心用法，开发者可以从中学到：

* 如何获取和重写设计器内置命令
* 如何通过 `commandMap` 注入自定义命令配置
* 如何在异步命令执行完成后处理业务逻辑
* 如何批量操作工作表对象

该方案适用于需要在设计器标准操作流程中插入自定义业务逻辑的场景，具有良好的扩展性和可维护性。通过这种模式，开发者可以在不修改 SpreadJS 源码的前提下，灵活地定制设计器行为，满足特定的业务需求。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
