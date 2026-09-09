import * as GC from "@grapecity-software/spread-sheets";
function HighlightLayout(name){
    this.name = name;
    this._eventNs = ".HighlightLayout" + name || "";
    this._sheetRangesInfo = {}
}
HighlightLayout.prototype.bind = function(spread){
    if(spread){
        this._content = spread;
        this._container = this._createLayoutContainer(spread.getHost())
        this._bindEvents(spread);
    }
}
HighlightLayout.prototype._createLayoutContainer = function(host){
    host.style.position = "relative";
    var container = document.createElement('div');
    container.style.cssText = "position: absolute;height: 100%;width: 100%;top: 0px;left: 0px;pointer-events: none";
    host.appendChild(container)
    return container;
}
HighlightLayout.prototype._bindEvents = function(context){
    var self = this;
    context.bind(GC.Spread.Sheets.Events.TopRowChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.LeftColumnChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.ColumnWidthChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.RowHeightChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
    context.bind(GC.Spread.Sheets.Events.FormulatextboxActiveSheetChanged + self._eventNs, function (e, data) {
        setTimeout(function(){
            self._resetLayout();
        },0);
    });
}

HighlightLayout.prototype._resetLayout = function(id){
    var content = this._content,
        container = this._container,
        sheet = content.getActiveSheet();
    
    //clear Layout
    container.innerHTML = "";

    var rangesInfo = this._sheetRangesInfo[sheet.name()];
    if(!rangesInfo){
        return;
    }
    for(var id in rangesInfo){
        var info = rangesInfo[id];
        if(!info.ranges){
            continue;
        }
        for(var i = 0; i < info.ranges.length; i++){
            this._paintRange(container, id + "_" + i,sheet, info.ranges[i], info.option,id)
        }
    }
}
HighlightLayout.prototype._paintRange = function(container, id, sheet, hightlightRange, option,name){
    const noneBorderStyle = "none", 
        highlightBorderStyle = "3px solid " + (option && option.borderColor) || "lightseagreen";
		var tlRect = {},rbRect = {};
		var actualArea = {};
		for(var i = hightlightRange.row; i < hightlightRange.row + hightlightRange.rowCount; i++){
			var breakFlag = false;
			for(var j = hightlightRange.col; j < hightlightRange.col + hightlightRange.colCount; j++){
				var rect = sheet.getCellRect(i, j);
				if(rect.x != null){
					tlRect = rect;
					actualArea.rowStart = i;
					actualArea.colStart = j;
					breakFlag = true;
					break;
				}
			}
			if(breakFlag){
				break
			}
		}
		for(var i = hightlightRange.row + hightlightRange.rowCount - 1; i >= hightlightRange.row; i--){
			var breakFlag = false;
			for(var j = hightlightRange.col + hightlightRange.colCount - 1; j >= hightlightRange.col; j--){
				var rect = sheet.getCellRect(i, j);
				if(rect.x != null){
					rbRect = rect;
					actualArea.rowEnd = i;
					actualArea.colEnd = j;
					breakFlag = true;
					break;
				}	
			}
			if(breakFlag){
				break
			}
		}
    var trRect = sheet.getCellRect(actualArea.rowStart, actualArea.colEnd),
        lbRect = sheet.getCellRect(actualArea.rowEnd, actualArea.colStart),
        cornerRect = sheet.getCellRect(0, 0, -1, -1);
    var viewportWidth = cornerRect.width + sheet.getViewportWidth(0) + sheet.getViewportWidth(1),
        viewportHeight = cornerRect.height + sheet.getViewportHeight(0) + sheet.getViewportHeight(1);

    var x = tlRect.x || lbRect.x,
        y = tlRect.y || trRect.y,
        endX = trRect.x != undefined && (trRect.x + trRect.width) || rbRect.x != undefined && (rbRect.x + rbRect.width),
        endY = rbRect.y != undefined && (rbRect.y + rbRect.height) || lbRect.y != undefined && (lbRect.y + lbRect.height);
        
    var left = x && x - cornerRect.width >= 0,
        top = y && y - cornerRect.height >= 0, 
        right = endX && endX <= viewportWidth, 
        bottom = endY && endY <= viewportHeight;

    if(!(left || top || right || bottom)){
        return;
    }
    x = left ? x : cornerRect.width;
    y = top ? y : cornerRect.height;
    endX = right ? endX : viewportWidth;
    endY = bottom ? endY : viewportHeight;
    var rectWidth= endX - x,
        rectHeight = endY - y; 

    var highLightRect = document.createElement('div');
    highLightRect.id = id;
    highLightRect.style.position = "absolute";
    highLightRect.style.pointerEvents = "none";
    
    highLightRect.style.left = x - 2 + "px";
    highLightRect.style.top = y - 2 + "px";
    highLightRect.style.height = rectHeight - 2 + "px";
    highLightRect.style.width = rectWidth - 2 + "px";
        
    highLightRect.style.borderLeft = left ? highlightBorderStyle : noneBorderStyle;
    highLightRect.style.borderTop = top ? highlightBorderStyle : noneBorderStyle;
    highLightRect.style.borderRight = right ? highlightBorderStyle : noneBorderStyle;
    highLightRect.style.borderBottom = bottom ? highlightBorderStyle : noneBorderStyle;
    highLightRect.innerHTML = '<div style="position:absolute;right:0px;bottom:0px;width: 60px;height: 20px;text-align:center;background-color:#1B9AF7">' + name + '</div>'
    container.appendChild(highLightRect);
}

HighlightLayout.prototype.addRanges = function(sheetName, id, ranges, option){
    if(sheetName && id && ranges && ranges.length){
        var rangesInfo = this._sheetRangesInfo[sheetName];
        if(!rangesInfo){
            this._sheetRangesInfo[sheetName] = rangesInfo = {};
        }
        rangesInfo[id] = {ranges, option}
        this._resetLayout(id);
    }
}

export default HighlightLayout