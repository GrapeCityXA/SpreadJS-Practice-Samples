import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-shapes";
// Title:公式追踪
// Description：公式追踪
// Tag:公式追踪

var spreadForShow = null; //用于展示的spread对象
var maxDeep = 5; //最大深度
var firstShapeX = 20; //第一个shape开始位置
var firstShapeY = 20; //第一个shape开始位置
var rectWidth = 260; //单元格展示信息矩形宽度
var rectHeight = 60; //矩形高度
var spacingWidth = 300; //形状带空白宽度，rectWidth+横向间距
var shapeGap = 20; //shape纵向间距

var trackCellInfo, trackType, sourceSpread;


function workbookInitialized(spread) {
    if (spread) {
        spread.options.scrollByPixel = true; //像素滚动
        let sheet = spread.getActiveSheet();
        sheet.defaults.rowHeight = rectHeight + shapeGap; //方便插入行计算
        sheet.defaults.colWidth = spacingWidth; //方便插入列计算
        sheet.options.gridline.showVerticalGridline = false; //隐藏网格线
        sheet.options.gridline.showHorizontalGridline = false; //隐藏网格线
        // sheet.options.rowHeaderVisible = false;
        // sheet.options.colHeaderVisible = false;
        sheet.options.protectionOptions.allowEditObjects = true; //允许保护后编辑shape
        spread.getHost().addEventListener("dblclick", workbookDblClicked());
        sheet.options.isProtected = true;
    }
    console.log("tracker workbookInitialized " + trackCellInfo);
}


// 处理Shape双击事件，跳转对应单元格
function workbookDblClicked(e) {
    console.log(e)
    let self = window;
    if (!spreadForShow || !sourceSpread) {
        return;
    }
    var sheet = spreadForShow.getActiveSheet();
    if (!sheet) {
        return false;
    }
    let host = spreadForShow.getHost();
    var offset = $(host).offset(),
        left = offset.left,
        top = offset.top;
    var x = e.pageX - left,
        y = e.pageY - top;
    var hitTest = sheet.hitTest(x, y);
    if (!hitTest || !hitTest.shapeHitInfo) {
        return;
    }
    // 获取双击选中shape
    var shapes = sheet.shapes.all(),
        activeShape = null;
    for (var i = 0; i < shapes.length; i++) {
        var shape = shapes[i];
        if (shape.isSelected()) {
            activeShape = shape;
            break;
        }
    }
    if (activeShape && activeShape.type() === GC.Spread.Sheets.Shapes.AutoShapeType.rectangle) {
        let item = getCellInfo(activeShape.name());
        console.log(activeShape.name())
        sourceSpread.suspendPaint()
        let sheet = sourceSpread.getSheetFromName(item.sheetName);
        if (sheet) {
            sourceSpread.setActiveSheet(item.sheetName);
            sourceSpread.startSheetIndex(sourceSpread.getSheetIndex(item.sheetName));
            sheet.setActiveCell(item.row, item.col);
            sheet.showCell(item.row, item.col, GC.Spread.Sheets.VerticalPosition.center, GC.Spread.Sheets.HorizontalPosition.center);
        }
        sourceSpread.resumePaint()
    }
}

function trackCellInfoChanged(trackCellInfo, sourceSpread, spreadForShow, tt) {
    trackType = tt;
    trackCellInfo = trackCellInfo;
    sourceSpread = sourceSpread;
    spreadForShow = spreadForShow;
    if (trackCellInfo && sourceSpread && spreadForShow) {
        spreadForShow.suspendPaint();
        buildNodeTreeAndPaint(sourceSpread, spreadForShow, trackCellInfo);
        spreadForShow.resumePaint();
    }
}

//解析Cell信息，“SheetName*row*col”形式
function getCellInfo(cellInfo) {
    let info = cellInfo.split("*");
    return {
        sheetName: info[0],
        row: parseInt(info[1]),
        col: parseInt(info[2])
    }
}



