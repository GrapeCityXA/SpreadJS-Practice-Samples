## 一、Demo 概述

本示例展示了如何将 SpreadJS Designer（设计器）的界面语言从简体中文修改为繁体中文。通过修改设计器的配置对象和全局资源对象，可以自定义 Ribbon 菜单栏、对话框等 UI 组件的显示文字，实现界面的本地化定制。

该示例适用于需要为港澳台地区用户或海外华人用户提供繁体中文界面的应用场景。

## 二、解决的问题

- **界面语言定制需求**：SpreadJS Designer 默认提供简体中文资源包，但部分用户需要繁体中文界面
- **多语言支持**：为不同地区的用户提供符合其语言习惯的界面文字
- **品牌本地化**：满足企业在不同市场的本地化要求

## 三、实现思路

### 3.1 修改 Ribbon 菜单栏文字

通过获取 `GC.Spread.Sheets.Designer.DefaultConfig` 对象，可以访问设计器的默认配置。该配置对象包含 Ribbon 菜单栏的结构定义，其中 `ribbon` 数组存储了各个选项卡的配置信息。

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig
console.log(config)     // 可以打印出来自己看看结构
config.ribbon[0].text='開始'
config.ribbon[2].text='頁面佈局'
config.ribbon[4].text='數據'
config.ribbon[5].text='視圖'
config.ribbon[6].text='設置'
```

通过修改 `config.ribbon[index].text` 属性，可以将菜单栏的文字从简体中文改为繁体中文。需要注意的是，不同版本的 SpreadJS 配置结构可能略有差异，建议先通过 `console.log` 查看实际结构。

### 3.2 修改全局资源对象

设计器的全局资源对象包含了对话框、提示信息等 UI 组件的文字定义。通过 `GC.Spread.Sheets.Designer.getResources()` 获取资源对象，修改后再通过 `setResources()` 方法应用修改。

```javascript
// 这里是designer的全局资源对象，包含很多弹出框中的显示文字
var resources = GC.Spread.Sheets.Designer.getResources()
console.log(resources)        // 打印出来自己看看结构
resources.borderDialog.border = '邊框'
resources.borderDialog.presets = '預置'
// 设置全局资源为修改之后的资源
GC.Spread.Sheets.Designer.setResources(resources)
```

资源对象采用嵌套结构，例如 `borderDialog` 对象包含边框对话框的所有文字定义。开发者可以根据需要修改任意资源项。

### 3.3 应用配置到设计器实例

创建设计器实例后，通过 `setConfig()` 方法应用修改后的配置：

```javascript
// 设置当前designer使用的配置信息
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
designer.setConfig(config)
```

配置必须在设计器实例创建后立即应用，否则将使用默认配置。

### 3.4 技术栈

- SpreadJS 16.0.1（核心表格组件）
- SpreadJS Designer 16.0.1（设计器组件）
- SpreadJS Designer Resources CN 16.0.1（简体中文资源包）
- SystemJS 0.19.22（模块加载器）
- TypeScript 4.1.2（开发语言）

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开浏览器的开发者工具（F12），查看控制台输出的 `config` 和 `resources` 对象结构
2. 观察设计器界面，可以看到 Ribbon 菜单栏已显示为繁体中文（開始、頁面佈局、數據、視圖、設置）
3. 点击"開始"选项卡中的边框设置按钮，打开边框对话框，可以看到对话框标题和预置选项已显示为繁体中文

## 五、功能特点

### 5.1 优点

- **灵活性高**：可以根据需要修改任意 UI 文字，不局限于繁体中文，也可以用于其他语言定制
- **实现简单**：只需修改配置对象和资源对象的属性值，无需修改源码或重新编译
- **可扩展性强**：通过打印配置和资源对象，可以发现所有可修改的文字项，便于全面定制

### 5.2 局限性与扩展建议

- **手动修改工作量大**：示例中仅修改了部分菜单和对话框文字，完整的繁体中文化需要逐一修改所有资源项
- **版本兼容性**：不同版本的 SpreadJS 配置结构可能不同，升级版本后需要重新检查修改项
- **扩展建议**：
  - 可以将所有繁体中文文字定义提取为独立的 JSON 配置文件，便于维护和复用
  - 可以开发自动化脚本，批量替换简体中文为繁体中文
  - 建议联系 GrapeCity 官方，获取完整的繁体中文资源包

## 六、总结

本示例展示了 SpreadJS Designer 界面本地化的基本方法，开发者可以学到以下知识点：

- 如何获取和修改设计器的配置对象（`DefaultConfig`）
- 如何获取和修改设计器的全局资源对象（`getResources/setResources`）
- 如何将修改后的配置应用到设计器实例（`setConfig`）
- 如何通过控制台调试查看配置和资源对象的结构

该方案适用于需要自定义设计器界面语言的场景，具有良好的扩展性。开发者可以在此基础上实现完整的多语言支持系统，满足不同地区用户的需求。

### 在线Demo（[全屏打开](https://jscodemine.grapecity.com/share/qBEz99e93kiI5JDtdkAK2g/)）
