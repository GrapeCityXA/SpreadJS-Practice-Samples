import GC from "@grapecity/spread-sheets"

export class TableDivideCellType extends GC.Spread.Sheets.CellTypes.Base{
    size?: number
    constructor(){
        super()
        this.size = 10
    }
}



const getEndPoint= (x:number,y:number,w:number,h:number,count:number) => {
    let result  = []
    for(let i=1; i<=count-1;i++){
        let angle = i*Math.PI/(2*count)
        if(w*Math.tan(angle) < h){
            result.push({offsetX: w,offsetY: Math.ceil(w*Math.tan(angle))})
        }else{
            result.push({offsetX: Math.ceil(h/Math.tan(angle)),offsetY: h})
        }
    }
    console.log(result)
    return result
}

const getAreaPoint = (w:number,h:number,count:number) => {
    let totalArea = w*h
    let results = []
    for(let i=1; i<=count; i++){
        const targetArea = (totalArea/count) * i
        if(targetArea <= totalArea/2){
            results.push({offsetX: w,offsetY: Math.ceil((2*targetArea)/w)})
        }else{
            results.push({offsetX:Math.ceil(w-(2*(targetArea-w*h/2))/h),offsetY: h})
        }
    }
    return results
}

const drawContent = (ctx: any,x:number,y:number,width:number,height:number,content:{count:null,text:[]}) => {
    let lineCount = content.count
    let texts = content.text
    const totalArea = width * height;

    // Clear the canvas
    ctx.clearRect(x,y, width, height);

    // Store the end points of each line to calculate text positions later
    const endPoints = [];

    for (let i = 1; i <= lineCount; i++) {
        const targetArea = (totalArea / lineCount) * i;
        let xEnd, yEnd;

        // Calculate end points based on area
        if (targetArea <= (width * height / 2)) {
            yEnd = (2 * targetArea) / width;
            xEnd = width;
        } else {
            yEnd = height;
            xEnd = width - (2 * (targetArea - width * height / 2)) / height;
        }

        endPoints.push({ x: xEnd, y: yEnd });

        // Draw the main line
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+xEnd, y+yEnd);
        ctx.stroke();
    }

    // // Draw angle bisector lines
    // ctx.setLineDash([5, 5]); // Set line dash for the bisector lines
    // for (let i = 0; i < lineCount; i++) {
    //     const xPrev = i === 0 ? width : endPoints[i - 1].x;
    //     const yPrev = i === 0 ? 0 : endPoints[i - 1].y;
    //     const xCurr = endPoints[i].x;
    //     const yCurr = endPoints[i].y;

    //     // Calculate bisector line end point
    //     const xMid = (xPrev + xCurr) / 2;
    //     const yMid = (yPrev + yCurr) / 2;

    //     // Draw the bisector line
    //     ctx.beginPath();
    //     ctx.moveTo(x,y);
    //     ctx.lineTo(xMid, yMid);
    //     ctx.stroke();
    // }
    // ctx.setLineDash([]); // Reset line dash to solid for the main lines

    // Calculate and draw text in each region
    for (let i = 0; i < lineCount; i++) {
        const xPrev = i === 0 ? width : endPoints[i - 1].x;
        const yPrev = i === 0 ? 0 : endPoints[i - 1].y;
        const xCurr = endPoints[i].x;
        const yCurr = endPoints[i].y;

        // Calculate 2/3 position along the angle bisector
        const xText = (2 / 3) * ((xPrev + xCurr) / 2);
        const yText = (2 / 3) * ((yPrev + yCurr) / 2);

        // Draw the text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(texts[i], xText+x, yText+y);
    }



}



TableDivideCellType.prototype.paint = function(ctx, value, x, y, w, h, style, context) {
    if (!ctx) {
        return;
    }
    ctx.clearRect(x,y,w,h)
    ctx.lineWidth = 1
    drawContent(ctx,x,y,w,h,value)
    
}