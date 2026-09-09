import * as GC from "@grapecity-software/spread-sheets";


var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
spread.options.highlightInvalidData = true;
var sheet = spread.getActiveSheet();

//ListValidator
var dv1 = new GC.Spread.Sheets.DataValidation.createListValidator("Fruit,Vegetable,Food");
dv1.inputTitle("Please choose a category:");
dv1.inputMessage("Fruit, Vegetable, Food");
dv1.ignoreBlank(false)
dv1.highlightStyle({
    type: GC.Spread.Sheets.DataValidation.HighlightType.icon,
    color: "gold",
    position: GC.Spread.Sheets.DataValidation.HighlightPosition.outsideRight,
});
dv1.showErrorMessage(true);
for (var i = 0; i < 11; i++) {
    sheet.setDataValidator(i, 2, dv1);
}
dv1.errorStyle(GC.Spread.Sheets.DataValidation.ErrorStyle.stop);
dv1.errorTitle("Err")
dv1.errorMessage("Please choose a category")

sheet.bind(GC.Spread.Sheets.Events.ValidationError, function(e, args) {
    var validator = args.validator;
    if(validator.showErrorMessage()){
        var oldValue = args.sheet.getValue(args.row, args.col);
        var errorTitle = validator.errorTitle();
        var errorMessage = validator.errorMessage();
        // 这里根据类型弹不同的框
        if(validator.errorStyle() === GC.Spread.Sheets.DataValidation.ErrorStyle.stop){
            // 如果不是异步弹框，可以用validationResult 返回操作结果
            args.validationResult = GC.Spread.Sheets.DataValidation.DataValidationResult.retry;

            alert(errorMessage);
            // 一般弹框都是异步的，模拟异步
            // setTimeout(function(){
            //     args.sheet.setActiveCell(args.row, args.col);
            //     args.sheet.setValue(args.row, args.col, oldValue);
            //     args.sheet.startEdit(true);
            // }, 10);
        }
    }
});