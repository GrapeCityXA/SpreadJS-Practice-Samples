import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-resources-zh"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



var designerConfig = JSON.parse(
    JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig)
);
designerConfig.contextMenu.unshift("insertMutiRows");

designerConfig.commandMap = {
    "insertMutiRows": {
        text: "插入行",
        commandName: "insertMutiRows",
        visibleContext: "ClickRowHeader",
    }

}



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)

let spread = designer.getWorkbook()

spread.setSheetCount(5)

let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, '←在左侧行头点击右键')


let commandManager = spread.commandManager();
var insertRowsByCounts = {
    canUndo: true,
    canExcute: function () {
        console.log(arguments)
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



var oldCreateMenuItemElement = spread.contextMenu.menuView.createMenuItemElement;
spread.contextMenu.menuView.createMenuItemElement = function (menuItemData) {
    var self = this;
    var menuItemView = oldCreateMenuItemElement.call(self, menuItemData);
    if (menuItemData.name === "insertMutiRows") {
        var supMenuItemContainer = menuItemView[0];

        var inputBlock = createInput();
        var btnupBlock = createBtn();

        supMenuItemContainer.appendChild(inputBlock);
        supMenuItemContainer.appendChild(btnupBlock);

    }
    return menuItemView;
}

var oldgetCommandOptions = spread.contextMenu.menuView.getCommandOptions;
spread.contextMenu.menuView.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && menuItemData.name === "insertMutiRows") {
        var ele = document.getElementsByClassName("inputBlock")[0]
        return ele.value;
    }
    else {
        return oldgetCommandOptions.apply(this, arguments)
    }
};




function createInput() {
    var inputBlock = document.createElement('input');
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
        if (e.key == "Enter") {
            spread.commandManager().execute({
                cmd: "insertMutiRows",
                sheetName: spread.getActiveSheet().name(),
                rowCount: inputBlock.value,
                startRow: spread.getActiveSheet().getActiveRowIndex()
            })
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
    var inputBlock = document.createElement('p');
    inputBlock.innerText = "行";
    inputBlock.className = 'btnBlock';
    inputBlock.style = 'display :inline;margin-left: 10px; ';
    return inputBlock;
}
