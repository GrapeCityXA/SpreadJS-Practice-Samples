import * as GC from "@grapecity-software/spread-sheets";


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

var sheet = spread.getActiveSheet();


let dragged
let decoration = document.createElement("div");

sheet.frozenRowCount(3)
sheet.frozenColumnCount(3)
function addQ(spread) {
    var td = document.getElementById("btn1");
    td.draggable = true;
    td.addEventListener("dragstart", function (ev) {
        // 存储相关的拖拽元素
        dragged = ev.target;
        // 设置拖拽元素的透明度
        ev.target.style.opacity = 0.5;
        // console.log("开始拖动 ")
    }, false);
    /* 事件在拖拽元素上触发 */

    document.addEventListener("dragend", function (ev) {
        // 重设透明度
        decoration.style.display = "none"
        event.target.style.opacity = "";
    }, false);

    let host = spread.getHost()

    /* 事件在目标区域触发 */
    host.addEventListener("dragover", function (event) {
        // 默认情况下是无法允许一个元素放置在另一个元素上的，要放置必须阻止默认行为
        event.preventDefault();
        // console.log("已经在目标区域 ")

        let hostRect = host.getBoundingClientRect()
        let offsetL = hostRect.left
        let offsetT = hostRect.top
        let x = event.pageX - offsetL;
        let y = event.pageY - offsetT;
        //获取单元格的位置
        highlihgtCell(x, y)
        
    }, false);

    /* 事件在目标区域触发 */
    host.addEventListener("dragenter", function (event) {
        // 当拖拽元素进入潜在放置区域时，高亮处理
        if (event.target.className == "dropzone") {
            event.target.style.background = "purple";
        }

        // console.log("已经触发")
    }, false);



    /* 事件在目标区域触发 */
    host.addEventListener("dragleave", function (event) {
        // 当拖拽元素离开潜在放置区域时重置该目标区域的背景
        if (event.target.className == "dropzone") {
            event.target.style.background = "";
        }
        // console.log("离开目标区域！")
    }, false);

    /* 松开鼠标，触发 drop */
    host.addEventListener("drop", function (event) {
        console.log(arguments)
        // 阻止默认行为（drop的默认处理方式是当初链接处理）
        event.preventDefault();
        // 把拖拽元素移入目标区域
        //这里要经过两步处理
        // 1、先把拖拽元素从原父元素中删除（这步不是必须的）
        ///2、然后再添加到目标区域
        if (event.target.className == "dropzone") {
            event.target.style.background = "";
            dragged.parentNode.removeChild(dragged);
            event.target.appendChild(dragged);
        }

        if (decoration) {
            // decoration.remove()
            decoration.style.display = "none"
        }
        //获取拖动物理在屏幕的位置
        let rect = spread.getHost().getBoundingClientRect()
        let offsetL = rect.left
        let offsetT = rect.top
        //获取拖动块的值
        let tab_value = document.getElementById("btn1").innerText
        // console.log(tab_value)
        let x = event.pageX - offsetL;
        let y = event.pageY - offsetT;
        //获取单元格的位置
        let target = spread.hitTest(x, y);
        let sheet = spread.getActiveSheet();
        sheet.setValue(target.worksheetHitInfo.row, target.worksheetHitInfo.col, tab_value);

        // console.log("执行完毕 ")
    })
}

function highlihgtCell(x, y) {
    let target = spread.getActiveSheet().hitTest(x, y);
    if (target.row === undefined || target.col === undefined) {
        return
    }
    let cellRect = spread.getActiveSheet().getCellRect(target.row, target.col)

    decoration.className = "xcy"
    decoration.style.display = "block"
    decoration.style.position = "absolute"
    decoration.style.border = "1px solid blue"
    decoration.style.boxShadow = "0px 0px 4px 0px #007eff"
    decoration.style.zIndex = "1000"
    spread.getHost().style.position = "relative"
    spread.getHost().appendChild(decoration);


    decoration.style.width = (cellRect.width - 1) + "px";
    decoration.style.height = (cellRect.height - 1) + "px";
    decoration.style.left = cellRect.x + "px";
    decoration.style.top = cellRect.y + "px";
}


addQ(spread);