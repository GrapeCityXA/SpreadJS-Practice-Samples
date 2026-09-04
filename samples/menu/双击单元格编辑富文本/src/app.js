import * as GC from "@grapecity-software/spread-sheets";

// 引用这两个资源，如果systemjs-plugin-css报错： package添加：  "systemjs-plugin-css": "0.1.37",
import "./videoTools.css"
import { videoPreview } from "./videoTools.js"
videoPreview("https://videos.grapecity.com.cn/SpreadJS/CodeLibrary/Right%20click%20menu%20or%20double-click%20cell%20to%20edit%20rich%20text.mp4");



/**
 * 双击单元格或单元格右键菜单支持富文本编辑
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();

//初始化富文本单元格的内容
let lawOfUniversalGravitation = {
    richText: [
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "F = (G * M"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "1"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: " * M"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "2"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: ") / R"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 1
            },
            text: "2"
        }
    ]
};
let reaction = {
    richText: [
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "3 Ba(OH)"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "2"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: " + 2 H"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "3"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "PO"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "4"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: " → 6 H"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "2"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "O + Ba"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "3"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "(PO"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "4"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: ")"
        },
        {
            style: {
                font: "normal 24px Calibri",
                vertAlign: 2
            },
            text: "2"
        },
        {
            style: {
                font: "normal 24px Calibri"
            },
            text: "↓"
        }
    ]
};
let google = {
    richText: [
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(78,133,242)"
            },
            text: "G"
        },
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(228,65,52)"
            },
            text: "o"
        },
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(247,188,32)"
            },
            text: "o"
        },
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(78,133,242)"
            },
            text: "g"
        },
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(65,168,87)"
            },
            text: "l"
        },
        {
            style: {
                font: "bold 36px Calibri",
                foreColor: "rgb(228,65,52)"
            },
            text: "e"
        }
    ]
};

//将自定义富文本对象设置到表单中
let sheet = spread.sheets[0];
sheet.suspendPaint();
sheet.setColumnWidth(0, 720);
sheet.setValue(0, 0, 'Law of universal gravitation:', 3);
sheet.setValue(1, 0, lawOfUniversalGravitation, 3);
sheet.setRowHeight(1, 40);
sheet.getCell(1, 0).vAlign(GC.Spread.Sheets.VerticalAlign.center);
sheet.setValue(3, 0, 'The reaction of barium hydroxide with phosphoric acid:', 3);
sheet.setValue(4, 0, reaction, 3);
sheet.setRowHeight(4, 40);
sheet.getCell(4, 0).vAlign(GC.Spread.Sheets.VerticalAlign.center);
sheet.setValue(6, 0, google, 3);
sheet.setRowHeight(6, 50);
sheet.resumePaint();

setOption(spread);

//响应单元格双击事件  
spread.bind(GC.Spread.Sheets.Events.CellDoubleClick, function (sender, args) {
    let rich = args.sheet.getValue(args.row, args.col, GC.Spread.Sheets.SheetArea.viewport, GC.Spread.Sheets.ValueType.richText)
    //富文本单元格停止单元格编辑状态，让编辑富文本的div可见，并让工作薄失去焦点
    if (rich !== null && rich !== args.sheet.getValue(args.row, args.col)) {
        $('#subEditor').modal('show')
        $('#subEditor').on("shown.bs.modal", function () {
            args.sheet.endEdit(true);
            // 让spread失去焦点，使富文本编辑框能够获取编辑焦点
            spread.focus(false);
        });
    }
});

//可能移除冲突的菜单项
spread.contextMenu.menuData.forEach(function (item, index) {
    if (item && item.name === "richText") {
        spread.contextMenu.menuData.splice(index, 1);
    }
});

//自定义菜单子项并将其添加到菜单列表
let commandManager = spread.commandManager();
let richText = {
    text: "编辑富文本",
    name: "richText",
    command: "richText",
    workArea: "viewport"
};
spread.contextMenu.menuData.push(richText);
//自定义命令并将其注册到命令管理器
let richTextCommand = {
    canUndo: false,
    execute: function () {
        $('#subEditor').modal('show')
        spread.focus(false);
    }
};
commandManager.register("richText", richTextCommand, null, false, false, false, false);

//响应确定按钮点击
$("#setValue").click(function () {
    spread.focus(true)

    $('#subEditor').modal('hide')
    sheet.endEdit(true);

})


function setOption(spread) {
    let _extends =
        Object.assign ||
        function (target) {
            for (let i = 1; i < arguments.length; i++) {
                let source = arguments[i];
                for (let key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };

    let addEventListener = function (parent, type, listener) {
        return parent.addEventListener(type, listener);
    };
    let appendChild = function (parent, child) {
        return parent.appendChild(child);
    };
    let createElement = function (tag) {
        return document.createElement(tag);
    };
    let queryCommandState = function (command) {
        return document.queryCommandState(command);
    };
    let queryCommandValue = function (command) {
        return document.queryCommandValue(command);
    };
    let defaultClasses = {
        actionbar: "rich-editor-actionbar",
        button: "rich-editor-button",
        content: "rich-editor-content",
        selected: "rich-editor-button-selected",
    };
    let defaultParagraphSeparatorString = "defaultParagraphSeparator";
    let formatBlock = "formatBlock";
    let exec = function (command) {
        let value =
            arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return document.execCommand(command, false, value);
    };
    // font element limitation, only support font size from 1~7
    let convertFontSize = function (value) {
        if (value <= 10) {
            return 1;
        } else if (value <= 13) {
            return 2;
        } else if (value <= 16) {
            return 3;
        } else if (value <= 18) {
            return 4;
        } else if (value <= 24) {
            return 5;
        } else if (value <= 32) {
            return 6;
        } else {
            return 7;
        }
    };
    let fontSizeDict = [0, 10, 13, 16, 18, 24, 32, 48];

    let _stopBubble = function (e) {
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else {
            window.event.cancelBubble = true;
        }
    };
    let _colorRGB2Hex = function (color) {
        let rgb = color.split(",");
        let r = parseInt(rgb[0].split("(")[1]);
        let g = parseInt(rgb[1]);
        let b = parseInt(rgb[2].split(")")[0]);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    let createRichTextElement = function (tag, value) {
        let elem;
        switch (tag) {
            case "subscript":
                elem = createElement("sub");
                break;
            case "superscript":
                elem = createElement("sup");
                break;
            case "underline":
                elem = createElement("u");
                break;
            case "strikeThrough":
                elem = createElement("strike");
                break;
            case "foreColor":
                elem = createElement("font");
                elem.color = _colorRGB2Hex(value);
                break;
            case "fontName":
                elem = createElement("font");
                elem.face = value;
                break;
            case "fontSize":
                elem = createElement("font");
                elem.size = convertFontSize(value);
                break;
            case "bold":
                elem = createElement("b");
                break;
            case "italic":
                elem = createElement("i");
                break;
            default:
                elem = createElement("span");
                break;
        }
        return elem;
    };
    let addFonts = function (container) {
        let defaultFonts = {
            ff1: { name: "Arial", text: "Arial" },
            ff2: { name: "Arial Black", text: "Arial Black" },
            ff3: { name: "Calibri", text: "Calibri" },
            ff4: { name: "Cambria", text: "Cambria" },
            ff5: { name: "Candara", text: "Candara" },
            ff6: { name: "Century", text: "Century" },
            ff7: { name: "Courier New", text: "Courier New" },
            ff8: { name: "Comic Sans MS", text: "Comic Sans MS" },
            ff9: { name: "Garamond", text: "Garamond" },
            ff10: { name: "Georgia", text: "Georgia" },
            ff11: { name: "Malgun Gothic", text: "Malgun Gothic" },
            ff12: { name: "Mangal", text: "Mangal" },
            ff13: { name: "Meiryo", text: "Meiryo" },
            ff14: { name: "MS Gothic", text: "MS Gothic" },
            ff15: { name: "MS Mincho", text: "MS Mincho" },
            ff16: { name: "MS PGothic", text: "MS PGothic" },
            ff17: { name: "MS PMincho", text: "MS PMincho" },
            ff18: { name: "Tahoma", text: "Tahoma" },
            ff19: { name: "Times", text: "Times" },
            ff20: { name: "Times New Roman", text: "Times New Roman" },
            ff21: { name: "Trebuchet MS", text: "Trebuchet MS" },
            ff22: { name: "Verdana", text: "Verdana" },
            ff23: { name: "Wingdings", text: "Wingdings" },
        };
        let $ul = container;
        let fontItems = [];
        let prefix = "ff",
            i = 1,
            id = prefix + i;
        while (defaultFonts[id]) {
            fontItems.push(
                '<li class="fontfamily-item">' + defaultFonts[id].name + "</li>"
            );
            // .replace(/\{id\}/g, id));
            i++;
            id = prefix + i;
        }
        $ul.append($(fontItems.join("")));
    };

    let defaultActions = {
        fontFamily: {
            icon:
                '<span id="fontFamilyValue">Calibri</span>' +
                '<span class="drop-down-arrow"></span>',
            title: "Bold",
            type: "drop-down",
            specialStyle: {
                width: "150px",
            },
            dropDownListId: "fontFamilyList",
            queryValue: function () {
                let value = queryCommandValue("fontName").replace(/"/g, "");
                if (value.length > 15) {
                    // if fontFamily string is too long,
                    value = value.substring(0, 15) + "...";
                }
                document.getElementById("fontFamilyValue").innerText = value;
            },
            result: function (e) {
                e.currentTarget.style.display = "none";
                _stopBubble(e);
                let result =
                    e.target.nodeName.toUpperCase() === "LI" ? e.target.innerText : null;
                if (result) {
                    document.getElementById("fontFamilyValue").innerText = result;
                    exec("fontName", result);
                    return true;
                } else {
                    return false;
                }
            },
        },
        fontSize: {
            icon:
                '<span id="fontSizeValue">13</span>' +
                '<span class="drop-down-arrow"></span>',
            title: "Bold",
            type: "drop-down",
            specialStyle: {
                width: "40px",
            },
            dropDownListId: "fontSizeList",
            queryValue: function () {
                let fontSizeMap = [0, 10, 13, 16, 18, 24, 32, 48];
                let value = queryCommandValue("fontSize");
                document.getElementById("fontSizeValue").innerText = fontSizeMap[value]
                    ? fontSizeMap[value]
                    : document.getElementById("fontSizeValue").innerText;
            },
            result: function (e) {
                e.currentTarget.style.display = "none";
                _stopBubble(e);
                let result =
                    e.target.nodeName.toUpperCase() === "LI"
                        ? parseInt(e.target.value)
                        : null;
                if (result !== null) {
                    document.getElementById("fontSizeValue").innerText =
                        fontSizeDict[result];
                    exec("fontSize", result);
                    return true;
                } else {
                    return false;
                }
            },
        },
        bold: {
            icon: "<b>B</b>",
            title: "Bold",
            state: function () {
                return queryCommandState("bold");
            },
            result: function () {
                return exec("bold");
            },
        },
        italic: {
            icon: "<i>I</i>",
            title: "Italic",
            state: function () {
                return queryCommandState("italic");
            },
            result: function () {
                return exec("italic");
            },
        },
        underline: {
            icon: "<u>U</u>",
            title: "Underline",
            state: function () {
                return queryCommandState("underline");
            },
            result: function () {
                return exec("underline");
            },
        },
        strikethrough: {
            icon: "<strike>S</strike>",
            title: "Strike-through",
            state: function () {
                return queryCommandState("strikeThrough");
            },
            result: function () {
                return exec("strikeThrough");
            },
        },
        colorPicker: {
            icon:
                '<span id="foreColorValue" class="color_picker_result">&nbsp;A&nbsp;</span>' +
                '<span class="drop-down-arrow"></span>',
            title: "colorPicker",
            type: "drop-down",
            specialStyle: {
                width: "40px",
            },
            dropDownListId: "colorPicker",
            queryValue: function () {
                let value = queryCommandValue("foreColor");
                document.getElementById("foreColorValue").style.borderBottomColor =
                    value;
            },
            result: function result(e) {
                e.currentTarget.style.display = "none";
                _stopBubble(e);
                return e.target.nodeName.toUpperCase() === "LI"
                    ? exec("foreColor", _colorRGB2Hex(e.target.style.backgroundColor))
                    : false;
            },
        },
        superScript: {
            icon: "X<sup>2</sup>",
            title: "SuperScript",
            state: function () {
                return queryCommandState("superscript");
            },
            result: function () {
                return exec("superscript");
            },
        },
        subScript: {
            icon: "X<sub>2</sub>",
            title: "SubScript",
            state: function () {
                return queryCommandState("subscript");
            },
            result: function () {
                return exec("subscript");
            },
        },
    };

    function _getRichText() {
        let iterator = document.createNodeIterator(
            document.getElementsByClassName("rich-editor-content")[0],
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let root = iterator.nextNode(); // root
        let richText = [];
        let style = {};
        let text = "";
        let node = iterator.nextNode();
        let underlineNode = null,
            lineThroughNode = null,
            pNode = null;
        while (node !== null) {
            if (node.nodeType === 3 /*TextNode*/) {
                text = node.nodeValue;
                style = document.defaultView.getComputedStyle(node.parentElement, null);
                if (underlineNode && underlineNode.contains(node) === false) {
                    underlineNode = null;
                }
                if (lineThroughNode && lineThroughNode.contains(node) === false) {
                    lineThroughNode = null;
                }
                if (
                    pNode &&
                    _getLastTextNode(pNode) === node &&
                    _getLastTextNode(root) !== node
                ) {
                    text = text + "\r\n";
                    pNode = null;
                }
                let richTextStyle = _getRichStyle(
                    style,
                    underlineNode,
                    lineThroughNode
                );
                _handleSuperAndSubScript(root, node, richTextStyle);
                richText.push({
                    style: richTextStyle,
                    text: text,
                });
            } else if (node.nodeName.toLowerCase() === "p") {
                pNode = node;
            } else if (node.nodeName.toLowerCase() === "u") {
                underlineNode = node;
            } else if (node.nodeName.toLowerCase() === "strike") {
                lineThroughNode = node;
            }

            node = iterator.nextNode();
        }
        return richText;
    }

    function _handleSuperAndSubScript(root, node, style) {
        if (root === node) {
            return;
        }
        while (node.parentNode !== root) {
            if (node.nodeName.toLowerCase() === "sub") {
                style.vertAlign = 2;
                break;
            }
            if (node.nodeName.toLowerCase() === "sup") {
                style.vertAlign = 1;
                break;
            }
            node = node.parentNode;
        }
    }

    function _getRichStyle(style, isUnderlineNode, isLineThroughNode) {
        // getComputedStyle can't get inherit textDecoration
        return {
            font:
                (style.fontWeight === "700" ? "bold " : "") +
                (style.fontStyle === "italic" ? "italic " : "") +
                style.fontSize +
                " " +
                style.fontFamily,
            foreColor: style.color,
            textDecoration: (isUnderlineNode ? 1 : 0) | (isLineThroughNode ? 2 : 0),
        };
    }

    function _getLastTextNode(root) {
        if (root && root.nodeType === 1) {
            let child = root.lastChild;
            return _getLastTextNode(child);
        } else {
            return root;
        }
    }

    let _initContent = function (settings) {
        let actions = settings.actions
            ? settings.actions.map(function (action) {
                if (typeof action === "string") {
                    return defaultActions[action];
                } else if (defaultActions[action.name]) {
                    //NOSONAR
                    return _extends({}, defaultActions[action.name], action);
                }
                return action;
            })
            : Object.keys(defaultActions).map(function (action) {
                return defaultActions[action];
            });

        let classes = _extends({}, defaultClasses, settings.classes);

        let defaultParagraphSeparator =
            settings[defaultParagraphSeparatorString] || "div";

        let actionbar = createElement("div");
        actionbar.className = classes.actionbar;
        appendChild(settings.element, actionbar);

        let content = (settings.element.content = createElement("div"));
        content.contentEditable = true;

        content.className = classes.content;

        content.oninput = function (_ref) {
            let firstChild = _ref.target.firstChild;
            if (firstChild && firstChild.nodeType === 3) {
                exec(formatBlock, "<" + defaultParagraphSeparator + ">");
            } else if (content.innerHTML === "<br>") {
                //NOSONAR
                content.innerHTML = "";
            }
        };
        content.onkeydown = function (event) {
            if (event.key === "Tab") {
                event.preventDefault();
            } else if (
                event.key === "Enter" &&
                queryCommandValue(formatBlock) === "blockquote"
            ) {
                setTimeout(function () {
                    return exec(formatBlock, "<" + defaultParagraphSeparator + ">");
                }, 0);
            }
        };
        appendChild(settings.element, content);
        let contentWrapper = createElement(defaultParagraphSeparator);

        appendChild(content, contentWrapper);

        if (!this._addedFonts) {
            addFonts($("#fontFamilyList"));
            this._addedFonts = true;
        }

        actions.forEach(function (action) {
            let button = createElement("button");
            button.className = classes.button;
            button.innerHTML = action.icon;
            // button.title = action.title;

            if (action.specialStyle) {
                for (let styleProp in action.specialStyle) {
                    if (action.specialStyle.hasOwnProperty(styleProp)) {
                        button.style[styleProp] = action.specialStyle[styleProp];
                    }
                }
            }

            button.setAttribute("type", "button");
            button.onclick = function () {
                // should notify each action button to close its drop-down list.
                let lists = document.getElementsByClassName("list");
                let dropDownList = document.getElementById(action.dropDownListId);
                for (let k = 0; k < lists.length; k++) {
                    if (lists[k] !== dropDownList) {
                        lists[k].style.display = "none";
                    }
                }
                if (action.type === "drop-down") {
                    if (button.contains(dropDownList)) {
                        dropDownList.style.display === "none"
                            ? (dropDownList.style.display = "block")
                            : (dropDownList.style.display = "none"); //NOSONAR
                    } else {
                        let dropDownListClone = dropDownList.cloneNode(true);
                        if (action.queryValue) {
                            addEventListener(dropDownListClone, "click", action.queryValue);
                        }
                        button.appendChild(dropDownListClone);
                        let hostOffsetHeight = button.offsetHeight;
                        dropDownListClone.style.top = hostOffsetHeight + 20 + "px";
                        dropDownListClone.style.display = "block";
                        dropDownListClone.onclick = function (e) {
                            return action.result(e) && content.focus();
                        };
                    }
                } else if (action.type === "designer-gcui-widget") {
                    $(action.widgetId).toggle();
                } else {
                    return action.result() && content.focus();
                }
            };

            let handler;

            if (action.state) {
                handler = function () {
                    return button.classList[action.state() ? "add" : "remove"](
                        classes.selected
                    );
                };
                addEventListener(content, "keyup", handler);
                addEventListener(content, "mouseup", handler);
                addEventListener(button, "click", handler);
            }

            if (action.queryValue) {
                handler = action.queryValue;
                addEventListener(content, "keyup", handler);
                addEventListener(content, "mouseup", handler);
                addEventListener(button, "click", handler);
            }

            appendChild(actionbar, button);
        });

        if (settings.styleWithCSS) {
            exec("styleWithCSS");
        }
        exec(defaultParagraphSeparatorString, defaultParagraphSeparator);

        return settings.element;
    };
    let richEditor = { exec: exec, init: _initContent };
    spread.bind(GC.Spread.Sheets.Events.EnterCell, onSpreadEnterCell);
    function onSpreadEnterCell() {
        let sheet = spread.getActiveSheet();
        let contentWrapper = $(".rich-editor-content")[0];
        contentWrapper.innerHTML = "";
        let contentText = sheet.getValue(
            sheet.getActiveRowIndex(),
            sheet.getActiveColumnIndex(),
            3 /* sheetArea */,
            1 /* richText */
        );
        if (contentText && contentText.richText) {
            for (let i = 0; i < contentText.richText.length; i++) {
                let elemAttr = [];
                if (contentText.richText[i].style && contentText.richText[i].text) {
                    for (let styleProperty in contentText.richText[i].style) {
                        if (contentText.richText[i].style.hasOwnProperty(styleProperty)) {
                            switch (styleProperty) {
                                case "vertAlign":
                                    if (contentText.richText[i].style[styleProperty] === 2) {
                                        elemAttr.push("subscript");
                                    } else if (
                                        contentText.richText[i].style[styleProperty] === 1
                                    ) {
                                        elemAttr.push("superscript");
                                    }
                                    break;
                                case "textDecoration":
                                    if (
                                        (contentText.richText[i].style[styleProperty] & 1) ===
                                        1
                                    ) {
                                        elemAttr.push("underline");
                                    }
                                    if (
                                        (contentText.richText[i].style[styleProperty] & 2) ===
                                        2
                                    ) {
                                        elemAttr.push("strikeThrough");
                                    }
                                    break;
                                case "foreColor":
                                    elemAttr.push({
                                        name: "foreColor",
                                        value: contentText.richText[i].style[styleProperty],
                                    });
                                    break;
                                case "font":
                                    let spanElem = createElement("div");
                                    spanElem.style.font =
                                        contentText.richText[i].style[styleProperty];
                                    if (spanElem.style.fontFamily) {
                                        elemAttr.push({
                                            name: "fontName",
                                            value: spanElem.style.fontFamily,
                                        });
                                    }
                                    if (spanElem.style.fontSize) {
                                        elemAttr.push({
                                            name: "fontSize",
                                            value: parseInt(spanElem.style.fontSize),
                                        });
                                    }
                                    if (spanElem.style.fontWeight === "bold") {
                                        elemAttr.push("bold");
                                    }
                                    if (spanElem.style.fontStyle === "italic") {
                                        elemAttr.push("italic");
                                    }
                                    break;
                            }
                        }
                    }
                }
                let parentElem = contentWrapper;
                for (let j = 0; j < elemAttr.length; j++) {
                    let richTextElem;
                    if (typeof elemAttr[j] === "string") {
                        richTextElem = createRichTextElement(elemAttr[j]);
                    } else if (typeof elemAttr[j] === "object" && elemAttr[j]) {
                        richTextElem = createRichTextElement(
                            elemAttr[j].name,
                            elemAttr[j].value
                        );
                    }
                    appendChild(parentElem, richTextElem);
                    parentElem = richTextElem;
                    if (j === elemAttr.length - 1 && richTextElem) {
                        richTextElem.innerHTML = contentText.richText[i].text;
                    }
                }
            }
        } else {
            contentWrapper.innerHTML = contentText;
        }
    }
    richEditor.init({
        element: document.getElementById("richEditor"),
        defaultParagraphSeparator: "p",
        styleWithCSS: false,
    });
    $("#setValue").click(function () {
        let spread = GC.Spread.Sheets.findControl("ss");
        let sheet = spread.getActiveSheet();
        let richText = _getRichText();
        if (richText.length > 0) {
            sheet.setValue(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), {
                richText: richText,
            });
        }
    });
}