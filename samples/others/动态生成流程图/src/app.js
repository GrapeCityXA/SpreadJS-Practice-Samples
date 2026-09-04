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



let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")

let spread = designer.getWorkbook()

import data from "./shapeInfo.js"
let shapeInfo = JSON.parse(JSON.stringify(data.shapeInfo))
let SpreadTypes = GC.Spread.Sheets.Shapes.AutoShapeType
let not_start_color = "#d8d8d8"
let in_process_color = "#bf9000"
let finish_color = "#305796"
let isPrinting = false
function initSpread() {
    GC.Spread.Common.CultureManager.culture("zh-cn");
    designer = new GC.Spread.Sheets.Designer.Designer(document.getElementById("designer-container"));
    spread = designer.getWorkbook()
    let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig))
    config.ribbon.push({
        id: "process-control",
        text: "流程控制",
        buttonGroups: [{
            label: "控制按钮区",
            commandGroup: {
                children: ["unstartProcess", "inProcess", "finishProcess"]
            }
        }, {
            label: "导出",
            commandGroup: {
                children: ["exportProcess", "printProcessJson"]
            }
        }]
    })

    config.commandMap = {
        unstartProcess: {
            title: "设置流程为未开始",
            text: "未开始",
            iconClass: "ribbon-button-unstart-process",
            bigButton: "true",
            commandName: "unstartProcess",
            execute: function (designer) {
                let spread = designer.getWorkbook()
                let sheet = spread.getActiveSheet()
                spread.commandManager().execute({
                    cmd: "changeShapeColor",
                    sheetName: sheet.name(),
                    flag: 0
                })
            }
        },
        inProcess: {
            title: "设置流程为进行中",
            text: "进行中",
            iconClass: "ribbon-button-in-process",
            bigButton: "true",
            commandName: "inProcess",
            execute: function (designer) {
                let spread = designer.getWorkbook()
                let sheet = spread.getActiveSheet()
                spread.commandManager().execute({
                    cmd: "changeShapeColor",
                    sheetName: sheet.name(),
                    flag: 1
                })
            }
        },
        finishProcess: {
            title: "设置流程为已完成",
            text: "已完成",
            iconClass: "ribbon-button-finish-process",
            bigButton: "true",
            commandName: "finishProcess",
            execute: function (designer) {
                let spread = designer.getWorkbook()
                let sheet = spread.getActiveSheet()
                spread.commandManager().execute({
                    cmd: "changeShapeColor",
                    sheetName: sheet.name(),
                    flag: 2
                })
            }
        },
        exportProcess: {
            title: "导出流程图为图片",
            text: "导出图片",
            iconClass: "ribbon-button-export",
            bigButton: true,
            commandName: "exportProcess",
            execute: function (designer) {
                let spread = designer.getWorkbook()
                if (isPrinting) {
                    return;
                }
                spread.bind(GC.Spread.Sheets.Events.BeforePrint, function (s, e) {
                    var iframe = e.iframe;
                    var images = iframe.contentWindow.document.getElementsByTagName("img");
                    for (var i = 0; i < images.length; i++) {
                        var img = images[i];
                        let width = img.style.width.split("px")[0]
                        let height = img.style.height.split("px")[0]
                        if (parseFloat(width) / parseFloat(height) > 10) {
                            continue
                        }
                        var canvas = document.createElement("canvas");
                        canvas.height = img.naturalHeight;
                        canvas.width = img.naturalWidth;
                        var ctx = canvas.getContext('2d');
                        ctx.fillStyle = "#FFF";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0) //, img.width, img.height);
                        canvas.toBlob(function (blob) {
                            saveAs(blob, "print.jpeg");
                        }, "image/jpeg", 1);
                    }
                    e.cancel = true;
                    setTimeout(function () {
                        isPrinting = false;
                        spread.unbind(GC.Spread.Sheets.Events.BeforePrint)
                    }, 10)
                });
                isPrinting = true;
                let sheet = spread.getActiveSheet()
                let printInfo = sheet.printInfo()
                // 质量大于4才会生成图片
                printInfo.qualityFactor(6)
                //打印时隐藏列头          
                printInfo.showColumnHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
                // 打印时隐藏行头         
                printInfo.showRowHeader(GC.Spread.Sheets.Print.PrintVisibilityType.hide)
                //设置打印纸张，大一点导出的图片会在一张
                printInfo.paperSize(new GC.Spread.Sheets.Print.PaperSize(GC.Spread.Sheets.Print.PaperKind.a2))
                spread.print();
            }
        },
        printProcessJson: {
            title: "打印流程json到控制台",
            text: "打印json",
            iconClass: "ribbon-button-print-json",
            bigButton: true,
            commandName: "printProcessJson",
            execute: function () {
                let info = JSON.parse(JSON.stringify(shapeInfo))
                clearUselessKeys(info)
                console.log(info)
                alert("打印成功，请按下F12在控制台查看")
            }
        }
    }

    // 根据流程状态，更改形状的背景色
    let changeShapeColor = {
        canUndo: true,
        execute: function (spread, options, isUndo) {
            var Commands = GC.Spread.Sheets.Commands;
            if (isUndo) {
                Commands.undoTransaction(spread, options);
                return true;
            } else {
                Commands.startTransaction(spread, options);
                spread.suspendPaint();
                let selectedShapes = getSelectedShapes(spread)
                let flag_2_color = [not_start_color, in_process_color, finish_color]
                selectedShapes.forEach(shape => {
                    if (!shape.infoId) {
                        alert("非流程元素，禁止设置")
                        return
                    }
                    let style = shape.style()
                    style.fill.color = flag_2_color[options.flag]
                    shape.style(style)
                    getInfoFromId(shape.infoId).process = options.flag
                })
                spread.resumePaint();
                Commands.endTransaction(spread, options);
                return true;
            }
        }
    }


    designer = new GC.Spread.Sheets.Designer.Designer(document.getElementById("designer-container"));
    designer.setConfig(config)
    spread = designer.getWorkbook()
    spread.getActiveSheet().setColumnCount(100)
    let commandMgr = spread.commandManager()
    commandMgr.register("changeShapeColor", changeShapeColor)

    initShapes()

    let timer
    spread.getActiveSheet().bind(GC.Spread.Sheets.Events.ShapeChanged, function (e, arg) {
        if (arg.propertyName == "x" || arg.propertyName == "y" || arg.propertyName == "width" || arg.propertyName == "height") {
            clearTimeout(timer)
            timer = setTimeout(() => {
                // 当shape移动时，更新浮动的文字（是/否）
                addDecisionText()
            }, 100);
        }
        let shape = arg.shape
        let info = getInfoFromId(shape.infoId)
        if (!info) {
            return
        }
        // 更新数据model
        if (arg.propertyName == "width") {
            info.width = shape.width()
        }
        if (arg.propertyName == "height") {
            info.height = shape.height()
        }
        if (arg.propertyName == "x") {
            info.x = shape.x()
        }
        if (arg.propertyName == "y") {
            info.y = shape.y()
        }
        if (arg.propertyName == "text") {
            info.text = shape.text()
        }
    });
}

