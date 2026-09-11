# control-cell-editable

# 实现单元格编辑可控

### 问题：如何用自定义单元格实现编辑可控

***

#### 背景

在某些情况下，用户需要通过按钮实现某个单元格是否可编辑（每一个单元格都有对应的一个按钮来控制这个单元格是否可编辑）。 
当用户点击按钮后，单元格变为可编辑状态，按钮变成另一个样式作为提示。之后用户在编辑完成之后再次点击按钮，单元格变为不可编辑状态。

#### 实现思路

对于这样的需求，首先要知道编辑状态的控制可以通过单元格更改单元格锁定状态结合表单保护来实现。
那么这个需求就被分解成了如何做一个带有按钮的单元格，并将上述更改锁定状态的控制集成到单元格本身的生命周期中，这样的需求就非常符合自定义单元格的功能。
所以，首先定义一个自定义单元格的对象：

```auto
function ImageCellType() {
    this.iconFlag = true;
}
```

这里设置了一个iconFlag的属性，起一个标记的作用，用于判断按钮图片的切换。
接下来，指定自定义单元格的继承关系，将他的原型设置为GC.Spread.Sheets.CellTypes.Text：

```auto
ImageCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
```

下面我们需要重写里面的一些方法，paint是首当其冲要重写的。paint本身控制着单元格绘制的相关逻辑，并且在每次重绘的时候都会被调用。所以我们需要在paint中加入绘制按钮的相关逻辑，paint中会提供canvas的底层对象，通过底层canvas对象我们可以自由的在单元格上绘制各种内容：文字，图片，图形等。

```auto
ImageCellType.prototype.paint = function (ctx, value, x, y, width, height, style, context) {
    GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, width - 20, height, style, context]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (!this.iconFlag) {
        ctx.drawImage(rightImg, x + width - 20, y, 20, 20);
    } else {
        ctx.drawImage(errorImg, x + width - 20, y, 20, 20);
    }
    ctx.restore();
    return;
};
```

这里主要是根据iconFlag来绘制不同的图片的方法逻辑。
这里的两张图片必须在初始化的时候提前加载好，如果在paint方法中加载会造成死循环（因为如果是paint方法中加载图片，图片本身是一个异步加载，加载好之后又会触发画布的重绘，那么会继续调用paint方法，如此往复会造成死循环，所以图片需要在外部提前加载好缓存起来）。
外部加载图片的代码如下：

```auto
let rightImg = new Image(); //指定图片的URL
rightImg.src = "./assets/right.png";
let errorImg = new Image(); //指定图片的URL
errorImg.src = "./assets/wrong.png";
rightImg.onload = function () {
    sheet.repaint();
};
errorImg.onload = function () {
    sheet.repaint();
};
```

之后要重写getHitInfo方法，getHitInfo方法用于获取点击之后的位置信息。因为需要判断单元格的点击位置，从而获取鼠标单击的位置是否是在按钮上，所以需要重新改写该方法：

```auto
ImageCellType.prototype.getHitInfo = function (
    x,
    y,
    cellStyle,
    cellRect,
    context
) {
    var info = {
        x: x,
        y: y,
        row: context.row,
        col: context.col,
        cellStyle: cellStyle,
        cellRect: cellRect,
        sheetArea: context.sheetArea,
    };

    if (
        cellRect.x + cellRect.width - 20 < x &&
        x < cellRect.x + cellRect.width &&
        cellRect.y < y &&
        y < cellRect.y + 20
    ) {
        info.isReservedLocation = true;
    }

    return info;
};
```

接下来，可以根据上述信息重写processMouseMove方法，在方法中通过getHitInfo方法返回的信息，更改鼠标指针的状态（当鼠标悬浮在按钮之上时，可以调整指针为手形）。

```auto
ImageCellType.prototype.processMouseMove = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var div = sheet.getParent().getHost();
    var canvasId = div.id + "vp_vp";
    var canvas = document.querySelectorAll("#" + canvasId)[0];
    if (sheet && hitInfo.isReservedLocation) {
        canvas.style.cursor = "pointer";
        return true;
    } else {
        canvas.style.cursor = "default";
    }
    return false;
};
```

之后，重写processMouseUp方法，processMouseUp方法在鼠标点击之后向上弹时触发。在方法中我们可以根据之前的判断，定位鼠标点击的是否是按钮单元格，如果是按钮单元格就需要调整该单元格的locked状态，用于该单元格只读还是可编辑的控制。

```auto
ImageCellType.prototype.processMouseUp = function (hitInfo) {
    var sheet = hitInfo.sheet;
    var that = this;
    if (sheet && hitInfo.isReservedLocation) {
        if (that.iconFlag) {
            that.iconFlag = false;
        } else {
            that.iconFlag = true;
        }
        setTimeout(function () {
            var cell = hitInfo.sheet.getCell(hitInfo.row, hitInfo.col);
            cell.locked(that.iconFlag);
        }, 0);
        sheet.repaint();
        return true;
    }
    return false;
};
```

这样，我们就完成了自定义单元格的设置，接下来就是给单元格设置celltype为ImageCellType来测试一下实际的效果。

```auto
sheet.setCellType(0, 0, new ImageCellType());
sheet.options.isProtected = true;
sheet.setValue(0, 0, "葡萄城");
sheet.setColumnWidth(0, 100)
```

这里额外设置了sheet.options.isProtected = true; 即为表单保护，因为单元格锁定需要配合表单保护才能控制单元格的只读状态。实际效果如下图所示：
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.0d9208.png?width=250)
默认加载后单元格不可编辑，按钮为“×”。点击按钮后单元格可编辑，按钮变为“√”。
![image](/DOCUMENT_SITE_LINK_PREFIX_HERE/document-site-files/images/6dac7158-28fc-4aba-b07b-33f4b5b16b1b/image-20260309.ec5c68.png?width=250)

For more information about SpreadJS, please visit:

SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs

SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet

SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide

SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
