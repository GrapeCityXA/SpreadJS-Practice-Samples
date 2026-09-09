import * as GC from "@grapecity-software/spread-sheets";

export default function bindCustomNameBox(spread, btnid) {
    let div = document.createElement("div")
    div.id = "CustomNamePopBox"
    document.body.appendChild(div)

    let script = document.createElement("script")
    script.innerHTML = `
    let startPosition
    function dragStartCb(e) {
        startPosition = {
            x: e.x,
            y: e.y
        }
    }
    function dragEndCb(e) {
        let pnode = e.srcElement.parentNode
        pnode.style.left = Number(pnode.style.left.split("px")[0]) + e.x - startPosition.x + "px"
        pnode.style.top = Number(pnode.style.top.split("px")[0]) + e.y - startPosition.y + "px"
    }
    `
    document.head.appendChild(script)

    let _spread = initCustomBox(spread, "CustomNamePopBox")

    document.getElementById(btnid).addEventListener("click", function () {
        openCustomBox(spread, _spread, "CustomNamePopBox")
    })
}



function initCustomBox(spread, id) {
    document.getElementById(id).innerHTML = `
    <div id="name-mgr-modal" class="name-mgr-modal"></div>
    <div class="normal-box name-mgr-list" id="name-mgr-list" style="left: 100px; top: 100px;">
        <div class="title" ondragstart="dragStartCb(event)" draggable="true" ondragstart="dragStartCb(event)" ondragend="dragEndCb(event)">名称管理器</div>
        <div class="content-box">
            <div class="btn-list">
                <span class="btn" id="create-name">新建</span>
                <span class="btn" id="edit-name">编辑</span>
                <span class="btn" id="delete-name">删除</span>
            </div>
            <div class="list-box" id="list-container">
            </div>
            <div class="footer">
                <div class="btn" id="close-btn">关闭</div>
            </div>
        </div>
    </div>
    <div id="edit-box" class="normal-box edit-box" style="left: 150px; top: 50px;">
        <div class="title" id="edit-title" draggable="true" ondragstart="dragStartCb(event)" ondragend="dragEndCb(event)">新建名称</div>
        <div class="content-box">
            <div class="fill-pair">
                <span class="key">名称：</span>
                <input type="text" id="c-name" />
            </div>
            <div class="fill-pair">
                <span class="key">范围：</span>
                <select id="c-erange"></select>
            </div>
            <div class="fill-pair">
                <span class="key">引用位置：</span>
                <div id="c-range"></div>
            </div>
            <div class="fill-pair">
                <span class="key">批注：</span>
                <textarea type="text" id="c-comment"></textarea>
            </div>
            <div class="footer">
                <div class="btn" id="close-confirm">确定</div>
                <div class="btn" id="close-cancel">取消</div>
            </div>
        </div>
    </div>
    `
    let _spread = new GC.Spread.Sheets.Workbook("list-container")
    _spread.options.tabStripVisible = false
    _spread.options.showVerticalScrollbar = false
    _spread.options.showHorizontalScrollbar = false
    _spread.options.allowUserDragDrop = false
    _spread.options.allowUserDragFill = false
    _spread.options.allowUserResize = false
    let _sheet = _spread.getActiveSheet()
    _sheet.options.rowHeaderVisible = false
    _sheet.options.gridline.showHorizontalGridline = false
    _sheet.options.gridline.showVerticalGridline = false
    _sheet.setValue(0, 0, "名称", GC.Spread.Sheets.SheetArea.colHeader)
    _sheet.setValue(0, 1, "引用位置", GC.Spread.Sheets.SheetArea.colHeader)
    _sheet.setValue(0, 2, "范围", GC.Spread.Sheets.SheetArea.colHeader)
    _sheet.setValue(0, 3, "批注", GC.Spread.Sheets.SheetArea.colHeader)
    _sheet.options.isProtected = true
    let defaultStyle = _sheet.getDefaultStyle(GC.Spread.Sheets.SheetArea.colHeader)
    defaultStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.left
    _sheet.setDefaultStyle(defaultStyle, GC.Spread.Sheets.SheetArea.colHeader)
    let colInfos = [
        { name: "name", displayName: "名称" },
        { name: "range", displayName: "引用位置" },
        { name: "effectRange", displayName: "范围" },
        { name: "comment", displayName: "批注" },
    ];
    _sheet.selectionPolicy(GC.Spread.Sheets.SelectionPolicy.single)
    _sheet.bindColumns(colInfos)
    _sheet.setColumnCount(4)
    _sheet.setRowCount(0)



    let cStyle = new GC.Spread.Sheets.Style()
    cStyle.backColor = "#d0d0d0"
    let stateRule = new GC.Spread.Sheets.ConditionalFormatting.StateRule(
        GC.Spread.Sheets.ConditionalFormatting.RuleType.rowStateRule,
        GC.Spread.Sheets.RowColumnStates.selected,
        cStyle,
        [new GC.Spread.Sheets.Range(-1, -1, -1, -1)]
    )
    _sheet.conditionalFormats.addRule(stateRule)

    document.getElementById("close-btn").addEventListener("click", function () {
        document.getElementById(id).style.display = "none"
        document.getElementById("edit-box").style.display = "none"
    })
    let title, fbx, editData
    document.getElementById("create-name").addEventListener("click", function () {
        title = "新建名称"
        fbx = initEditBox(spread, title, fbx)
        document.getElementById("c-name").value = ""
        document.getElementById("c-erange").value = ""
        document.getElementById("c-comment").value = ""
        fbx.text("")
    })

    document.getElementById("edit-name").addEventListener("click", function () {
        let aRow = _sheet.getSelections()[0]
        if (!aRow) {
            alert("请选择要编辑的名称")
            return
        }
        title = "编辑名称"
        fbx = initEditBox(spread, title, fbx)
        let data = _sheet.getDataSource()[aRow.row]
        document.getElementById("c-name").value = data.name
        document.getElementById("c-erange").value = data.effectRange
        document.getElementById("c-comment").value = data.comment
        fbx.text(data.range)
        editData = data
    })

    document.getElementById("delete-name").addEventListener("click", function () {
        let aRow = _sheet.getSelections()[0]
        if (!aRow) {
            alert("请选择要删除的名称")
            return
        }
        if (confirm("确认删除该名称吗？")) {
            let data = _sheet.getDataSource()[aRow.row]
            if (data.effectRange == "工作簿") {
                spread.removeCustomName(data.name)
            } else {
                // 判断是否为table，是table的话无法删除
                let curSheet = spread.getSheetFromName(data.effectRange)
                let range = GC.Spread.Sheets.CalcEngine.formulaToRange(curSheet, data.range)
                if (curSheet.tables.find(range.row, range.col)) {
                    alert("无法删除表格")
                    return
                }
                curSheet.removeCustomName(data.name)
            }
            _sheet.getDataSource().splice(aRow.row, 1)
            _spread.refresh()
        }
    })

    document.getElementById("close-confirm").addEventListener("click", function () {
        let name = document.getElementById("c-name").value
        let effectRange = document.getElementById("c-erange").value
        let comment = document.getElementById("c-comment").value
        let range = fbx.text()
        if (!name) {
            alert("请填写名称")
            return
        }
        if (!effectRange) {
            alert("请选择作用范围")
            return
        }
        if (!range) {
            alert("请选择区域")
            return
        }

        try {
            if (title.indexOf("编辑") == 0) {
                if (effectRange == "工作簿") {
                    spread.removeCustomName(editData.name)
                } else {
                    spread.getSheetFromName(effectRange).removeCustomName(editData.name)
                }
            }
            if (effectRange == "工作簿") {
                spread.addCustomName(name, range, 0, 0, comment)
            } else {
                spread.getSheetFromName(effectRange).addCustomName(name, range, 0, 0, comment)
            }
        } catch (e) {
            alert(e.message)
            return
        }
        document.getElementById("edit-box").style.display = "none"
        document.getElementById("name-mgr-list").style.display = "block"
        openCustomBox(spread, _spread, id)
    })

    document.getElementById("close-cancel").addEventListener("click", function () {
        document.getElementById("edit-box").style.display = "none"
        document.getElementById("name-mgr-list").style.display = "block"
    })


    return _spread
}

