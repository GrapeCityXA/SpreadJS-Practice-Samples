### 需求：SpreadJS注册“ALT+；”快捷键，实现拷贝忽略隐藏行

#### 背景：

复制选中区域时，若区域中包含隐藏区域，默认也会复制这些隐藏区域。在Excel中，若复制时不想包含隐藏区域，可以在复制前先按下“ALT+；”快捷键，再进行复制粘贴，就可以实现拷贝时忽略隐藏区域。因此，不少客户希望SpreadJS也能具备这个功能。

>type=info
> 请注意，SpreadJS从V17.1.9版本开始，已经在设计器中默认支持了该快捷键，如果您正在使用17.1.9及以上的版本，并且使用了设计器，则可以直接使用 alt+; 快捷键，否则，请查看demo中的写法。

#### 实现方法：

分析Excel中“ALT+；”快捷键的作用，发现它其实是结合隐藏区域，将选中区域做拆分。按下“ALT+;"时，检查当前选中区域是否包隐藏区域，如果包含隐藏区域，则用隐藏区域将当前选中区域拆分出来。拆分完成之后，正常执行复制黏贴逻辑即可。

```javascript
spread.commandManager().register("selectIgnoreHidden", {
    canUndo: false,
    execute: function (spread, options, isUndo) {
        let sheet = spread.getActiveSheet();
        spread.suspendPaint();
        let sels = sheet.getSelections();
        let newSels = [];
        for (let sel of sels) {
            let originalRange = sel;
            if (originalRange.row !== -1) {
                let newRanges = [];
                let lastVisibleRow = -1;
                for (let r = 0; r < originalRange.rowCount; r++) {
                    let row = originalRange.row + r;
                    if (!sheet.getRowVisible(row)) {
                        if (lastVisibleRow !== -1) {
                            newRanges.push(new GC.Spread.Sheets.Range(lastVisibleRow, originalRange.col, row - lastVisibleRow, originalRange.colCount));
                            lastVisibleRow = -1;
                        }
                    }
                    else if (lastVisibleRow === -1) {
                        lastVisibleRow = row;
                    }
                }
                if (lastVisibleRow !== -1) {
                    newRanges.push(new GC.Spread.Sheets.Range(lastVisibleRow, originalRange.col, originalRange.row + originalRange.rowCount - lastVisibleRow, originalRange.colCount));
                }
                newSels = newSels.concat(newRanges);
            }
        }
        sheet.clearSelection();
        for (let sel of newSels) {
            sheet.addSelection(sel.row, sel.col, sel.rowCount, sel.colCount);
        }
        spread.resumePaint();
    }
}, 186, false, false, true, false);
```

### 在线 Demo （[全屏打开](https://jscodemine.grapecity.com/share/B3vvZ5Lc5U6DZVRoDUCicQ/){:target="_blank"}）
