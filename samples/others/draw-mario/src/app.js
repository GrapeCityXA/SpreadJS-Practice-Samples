import * as GC from "@grapecity-software/spread-sheets";

GC.Spread.Sheets.LicenseKey = "";
/**
 * 自定义绘制超级马里奥
 * 给表单中不同区域标注不同的颜色，然后存到数组中，循环数组去设置背景色实现绘制效果
 */
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
let sheet = spread.getActiveSheet();
spread.suspendPaint();
sheet.setColumnCount(50);
for (let i = 0; i < sheet.getColumnCount(); i++) {
  sheet.setColumnWidth(i, 20);
}
spread.options.scrollbarMaxAlign = true;
spread.resumePaint();

// 绘制图案的单元格操作记录
let commandArr = [];

for (let i = 16; i < 22; i++) {
  let command = {};
  command.row = 3;
  command.col = i;
  command.backColor = "red";
  commandArr.push(command);
}

//4
for (let i = 15; i < 24; i++) {
  let command = {};
  command.row = 4;
  command.col = i;
  command.backColor = "red";
  commandArr.push(command);
}

//5
for (let i = 15; i < 23; i++) {
  let command = {};
  command.row = 5;
  command.col = i;
  if (i < 19 || i == 21) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "rgb(251,162,80)";
  }
  commandArr.push(command);
}

//6
for (let i = 14; i < 25; i++) {
  let command = {};
  command.row = 6;
  command.col = i;
  if (i < 16 || i == 17 || i == 21) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "rgb(251,162,80)";
  }
  commandArr.push(command);
}

//7
for (let i = 14; i < 26; i++) {
  let command = {};
  command.row = 7;
  command.col = i;
  if (i < 16 || i == 17 || i == 18 || i == 22) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "rgb(251,162,80)";
  }
  commandArr.push(command);
}

//8
for (let i = 14; i < 25; i++) {
  let command = {};
  command.row = 8;
  command.col = i;
  if (i < 17 || i > 20) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "rgb(251,162,80)";
  }
  commandArr.push(command);
}

//9
for (let i = 15; i < 24; i++) {
  let command = {};
  command.row = 9;
  command.col = i;
  command.backColor = "rgb(251,162,80)";
  commandArr.push(command);
}

//10
for (let i = 14; i < 22; i++) {
  let command = {};
  command.row = 10;
  command.col = i;
  if (i == 18) {
    command.backColor = "red";
  } else {
    command.backColor = "Accent 2 -50";
  }
  commandArr.push(command);
}

//11
for (let i = 13; i < 25; i++) {
  let command = {};
  command.row = 11;
  command.col = i;
  if (i == 18 || i == 21) {
    command.backColor = "red";
  } else {
    command.backColor = "Accent 2 -50";
  }
  commandArr.push(command);
}

//12
for (let i = 12; i < 26; i++) {
  let command = {};
  command.row = 12;
  command.col = i;
  if (i < 18 || i > 21) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "red";
  }
  commandArr.push(command);
}

//13
for (let i = 12; i < 26; i++) {
  let command = {};
  command.row = 13;
  command.col = i;
  if (i < 15 || i == 17 || i == 21 || i > 23) {
    command.backColor = "rgb(251,162,80)";
  } else if (i == 15 || i == 23) {
    command.backColor = "Accent 2 -50";
  } else {
    command.backColor = "red";
  }
  commandArr.push(command);
}

//14
for (let i = 12; i < 26; i++) {
  let command = {};
  command.row = 14;
  command.col = i;
  if (i < 16 || i > 22) {
    command.backColor = "rgb(251,162,80)";
  } else {
    command.backColor = "red";
  }
  commandArr.push(command);
}

//15
for (let i = 12; i < 26; i++) {
  let command = {};
  command.row = 15;
  command.col = i;
  if (i < 15 || i > 23) {
    command.backColor = "rgb(251,162,80)";
  } else {
    command.backColor = "red";
  }
  commandArr.push(command);
}

//16
for (let i = 14; i < 24; i++) {
  let command = {};
  command.row = 16;
  command.col = i;
  command.backColor = "red";
  commandArr.push(command);
}

//17
for (let i = 13; i < 25; i++) {
  if (i < 17 || i > 19) {
    let command = {};
    command.row = 17;
    command.col = i;
    command.backColor = "Accent 2 -50";
    commandArr.push(command);
  }
}

//18
for (let i = 12; i < 26; i++) {
  if (i < 17 || i > 19) {
    let command = {};
    command.row = 18;
    command.col = i;
    command.backColor = "Accent 2 -50";
    commandArr.push(command);
  }
}
//点击按钮事件
document.getElementById("work").onclick = function () {
  executeCmd(commandArr);
};
//每隔20毫秒设置一个单元格的背景色
function executeCmd(cmdArr) {
  setTimeout(function () {
    let i = cmdArr.length - 1;
    // 设置单元格背景色
    sheet.getCell(cmdArr[i].row, cmdArr[i].col).backColor(cmdArr[i].backColor);
    cmdArr.pop();
    if (cmdArr.length != 0) {
      executeCmd(cmdArr);
    }
  }, 20);
}
