import * as GC from "@grapecity-software/spread-sheets";

/**
 * 中文拼音自定义比较函数
 *
 * 排序规则：非汉字 < 汉字（按拼音）< "(空白)"
 * @param {*} value1 - 第一个值
 * @param {*} value2 - 第二个值
 * @param {number} sortType - 0=升序，1=降序
 * @returns {number} 比较结果
 */
export function HZPinyin(value1, value2, sortType) {
  function normalize(v) {
    return v == null ? "" : String(v);
  }

  function isBlank(v) {
    v = normalize(v).trim();
    return v === "" || v === "(空白)";
  }

  function hasHanzi(v) {
    return /[㐀-䶿一-鿿豈-﫿]/.test(v);
  }

  function getType(v) {
    if (isBlank(v)) {
      return 2; // '(空白)' 最大
    }
    if (hasHanzi(v)) {
      return 1; // 汉字
    }
    return 0; // 非汉字
  }

  const v1 = normalize(value1);
  const v2 = normalize(value2);

  const t1 = getType(v1);
  const t2 = getType(v2);

  let result = 0;

  // 先按大类排：非汉字 < 汉字 < '(空白)'
  if (t1 !== t2) {
    result = t1 < t2 ? -1 : 1;
  } else {
    // 同类比较
    if (t1 === 0) {
      // 非汉字：按英文排序
      result = v1.localeCompare(v2, "en", { sensitivity: "base" });
    } else if (t1 === 1) {
      // 汉字：按拼音排序
      result = v1.localeCompare(v2, "zh-CN-u-co-pinyin", {
        sensitivity: "base",
      });
    } else {
      // 都是空白
      result = 0;
    }

    if (result < 0) {
      result = -1;
    } else if (result > 0) {
      result = 1;
    }
  }

  // sortType=0 升序，sortType=1 降序
  return sortType === 1 ? -result : result;
}

/**
 * 安装三处自定义排序：筛选器排序、透视表排序、工具栏排序按钮
 * @param {GC.Spread.Sheets.Workbook} spread - 工作簿对象
 */
export function installSortHandlers(spread) {
  installFilterSortHandler(spread);
  installPivotSortHandler(spread);
  installRibbonSortHandler(spread);
}

/**
 * 筛选器（RangeSorting 事件）：用户点击筛选菜单中的“排序”时，
 * 注入拼音比较函数，使列排序支持中文拼音规则。
 */
function installFilterSortHandler(spread) {
  spread.bind(GC.Spread.Sheets.Events.RangeSorting, function (E, args) {
    console.log("RangeSorting, args: ", args);
    var sortType = args.ascending;
    args.compareFunction = function (value1, value2) {
      return HZPinyin(value1, value2, sortType);
    };
  });
}

/**
 * 透视表（PivotTableChanged 事件）：当文本字段（dataType=1）被设置排序时，
 * 改为使用拼音自定义排序回调。
 */
function installPivotSortHandler(spread) {
  spread.bind(GC.Spread.Sheets.Events.PivotTableChanged, function (e, args) {
    console.log("PivotTableChanged, args: ", args);
    let pt = spread.getActiveSheet().pivotTables.get(args.pivotTableName);
    if (
      pt &&
      args.type === "sort" &&
      args.fieldName &&
      pt.getField(args.fieldName)?.dataType === 1 &&
      (!args.sortInfo || !args.sortInfo.sortValueFieldName)
    ) {
      pt.sort(args.fieldName, {
        sortType: GC.Spread.Pivot.SortType.custom,
        customSortCallback: function (fieldItemNameArray) {
          return fieldItemNameArray.sort((value1, value2) => {
            return HZPinyin(value1, value2, args.sortType);
          });
        },
      });
    }
  });
}

/**
 * 工具栏排序按钮（Designer.sortRange 命令）：拦截设计器排序命令，
 * 用拼音比较函数重新排序，替代默认的字符串排序。
 */
function installRibbonSortHandler(spread) {
  spread.commandManager().addListener("-", function (arg) {
    console.log("arg: ", arg);
    if (arg.command && arg.command.cmd === "Designer.sortRange") {
      var sheet = spread.getActiveSheet();
      var { row, col, rowCount, colCount } = arg.command.selections[0];
      sheet.sortRange(row, col, rowCount, colCount, true, [
        {
          index: col,
          ascending: arg.command.ascending,
          compareFunction: function (value1, value2) {
            return HZPinyin(value1, value2, arg.command.ascending);
          },
        },
      ]);
    }
  });
}
