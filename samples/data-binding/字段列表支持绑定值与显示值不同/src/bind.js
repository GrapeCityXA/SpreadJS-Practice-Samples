// 生成基础dom
function addBasicDom() {
    let treeBox = document.createElement("div")
    treeBox.className = "treebox-content"
    treeBox.id = "treebox-content"
    treeBox.innerHTML =
        `
        <div class="item-content flex">
            <div class="header-label">源</div>
            <div id="source-add" class="icons icon-add"></div>
        </div>
        <div id="tree-root">
        </div>
    `

    let settingBox = document.createElement("div")
    settingBox.className = "setting-box"
    settingBox.id = "setting-box"
    settingBox.innerHTML =
        `
    <div class="key-value">
            <div class="key">描述</div>
            <input class="value" type="text" placeholder="在字段列表显示的名称" id="desc" />
        </div>
        <div class="key-value">
            <div class="key">绑定值</div>
            <input class="value" type="text" placeholder="实际绑定值" id="path" />
        </div>
        <div class="key-value">
            <div class="key">类型</div>
            <select class="value" id="type">
                <option value="string">字符串</option>
                <option value="table">表格</option>
            </select>
        </div>
        <div class="footer">
            <button id="sure">确定</button>
            <button id="cancel">取消</button>
        </div>
    `
    document.body.appendChild(treeBox)
    document.body.appendChild(settingBox)
}

function open() {
    document.getElementById("treebox-content").style.display = "block"
}
function close() {
    document.getElementById("treebox-content").style.display = "none"
    document.getElementById("setting-box").style.display = "none"
}

