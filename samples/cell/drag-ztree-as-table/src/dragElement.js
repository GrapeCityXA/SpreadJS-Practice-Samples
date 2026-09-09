function DragElement(elementId, spread){
    this.element = document.getElementById(elementId);
    this.spread = spread;
    this._init();
}

DragElement.prototype._init = function(){
    if(this.element && this.spread){
        this.element.ondragstart = (evt) => {

            if(!this.spread){
                return;
            }

            if (evt.dataTransfer) {
                evt.dataTransfer.setData("text/plain", "Data")
            }
            this.spread.getHost().style.position = "relative"
            this.spread.getHost().ondragover = (evt) => this._onDocumentMouseMove(evt);
            this.spread.getHost().ondrop = (evt) => this._onDocumentMouseUp(evt);

            // this.spread.getHost().addEventListener("dragover", this._onDocumentMouseMove.bind(this));
            // this.spread.getHost().addEventListener("drop", this._onDocumentMouseUp.bind(this));
        };
        this.element.ondragend = (evt) => {
            if(!this.spread){
                return;
            }
            this.spread.getHost().ondragover = undefined;
            this.spread.getHost().ondrop = undefined;

            // this.spread.getHost().removeEventListener("dragover", this._onDocumentMouseMove.bind(this));
            // this.spread.getHost().removeEventListener("drop", this._onDocumentMouseUp.bind(this));

            this._removeBlock();
        };
        
    }
}

DragElement.prototype._onDocumentMouseMove = function(evt){
    evt.preventDefault();
    let hitInfo = this._getHitTestInfo(evt);
    if (!hitInfo) {
        return;
    }
    if (hitInfo.row === undefined || hitInfo.col === undefined) {
        return;
    }
    if (isNaN(hitInfo.row) || isNaN(hitInfo.col)) {
        return;
    }
    evt.stopPropagation()
    if(hitInfo.rowViewportIndex !== 1 || hitInfo.colViewportIndex !== 1){
        return;
    }
    let activeSheet = this.spread.getActiveSheet();
    let rect = activeSheet.getCellRect(hitInfo.row, hitInfo.col);
    this._highlightBlock(rect);
}
DragElement.prototype._onDocumentMouseUp = function(evt){
    evt.preventDefault();
    let hitInfo = this._getHitTestInfo(evt);
    if (!hitInfo) {
        return;
    }
    if (hitInfo.row === undefined || hitInfo.col === undefined) {
        return;
    }
    if (isNaN(hitInfo.row) || isNaN(hitInfo.col)) {
        return;
    }
    evt.stopPropagation()
    if(hitInfo.rowViewportIndex !== 1 || hitInfo.colViewportIndex !== 1){
        return;
    }
    let activeSheet = this.spread.getActiveSheet();
    activeSheet.setValue(hitInfo.row, hitInfo.col, evt.dataTransfer.getData("text/plain"))

}
DragElement.prototype._highlightBlock = function(rect){
    if(!this.decoration){
        this.decoration = document.createElement("div");
        this.decoration.style.position = "absolute"
        this.decoration.style.border = "1px solid blue"
        this.decoration.style.boxShadow = "0px 0px 4px 0px #007eff"
        this.decoration.style.zIndex = "1000"
        this.spread.getHost().appendChild(this.decoration);
    }
    this.decoration.style.width = (rect.width - 1) + "px";
    this.decoration.style.height = (rect.height - 1) + "px";
    this.decoration.style.left = rect.x + "px";
    this.decoration.style.top = rect.y + "px";
}
DragElement.prototype._removeBlock = function(){
    if(this.decoration){
        this.decoration.remove();
        this.decoration = undefined;
    }
}

DragElement.prototype._getHitTestInfo = function(event) {
    if(!this.spread){
        return;
    }
    let activeSheet = this.spread.getActiveSheet();
    if (!activeSheet) {
        return;
    }
    let canvas = this.spread.getHost().querySelector("canvas[gcuielement]");;
    let t = this._getOffset(canvas);
    return activeSheet.hitTest(event.pageX - t.left, event.pageY - t.top);
}

DragElement.prototype._getOffset = function(element) {
    let left = 0;
    let top = 0;
    while (element) {
        left += element.offsetLeft;
        top += element.offsetTop;
        element = element.offsetParent;
    }
    return {
        left: left,
        top: top
    };
}

DragElement.prototype.destroy = function(){
    this.element.ondragstart = undefined;
    this.element.ondragend = undefined;
    this.element = undefined;
    this.spread = undefined;
}

export {DragElement};