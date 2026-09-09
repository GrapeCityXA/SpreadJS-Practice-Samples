## 一、Demo 概述

本示例展示了如何在 SpreadJS Designer 中注册自定义弹窗模板，实现省市级联选择功能。通过自定义 Ribbon 菜单按钮，用户可以打开一个包含联动下拉框的弹窗，当选择不同的省份时，对应的城市列表会动态显示。该示例演示了 SpreadJS Designer 的扩展能力，包括自定义命令、弹窗模板注册和条件显示控制。

## 二、解决的问题

- 在 SpreadJS Designer 中添加自定义业务功能入口，扩展标准工具栏
- 实现级联选择交互，根据上级选项动态显示下级选项
- 通过声明式配置创建复杂的弹窗 UI，无需手写 HTML/CSS
- 实现数据绑定和条件渲染，简化前端交互逻辑

## 三、实现思路

### 3.1 自定义 Ribbon 菜单

通过修改 `GC.Spread.Sheets.Designer.DefaultConfig` 配置对象，在 Designer 的 Ribbon 工具栏中添加自定义选项卡和按钮：

```javascript
var config = GC.Spread.Sheets.Designer.DefaultConfig
config.ribbon.push({
    "id": 'operate',
    "text": '自定义操作',
    "buttonGroups": [
        {
            "label": "其他功能",
            "thumbnailClass": "",
            "commandGroup": {
                "children": [
                    { "direction": "vertical", "commands": ["cascadeSelection"] }
                ]
            }
        },
    ]
})
```

这段代码在 Ribbon 中新增了一个名为"自定义操作"的选项卡，其中包含一个"其他功能"按钮组，绑定了 `cascadeSelection` 命令。

### 3.2 注册自定义命令

在 `config.commandMap` 中定义命令的执行逻辑：

```javascript
config.commandMap = {
    cascadeSelection: {
        title: "联动选择弹窗",
        text: "联动选择弹窗",
        iconClass: "ribbon-button-namemanager",
        bigButton: "true",
        commandName: "cascadeSelection",
        execute: async () => {
            let dialogOptiosn = {
                "province": 0,
                ...defaultOptions
            }
            GC.Spread.Sheets.Designer.showDialog("newTab", dialogOptiosn, (result) => {
                console.log(result)
            })
        }
    }
}
```

当用户点击按钮时，`execute` 方法会被调用，通过 `showDialog` 方法打开注册的弹窗模板，并传入初始数据。

### 3.3 弹窗模板定义与条件渲染

使用 JSON 配置定义弹窗的 UI 结构，核心是通过 `visibleWhen` 属性实现条件显示：

```javascript
const selectTemplate = {
    title: "选择数据源",
    content: [{
        type: "FlexContainer",
        children: [
            {
                "type": "Column",
                "children": [
                    {
                        "type": "TextBlock",
                        "text": "省："
                    }
                ],
                "width": "80px"
            },
            {
                "type": "Column",
                "children": [
                    {
                        "type": "ListComboEditor",
                        "items": ['陕西省', '广东省', '湖南省', '四川省', "福建省"].map((item, index) => {
                            return {
                                "text": item,
                                "value": index,
                                "selected": index === 0
                            }
                        }),
                        "bindingPath": "province",
                    }
                ],
                "width": "100px"
            }
        ]
    }]
}
```

### 3.4 动态生成城市下拉框

通过循环遍历城市数据，动态向模板中添加城市选择器，并使用 `visibleWhen` 属性绑定显示条件：

```javascript
let cityList = [['宝鸡市', "西安市"], ['湛江市', "广州市"], ["长沙市", "株洲市"], ["成都市", "眉山市"], ["厦门市", "福州市"]]
let defaultOptions = {}
cityList.forEach((item, index) => {
    selectTemplate.content[0].children.push({
        "type": "Column",
        "visibleWhen": `province=${index}`,
        "children": [
            {
                "type": "ListComboEditor",
                "items": item.map((k, kIndex) => {
                    return {
                        "text": k,
                        "value": kIndex,
                        "selected": kIndex === 0
                    }
                }),
                "bindingPath": `city_${index}`,
            }
        ],
        "width": "100px"
    })
    defaultOptions[`city_${index}`] = 0
})
```

`visibleWhen: "province=0"` 表示只有当 `province` 字段值为 0 时，该城市下拉框才会显示，从而实现级联效果。

### 3.5 注册模板

最后通过 `registerTemplate` 方法将模板注册到 Designer 中：

```javascript
GC.Spread.Sheets.Designer.registerTemplate("newTab", selectTemplate);
```

### 3.6 技术栈

- SpreadJS v17.0.8（核心表格引擎）
- SpreadJS Designer v17.0.8（设计器组件）
- SystemJS 0.19.22（模块加载器）

## 四、使用说明

### 4.1 运行方式

```bash
npm install
```

在浏览器中打开 `index.html` 文件即可运行。

### 4.2 操作步骤

1. 打开页面后，SpreadJS Designer 会自动加载
2. 在顶部 Ribbon 工具栏中找到"自定义操作"选项卡
3. 点击"联动选择弹窗"按钮
4. 在弹出的对话框中选择省份
5. 观察城市下拉框根据省份选择自动切换
6. 选择城市后点击确定，控制台会输出选择结果

## 五、功能特点

### 5.1 优点

- 声明式 UI 配置，无需手写 DOM 操作代码
- 通过 `visibleWhen` 实现条件渲染，逻辑清晰
- 数据绑定机制简化了表单数据管理
- 易于扩展，可以快速添加更多级联层级

### 5.2 局限性与扩展建议

- 当前示例中城市数据是硬编码的，实际应用中应从后端 API 动态获取
- 可以扩展为三级或多级联动（省-市-区）
- 可以添加数据验证逻辑，确保用户必须选择完整的省市信息
- 可以将选择结果写入到 SpreadJS 的单元格中，实现与表格数据的联动

## 六、关键代码片段

### 条件显示配置

```javascript
{
    "type": "Column",
    "visibleWhen": `province=${index}`,  // 核心：根据 province 值控制显示
    "children": [
        {
            "type": "ListComboEditor",
            "bindingPath": `city_${index}`,  // 数据绑定路径
        }
    ]
}
```

### 弹窗调用与回调

```javascript
GC.Spread.Sheets.Designer.showDialog("newTab", dialogOptiosn, (result) => {
    console.log(result)  // result 包含用户选择的所有字段值
})
```

## 七、总结

本示例展示了 SpreadJS Designer 的高级扩展能力，开发者可以学到：

- 如何自定义 Designer 的 Ribbon 菜单和命令
- 如何使用 JSON 配置创建复杂的弹窗 UI
- 如何实现条件渲染和数据绑定
- 如何通过 `visibleWhen` 属性实现级联选择交互

该方案适用于需要在 SpreadJS Designer 中集成自定义业务逻辑的场景，特别是需要用户输入结构化数据的情况。通过模板注册机制，可以快速构建各种复杂的表单交互，而无需深入了解底层 DOM 操作。

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/Bf9QymmO9kuhJAx0ZGIxZQ/)）