// 获取当前被选中的形状
function getSelectedShapes(spread) {
    let shapes = []
    spread.getActiveSheet().shapes.all().forEach(s => {
        if (s.isSelected() && !s.startConnector) {
            shapes.push(s)
        }
    })
    return shapes
}

// 默认的形状config
let shapeConfig = {
    width: 100,
    height: 55
}
function initShapes() {
    // 初始化所有形状，挂载函数方法
    shapeInfo.elements.forEach(info => {
        let shape = spread.getActiveSheet().shapes.add("", info.type)
        shape.text(info.text)
        info.width = info.width || shapeConfig.width
        info.height = info.height || shapeConfig.height
        shape.width(info.width)
        shape.height(info.height)
        // 把数据model的id也挂在shape上，方便通过shape取model
        shape.infoId = info.id
        let style = shape.style()
        switch (info.process) {
            case 1: {
                style.fill.color = in_process_color
                break
            }
            case 2: {
                style.fill.color = finish_color
                break
            }
            default: {
                style.fill.color = not_start_color
                break
            }
        }
        info.process = info.process || 0
        getShapeFromId(info.id).style(style)
        // 挂载next和prev函数，返回下一级或上一级形状信息
        info.next = function () {
            let nextIds = shapeInfo.edge.filter(e => {
                return e.source == this.id
            }).map(e => {
                return e.target
            })
            return shapeInfo.elements.filter(e => {
                return nextIds.indexOf(e.id) > -1
            })
        }
        info.prev = function () {
            let prevIds = shapeInfo.edge.filter(e => {
                return e.target == this.id
            }).map(e => {
                return e.source
            })
            return shapeInfo.elements.filter(e => {
                return prevIds.indexOf(e.id) > -1
            })
        }
    })

    // 计算各个形状的位置

    // 1. 递归计算最高有几层
    let maxLvl = getMaxLvl(shapeInfo.elements[0], 1)
    console.log(maxLvl)
    // 2. 设置第一个流程的位置
    shapeInfo.elements[0].y = maxLvl * 70
    shapeInfo.elements[0].x = 50
    // 3. 递归计算其他流程图的位置
    calcPosition(shapeInfo.elements[0])
    // 4. 设置位置
    shapeInfo.elements.forEach(info => {
        let shape = getShapeFromId(info.id)
        shape.x(info.x)
        shape.y(info.y || 0)
    })

    // 设置流程之间的连接关系
    setConnector(shapeInfo.elements[0])
    // 添加决策图的 是/否 文字
    addDecisionText()
}

