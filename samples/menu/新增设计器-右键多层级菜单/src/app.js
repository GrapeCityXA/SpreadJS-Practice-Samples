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


let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))

let subCustomCommand1_1 = {
    text: "子级菜单1-1",
    commandName: "subCustomCommand1_1",
    execute: (context) => {
        console.log("sub 1-1")
    }
}
let subCustomCommand1_2 = {
    text: "子级菜单1-2",
    commandName: "subCustomCommand1_2",
    execute: (context) => {
        console.log("sub 1-2")
    }
}
let subCustomCommand2_1 = {
    text: "子级菜单2-1",
    commandName: "subCustomCommand2_1",
    execute: (context) => {
        console.log("sub 2-1")
    }
}
let subCustomCommand2_2 = {
    text: "子级菜单2-2",
    commandName: "subCustomCommand2_2",
    execute: (context) => {
        console.log("sub 2-2")
    }
}
let subCustomCommand1 = {
    text: "子级菜单1",
    commandName: "subCustomCommand1",
    subCommands: [subCustomCommand1_1, subCustomCommand1_2],
    execute: (context) => {
        console.log("sub 1")
    }
}
let subCustomCommand2 = {
    text: "子级菜单2",
    commandName: "subCustomCommand2",
    subCommands: [subCustomCommand2_1, subCustomCommand2_2],
    execute: (context) => {
        console.log("sub 2")
    }
}
let customCommand = {
    text: "自定义菜单",
    commandName: "customCommand",
    visibleContext: "ClickViewport",
    subCommands: [subCustomCommand1, subCustomCommand2]
}


// 追加自定义命令
config.contextMenu.unshift("customCommand")
config.commandMap = {
    customCommand,
}


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container", config)
let spread = designer.getWorkbook()

spread.commandManager().register("subCustomCommand1_1", subCustomCommand1_1);
spread.commandManager().register("subCustomCommand1_2", subCustomCommand1_2);
spread.commandManager().register("subCustomCommand2_1", subCustomCommand2_1);
spread.commandManager().register("subCustomCommand2_2", subCustomCommand2_2);


let menuData = spread.contextMenu.menuData
menuData.unshift({
    text: "自定义菜单",
    name: "customCommand",
    command: "customCommand",
    subMenu: [{
        text: "子级菜单1",
        iconClass: "c-submenu-1",
        name: "subCustomCommand1",
        command: "subCustomCommand1",
        subMenu: [{
            text: "子级菜单1-1",
            iconClass: "",
            name: "子级菜单1-1",
            command: "subCustomCommand1_1",
        }, {
            text: "子级菜单1-2",
            iconClass: "",
            name: "子级菜单1-2",
            command: "subCustomCommand1_2",
        }]
    }, {
        text: "子级菜单2",
        iconClass: "c-submenu-2",
        name: "subCustomCommand2",
        command: "subCustomCommand2",
        subMenu: [{
            text: "子级菜单2-1",
            iconClass: "",
            name: "子级菜单2-1",
            command: "subCustomCommand2_1",
        }, {
            text: "子级菜单2-2",
            iconClass: "",
            name: "子级菜单2-2",
            command: "subCustomCommand2_2",
        }]
    }]
})
spread.contextMenu.menuData = menuData

let sheet = spread.getActiveSheet()

// 由于SpreadJS本身不支持三级菜单，上面的写法会导致二级菜单重复高亮，故用js操控dom来控制显示效果
spread.contextMenu.onMenuOpened = function () {
    let controllers = []
    let c_1
    if (AbortController) {
        c_1 = new AbortController()
        controllers.push(c_1)
    }
    document.getElementById("gc-dialog1").addEventListener("DOMNodeRemovedFromDocument", function () {
        // controllers中存储了所有的监听，在dom被销毁时，统一移除监听，节约资源
        controllers.forEach(c => {
            c.abort()
        })
    }, c_1)
    /**
     * 重要：这里的class是出问题的菜单对应的iconClass，必须写上
     */
    let classes = ["c-submenu-1", "c-submenu-2"]
    classes.forEach(c => {
        let c_dom = document.querySelector("." + c)
        c_dom = c_dom.parentNode
        while (true) {
            if (Array.from(c_dom.classList).indexOf("gc-ui-contextmenu-menuitem") > -1) {
                break
            }
            c_dom = c_dom.parentNode
        }
        let p_dom = c_dom.parentNode
        p_dom.childNodes.forEach(node1 => {
            let controller
            if (AbortController) {
                controller = new AbortController()
                controllers.push(controller)
            }
            node1.addEventListener("mouseenter", function () {
                p_dom.childNodes.forEach(node2 => {
                    if (node2 != node1) {
                        node2.style.background = "#ffffff"
                    } else {
                        node2.style.background = ""
                    }
                })
            }, controller)
        })
    })
}



