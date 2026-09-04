import * as GC from "@grapecity-software/spread-sheets";
// Title：公式美化
// Description：公式
// Tag：公式
GC.Spread.Common.CultureManager.culture('zh-cn');

var initJson = {
    "version": "10.0.0",
    "tabStripRatio": 0.6,
    "sheets": {
        "Foglio1": {
            "name": "Foglio1",
            "defaults": {
                "colHeaderRowHeight": 20,
                "rowHeaderColWidth": 40,
                "rowHeight": 20,
                "colWidth": 64
            },
            "rowCount": 3,
            "columnCount": 2,
            "data": {
                "dataTable": {
                    "0": {
                        "0": {
                            "value": "Number",
                            "style": "__builtInStyle3"
                        },
                        "1": {
                            "value": "Formula",
                            "style": "__builtInStyle3"
                        }
                    },
                    "1": {
                        "0": {
                            "value": 85488633,
                            "style": "__builtInStyle2",
                            "formula": "RANDBETWEEN(0,999999999)"
                        },
                        "1": {
                            "value": "Eighty-Five million Four hundred Eighty-Eight thousand Six hundred Thirty-Three",
                            "style": "__builtInStyle1",
                            "formula": "TRIM(REPT(INDEX(n_1,1+INT(A2/10^8))&\" hundred\",10^8<A2)&IF(A2-TRUNC(A2,-8)<2*10^7,INDEX(n_1,1+MID(TEXT(A2,\"000000000\"),2,2)),INDEX(n_2,1+MID(TEXT(A2,\"000000000\"),2,2)/10)&INDEX(n_3,1+RIGHT(INT(A2/10^6))))&REPT(\" million\",10^6<A2)&IF(--RIGHT(INT(A2/10^5)),INDEX(n_1,1+RIGHT(INT(A2/10^5)))&\" hundred\",\"\")&IF(A2-TRUNC(A2,-5)<2*10^4,INDEX(n_1,1+MID(TEXT(A2,\"000000000\"),5,2)),INDEX(n_2,1+MID(TEXT(A2,\"000000000\"),5,2)/10)&INDEX(n_3,1+RIGHT(INT(A2/10^3))))&IF(--MID(TEXT(A2,\"000000000\"),4,3),\" thousand\",\"\")&IF(--RIGHT(INT(A2/100)),INDEX(n_1,1+RIGHT(INT(A2/100)))&\" hundred\",\"\")&IF(MOD(A2,100)<20,INDEX(n_1,1+RIGHT(A2,2)),INDEX(n_2,1+RIGHT(A2,2)/10)&INDEX(n_3,1+RIGHT(A2))))"
                        }
                    },
                    "2": {
                        "1": {
                            "value": "捌仟伍佰肆拾捌万捌仟陆佰叁拾叁元○角○分",
                            "style": "__builtInStyle1",
                            "formula": "IF(A2=0,\"\",IF(A2<0,\"负\",\"\")&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(TEXT(INT(ABS(A2)),\"[$-804][DBNum2]General\")&\"元\"&TEXT(RIGHT(TEXT(A2,\".00\"),2),\"[$-804][DBNum1]0角0分\"),\"零角零分\",\"整\"),\"零分\",\"整\"),\"零角\",\"零\"),\"零元零\",\"\"))"
                        }
                    }
                },
                "defaultDataNode": {
                    "style": {
                        "backColor": null,
                        "foreColor": "Text 1 0",
                        "vAlign": 2,
                        "font": "14.7px Calibri",
                        "themeFont": "Body",
                        "locked": true,
                        "textIndent": 0,
                        "wordWrap": false
                    }
                }
            },
            "rowHeaderData": {
                "defaultDataNode": {
                    "style": {
                        "themeFont": "Body"
                    }
                }
            },
            "colHeaderData": {
                "defaultDataNode": {
                    "style": {
                        "themeFont": "Body"
                    }
                }
            },
            "selections": {
                "0": {
                    "row": 0,
                    "rowCount": 1,
                    "col": 0,
                    "colCount": 1
                },
                "length": 1
            },
            "theme": {
                "name": "Office",
                "themeColor": {
                    "name": "Office",
                    "background1": {
                        "a": 255,
                        "r": 255,
                        "g": 255,
                        "b": 255
                    },
                    "background2": {
                        "a": 255,
                        "r": 238,
                        "g": 236,
                        "b": 225
                    },
                    "text1": {
                        "a": 255,
                        "r": 0,
                        "g": 0,
                        "b": 0
                    },
                    "text2": {
                        "a": 255,
                        "r": 31,
                        "g": 73,
                        "b": 125
                    },
                    "accent1": {
                        "a": 255,
                        "r": 79,
                        "g": 129,
                        "b": 189
                    },
                    "accent2": {
                        "a": 255,
                        "r": 192,
                        "g": 80,
                        "b": 77
                    },
                    "accent3": {
                        "a": 255,
                        "r": 155,
                        "g": 187,
                        "b": 89
                    },
                    "accent4": {
                        "a": 255,
                        "r": 128,
                        "g": 100,
                        "b": 162
                    },
                    "accent5": {
                        "a": 255,
                        "r": 75,
                        "g": 172,
                        "b": 198
                    },
                    "accent6": {
                        "a": 255,
                        "r": 247,
                        "g": 150,
                        "b": 70
                    },
                    "hyperlink": {
                        "a": 255,
                        "r": 0,
                        "g": 0,
                        "b": 255
                    },
                    "followedHyperlink": {
                        "a": 255,
                        "r": 128,
                        "g": 0,
                        "b": 128
                    }
                },
                "headingFont": "Cambria",
                "bodyFont": "Calibri"
            },
            "rows": [{
                "size": 20
            }, {
                "size": 20
            }, {
                "size": 20
            }],
            "columns": [{
                "size": 188
            }, {
                "size": 631
            }],
            "validations": [],
            "printInfo": {
                "pageOrder": 1,
                "paperSize": {
                    "width": 850,
                    "height": 1100,
                    "kind": 9
                }
            },
            "allowCellOverflow": true,
            "index": 0
        }
    },
    "namedStyles": [{
        "backColor": "Accent 1 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent1"
    }, {
        "backColor": "Accent 2 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent2"
    }, {
        "backColor": "Accent 3 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent3"
    }, {
        "backColor": "Accent 4 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent4"
    }, {
        "backColor": "Accent 5 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent5"
    }, {
        "backColor": "Accent 6 79",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "20% - Accent6"
    }, {
        "backColor": "Accent 1 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent1"
    }, {
        "backColor": "Accent 2 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent2"
    }, {
        "backColor": "Accent 3 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent3"
    }, {
        "backColor": "Accent 4 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent4"
    }, {
        "backColor": "Accent 5 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent5"
    }, {
        "backColor": "Accent 6 59",
        "foreColor": "Text 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "40% - Accent6"
    }, {
        "backColor": "Accent 1 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent1"
    }, {
        "backColor": "Accent 2 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent2"
    }, {
        "backColor": "Accent 3 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent3"
    }, {
        "backColor": "Accent 4 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent4"
    }, {
        "backColor": "Accent 5 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent5"
    }, {
        "backColor": "Accent 6 39",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "60% - Accent6"
    }, {
        "backColor": "Accent 1 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent1"
    }, {
        "backColor": "Accent 2 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent2"
    }, {
        "backColor": "Accent 3 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent3"
    }, {
        "backColor": "Accent 4 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent4"
    }, {
        "backColor": "Accent 5 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent5"
    }, {
        "backColor": "Accent 6 0",
        "foreColor": "Background 1 0",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Accent6"
    }, {
        "backColor": "#ffc7ce",
        "foreColor": "#9c0006",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Bad"
    }, {
        "backColor": "#f2f2f2",
        "foreColor": "#fa7d00",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "borderLeft": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderTop": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderRight": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderBottom": {
            "color": "#7f7f7f",
            "style": 1
        },
        "name": "Calculation"
    }, {
        "backColor": "#a5a5a5",
        "foreColor": "Background 1 0",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "borderLeft": {
            "color": "#3f3f3f",
            "style": 6
        },
        "borderTop": {
            "color": "#3f3f3f",
            "style": 6
        },
        "borderRight": {
            "color": "#3f3f3f",
            "style": 6
        },
        "borderBottom": {
            "color": "#3f3f3f",
            "style": 6
        },
        "name": "Check Cell"
    }, {
        "backColor": null,
        "formatter": "_(* #,##0.00_);_(* (#,##0.00);_(* \"-\"??_);_(@_)",
        "name": "Comma"
    }, {
        "backColor": null,
        "formatter": "_(* #,##0_);_(* (#,##0);_(* \"-\"_);_(@_)",
        "name": "Comma [0]"
    }, {
        "backColor": null,
        "formatter": "_(\"$\"* #,##0.00_);_(\"$\"* (#,##0.00);_(\"$\"* \"-\"??_);_(@_)",
        "name": "Currency"
    }, {
        "backColor": null,
        "formatter": "_(\"$\"* #,##0_);_(\"$\"* (#,##0);_(\"$\"* \"-\"_);_(@_)",
        "name": "Currency [0]"
    }, {
        "backColor": null,
        "foreColor": "#7f7f7f",
        "font": "italic normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Explanatory Text"
    }, {
        "backColor": "#c6efce",
        "foreColor": "#006100",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Good"
    }, {
        "backColor": null,
        "foreColor": "Text 2 0",
        "font": "normal bold 20px Calibri",
        "themeFont": "Body",
        "borderBottom": {
            "color": "Accent 1 0",
            "style": 5
        },
        "name": "Heading 1"
    }, {
        "backColor": null,
        "foreColor": "Text 2 0",
        "font": "normal bold 17.3px Calibri",
        "themeFont": "Body",
        "borderBottom": {
            "color": "Accent 1 49",
            "style": 5
        },
        "name": "Heading 2"
    }, {
        "backColor": null,
        "foreColor": "Text 2 0",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "borderBottom": {
            "color": "Accent 1 39",
            "style": 2
        },
        "name": "Heading 3"
    }, {
        "backColor": null,
        "foreColor": "Text 2 0",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "name": "Heading 4"
    }, {
        "backColor": "#ffcc99",
        "foreColor": "#3f3f76",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "borderLeft": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderTop": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderRight": {
            "color": "#7f7f7f",
            "style": 1
        },
        "borderBottom": {
            "color": "#7f7f7f",
            "style": 1
        },
        "name": "Input"
    }, {
        "backColor": null,
        "foreColor": "#fa7d00",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "borderBottom": {
            "color": "#ff8001",
            "style": 6
        },
        "name": "Linked Cell"
    }, {
        "backColor": "#ffeb9c",
        "foreColor": "#9c6500",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Neutral"
    }, {
        "backColor": "#ffffcc",
        "borderLeft": {
            "color": "#b2b2b2",
            "style": 1
        },
        "borderTop": {
            "color": "#b2b2b2",
            "style": 1
        },
        "borderRight": {
            "color": "#b2b2b2",
            "style": 1
        },
        "borderBottom": {
            "color": "#b2b2b2",
            "style": 1
        },
        "name": "Note"
    }, {
        "backColor": "#f2f2f2",
        "foreColor": "#3f3f3f",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "borderLeft": {
            "color": "#3f3f3f",
            "style": 1
        },
        "borderTop": {
            "color": "#3f3f3f",
            "style": 1
        },
        "borderRight": {
            "color": "#3f3f3f",
            "style": 1
        },
        "borderBottom": {
            "color": "#3f3f3f",
            "style": 1
        },
        "name": "Output"
    }, {
        "backColor": null,
        "formatter": "0%",
        "name": "Percent"
    }, {
        "backColor": null,
        "foreColor": "Text 2 0",
        "font": "normal bold 24px Cambria",
        "themeFont": "Headings",
        "name": "Title"
    }, {
        "backColor": null,
        "foreColor": "Text 1 0",
        "font": "normal bold 14.7px Calibri",
        "themeFont": "Body",
        "borderTop": {
            "color": "Accent 1 0",
            "style": 1
        },
        "borderBottom": {
            "color": "Accent 1 0",
            "style": 6
        },
        "name": "Total"
    }, {
        "backColor": null,
        "foreColor": "#ff0000",
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "name": "Warning Text"
    }, {
        "backColor": null,
        "foreColor": "Text 1 0",
        "hAlign": 3,
        "vAlign": 2,
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "locked": true,
        "textIndent": 0,
        "wordWrap": false,
        "name": "Normal"
    }, {
        "backColor": null,
        "foreColor": "Text 1 0",
        "hAlign": 3,
        "vAlign": 2,
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "locked": true,
        "textIndent": 0,
        "wordWrap": false,
        "name": "__builtInStyle1"
    }, {
        "backColor": null,
        "foreColor": "Text 1 0",
        "hAlign": 3,
        "vAlign": 2,
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "formatter": "#,##0",
        "locked": true,
        "textIndent": 0,
        "wordWrap": false,
        "name": "__builtInStyle2"
    }, {
        "backColor": null,
        "foreColor": "Text 1 0",
        "hAlign": 1,
        "vAlign": 2,
        "font": "normal normal 14.7px Calibri",
        "themeFont": "Body",
        "locked": true,
        "textIndent": 0,
        "wordWrap": false,
        "name": "__builtInStyle3"
    }],
    "names": [{
        "name": "n_1",
        "formula": "{\"\";\" One\";\" Two\";\" Three\";\" Four\";\" Five\";\" Six\";\" Seven\";\" Eight\";\" Nine\";\" Ten\";\" Eleven\";\" Twelve\";\" Thirteen\";\" Fourteen\";\" Fifteen\";\" Sixteen\";\" Seventeen\";\" Eighteen\";\" Nineteen\"}",
        "row": 0,
        "col": 0,
        "comment": ""
    }, {
        "name": "n_2",
        "formula": "{\"\";0;\" Twenty\";\" Thirty\";\" Forty\";\" Fifty\";\" Sixty\";\" Seventy\";\" Eighty\";\" Ninety\"}",
        "row": 0,
        "col": 0,
        "comment": ""
    }, {
        "name": "n_3",
        "formula": "{\"\";\"-One\";\"-Two\";\"-Three\";\"-Four\";\"-Five\";\"-Six\";\"-Seven\";\"-Eight\";\"-Nine\"}",
        "row": 0,
        "col": 0,
        "comment": ""
    }]
};


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
var spread1 = new GC.Spread.Sheets.Workbook(document.getElementById("ss1"));
spread.fromJSON(initJson);
var sheet = spread.getActiveSheet();
var formula = sheet.getFormula(1, 1);

