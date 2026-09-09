import * as GC from "@grapecity-software/spread-sheets";
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

let spread = designer.getWorkbook();
spread.getActiveSheet().setValue(1,1,12347.57)
let designerConfig = GC.Spread.Sheets.Designer.DefaultConfig;
const numMap = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
};
const minus = '⁻';
// 自定义单元格式
function MyFormatter(format, cultureName) {
    GC.Spread.Formatter.FormatterBase.apply(this, arguments);
    // console.log(1118899977, ...arguments)
    this.typeName = 'MyScientificFormatter';
    if (format) {
        this.num = Number(format.text);
    }
}
MyFormatter.prototype = new GC.Spread.Formatter.FormatterBase();
MyFormatter.prototype.parse = function (str) {
    if (Number(str)) {
        return Number(str);
    } else {
        return str;
    }
};
MyFormatter.prototype.format = function (obj, conditionalForeColor) {
    console.log(obj)
    if ((typeof obj === 'number' || (Number(obj) && !isNaN(Number(obj)))) && this.num !== 0) {
        let inputNum = Number(obj);
        let num = inputNum.toExponential(this.num);
        // let res = num.replace('e', "×10");
        let index = 0;
        let numType = 'add';
        if (num.indexOf('+') !== -1) {
            index = num.indexOf('+') + 1;
        } else if (num.indexOf('-') !== -1) {
            index = num.indexOf('-') + 1;
            numType = 'minus';
        }

        let cornerMark = num.slice(index);

        let nowNumArray = cornerMark.split('');

        let newNum = '';

        nowNumArray.forEach(item => {
            newNum = newNum + numMap[item];
        });

        if (numType === 'minus') {
            newNum = minus + newNum;
        }

        let returnNum = num.slice(0, index - 1);
        let returnData = (returnNum + newNum).replace('e', '×10');
        return returnData;
    } else {
        return obj;
    }
};
let customerRibbon = {
    "id": "settings",
    "text": "自定义",
    "buttonGroups": [
        {
            label: '自定义',
            commandGroup: {
                children: [
                    {
                        direction: 'vertical',
                        commands: ['scientificCountingMethod'],
                    },
                ],
            },
        }

    ]
};
let ribbonFileCommands = {
    "scientificCountingMethod": {
        iconClass: "ribbon-button-download",
        title: '科学计数法',
        text: '科学计数法',
        commandName: "scientificCountingMethod",
        execute: async (context) => {
            var spread = context.getWorkbook();
            var sheet = spread.getActiveSheet();
            var cell = sheet.getActualStyle(
                sheet.getSelections()[0].row,
                sheet.getSelections()[0].col,
                GC.Spread.Sheets.SheetArea.viewport,
                true
            );
            let nowNum = cell?.formatter?.num;
            window.cells = cell;
            var dialogOption = {
                text: nowNum || '',
                isCenter: false,
            };
            GC.Spread.Sheets.Designer.showDialog(
                'setText',
                dialogOption,
                result => {
                    if (!result) {
                        return;
                    }
                    var cell = sheet.getCell(
                        sheet.getSelections()[0].row,
                        sheet.getSelections()[0].col
                    );
                    console.log(result)
                    cell.formatter(new MyFormatter(result));
                },
                error => {
                    console.error(error);
                },
                // this.checkResult(result)
            );
        },
    },
}

designerConfig.commandMap = {};
Object.assign(designerConfig.commandMap, ribbonFileCommands)
designerConfig.ribbon[designerConfig.ribbon.length - 1] = customerRibbon;
designer.setConfig(designerConfig);

var setTextTemplate = {
    title: '小数位数',
    content: [
        {
            type: 'TextEditor',
            margin: '0 0 0 10px',
            bindingPath: 'text',
        },
    ],
};
GC.Spread.Sheets.Designer.registerTemplate('setText', setTextTemplate);
let oldFun = GC.Spread.Sheets.getTypeFromString;
// Private types can not be accessed from window, so override getTypeFromString method.
GC.Spread.Sheets.getTypeFromString = function (typeString) {
    switch (typeString) {
        case 'MyScientificFormatter':
            return MyFormatter;
        default:
            return oldFun.apply(this, arguments);
    }
};
function checkResult(value) {
    if (value.text === '') {
        return true;
    }

    if (!Number(value.text)) {
        GC.Spread.Sheets.Designer.showMessageBox(
            '请输入数字',
            'Warning',
            GC.Spread.Sheets.Designer.MessageBoxIcon.warning
        );
        return false;
    }

    if (Number(value.text)) {
        let num = Number(value.text);
        let reg = /^[1-9]\d*$/g;
        if (!reg.test(num) || num > 16) {
            GC.Spread.Sheets.Designer.showMessageBox(
                '请输入1-16的正整数',
                'Warning',
                GC.Spread.Sheets.Designer.MessageBoxIcon.warning
            );
            return false;
        }
    }
    return true;
}





