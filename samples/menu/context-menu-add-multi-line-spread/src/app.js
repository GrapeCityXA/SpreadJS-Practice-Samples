import * as GC from "@grapecity-software/spread-sheets";


let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet()
sheet.setValue(0,0,"←--请在这里点击鼠标右键查看效果")
let oldOpenMenu = spread.contextMenu.onOpenMenu
// 在右键菜单新增选项
spread.contextMenu.onOpenMenu = function (menuData, itemsDataForShown, hitInfo, spread) {
    itemsDataForShown.push({
        text: "插入行",
        name: "insertMutiRows",
        visibleContext: "ClickRowHeader",
        command: "insertMutiRows"
    })
    oldOpenMenu.apply(this, arguments)
}
// 注册插入多行的命令
let commandManager = spread.commandManager();
let insertRowsByCounts = {
    canUndo: true,
    canExcute: function () {
    },
    execute: function (_spread, options, isUndo) {
        var Commands = GC.Spread.Sheets.Commands;
        if (isUndo) {
            Commands.undoTransaction(_spread, options);
            return true;
        } else {
            Commands.startTransaction(_spread, options);
            if (options.rowCount) {
                var _sheet = _spread.getSheetFromName(options.sheetName);
                _sheet.suspendPaint();
                _sheet.addRows(options.startRow, parseInt(options.rowCount));
                _sheet.resumePaint();
            }
            Commands.endTransaction(_spread, options);
            return true;
        }
    }
};
commandManager.register("insertMutiRows", insertRowsByCounts, null, false, false, false, false);

// 插入多行的菜单对应的html元素创建
let oldCreateMenuItemElement = spread.contextMenu.menuView.createMenuItemElement;
spread.contextMenu.menuView.createMenuItemElement = function (menuItemData) {
    let menuItemView = oldCreateMenuItemElement.call(this, menuItemData);
    if (menuItemData.name === "insertMutiRows") {
        let supMenuItemContainer = menuItemView[0];

        let inputBlock = createInput();
        let btnupBlock = createBtn();

        supMenuItemContainer.appendChild(inputBlock);
        supMenuItemContainer.appendChild(btnupBlock);

    }
    return menuItemView;
}

let oldgetCommandOptions = spread.contextMenu.menuView.getCommandOptions;
spread.contextMenu.menuView.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && menuItemData.name === "insertMutiRows") {
        let ele = document.getElementsByClassName("inputBlock")[0]
        return ele.value;
    }
    else {
        return oldgetCommandOptions.apply(this, arguments)
    }
};

function createInput() {
    let inputBlock = document.createElement('input');
    inputBlock.type = 'text';
    inputBlock.value = '1';
    inputBlock.className = 'inputBlock';
    inputBlock.style = 'width: 20px';
    inputBlock.setAttribute('gcUIElement', 'gcContextMenu');
    inputBlock.onclick = function (ev) {
        if (ev.target) {
            ev.stopPropagation()
        }
    }
    inputBlock.onkeydown = function (e) {
        console.log(e)
        // 输入完成，按下回车键后自动执行命令
        if (e.key == "Enter") {
            spread.commandManager().execute({
                cmd: "insertMutiRows",
                sheetName: spread.getActiveSheet().name(),
                rowCount: inputBlock.value,
                startRow: spread.getActiveSheet().getActiveRowIndex()
            })
            // 自动关闭contextmenu
            let dom = document.querySelector("div.gc-ui-contextmenu-container")
            while(true) {
                if(dom.id == "gc-dialog1") {
                    break
                }
                dom = dom.parentNode
            }
            dom.style.display = "none"
        }
    }
    return inputBlock;
}

function createBtn() {
    let inputBlock = document.createElement('p');
    inputBlock.innerText = "行";
    inputBlock.className = 'btnBlock';
    inputBlock.style = 'display :inline;margin-left: 10px; ';
    return inputBlock;
}