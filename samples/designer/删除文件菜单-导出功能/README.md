## 一、Demo 概述

本示例展示了如何通过 SpreadJS Designer 的模板系统自定义文件菜单，实现删除特定菜单项（导出功能）并修改默认选中项的功能。该示例演示了如何获取、修改和重新注册 Designer 的内置模板，以及如何通过 `setData` 方法控制文件菜单的默认行为。

## 二、解决的问题

在实际应用中，开发者可能需要根据业务需求定制 SpreadJS Designer 的文件菜单，例如：

- 限制用户的导出权限，防止敏感数据被导出
- 简化菜单选项，只保留业务所需的功能
- 修改默认打开的菜单项，优化用户操作流程
- 根据不同用户角色动态调整可用功能

## 三、实现思路

### 3.1 获取并修改文件菜单模板

SpreadJS Designer 提供了 `getTemplate` 方法来获取内置模板对象，通过修改模板的 JSON 结构可以实现菜单的定制化：

```javascript
var fileMenuPanelTemplate = GC.Spread.Sheets.Designer.getTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate
);

// 删除导出按钮（根据实际版本调整层级路径）
fileMenuPanelTemplate.content[0].children[0].children[0].children[0].children[5].items.splice(1, 1);

// 重新注册修改后的模板
GC.Spread.Sheets.Designer.registerTemplate(
    GC.Spread.Sheets.Designer.TemplateNames.FileMenuPanelTemplate, 
    fileMenuPanelTemplate
);
```

关键点：
- 模板结构是嵌套的 JSON 对象，需要根据实际版本确定目标元素的层级路径
- 使用 `splice(1, 1)` 删除数组中索引为 1 的元素（导出按钮）
- 必须调用 `registerTemplate` 重新注册模板才能生效

### 3.2 修改文件菜单默认选中项

通过 `setData` 方法可以控制文件菜单打开时默认选中的类别：

```javascript
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container");
// 设置默认选中"导入"选项
designer.setData("fileMenuSetting", {activeCategory_main: "Import"});
```

示例中还提供了另一种实现方式，通过拦截 `getFileMenuOption` 方法来修改默认选项：

```javascript
let getFileMenuOption = GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption;
GC.Spread.Sheets.Designer.FileMenuHandler.getFileMenuOption = function (context) {
    let fileMenuSetting = (context.getData("fileMenuSetting") || {});
    let option = getFileMenuOption.apply(this, arguments);
    if (!fileMenuSetting.activeCategory_main) {
        option.activeCategory_main = "Import"
    }
    return option;
}
```

### 3.3 技术栈

- SpreadJS 16.0.1 - 核心表格组件
- SpreadJS Designer 16.0.1 - 设计器组件
- SystemJS - 模块加载器
- TypeScript 4.1.2 - 开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html
```

### 4.2 操作步骤

1. 打开页面后，Designer 组件会自动加载
2. 点击左上角的"文件"按钮
3. 观察文件菜单面板，可以看到：
   - 导出功能已被移除
   - 默认选中"导入"选项卡

## 五、功能特点

### 5.1 优点

- 灵活的模板定制机制，可以精确控制菜单结构
- 提供多种方式修改默认行为（setData 和方法拦截）
- 不影响 Designer 的其他功能
- 代码实现简洁，易于维护

### 5.2 局限性与扩展建议

- 模板结构的层级路径依赖于 SpreadJS 版本，升级时需要重新确认路径
- 建议在修改前通过 `console.log` 打印模板结构，确保准确定位目标元素
- 可以扩展为动态权限控制系统，根据用户角色动态调整可用菜单项

## 六、关键代码片段

### 版本兼容性处理

```javascript
/***去掉导出按钮
 *  注意：使用的产品版本不同，层级关系可能有差异
 *  需要结合产品版本去写代码，可以观察fileMenuPanelTemplate结构，确定要删除的按钮处于那一层
 * **/
console.log(fileMenuPanelTemplate); // 打印模板结构以确定层级
```

建议在实际开发中先打印模板结构，再根据实际情况调整访问路径。

## 七、总结

本示例展示了 SpreadJS Designer 模板系统的强大定制能力，开发者可以学到：

- 如何获取和修改 Designer 内置模板
- 如何通过 JSON 结构操作实现菜单定制
- 如何控制文件菜单的默认行为
- 两种不同的配置方式（直接设置 vs 方法拦截）

该方案适用于需要对 Designer 界面进行深度定制的场景，特别是在企业级应用中需要根据权限控制功能可见性的情况。通过模板系统，可以实现几乎任意程度的界面定制，而无需修改 SpreadJS 的源代码。

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/1Bh3GdSq7UKE7pmo7eC-wA/)）