function initStaticEvents() {
    // 确定和取消不用移除事件，他们的dom会保持不变
    document.getElementById("sure").addEventListener("click", function () {
        document.getElementById("setting-box").style.display = "none"
        if (dialogType == "setting") {
            targetData.desc = document.getElementById("desc").value
            targetData.path = document.getElementById("path").value
            targetData.type = document.getElementById("type").value
        } else if (dialogType == "add") {
            let data = {
                desc: document.getElementById("desc").value,
                path: document.getElementById("path").value,
                type: document.getElementById("type").value
            }
            if (!targetData.child) {
                targetData.child = []
            }
            targetData.child.push(data)
        } else if (dialogType == "sourceAdd") {
            let data = {
                desc: document.getElementById("desc").value,
                path: document.getElementById("path").value,
                type: document.getElementById("type").value
            }
            targetData.push(data)
        }
        clearEvents()
        refresh()
        console.log("Events", events)

    })
    document.getElementById("cancel").addEventListener("click", function () {
        document.getElementById("setting-box").style.display = "none"
    })

    document.addEventListener("dragend", function (ev) {
        // 重设透明度
        decoration.style.display = "none"
        ev.target.style.opacity = "";
    }, false);


    let host = spread.getHost()
    /* 事件在目标区域触发 */
    host.addEventListener("dragover", function (event) {
        // 默认情况下是无法允许一个元素放置在另一个元素上的，要放置必须阻止默认行为
        event.preventDefault();

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

    }, false);



    /* 事件在目标区域触发 */
    host.addEventListener("dragleave", function (event) {
        // 当拖拽元素离开潜在放置区域时重置该目标区域的背景
        if (event.target.className == "dropzone") {
            event.target.style.background = "";
        }
    }, false);

    /* 松开鼠标，触发 drop */
    host.addEventListener("drop", function (event) {
        // 阻止默认行为（drop的默认处理方式是当初链接处理）
        event.preventDefault();
        // 把拖拽元素移入目标区域
        //这里要经过两步处理
        // 1、先把拖拽元素从原父元素中删除（这步不是必须的）
        ///2、然后再添加到目标区域
        if (!draggedElement) {
            return
        }
        if (event.target.className == "dropzone") {
            event.target.style.background = "";
            draggedElement.parentNode.removeChild(draggedElement);
            event.target.appendChild(draggedElement);
        }

        if (decoration) {
            decoration.style.display = "none"
        }
        //获取拖动物理在屏幕的位置
        let rect = spread.getHost().getBoundingClientRect()
        let offsetL = rect.left
        let offsetT = rect.top
        let x = event.pageX - offsetL;
        let y = event.pageY - offsetT;
        //获取单元格的位置
        let target = spread.hitTest(x, y);
        let sheet = spread.getActiveSheet();
        let path = draggedElement.getAttribute("bindingpath")

        let row = target.worksheetHitInfo.row
        let col = target.worksheetHitInfo.col
        if (draggedElement.getAttribute("type") == "string") {
            sheet.setBindingPath(row, col, path)
        } else if (draggedElement.getAttribute("type") == "table") {
            let data = getTargetData(path)
            if (!data.child || !data.child.length) {
                alert("请添加表格列信息")
                return
            }
            let column_count = data.child.length

            // 防止表名重复
            let suffix = 0
            let nameClaimed = false
            while (true) {
                nameClaimed = false
                suffix++
                spread.sheets.forEach(s => {
                    s.tables.all().forEach(t => {
                        if (t.name() == path + suffix) {
                            nameClaimed = true
                        }
                    })
                })
                if (!nameClaimed) {
                    break
                }
            }
            let table = sheet.tables.add(path + suffix, row, col, 2, column_count)
            table.bindingPath(path)
            data.child.forEach((v, i) => {
                table.setColumnDataField(i, v.path)
            })
            let table_header = data.child.map(v => {
                return v.desc
            })
            console.log(table_header)
            sheet.setArray(row, col, [table_header])
            let c_p = {}
            data.child.forEach(v => {
                c_p[v.path] = { type: "string" }
            })
            let treeNodeJson = { "$schema": "http://json-schema.org/draft-04/schema#", properties: {} }
            treeNodeJson.properties[path] = {
                dataFieldType: "table",
                type: "array",
                items: {
                    type: "object",
                    properties: c_p
                }
            }
            designer.setData("treeNodeFromJson", JSON.stringify(treeNodeJson))
        }
    })
}
function initDynamicEvents() {
    // 绑定事件前，需要清空所有动态添加的事件，重新生成dom树
    clearEvents()
    document.querySelectorAll(".name-label").forEach(el => {
        el.addEventListener("mouseenter", showIcons)
        // 将所有的event记录下来， 方便后续清除event事件
        events.push({
            el: el,
            event: "mouseenter",
            function: showIcons
        })
        el.parentElement.addEventListener("mouseleave", hideIcons)
        events.push({
            el: el.parentElement,
            event: "mouseleave",
            function: hideIcons
        })
    })
    document.querySelectorAll(".header-label").forEach(el => {
        el.addEventListener("mouseenter", showIcons)
        events.push({
            el: el,
            event: "mouseenter",
            function: showIcons
        })
        el.parentElement.addEventListener("mouseleave", hideIcons)
        events.push({
            el: el.parentElement,
            event: "mouseleave",
            function: hideIcons
        })
    })

    let sourceAddIcon = document.getElementById("source-add")
    sourceAddIcon.addEventListener("click", sourceAdd)
}

let events = []
let targetData
let dialogType

// 清除绑定的所有事件，防止dom被移除后仍然保留该dom的事件
function clearEvents() {
    events.forEach(e => {
        e.el.removeEventListener(e.event, e.function)
    })
    events = []
}

function showIcons(e) {
    e.srcElement.parentElement.querySelectorAll(".icons").forEach(icon => {
        icon.style.backgroundSize = "cover"
    })
}

function hideIcons(e) {
    e.srcElement.querySelectorAll(".icons").forEach(icon => {
        icon.style.backgroundSize = "auto"
    })
}
// 从点击的图标获取对应的数据
function getTargetData(curPath) {
    let curPathArr = curPath.split(".")

    // 临时的变量，用于遍历_data
    let targetData = _data
    while (true) {
        let p = curPathArr.shift()
        let canBreak = false
        targetData.forEach((v, i) => {
            if (v.path == p) {
                if (curPathArr.length) {
                    targetData = v.child
                } else {
                    targetData = v
                    canBreak = true
                }
            }
        })
        if (canBreak) {
            break
        }
    }
    return targetData
}
function clickSetting(e) {
    let settingBox = document.getElementById("setting-box")
    settingBox.style.display = "block"
    let nameLabel = e.srcElement.parentElement.querySelector(".name-label")
    let curPath = nameLabel.getAttribute("bindingpath")
    targetData = getTargetData(curPath)
    document.getElementById("desc").value = targetData.desc
    document.getElementById("path").value = targetData.path
    document.getElementById("type").value = targetData.type

    dialogType = "setting"
}