// 清除临时插入数据model的键值
function clearUselessKeys(info) {
    info.elements.forEach(i => {
        delete i.connectors
        delete i.hasCalcPos
        delete i.hasCountMax
        delete i.hasSetConn
    })
}

function getMaxLvl(info, lvl) {
    let res = _getMaxLvl(info, lvl)
    clearUselessKeys(shapeInfo)
    return res
}

function _getMaxLvl(info, lvl) {
    let nextShapes = info.next()
    if (nextShapes.length == 0 || info.hasCountMax) {
        return lvl
    }
    info.hasCountMax = true
    let arr = []
    nextShapes.forEach(info => {
        arr.push(_getMaxLvl(info, lvl + nextShapes.length - 1))
    })
    return Math.max(...arr)
}

// 计算各个流程的位置
function calcPosition(info) {
    let prevs = info.prev()
    if (info.hasCalcPos) {
        return
    }
    if (prevs.length == 0) {
        info.next().forEach(i => {
            calcPosition(i)
        })
        return
    }
    info.hasCalcPos = true
    info.x = prevs[0].x + prevs[0].width + 60

    // 计算思路：每一个形状的位置关系，是由它有几个兄弟级元素、兄弟元素的位置以及父级元素的位置共同确定的
    // 假设流程图从左到右扩展，如果没有兄弟元素，则该形状Y方向的位置和它的上一级相同
    // 如果有兄弟元素,则各自向上下扩展,他们的平均位置与上级相同
    let siblings = prevs[0].next()
    let parentMaxLvl = getMaxLvl(prevs[0], 1)
    let index
    siblings.forEach((s, i) => {
        if (s.id == info.id) {
            index = i
        }
    })

    let prevY = 0
    prevs.forEach(p => {
        prevY = prevY + p.y
    })
    prevY = prevY / prevs.length

    let prevH = 0
    prevs.forEach(p => {
        prevH = prevH + p.height
    })
    prevH = prevH / prevs.length

    info.y = prevY + (prevH - info.height) / 2 + (index - (siblings.length - 1) / 2) * (prevH) * (parentMaxLvl / 2.5)
    info.next().forEach(i => {
        calcPosition(i)
    })
}

