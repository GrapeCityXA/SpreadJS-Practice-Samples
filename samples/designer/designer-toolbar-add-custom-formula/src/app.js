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


function customFontFamilyInFormatDialogTemplate(templateNode) {

    // 如果要添加到不同的分类下，可以调试查看template中的bindingPath信息
    if (templateNode.bindingPath && templateNode.bindingPath === 'functionDesc.mathAndTrigonometryFunction' && templateNode.items) {
        templateNode.items.unshift({ text: "FACTORIAL", value: "FACTORIAL" })
        return
    }
    let nodes = templateNode.content || templateNode.children;
    // CODE_SNIPPET_START:<SNIPPET_NAME_REQUIRED>
    if (nodes && nodes instanceof Array) {
        nodes.forEach((subNode) => customFontFamilyInFormatDialogTemplate(subNode))
    }
}
let tamplate = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate)
customFontFamilyInFormatDialogTemplate(tamplate)
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate, tamplate)

function FactorialFunction() {
    this.name = "FACTORIAL";
    this.maxArgs = 1;
    this.minArgs = 1;
    this.description = function () {
        return (
            {
                description: "菲波那切数列",
                parameters: [
                    {
                        name: 'number01',
                        repeatable: false,
                        optional: false
                    }
                ]
            }
        )
    }
}
FactorialFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();
FactorialFunction.prototype.evaluate = function (arg) {
    var result = 1;
    if (arguments.length === 1 && !isNaN(parseInt(arg))) {
        for (var i = 1; i <= arg; i++) {
            result = i * result;
        }
        return result;
    }
    return "#VALUE!";
};

GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("FACTORIAL", new FactorialFunction());


// 工具栏日期下拉框新增公式
let designerConfig = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
let formulaMathTrigCmd = GC.Spread.Sheets.Designer.getCommand("formulaMathTrig");
let customFormula = [
    { value: "FACTORIAL", text: "FACTORIAL" }
];
formulaMathTrigCmd.dropdownList = customFormula.concat(formulaMathTrigCmd.dropdownList);
designerConfig.commandMap = {};
designerConfig.commandMap["formulaMathTrig"] = formulaMathTrigCmd

designer = new GC.Spread.Sheets.Designer.Designer("designer-container", designerConfig)
spread = designer.getWorkbook()

var factorial = new FactorialFunction();
spread.addCustomFunction(factorial)