function initEditBox(spread, title, fbx) {
    document.getElementById("edit-box").style.display = "block"
    document.getElementById("edit-title").innerText = title
    document.getElementById("c-erange").innerHTML = ""
    let node = document.createElement("option")
    node.setAttribute("value", "工作簿")
    node.innerText = "工作簿"
    if (title.indexOf("编辑") == 0) {
        document.getElementById("c-erange").setAttribute("disabled", true)
    } else {
        document.getElementById("c-erange").removeAttribute("disabled")
    }
    document.getElementById("c-erange").appendChild(node)
    spread.sheets.forEach(s => {
        let node = document.createElement("option")
        node.setAttribute("value", s.name())
        node.innerText = s.name()
        document.getElementById("c-erange").appendChild(node)
    })
    fbx && fbx.destroy()
    fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('c-range'), { rangeSelectMode: true });
    fbx.workbook(spread);
    let fbxStatus = "ready"
    document.getElementById("c-range").children[0].children[0].children[0].children[1].addEventListener("click", function () {
        if (fbxStatus == "ready") {
            fbxStatus = "selecting"
            document.getElementById("name-mgr-modal").style.display = "none"
            document.getElementById("name-mgr-list").style.display = "none"
        } else {
            fbxStatus = "ready"
            document.getElementById("name-mgr-modal").style.display = "block"
            document.getElementById("name-mgr-list").style.display = "block"
        }
    })
    return fbx
}

function openCustomBox(spread, _spread, id) {
    document.getElementById(id).style.display = "block"
    let _sheet = _spread.getActiveSheet()
    let names = getNames(spread)
    _sheet.setDataSource(names)

    _sheet.setColumnWidth(0, "*")
    _sheet.setColumnWidth(1, "*")
    _sheet.setColumnWidth(2, "*")
    _sheet.setColumnWidth(3, "*")
    _sheet.clearSelection()
    _spread.refresh()
}

function getNames(spread) {
    let names = []
    spread.getCustomNames().forEach(v => {
        let exp = v.getExpression()
        let sheetName = exp.source.getName()
        let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(new GC.Spread.Sheets.Range(exp.row, exp.column, exp.endRow - exp.row + 1, exp.endColumn - exp.column + 1))
        names.push({
            name: v.getName(),
            range: `=${sheetName}!${rangeStr}`,
            effectRange: "工作簿",
            comment: v.getComment()
        })
    })
    spread.sheets.forEach(s => {
        s.getCustomNames().forEach(v => {
            let exp = v.getExpression()
            let sheetName = exp.source.getName()
            let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(new GC.Spread.Sheets.Range(exp.row, exp.column, exp.endRow - exp.row + 1, exp.endColumn - exp.column + 1))
            names.push({
                name: v.getName(),
                range: `=${sheetName}!${rangeStr}`,
                effectRange: sheetName,
                comment: v.getComment()
            })
        })
        s.tables.all().forEach(t => {
            let tr = t.range()
            let rangeStr = GC.Spread.Sheets.CalcEngine.rangeToFormula(tr)
            names.push({
                name: t.name(),
                range: `=${s.name()}!${rangeStr}`,
                effectRange: s.name(),
                comment: ""
            })
        })
    })
    return names
}