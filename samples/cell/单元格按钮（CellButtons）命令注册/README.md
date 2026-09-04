### 问题：CellButtons如何注册命令

***

首先我们先简单学习下 [cellButtons](/spreadjs/help/docs/features/cells/celltypes/cellbutton)
单元格按钮 cellButtons 是一组多个预定义按钮，可以嵌入到单元各中并可以运行各种命令。
它支持多种方式的命令，分为SpreadJS的内置命令，function类型函数，以及自定义命令。
1\. SpreadJS 内置命令

```javascript
let style1 = new GC.Spread.Sheets.Style();
style1.cellButtons= [{
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
        command: "openColorPicker",
    }
];
sheet.setStyle(1, 3, style1);
```

2\. function类型：

```javascript
let style2 = new GC.Spread.Sheets.Style();
style2.cellButtons= [{
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
        command: function() {
            alert("不注册命令，直接写Function")
        }
    }
];
sheet.setStyle(3, 3, style2);
```

3\. 自定义命令：

```javascript
let command = {
    canUndo: true,
    execute: function (context, options, isUndo) {
        alert('自定义命令');
    }
}
let commandManager = spread.commandManager();
commandManager.register("alertSth", command);

let style3 = new GC.Spread.Sheets.Style();
style3.cellButtons= [{
        imageType: GC.Spread.Sheets.ButtonImageType.dropdown,
        command: "alertSth",
    }
];
sheet.setStyle(5, 3, style3);
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/K8RtWMHkhkO40DKTVToPOw/){:target="_blank"}）
