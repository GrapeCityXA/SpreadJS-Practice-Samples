import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-tablesheet";
import "@grapecity-software/spread-excelio"
import "@grapecity-software/spread-sheets-charts"
import "@grapecity-software/spread-sheets-print"
import "@grapecity-software/spread-sheets-pdf"
import "@grapecity-software/spread-sheets-barcode"
import "@grapecity-software/spread-sheets-languagepackages"
import "@grapecity-software/spread-sheets-shapes"
import "@grapecity-software/spread-sheets-pivot-addon"
import "@grapecity-software/spread-sheets-designer-resources-cn"
import "@grapecity-software/spread-sheets-designer"


function customFontFamilyInFormatDialogTemplate(templateNode) {
	if (templateNode.bindingPath && templateNode.bindingPath === 'functionDesc.allFunction' && templateNode.items) {
		templateNode.items.unshift({ text: "FACTORIAL", value: "FACTORIAL" })
		return;
	}
	let nodes = templateNode.content || templateNode.children;
	if (nodes && nodes instanceof Array) {
		nodes.forEach((subNode) => customFontFamilyInFormatDialogTemplate(subNode));
	}
}
let template = GC.Spread.Sheets.Designer.getTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate);
customFontFamilyInFormatDialogTemplate(template);
GC.Spread.Sheets.Designer.registerTemplate(GC.Spread.Sheets.Designer.TemplateNames.InsertFunctionDialogTemplate, template);


let designer = new GC.Spread.Sheets.Designer.Designer("designer-container")
let spread = designer.getWorkbook()


function FactorialFunction() {
	this.name = "FACTORIAL";
	this.maxArgs = 1;
	this.minArgs = 1;
	this.description = function () {
		return (
			{
				description: "自定义的阶乘函数",
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
	let result = 1;
	if (arguments.length === 1 && !isNaN(parseInt(arg))) {
		for (let i = 1; i <= arg; i++) {
			result = i * result;
		}
		return result;
	}
	return "#VALUE!";
};
let factorial = new FactorialFunction();
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("FACTORIAL", new FactorialFunction());
spread.addCustomFunction(factorial)

let sheet = spread.getActiveSheet()
sheet.setValue(0, 2, "请点击上方fx图标，公式列表的第一个就是自定义的阶乘函数")
sheet.setFormula(4, 2, "=factorial(5)");


