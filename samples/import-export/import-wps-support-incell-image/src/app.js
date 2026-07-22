import * as GC from "@grapecity-software/spread-sheets";
import "@grapecity-software/spread-sheets-io";
GC.Spread.Sheets.LicenseKey = "";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));

async function processFile() {
  console.log("sss");
  const fileInput = document.getElementById("xlsxFile");
  if (!fileInput.files.length) return alert("请选择XLSX文件");

  const file = fileInput.files[0];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    // 1. 获取所有包含DISPIMG函数的单元格
    const dispImgCells = findDispImgCells(workbook);
    // 2. 解析ZIP文件获取图片映射关系
    const zip = await JSZip.loadAsync(arrayBuffer);
    const rid2base64 = await buildImageIdMap(zip);
    const rid2id = await cellImageRid2Id(zip);
    console.log(dispImgCells);
    console.log("rid2base64:", rid2base64);
    console.log("rid2id:", rid2id);
    let id2cell = new Map();
    let id2base64;
    spread.import(file, function () {
      let srcSheet = new GC.Spread.Sheets.Worksheet("srcSheet");
      spread.addSheet(0, srcSheet);
      srcSheet.visible(GC.Spread.Sheets.SheetTabVisible.veryHidden);
      // 把base64放在srcSheet中
      let row = 0;
      rid2base64.forEach((base64, rid) => {
        srcSheet.setValue(row, 0, base64);
        let formula = GC.Spread.Sheets.CalcEngine.rangeToFormula(
          new GC.Spread.Sheets.Range(row, 0, 1, 1),
        );
        rid2id.get(rid).forEach((id) => {
          id2cell.set(id, "srcSheet!" + formula);
        });
        row++;
      });
      console.log("id2cell", id2cell);
      console.time("time cost");
      spread.suspendPaint();
      dispImgCells.forEach((info) => {
        let sheetName = info.address.split("!")[0];
        let addr = info.address.split("!")[1];
        let sheet = spread.getSheetFromName(sheetName);
        let range = GC.Spread.Sheets.CalcEngine.formulaToRange(sheet, addr);
        sheet.setFormula(
          range.row,
          range.col,
          `image(${id2cell.get(info.id)})`,
        );
      });
      spread.resumePaint();
      console.timeEnd("time cost");
      spread.setActiveSheet("Sheet1");
    });
  } catch (error) {
    console.error("解析错误:", error);
    alert("文件解析失败: " + error.message);
  }
}

// 查找所有包含DISPIMG函数的单元格
function findDispImgCells(workbook) {
  const results = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const cellAddresses = Object.keys(worksheet);

    cellAddresses.forEach((address) => {
      if (!address.startsWith("!") && worksheet[address].f) {
        const formula = worksheet[address].f;
        const match = formula.match(/DISPIMG\("([^"]+)",\s*(\d)\)/i);

        if (match) {
          results.push({
            address: `${sheetName}!${address}`,
            id: match[1],
            displayMode: parseInt(match[2]),
          });
        }
      }
    });
  });

  return results;
}

// 构建图片ID到文件名的映射关系
async function buildImageIdMap(zip) {
  const imageMap = new Map();

  // 1. 查找所有drawing关系文件
  const relFiles = [];
  zip.forEach((relativePath, file) => {
    if (
      (relativePath.startsWith("xl/drawings/_rels/") &&
        relativePath.endsWith(".rels")) ||
      (relativePath.startsWith("xl/_rels/") &&
        relativePath.endsWith("cellimages.xml.rels"))
    ) {
      relFiles.push(file);
    }
  });

  // 2. 解析每个关系文件
  for (const file of relFiles) {
    const xmlContent = await file.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    const relationships = xmlDoc.getElementsByTagName("Relationship");
    for (let i = 0; i < relationships.length; i++) {
      const rel = relationships[i];
      const id = rel.getAttribute("Id");
      const target = rel.getAttribute("Target");

      if (target) {
        let filename = "";
        if (target.startsWith("../media/")) {
          filename = target.replace("../media/", "");
        } else if (target.startsWith("media")) {
          filename = target.replace("media/", "");
        }
        const imgFile = zip.file(`xl/media/${filename}`);
        if (imgFile) {
          const blob = await imgFile.async("blob");
          let base64 = await blobToBase64(blob, imgFile);
          imageMap.set(id, base64);
        }
      }
    }
  }

  return imageMap;
}

async function cellImageRid2Id(zip) {
  let rid2id = new Map();
  // 1. 查找所有drawing关系文件
  let cellImgXmlFile;
  zip.forEach((relativePath, file) => {
    if (relativePath.startsWith("xl/cellimages.xml")) {
      cellImgXmlFile = file;
    }
  });
  let xmlContent = await cellImgXmlFile.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const xdrPics = xmlDoc.getElementsByTagName("xdr:pic");
  for (let i = 0; i < xdrPics.length; i++) {
    let p = xdrPics[i];
    let nameTag = p.getElementsByTagName("xdr:cNvPr")[0];
    let idTag = p.getElementsByTagName("a:blip")[0];
    let rid = idTag.getAttribute("r:embed");
    let id = nameTag.getAttribute("name");

    if (!rid2id.get(rid)) {
      rid2id.set(rid, []);
    }
    let arr = rid2id.get(rid);
    arr.push(id);
    rid2id.set(rid, arr);
  }
  return rid2id;
}

function blobToBase64(blob, imgFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const fileName = imgFile.name.toLowerCase();
    let mimeType = "image/png"; // 默认使用 PNG

    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (fileName.endsWith(".gif")) {
      mimeType = "image/gif";
    } else if (fileName.endsWith(".webp")) {
      mimeType = "image/webp";
    } else if (fileName.endsWith(".bmp")) {
      mimeType = "image/bmp";
    }
    reader.onload = () =>
      resolve(`data:${mimeType};base64,` + reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

document.getElementById("import").addEventListener("click", processFile);
