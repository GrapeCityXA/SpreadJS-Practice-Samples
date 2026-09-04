import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var sheet = spread.getSheet(0);
sheet.bind(GC.Spread.Sheets.Events.EditEnding, function (sender, args) {
    // element = $("span[class='gcsj-func-color-text']")[0];
    let element = document.getElementsByClassName('gcsj-func-color-text')[0];
    if (element !==undefined) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        // 谷歌、火狐
        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            // 选中的区域
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                // 克隆一个选中区域
                var preCaretRange = range.cloneRange();
                // 设置选中区域的节点内容为当前节点
                preCaretRange.selectNodeContents(element);
                // 重置选中区域的结束位置
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
            // IE
        } else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        alert("退出编辑前，光标停留在："+caretOffset);
    }
    return true

});
