import * as GC from "@grapecity-software/spread-sheets";

function ZTree(elementId, nodes, spread){

    		var setting = {
			edit: {
				enable: true,
				showRemoveBtn: false,
				showRenameBtn: false,
                // drag:{
                //     isCopy: false,
                //     isMove: true,
                //     prev: true,
			    //     next: true,
			    //     inner: true
                // }
			},
			data: {
				simpleData: {
					enable: true
				}
			},
			callback: {
				onDrag: (event, treeId, treeNodes) =>this._onDrag(event, treeId, treeNodes),
                onDragMove: (event, treeId, treeNodes) =>this._onDragMove(event, treeId, treeNodes),
                onDrop: (event, treeId, treeNodes, targetNode, moveType) => this._onDrop(event, treeId, treeNodes, targetNode, moveType)
			}
		};

    this.element = document.getElementById(elementId);
    this.spread = spread;
    $.fn.zTree.init($(this.element), setting, nodes);

}

		ZTree.prototype._onDrag = function(event, treeId, treeNodes) {
            if(!this.spread){
                return;
            }        
            this.spread.getHost().style.position = "relative"
			return true;
		}

        ZTree.prototype._onDragMove = function(event, treeId, treeNodes) {
            this._onDocumentMouseMove(event);
			return true;
		}

        ZTree.prototype._onDrop = function(event, treeId, treeNodes, targetNode, moveType){
            this._onDocumentMouseUp(event, treeNodes)
            this._removeBlock();
        }

ZTree.prototype._onDocumentMouseMove = function(evt){
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
ZTree.prototype._onDocumentMouseUp = function(evt, items){
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
    if(items && items.length){
        let item = items[0]
        if(item.children && item.children.length){
            console.log(item.children)
            var table = activeSheet.tables.add("Table" + item.id, hitInfo.row, hitInfo.col, 2, item.children.length);
            table.autoGenerateColumns(false);
            let cloumns = []
            for(var j = 0; j < item.children.length; j++){
                let child = item.children[j];
                var tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
                tableColumn.name(child.name);
                tableColumn.dataField(child.dataField);
                cloumns.push(tableColumn)
            }
            table.bindColumns(cloumns);
            table.bindingPath(item.id);
        }
        else{
            activeSheet.setBindingPath(hitInfo.row, hitInfo.col, items[0].id)
        }
        activeSheet.repaint();
    }

}
ZTree.prototype._highlightBlock = function(rect){
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
ZTree.prototype._removeBlock = function(){
    if(this.decoration){
        this.decoration.remove();
        this.decoration = undefined;
    }
}

ZTree.prototype._getHitTestInfo = function(event) {
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
ZTree.prototype._getOffset = function(element) {
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
export {ZTree};

