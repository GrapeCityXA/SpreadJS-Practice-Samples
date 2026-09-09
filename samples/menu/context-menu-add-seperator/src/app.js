import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
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



let cmd1 = {
    commandName: "子菜单",
    text: "子菜单",
    execute: async function (context, propertyName) {
        console.log(111)
    },
}
let cmd2 = {
    commandName: "子菜单2",
    text: "子菜单2",
    execute: async function (context, propertyName) {
        console.log(222)
    },
}
let menuItem = {
    commandName: "myCmd",
    text: "添加红框",
    visibleContext: "ClickViewport",
    subCommands: [
        cmd1, 'separator', cmd2
    ]
};
let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
config.commandMap = { abc: menuItem };
config.contextMenu.splice(1, 0, 'abc')
let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)

let spread = designer.getWorkbook()



function CustomMenuView() {
}

CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();
CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    var self = this;
    if (menuItemData.name === "separator") {
        var containers = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
        var supMenuItemContainer = containers[0];
        while (supMenuItemContainer.firstChild) {
            supMenuItemContainer.removeChild(supMenuItemContainer.firstChild);
        }
        supMenuItemContainer.setAttribute("class", "separatorIcon")
        return supMenuItemContainer;
    } else {
        return GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
    }
};
CustomMenuView.prototype.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && menuItemData.name === "selectColorPicker") {
        var ele = event.target || event.srcElement;
        return ele.style.backgroundColor;
    }
};

spread.contextMenu.menuView = new CustomMenuView();





