import * as GC from "@grapecity-software/spread-sheets";

/**
 * 判断一个值是否为公式追踪产生的图形/工件。
 * 追踪图形统一以 "formulaTrace_" 前缀命名。
 */
export function isTraceArtifact(value) {
  return (
    value &&
    typeof value === "object" &&
    ((typeof value.name === "string" &&
      value.name.indexOf("formulaTrace_") === 0) ||
      (typeof value.shapeName === "string" &&
        value.shapeName.indexOf("formulaTrace_") === 0))
  );
}

/**
 * 递归清理 JSON 中由公式追踪产生的图形与标记，
 * 保证导出/另存的文件不包含追踪痕迹。
 */
export function removeTraceArtifactsFromJson(value) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i -= 1) {
      if (isTraceArtifact(value[i])) {
        value.splice(i, 1);
      } else {
        removeTraceArtifactsFromJson(value[i]);
      }
    }
    return;
  }

  Object.keys(value).forEach(function (key) {
    const child = value[key];
    if (key.indexOf("formulaTrace_") === 0 || isTraceArtifact(child)) {
      delete value[key];
    } else {
      removeTraceArtifactsFromJson(child);
    }
  });
}

/**
 * 安装“干净导出”管线。
 * 覆盖工作簿的 toJSON / export / save 方法，导出前临时恢复被追踪高亮
 * 的单元格底色，并在序列化后移除追踪图形，从而导出不含追踪痕迹的文件。
 *
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 * @param {Map} highlightedCells - 追踪引擎中的高亮单元格状态表
 */
export function installCleanExportPipeline(spread, highlightedCells) {
  const originalToJSON = spread.toJSON;
  const originalExport = spread.export;
  const serializeLiveWorkbook = function (options) {
    return originalToJSON.call(spread, options);
  };

  function createCleanExportJson(options) {
    const serializationOptions = Object.assign(
      {
        includeBindingSource: true,
        includeStyles: true,
        includeFormulas: true,
        includeUnusedNames: true,
        includeEmptyRegionCells: true,
      },
      options || {},
    );
    const visibleHighlightColors = [];
    let json;

    spread.suspendPaint();
    try {
      // 序列化前临时恢复所有被追踪高亮单元格的原始底色
      highlightedCells.forEach(function (state) {
        visibleHighlightColors.push({
          cell: state.cell,
          backColor: state.cell.backColor(),
        });
        state.cell.backColor(state.backColor == null ? null : state.backColor);
      });
      json = serializeLiveWorkbook(serializationOptions);
    } finally {
      visibleHighlightColors.forEach(function (state) {
        state.cell.backColor(state.backColor);
      });
      spread.resumePaint();
    }

    removeTraceArtifactsFromJson(json);
    return json;
  }

  function createCleanExportWorkbook(options) {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "-10000px";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.visibility = "hidden";
    host.style.pointerEvents = "none";
    document.body.appendChild(host);

    let exportWorkbook;
    try {
      exportWorkbook = new GC.Spread.Sheets.Workbook(host, {
        sheetCount: 0,
      });
      exportWorkbook.fromJSON(createCleanExportJson(options));
    } catch (error) {
      if (exportWorkbook && typeof exportWorkbook.destroy === "function") {
        exportWorkbook.destroy();
      }
      host.remove();
      throw error;
    }

    return {
      workbook: exportWorkbook,
      dispose: function () {
        if (typeof exportWorkbook.destroy === "function") {
          exportWorkbook.destroy();
        }
        host.remove();
      },
    };
  }

  function runCleanExport(methodName, args) {
    const successCallback = args[0];
    const errorCallback = args[1];
    const options = args[2];
    let cleanExport;

    try {
      cleanExport = createCleanExportWorkbook(options);
    } catch (error) {
      if (typeof errorCallback === "function") {
        errorCallback.call(spread, error);
        return;
      }
      throw error;
    }

    let disposed = false;
    function dispose() {
      if (!disposed) {
        disposed = true;
        cleanExport.dispose();
      }
    }

    const exportArgs = Array.prototype.slice.call(args);
    exportArgs[0] = function () {
      const callbackArgs = arguments;
      dispose();
      if (typeof successCallback === "function") {
        return successCallback.apply(spread, callbackArgs);
      }
    };
    exportArgs[1] = function () {
      const callbackArgs = arguments;
      dispose();
      if (typeof errorCallback === "function") {
        return errorCallback.apply(spread, callbackArgs);
      }
    };

    try {
      return cleanExport.workbook[methodName].apply(
        cleanExport.workbook,
        exportArgs,
      );
    } catch (error) {
      dispose();
      if (typeof errorCallback === "function") {
        errorCallback.call(spread, error);
        return;
      }
      throw error;
    }
  }

  function shouldCleanExport(options) {
    if (!options || options.fileType == null) {
      return true;
    }

    const fileType = options.fileType;
    const fileTypes = GC.Spread.Sheets.FileType || {};
    return (
      fileType === fileTypes.excel ||
      fileType === fileTypes.ssjson ||
      /^(excel|xlsx|ssjson)$/i.test(String(fileType))
    );
  }

  spread.toJSON = function (options) {
    return createCleanExportJson(options);
  };
  spread.save = function () {
    return runCleanExport("save", arguments);
  };
  spread.export = function () {
    const options = arguments[2];
    if (!shouldCleanExport(options)) {
      return originalExport.apply(spread, arguments);
    }
    return runCleanExport("export", arguments);
  };
}
