import * as GC from "@grapecity-software/spread-sheets";
function DataBar(){
}

DataBar.prototype = new GC.Spread.Sheets.CellTypes.Text();

var oldPaint = GC.Spread.Sheets.CellTypes.Text.prototype.paint;
DataBar.prototype.paint = function (ctx, value, x, y, w, h, style, options) {
	if(typeof(value) == "number" && value >=0 && value <=100){
		var color;
		if(value>=0 && value <=60){
			color = "green";
		}
		else if(value>60 && value <=85){
			color = "yellow";
		}
		else if(value>85 && value <=100){
			color = "red";
		}
		ctx.fillStyle = color;
		ctx.fillRect(x,y,value/100*w,h);
		//oldPaint.call(this,ctx, value, x, y, w, h, style, options);
	}else{
		oldPaint.call(this,ctx, value, x, y, w, h, style, options);
	}
	
};
var spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
	var sheet = spread.getActiveSheet();
	sheet.setCellType(0, 0, new DataBar());
	sheet.setValue(0, 0, 30);
	sheet.setCellType(1, 0, new DataBar());
	sheet.setValue(1, 0, 40);
	sheet.setCellType(2, 0, new DataBar());
	sheet.setValue(2, 0, 50);
	sheet.setCellType(3, 0, new DataBar());
	sheet.setValue(3, 0, 60);
	sheet.setCellType(4, 0, new DataBar());
	sheet.setValue(4, 0, 70);
	sheet.setCellType(5, 0, new DataBar());
	sheet.setValue(5, 0, 80);
	sheet.setCellType(6, 0, new DataBar());
	sheet.setValue(6, 0, 90);