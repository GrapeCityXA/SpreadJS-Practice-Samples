## 一、Demo 概述

本示例展示了如何在 SpreadJS 中实现下拉框（ComboBox）的联动功能。当用户在第一个下拉框中选择不同的选项时，第二个下拉框的可选项会根据第一个下拉框的选择动态更新。该示例模拟了一个教师-课程的关联场景：选择不同的老师后，对应的授课科目列表会自动更新。

## 二、解决的问题

在实际业务场景中，经常需要实现级联选择功能，例如：
- 省市区三级联动选择
- 类别-子类别的关联选择
- 教师-课程的对应关系
- 品牌-型号的关联筛选

本示例通过监听单元格值变化事件，动态更新关联下拉框的选项列表，实现了简单高效的联动效果。

## 三、实现思路

### 3.1 创建下拉框单元格类型

使用 `GC.Spread.Sheets.CellTypes.ComboBox()` 创建下拉框对象，并通过 `items()` 方法设置选项列表。每个选项包含 `text`（显示文本）和 `value`（实际值）两个属性。

```javascript
let combo1 = new GC.Spread.Sheets.CellTypes.ComboBox();
combo1.items([{
    text: '张老师',
    value: 'MrZhang'
}, {
    text: '王老师',
    value: 'MrWang'
}, {
    text: '李老师',
    value: 'MrLi'
}]);
combo1.editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.value);
sheet.setCellType(3, 2, combo1, GC.Spread.Sheets.SheetArea.viewport);
```

关键点：
- `editorValueType()` 设置为 `value` 模式，确保单元格存储的是 value 值而非 text
- `setCellType()` 将下拉框应用到指定单元格（第4行第3列，索引为 3, 2）

### 3.2 监听值变化事件实现联动

通过绑定 `ValueChanged` 事件，监听第一个下拉框的值变化，并根据新值动态更新第二个下拉框的选项列表。

```javascript
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    let row = info.row;
    let col = info.col;
    if (row == 3 && col == 2) {
        let value = info.newValue;
        if (value == "MrZhang") {
            combo2.items([{
                text: '英语',
                value: 'English'
            }, {
                text: '语文',
                value: 'Yuwen'
            }, {
                text: '数学',
                value: 'Shuxue'
            }]);
            sheet.setValue(3, 3, "English");
        }
        // 其他教师的课程配置...
    }
});
```

实现逻辑：
1. 判断变化的单元格是否为目标单元格（C4）
2. 获取新选择的值（`info.newValue`）
3. 根据不同的值更新 combo2 的选项列表
4. 自动设置第二个下拉框的默认值

### 3.3 技术栈

- SpreadJS 15.0.0：核心电子表格组件
- SystemJS 0.19.22：模块加载器
- TypeScript 4.1.2：开发语言支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 在浏览器中打开 index.html 文件
```

### 4.2 操作步骤

1. 打开页面后，可以看到 C4 和 D4 单元格已设置为下拉框
2. 点击 C4 单元格的下拉箭头，选择不同的教师：
   - 选择"张老师"：D4 显示英语/语文/数学
   - 选择"王老师"：D4 显示历史/地理/政治
   - 选择"李老师"：D4 显示体育/音乐/美术
3. 观察 D4 下拉框的选项如何根据 C4 的选择动态变化

## 五、功能特点

### 5.1 优点

- 实现简单：仅需监听一个事件即可完成联动逻辑
- 响应迅速：值变化时立即更新关联下拉框
- 易于扩展：可以轻松添加更多级联层级或更复杂的联动规则
- 用户体验好：自动设置默认值，避免出现无效选项

### 5.2 局限性与扩展建议

当前实现使用硬编码的方式配置联动关系，对于大量数据或复杂的联动规则，建议：
- 使用数据驱动的方式，将联动关系存储在配置对象或数据库中
- 支持多级联动（三级及以上）
- 添加数据验证，防止选择无效组合
- 考虑异步加载选项数据，适应远程数据源场景

## 六、关键代码片段

### 完整的联动逻辑实现

```javascript
// 监听C4单元格值更新事件，更新关联下拉框D4的内容
sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function(e, info) {
    let row = info.row;
    let col = info.col;
    if (row == 3 && col == 2) {
        let value = info.newValue;
        if (value == "MrZhang") {
            combo2.items([{
                text: '英语',
                value: 'English'
            }, {
                text: '语文',
                value: 'Yuwen'
            }, {
                text: '数学',
                value: 'Shuxue'
            }]);
            sheet.setValue(3, 3, "English");
        }
        if (value == "MrWang") {
            combo2.items([{
                text: '历史',
                value: 'Lishi'
            }, {
                text: '地理',
                value: 'Dili'
            }, {
                text: '政治',
                value: 'Zhengzhi'
            }]);
            sheet.setValue(3, 3, "Lishi");
        }
        if (value == "MrLi") {
            combo2.items([{
                text: '体育',
                value: 'Tiyu'
            }, {
                text: '音乐',
                value: 'Yinyue'
            }, {
                text: '美术',
                value: 'Meishu'
            }]);
            sheet.setValue(3, 3, "Tiyu");
        }
    }
});
```

## 七、总结

本示例展示了 SpreadJS 中实现下拉框联动的基本方法，通过事件监听和动态更新选项列表，可以轻松实现级联选择功能。开发者可以从中学到：

1. ComboBox 单元格类型的创建和配置方法
2. ValueChanged 事件的使用方式
3. 动态更新下拉框选项的技巧
4. editorValueType 的作用和设置方法

该方案适用于需要实现简单级联选择的场景，对于更复杂的业务需求，可以在此基础上扩展为数据驱动的联动机制，提升代码的可维护性和扩展性。

[操作视频](DOCUMENT_SITE_VIDEO_BUTTON_PREFIX:https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/SpreadJS%20realizes%20linkage%20of%20drop-down%20box.mp4)

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/0dS55WPk30C5uyPd9IID_w/)）