sheet.bind(GC.Spread.Sheets.Events.EnterCell, function(sender, args) {
    var sheet = args.sheet,
        formula = sheet.getFormula(args.row, args.col);
    if (formula) {
        var exp = buildExpTree(sheet, formula),
            calcStack = [];
        buildExpStrNode(exp, calcStack, 0, sheet);

        displayTreeOnSJS(spread1, calcStack)
    }
});
var exp = buildExpTree(sheet, formula),
    calcStack = [];
buildExpStrNode(exp, calcStack, 0, sheet);

displayTreeOnSJS(spread1, calcStack)

function displayTreeOnSJS(spread, calcStack) {
    var sheet = spread.getActiveSheet();
    sheet.suspendPaint();
    sheet.setDataSource(calcStack);
    for (var i = 0; i < calcStack.length; i++) {
        var item = calcStack[i];
        sheet.getCell(i, 0).textIndent(item.indent);
    }
    initOutlineColumn(sheet);
    sheet.resumePaint();
}

function initOutlineColumn(sheet) {
    sheet.setColumnWidth(0, 500);
    sheet.setColumnWidth(2, 500);
    sheet.frozenColumnCount(1);
    sheet.showRowOutline(false);
    sheet.outlineColumn.options({
        columnIndex: 0,
        showIndicator: true
    });
    sheet.options.isProtected = true;
}