// 递归构建追踪树
function buildNodeTreeAndPaint(spreadSource, spreadForShow, trackCellInfo) {
    let info = getCellInfo(trackCellInfo);
    spreadForShow.suspendPaint();
    var sheetSource = spreadSource.getSheetFromName(info.sheetName);
    var sheetForShow = spreadForShow.getActiveSheet();
    sheetForShow.shapes.clear();
    // 创建跟节点
    let rootNode = creatNode(info.row, info.col, sheetSource, 0, "")
        // shapeName记录单元格信息
    let name = rootNode.sheetName + "*" + rootNode.row + "*" + rootNode.col + "*" + Math.random().toString();
    // 绘制第一个根shape
    let fatherShape = getRectShape(sheetForShow, name, firstShapeX, firstShapeY, rectWidth, rectHeight, rootNode);

    // 双向递归追踪单元格并绘制
    if (trackType === "Precedents" || trackType === "Both") {
        getNodeChild(rootNode, sheetSource, "Precedents")
        console.log(rootNode)
        var deepInfo = [1];
        if (rootNode.childNodes && rootNode.childNodes.length) {
            paintDataTreeFromRoot(sheetForShow, rootNode, rootNode.childNodes.length, fatherShape, deepInfo);
        }
    }
    if (trackType === "Dependents" || trackType === "Both") {
        getNodeChild(rootNode, sheetSource, "Dependents")
        console.log(rootNode)
        var deepInfo = [1];
        if (rootNode.childNodes && rootNode.childNodes.length) {
            paintDataTreeFromRoot(sheetForShow, rootNode, rootNode.childNodes.length, fatherShape, deepInfo);
        }
    }

    // 显示fatherShape
    spreadForShow.options.scrollByPixel = false;
    let row = fatherShape.startRow(),
        col = fatherShape.startColumn();
    sheetForShow.setActiveCell(row, col);
    sheetForShow.showCell(row, col, GC.Spread.Sheets.VerticalPosition.top, GC.Spread.Sheets.HorizontalPosition.center);

    spreadForShow.options.scrollByPixel = true;
    spreadForShow.resumePaint();
}

// 创建节点
function creatNode(row, col, sheet, deep, trackType) {
        var node = {
            value: sheet.getValue(row, col),
            position: sheet.name() + "!" + GC.Spread.Sheets.CalcEngine.rangeToFormula(new GC.Spread.Sheets.Range(row, col, 1, 1)),
            deep: deep,
            sheetName: sheet.name(),
            row: row,
            col: col,
            trackType: trackType
        };
        return node;
    }
    // 递归获取子节点
function getNodeChild(rootNode, sheet, trackType) {
        let childNodeArray = [];
        let childNodes = [];
        let row = rootNode.row,
            col = rootNode.col,
            deep = rootNode.deep;
        if (trackType == "Precedents") {
            childNodes = sheet.getPrecedents(row, col);
        } else {
            childNodes = sheet.getDependents(row, col);
        }
        let self = this;
        if (childNodes.length >= 1) {
            childNodes.forEach(function(node) {
                let row = node.row,
                    col = node.col,
                    rowCount = node.rowCount,
                    colCount = node.colCount,
                    _sheet = sheet.parent.getSheetFromName(node.sheetName);
                if (rowCount > 1 || colCount > 1) {
                    for (let r = row; r < row + rowCount; r++) {
                        for (let c = col; c < col + colCount; c++) {
                            let newNode = creatNode(r, c, sheet, deep + 1, trackType)
                            if (deep < maxDeep) {
                                getNodeChild(newNode, sheet, trackType);
                            }
                            childNodeArray.push(newNode);
                        }
                    }
                } else {
                    let newNode = creatNode(row, col, sheet, deep + 1, trackType)
                    if (deep < maxDeep) {
                        getNodeChild(newNode, sheet, trackType);
                    }
                    childNodeArray.push(newNode);
                }
            });
        }
        rootNode.childNodes = childNodeArray;
    }
    // 绘制矩形shape
function getRectShape(sheetForShow, name, x, y, width, height, nodeTree) {
        var rectShape = sheetForShow.shapes.add(name, GC.Spread.Sheets.Shapes.AutoShapeType.rectangle, x, y, width, height);
        var oldStyle = rectShape.style();

        oldStyle.fill.color = "#2894FF";
        oldStyle.textEffect.font = "bold 15px Calibri";
        oldStyle.textFrame.vAlign = GC.Spread.Sheets.VerticalAlign.top;
        oldStyle.textFrame.hAlign = GC.Spread.Sheets.HorizontalAlign.left;
        if (nodeTree.deep === 0) {
            oldStyle.textEffect.color = "yellow";
        } else {
            oldStyle.textEffect.color = "white";
        }
        rectShape.style(oldStyle);
        rectShape.dynamicMove(true);

        var _description = "Value: " + nodeTree.value + "    deep:" + nodeTree.deep + "\nCell: " + nodeTree.position;
        rectShape.text(_description);

        return rectShape;
    }
    // 添加链接符
function getConnectorShape(sheetForShow) {
        return sheetForShow.shapes.addConnector("", GC.Spread.Sheets.Shapes.ConnectorType.elbow);
    }
    // 递归绘制shape
