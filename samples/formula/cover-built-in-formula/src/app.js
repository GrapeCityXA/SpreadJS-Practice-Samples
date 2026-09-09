import * as GC from "@grapecity-software/spread-sheets";

// 移除内置if
GC.Spread.CalcEngine.Functions.removeGlobalFunction("if")

function MyIf(){}
MyIf.prototype = new GC.Spread.CalcEngine.Functions.Function("if",3,3,{
    description:"这是一个自定义的IF函数",
    parameter:[
        {
            name:"逻辑判断",
            optional: false,
            repeatable: false
        },{
            name: "逻辑真值",
            optional: false,
            repeatable:false
        },{
            name:"逻辑假值",
            optional: false,
            repeatable: false
        }
    ]
})
MyIf.prototype.evaluate = function(){
    // 可以打印出arguments信息，查看具体内容
    let logicValue = arguments[1]
    console.log(arguments)
    if(logicValue){
       if(typeof arguments[2] == Object){
        return "自定义if结果 真值：" + arguments[2].getSource().getValue(arguments[2].getRow(),arguments[2].getColumn())
       }else{
        return  "自定义if结果 真值：" + arguments[2]
       }
    }else{
        if(typeof arguments[3] == Object){
        return  "自定义if结果 假值：" + arguments[3].getSource().getValue(arguments[3].getRow(),arguments[3].getColumn())
       }else{
        return  "自定义if结果 假值：" + arguments[3]
       }
    }
    return "1"
}

MyIf.prototype.acceptsReference = function(){
    // 自定义函数中，需要参数能包含引用单元格位置等上下文信息，添加该参数
    return true
}
MyIf.prototype.isContextSensitive  = function(){
    // 如果自定义函数时，需要参数返回当前自定义公式所在单元格位置等信息，添加该代码
    return true
}

// 添加自定义if
GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("if",new MyIf())

let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

let sheet = spread.getActiveSheet()

sheet.setValue(0, 0, 1)
sheet.setValue(0, 1, 2)
sheet.setValue(1, 0, "覆盖If：")
sheet.setColumnWidth(0, 70)
sheet.setColumnWidth(1, 200)
sheet.setFormula(1, 1, 'IF(A1>B1,"A1大于B1","A1小于B1")')





