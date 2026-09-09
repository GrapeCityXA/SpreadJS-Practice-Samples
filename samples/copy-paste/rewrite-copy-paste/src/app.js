import * as GC from "@grapecity-software/spread-sheets";
var spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'), {
    sheetCount: 1
});
spread.options.allowExtendPasteRange = true;
spread.getActiveSheet().setArray(1, 1, [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]);

// 1、禁用ctrl+c ctrl+v功能
document.getElementById('ss').onkeydown = function () {
    if (event.ctrlKey && (window.event.keyCode == 67 || window.event.keyCode == 86)) {
        alert("禁止：" + window.event.keyCode);
        return false;
    }
}
// 2、重写copy命令
spread.commandManager().register("myCopy", {
    canUndo: true,
    execute: function (context, options, isUndo) {
        setTimeout(function () {
            options.cmd = "copy";
            alert("myCopy")
            spread.commandManager().execute(options);
            options.cmd = "myCopy";
        }, 10);
    }
});

// 设置快捷键Ctrl + C
spread.commandManager().setShortcutKey(
    "copy", null, false, false, false, false
);
spread.commandManager().setShortcutKey(
    "myCopy", GC.Spread.Commands.Key.c, true, false, false, false
);

// 3、重写paste命令
spread.commandManager().register("myPaste", {
    canUndo: true,
    execute: function (context, options, isUndo) {
        //内部粘贴逻辑
        var innerPaste = "paste";
        options.cmd = innerPaste;
        // 设置setTimeout，让开时间窗口，否则SpreadJS会自动粘贴外部内容。
        alert("myPaste")
        setTimeout(function () {
            spread.commandManager().execute(options);
        }, 10);
    }
});
// 设置快捷键Ctrl + V
spread.commandManager().setShortcutKey(
    "paste", null, false, false, false, false
);
spread.commandManager().setShortcutKey(
    "myPaste", GC.Spread.Commands.Key.v, true, false, false, false
);

spread.bind(GC.Spread.Sheets.Events.ClipboardPasting, function (sender, args) {
    console.log(args);
});