function paintDataTreeFromRoot(sheetForShow, rootNode, childLength, fatherShape, deepInfo) {
    if (!fatherShape) {
        return;
    }
    var childNodes = rootNode.childNodes;
    if (childNodes) {
        let self = this;
        var rectWidth = rectWidth,
            rectHeight = rectHeight;
        var spacingWidth = spacingWidth,
            shapeGap = shapeGap;

        for (let index = 0; index < childNodes.length; index++) {
            let nodeTree = childNodes[index];

            // 绘制shape
            var startIndex = deepInfo[nodeTree.deep] ? deepInfo[nodeTree.deep] : 0;
            var x = fatherShape.x() + spacingWidth;
            if (nodeTree.trackType == "Precedents") {
                x = fatherShape.x() - spacingWidth;
            }
            if (x < 0) {
                sheetForShow.addColumns(0, 1);
                x += sheetForShow.defaults.colWidth;
            }
            var y = firstShapeY + startIndex * (rectHeight + shapeGap);
            if (y < fatherShape.y()) {
                y = fatherShape.y();
                deepInfo[nodeTree.deep] = deepInfo[nodeTree.deep - 1] - 1;
            }
            if (index === 0 && y > fatherShape.y()) {
                deepInfo[nodeTree.deep - 1] = deepInfo[nodeTree.deep] + 1;
                fatherShape.y(y);
            }
            if (deepInfo[nodeTree.deep]) {
                deepInfo[nodeTree.deep] ++;
            } else {
                deepInfo[nodeTree.deep] = 1;
            }
            var name = nodeTree.sheetName + "*" + nodeTree.row + "*" + nodeTree.col + "*" + Math.random().toString();
            let rectShape = getRectShape(sheetForShow, name, x, y, rectWidth, rectHeight, nodeTree);

            rectShape.text(rectShape.text() + "deepinfo:" + deepInfo[nodeTree.deep]);

            //绘制链接符
            var connectorShape = getConnectorShape(sheetForShow);
            let connectorStyle = connectorShape.style();
            if (nodeTree.trackType == "Precedents") {
                connectorStyle.line.beginArrowheadStyle = GC.Spread.Sheets.Shapes.ArrowheadStyle.triangle;
                connectorShape.startConnector({
                    name: fatherShape.name(),
                    index: 1
                });
                connectorShape.endConnector({
                    name: rectShape.name(),
                    index: 3
                });
            } else {
                connectorStyle.line.endArrowheadStyle = GC.Spread.Sheets.Shapes.ArrowheadStyle.triangle;
                connectorShape.startConnector({
                    name: fatherShape.name(),
                    index: 3
                });
                connectorShape.endConnector({
                    name: rectShape.name(),
                    index: 1
                });
            }
            connectorShape.style(connectorStyle);

            //递归绘制
            if (nodeTree.childNodes && nodeTree.childNodes.length) {
                paintDataTreeFromRoot(sheetForShow, nodeTree, nodeTree.childNodes.length, rectShape, deepInfo);
            }
        }
    }

}
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"), {
    calcOnDemand: true
});
let sheet = spread.getActiveSheet()
sheet.setValue(0,1,1)
sheet.setValue(1,1,2)
sheet.setFormula(2,1, "=SUM(B1:B2)")
sheet.setColumnWidth(2, 300)
sheet.setValue(2,2, "<--- 请选择左方单元格，并点击下方按钮查看效果")
sheet.setFormula(3,1,"=SUM(B2:B3)")

var trackSpread = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
workbookInitialized(trackSpread)

document.getElementById('trackPrecedentsCell').onclick = function() {
    let sheet = spread.getActiveSheet();
    let trackType = "Precedents";
    let trackCellInfo = sheet.name() + "*" + sheet.getActiveRowIndex() + "*" + sheet.getActiveColumnIndex() + "*" + Math.random();
    trackCellInfoChanged(trackCellInfo, spread, trackSpread, trackType)
};
document.getElementById('trackDependentsCell').onclick = function() {
    let sheet = spread.getActiveSheet();
    let trackType = "Dependents";
    let trackCellInfo = sheet.name() + "*" + sheet.getActiveRowIndex() + "*" + sheet.getActiveColumnIndex() + "*" + Math.random();
    trackCellInfoChanged(trackCellInfo, spread, trackSpread, trackType)
};
document.getElementById('trackAllCell').onclick = function() {
    let sheet = spread.getActiveSheet();
    let trackType = "Both";
    let trackCellInfo = sheet.name() + "*" + sheet.getActiveRowIndex() + "*" + sheet.getActiveColumnIndex() + "*" + Math.random();
    trackCellInfoChanged(trackCellInfo, spread, trackSpread, trackType)
};