import * as GC from "@grapecity-software/spread-sheets";
/**
 * 在检测行业的文件中过存在大量富文本数据，有些需要从数据库中存储的html直接解析过来。
 * 该demo实现了从html到spreadJs的富文本对象间转换
 */

let spread = new GC.Spread.Sheets.Workbook(document.getElementById('ss'));
let sheet = spread.getActiveSheet();

let richtext = getRichText()
let style = new GC.Spread.Sheets.Style()
style.wordWrap = true
sheet.setStyle(2, 2, style)

sheet.setValue(2, 2, {
    richText: richtext
})
sheet.autoFitRow(2)

//获取富文本信息
function getRichText() {
    //创建一个节点迭代器
    let iterator = document.createNodeIterator(document.getElementsByClassName('rich-editor-content')[0], NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
    //获取根节点，从此节点开始遍历
    let root = iterator.nextNode();
    let richText = [];
    let style = {};
    let text = '';
    let node = iterator.nextNode();
    let underlineNode = null,
        lineThroughNode = null,
        pNode = null;
    //头节点不为空
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
            if (pNode && _getLastTextNode(pNode) === node && _getLastTextNode(root) !== node) {
                text = text + '\r\n';
                pNode = null;
            }
            let richTextStyle = getRichStyle(style, underlineNode, lineThroughNode);
            handleSuperAndSubScript(root, node, richTextStyle);
            richText.push({
                style: richTextStyle,
                text: text
            });
        } else if (node.nodeName.toLowerCase() === 'p') {
            pNode = node;
        } else if (node.nodeName.toLowerCase() === 'u') {
            underlineNode = node;
        } else if (node.nodeName.toLowerCase() === 'strike') {
            lineThroughNode = node;
        } else if (node.nodeName.toLowerCase() === 'br') {
            let richTextStyle = getRichStyle(style, underlineNode, lineThroughNode);
            handleSuperAndSubScript(root, node, richTextStyle);
            richText.push({
                style: richTextStyle,
                text: '\n'
            });
        }

        node = iterator.nextNode();
    }
    return richText;
};

// 自定义样式对象
function getRichStyle(style, isUnderlineNode, isLineThroughNode) { 
    return {
        font: (style.fontWeight === '700' ? 'bold ' : '') + (style.fontStyle === 'italic' ? 'italic ' : '') + style.fontSize + ' ' + style.fontFamily,
        foreColor: style.color,
        textDecoration: (isUnderlineNode ? 1 : 0) | (isLineThroughNode ? 2 : 0)
    };
};

//递归获取尾节点
function _getLastTextNode(root) {
    if (root && root.nodeType === 1) {
        let child = root.lastChild;
        return _getLastTextNode(child);
    } else {
        return root;
    }
}

function handleSuperAndSubScript(root, node, style) {
    if (root === node) {
        return;
    }
    while (node.parentNode !== root) {
        //垂直对齐文本的下标。
        if (node.nodeName.toLowerCase() === 'sub') {
            style.vertAlign = 2;
            break;
        }
        //定义上标文本
        if (node.nodeName.toLowerCase() === 'sup') {
            style.vertAlign = 1;
            break;
        }
        node = node.parentNode;
    }
};