import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()
let sheet = spread.getActiveSheet()
sheet.options.isProtected = true

let canEdit = true
function toggleStatus() {

    let config = GC.Spread.Sheets.Designer.DefaultConfig
    config.commandMap = {}
    let ribbonNode = config.ribbon[0].buttonGroups[2] // 字体的ribbon路径
    let commands = []

    findNode(ribbonNode)

    function findNode(node) {
        if (node instanceof Array) {
            for (let i = 0; i < node.length; i++) {
                findNode(node[i])
            }
        } else if (node.buttonGroups) {
            findNode(node.buttonGroups)
        } else if (node.commandGroup) {
            findNode(node.commandGroup)
        } else if (node.children) {
            if (node.command) {
                commands.push(node.command)
            }
            findNode(node.children)
        } else if (node.commands) {
            commands.push(...node.commands)
        } else {
            if (!node.type) {
                commands.push(node)
            }
        }
    }

    commands.forEach(commandName => {
        let command = GC.Spread.Sheets.Designer.getCommand(commandName)
        if (command) {
            console.log(commandName, command.visibleContext)
            if(canEdit) {
                command.enableContext = "true"
            } else {
                command.enableContext = "false"
            }
            config.commandMap[commandName] = command
        }
    })
    designer.setConfig(config)
    canEdit = !canEdit
}

document.getElementById("btn").addEventListener("click", toggleStatus)