function buildExpStrNode(expr, calcStack, indentLevel, sheet) {
    var operatorSymbol = ['+', '-', '%', '+', '-', '*', '/', '^', '&', '=', '<>', '<', '<=', '>', '>=', ':', ',', ' '];
    switch (expr.type) {
        case GC.Spread.CalcEngine.ExpressionType.operator:
            var leftExp = expr.value,
                rightExp = expr.value2;
            calcStack.push({
                text: operatorSymbol[expr.operatorType],
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            if (leftExp) {
                buildExpStrNode(leftExp, calcStack, indentLevel + 1, sheet);
            }
            if (rightExp) {
                buildExpStrNode(rightExp, calcStack, indentLevel + 1, sheet);
            }
            break;
        case GC.Spread.CalcEngine.ExpressionType.function:

            calcStack.push({
                text: expr.functionName,
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            //calcStack.push({text: "(", indent: indentLevel});
            var args = expr.arguments;
            if (args && args.length > 0) {
                for (var i = 0; i < args.length; i++) {
                    buildExpStrNode(args[i], calcStack, indentLevel + 1, sheet);
                }
            }
            //calcStack.push({text: ")", indent: indentLevel});
            break;
        case GC.Spread.CalcEngine.ExpressionType.parentheses:
            //calcStack.push({text: "(", indent: indentLevel});
            if (expr.value) {
                buildExpStrNode(expr.value, calcStack, indentLevel + 1, sheet);
            }
            //calcStack.push({text: ")", indent: indentLevel});
            break;
        case GC.Spread.CalcEngine.ExpressionType.reference:
            calcStack.push({
                text: GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expr, 0, 0),
                indent: indentLevel,
                value: evaluateExpression(sheet, expr)
            });
            break;
        default:
            if (expr.value) {
                calcStack.push({
                    text: expr.value + "",
                    indent: indentLevel,
                    value: evaluateExpression(sheet, expr)
                });
            }
            break;
    }
}

function buildExpTree(sheet, formula) {
    return GC.Spread.Sheets.CalcEngine.formulaToExpression(sheet, formula, 0, 0);
}

function evaluateExpression(sheet, expr) {
    var formula = GC.Spread.Sheets.CalcEngine.expressionToFormula(sheet, expr, 0, 0);
    if (formula) {
        return GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formula, 0, 0);
    }
    return null;
}