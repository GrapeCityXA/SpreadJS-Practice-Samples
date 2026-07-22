import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
GC.Spread.Sheets.LicenseKey = "";

// 定义超链接代表的是附件
let hyerlinkType = "attachfile";
// 定义保存的文件
let submitFile;

// spread上注册命令
function registerCommands(spread) {
  // 注册清除附件文件的命令
  spread.commandManager().register("removeAttachFile", {
    canUndo: false,
    execute: function (context, options, isUndo) {
      let { sheet, row, col } = options;
      let cellTag = sheet.getTag(row, col);
      if (cellTag && cellTag.type == hyerlinkType) {
        sheet.clear(
          row,
          col,
          1,
          1,
          GC.Spread.Sheets.SheetArea.viewport,
          GC.Spread.Sheets.StorageType.data | GC.Spread.Sheets.StorageType.tag,
        );
        sheet.refresh();
      } else {
        alert("当前单元格无附件");
      }
    },
  });

  // 下载文件
  spread.commandManager().register("downloadAttachFile", {
    canUndo: false,
    execute: function (context, options, isUndo) {
      let sheet = context.getActiveSheet();
      let row = sheet.getActiveRowIndex();
      let col = sheet.getActiveColumnIndex();
      let cellTag = sheet.getTag(row, col);
      if (cellTag && cellTag.type == hyerlinkType) {
        /***
         * 纯前端demo，文件存在于本地，fileInfo中存储的是File对象，可以直接获取到文件
         * 实际项目中，fileInfo应该是上传到文件服务器上的文件访问地址。
         * 因此这里需要发送请求，先获取文件blob,将获取的blob传递到saveAs的第二个参数中。
         */
        console.log("cellTag.fileInfo", cellTag.fileInfo);
        console.log("cellTag.fileInfo.name", cellTag.fileInfo.name);
        console.log("cellTag.fileInfo.path", cellTag.fileInfo.path);
        saveAs(cellTag.fileInfo, cellTag.fileInfo.name);
      }
    },
  });
}

// 创建Spread对象
let spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
registerCommands(spread);

document.getElementById("uploadAttach").onclick = function () {
  document.getElementById("fileOperate").style.visibility = "visible";
};

function hasAttachFile(sheet, row, col, file) {
  /**
   * 附件文件暂存
   * 这里由于没有服务端，所以我直接存了File对象,但File对象只有在实际使用时才会去获取实际的文件内容。在demo中可行
   * 在实际项目中，需要将file对象上传到文件服务器中
   * 上传完成后tag中的fileInfo应该代表的是文件的访问地址，而不能再是File对象。
   */
  console.log(file.name);
  sheet.setValue(row, col, file.name);
  sheet.setTag(row, col, {
    type: hyerlinkType,
    fileInfo: file, // 实际项目中fileInfo应该为上传完成文件的访问路径
  });
  sheet.setHyperlink(
    row,
    col,
    {
      url: file.name,
      linkColor: "#0066cc",
      visitedLinkColor: "#3399ff",
      drawUnderline: true,
      command: "downloadAttachFile",
    },
    GC.Spread.Sheets.SheetArea.viewport,
  );
}

document.getElementById("removeAttach").onclick = function () {
  /***
   * 清除附件
   * 清除附件需要先删除远程文件服务器的文件，之后清除单元格的Tag信息。
   * 这里前端演示demo，只删除了tag。
   * 实际项目中tag中的fileInfo应该是文件上传后的路径
   */
  let sheet = spread.getActiveSheet();
  let row = sheet.getActiveRowIndex();
  let col = sheet.getActiveColumnIndex();
  spread.commandManager().execute({
    cmd: "removeAttachFile",
    sheet,
    row,
    col,
  });
};

document.getElementById("fileSaver").onclick = function () {
  // 保存文件
  submitFile = spread.toJSON();
  spread.clearSheets();
  spread.addSheet(0);
};

document.getElementById("loadSubmitFile").onclick = function () {
  // 加载已保存文件
  spread.fromJSON(submitFile);
};

document.getElementById("submit").onclick = function () {
  // 点击上传附件模态框中确定事件暂存附件文件
  let file = document.getElementById("choseFile").files[0];
  if (!file) {
    alert("未添加文件");
  } else {
    let sheet = spread.getActiveSheet();
    let row = sheet.getActiveRowIndex();
    let col = sheet.getActiveColumnIndex();
    hasAttachFile(sheet, row, col, file);
  }
  document.getElementById("fileOperate").style.visibility = "hidden";
};

function loadAllFiles() {
  let zip = new JSZip();
  // 先获取附件文件
  let sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    let sheet = spread.getSheet(i);
    let rowCount = sheet.getRowCount();
    let colCount = sheet.getColumnCount();
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        let cellTag = sheet.getTag(row, col);
        if (
          sheet.getHyperlink(row, col) &&
          cellTag &&
          cellTag.type == hyerlinkType
        ) {
          // 实际项目中，单元格Tag中的fileInfo应该为文件路径，这里需要发送请求拿到文件的blob，demo里边直接从os里边读本地文件。
          // zip.file(cellTag.fileInfo.name,cellTag.fileInfo,{binary: true})
          zip.file("name.jpg", cellTag.fileInfo, { binary: true });
        }
      }
    }
  }
  spread.export(function (blob) {
    console.log(blob);
    zip.file("主文件.xlsx", blob, { binary: true });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "download.zip");
    });
  });
}

document.getElementById("loadPackage").onclick = loadAllFiles;

document.getElementById("cancel").onclick = function () {
  // 隐藏附件提交文件
  document.getElementById("fileOperate").style.visibility = "hidden";
};