// 添加形状之间的连线
function setConnector(info) {
    let nexts = info.next()
    if (!nexts.length || info.hasSetConn) {
        return
    }
    info.hasSetConn = true
    nexts.forEach(n => {
        let connector = spread.getActiveSheet().shapes.addConnector("", GC.Spread.Sheets.Shapes.ConnectorType.elbow)
        if (!info.connectors) {
            info.connectors = []
        }
        let flag
        for (let i = 0; i < shapeInfo.edge.length; i++) {
            let e = shapeInfo.edge[i]
            if (e.source == info.id && e.target == n.id) {
                flag = e.flag
                break
            }
        }
        connector.flag = flag
        connector.start = info
        connector.end = n
        info.connectors.push(connector)
        let style = connector.style()
        style.line.endArrowheadStyle = GC.Spread.Sheets.Shapes.ArrowheadStyle.triangle
        style.line.width = 2
        connector.style(style)
        // 计算连线的位置关系（起始于哪里，结束于哪里）
        let res = calcConnectPoint(info, n)
        let startIndex = res[0]
        let endIndex = res[1]
        let infoShape = getShapeFromId(info.id)
        let nShape = getShapeFromId(n.id)
        connector.startConnector({
            index: startIndex,
            name: infoShape.name()
        })
        connector.endConnector({
            index: endIndex,
            name: nShape.name()
        })
        setConnector(n)
    })
}

// 添加菱形决策图的是和否文字
function addDecisionText() {
    spread.suspendPaint()
    shapeInfo.elements.forEach(info => {
        if (!info.connectors) {
            return
        }
        if (info.type != SpreadTypes.flowchartDecision) {
            return
        }
        info.connectors.forEach(c => {
            let midX = c.x() + c.width() / 2
            let midY = c.y() + c.height() / 2
            if (!c.textBox) {
                c.textBox = spread.getActiveSheet().shapes.add("", SpreadTypes.roundedRectangle)
                c.textBox.width(45)
                c.textBox.height(35)
                c.textBox.text(c.flag == 1 ? "是" : "否")
            }
            c.textBox.x(midX - 23)
            c.textBox.y(midY - 17)
        })
    })
    spread.resumePaint()
}

// 计算各个形状之间连线的位置
// 目前用到的形状有矩形和菱形，连线可以连在上、左、下、右四个位置，分别对应0 1 2 3
function calcConnectPoint(startShape, endShape) {
    let startMidX = startShape.x + startShape.width / 2
    let startMidY = startShape.y + startShape.height / 2
    let endMidX = endShape.x + endShape.width / 2
    let endMidY = endShape.y + endShape.height / 2

    if (Math.abs((startMidX - endMidX) / (startMidY - endMidY)) < 0.1) {
        if (startMidY > endMidY) {
            return [0, 2]
        } else {
            return [2, 0]
        }
    }
    if (Math.abs((startMidY - endMidY) / (startMidX - endMidX)) < 0.1) {
        if (startMidX > endMidX) {
            return [1, 3]
        } else {
            return [3, 1]
        }
    }

    let distance = Math.sqrt((startMidX - endMidX) ^ 2 + (startMidY - endMidY) ^ 2)
    let sin_alpha = parseFloat((endMidY - startMidY) / distance)
    if (startMidX < endMidX) {
        if (1 > sin_alpha > Math.SQRT1_2) {
            return [0, 1]
        }
        if (Math.SQRT1_2 >= sin_alpha > 0) {
            return [3, 2]
        }
        if (0 > sin_alpha > -Math.SQRT1_2) {
            return [3, 1]
        }
        if (-Map.SQRT1_2 >= sin_alpha > -1) {
            return [2, 1]
        }
    } else {
        if (1 > sin_alpha > Math.SQRT1_2) {
            return [1, 2]
        }
        if (Math.SQRT1_2 >= sin_alpha > 0) {
            return [1, 3]
        }
        if (0 > sin_alpha > -Math.SQRT1_2) {
            return [2, 3]
        }
        if (-Map.SQRT1_2 >= sin_alpha > -1) {
            return [1, 0]
        }
    }
}

// 根据流程id获取数据model
function getInfoFromId(id) {
    let info
    for (let i = 0; i < shapeInfo.elements.length; i++) {
        if (shapeInfo.elements[i].id == id) {
            info = shapeInfo.elements[i]
            break
        }
    }
    return info
}

// 根据流程id获取形状
function getShapeFromId(id) {
    let shape
    spread.getActiveSheet().shapes.all().forEach(s => {
        if (s.infoId == id) {
            shape = s
        }
    })
    return shape
}

initSpread()