function clickAdd(e) {
    let settingBox = document.getElementById("setting-box")
    settingBox.style.display = "block"
    let nameLabel = e.srcElement.parentElement.querySelector(".name-label")
    let curPath = nameLabel.getAttribute("bindingpath")
    targetData = getTargetData(curPath)
    document.getElementById("desc").value = ""
    document.getElementById("path").value = ""
    document.getElementById("type").value = "string"

    dialogType = "add"
}

function sourceAdd() {
    let settingBox = document.getElementById("setting-box")
    settingBox.style.display = "block"

    targetData = _data

    dialogType = "sourceAdd"
}

function generateDom(data) {
    let root = document.getElementById("tree-root")
    root.innerHTML = ""
    genDomFromData(data, root)
}

function genDomFromData(data, dom, path = "") {
    data.forEach(d => {
        let itemContent = document.createElement("div")
        itemContent.className = "item-content child"

        let flex = document.createElement("div")
        flex.className = "flex"

        let nameLabel = document.createElement("div")
        nameLabel.className = "name-label"
        nameLabel.innerText = d.desc
        nameLabel.setAttribute("bindingPath", `${path ? path + "." : ""}${d.path}`)
        nameLabel.setAttribute("type", d.type)
        nameLabel.setAttribute("draggable", true)
        flex.appendChild(nameLabel)

        let iconAdd = document.createElement("div")
        iconAdd.className = "icons icon-add"
        flex.appendChild(iconAdd)
        iconAdd.addEventListener("click", clickAdd)
        events.push({
            el: iconAdd,
            events: "click",
            function: clickAdd
        })

        let iconSetting = document.createElement("div")
        iconSetting.className = "icons icon-setting"
        flex.appendChild(iconSetting)
        iconSetting.addEventListener("click", clickSetting)
        events.push({
            el: iconSetting,
            events: "click",
            function: clickSetting
        })


        itemContent.append(flex)

        dom.append(itemContent)

        if (d.child) {
            genDomFromData(d.child, itemContent, `${path ? path + "." : ""}${d.path}`)
        }
    })
}
let draggedElement
let decoration = document.createElement("div");
function dragStart(e) {
    // 存储相关的拖拽元素
    draggedElement = e.target;
    console.log(draggedElement)
    // 设置拖拽元素的透明度
    e.target.style.opacity = 0.5;
}

function initDraggableElements() {
    document.querySelectorAll(".name-label").forEach(el => {
        el.addEventListener("dragstart", dragStart);
        /* 事件在拖拽元素上触发 */
        events.push({
            el: el,
            event: "dragstart",
            function: dragStart
        })
    })
}

function highlihgtCell(x, y) {
    let curSheet = spread.getActiveSheet()
    if (!curSheet) {
        return
    }

    let target = curSheet.hitTest(x, y);
    if (target.row === undefined || target.col === undefined) {
        return
    }
    let cellRect = spread.getActiveSheet().getCellRect(target.row, target.col)

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

// 这是绑定侧边栏的数据结构，请严格按照此结构传参
// let _data = [{
//     desc: "个人信息",
//     path: "personal_info",
//     type: "string",
//     child: [{
//         desc: "姓名",
//         path: "name",
//         type: "string",
//         child: [{
//             desc: "英文名",
//             path: "en_name",
//             type: "string"
//         }, {
//             desc: "中文名",
//             path: "cn_name",
//             type: "string"
//         }]
//     }, {
//         desc: "年龄",
//         path: "age",
//         type: "string"
//     }]
// }, {
//     desc: "学校信息",
//     path: "school_info",
//     type: "string",
//     child: [{
//         desc: "校名",
//         path: "name",
//         type: "string"
//     }, {
//         desc: "级别",
//         path: "level",
//         type: "string"
//     }]
// }]

function refresh() {
    generateDom(_data)
    initDynamicEvents()
    initDraggableElements()
}
let _data = []
let spread, designer
function initBindSideBar(_spread, _designer) {
    spread = _spread
    designer = _designer
    addBasicDom()
    initStaticEvents()
    refresh()
}
function setData(data = []) {
    _data = data
    refresh()
}
export {
    open,
    close,
    initBindSideBar,
    setData
}