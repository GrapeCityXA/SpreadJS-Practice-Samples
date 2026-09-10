# area-limited-when-drag-floating-object

### 需求：如何限制浮动对象拖动范围

#### 背景：

用户希望将自定义浮动对象限制在某一单元格区域内拖动，超过区域则强制拖回区域边缘位置。

#### 实现方式：

监听FloatingObjectChanged事件，当拖动位置超过单元格区域时，强制修改浮动对象的xy坐标。
实现代码如下：

```javascript
// 设置浮动元素
let customFloatingObject = new GC.Spread.Sheets.FloatingObjects.FloatingObject('f1');
customFloatingObject.startRow(1);
customFloatingObject.startColumn(1);
customFloatingObject.endColumn(6);
customFloatingObject.endRow(6);
let div = document.createElement('div');
div.innerHTML = "<div style=\"text-align: center; font-size: 26px;\">浮动对象无法拖动出灰色区域</div>";
div.style.background = '#409EFF';
customFloatingObject.content(div);
sheet.floatingObjects.add(customFloatingObject);

// 设置区域背景色
sheet.getRange(0, 0, 10 + 5, 10 + 5, GC.Spread.Sheets.SheetArea.viewport).backColor("#F2F3F5");
sheet.bind(GC.Spread.Sheets.Events.FloatingObjectChanged, function (e, info) {
    let floatingObject = info.floatingObject
    let x = floatingObject.x();
    let y = floatingObject.y();
    let rangeX = sheet.getColumnWidth(0) * 10;
    let rangeY = sheet.getRowHeight(0) * 10;
    // 限制单元格区域为10行、10列
    if (x > rangeX) {
        floatingObject.x(rangeX);
    } else if (y > rangeY) {
        floatingObject.y(rangeY);
    }
});
```

实现效果如下动图所示：
![](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/GIF%202026-3-17%2012-16-26-20260317.e1d788.gif?width=400)

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
