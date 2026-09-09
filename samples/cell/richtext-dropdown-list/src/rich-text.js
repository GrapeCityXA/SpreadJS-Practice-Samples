import {
  DEFAULT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_SUPSUB_FONT_SIZE,
  VERTICAL_ALIGN_MAP
} from "./state";

// ---------------------------------------------------------------------------
// 富文本 HTML ↔ 片段模型 的转换工具。
// 下拉弹层、配置弹框、表格单元格写入都基于统一的“片段模型”（text + 粗体 +
// 上下标 + 颜色）来转换，保证各处展示一致。这里只做纯 HTML 字符串与 DOM 解析，
// 不依赖任何页面 UI 元素。
// ---------------------------------------------------------------------------

// 转义超文本特殊字符，避免把用户输入当作标签执行。
export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// 将中间富文本片段模型还原成可显示的超文本内容。
export function optionSegmentsToHtml(segments) {
  return segments
    .map(function (segment) {
      const style =
        "color:" + escapeHtml(segment.color || DEFAULT_COLOR) + ";" +
        "font-weight:" + (segment.bold ? "700" : "400") + ";";
      const content = '<span style="' + style + '">' + escapeHtml(segment.text || "") + "</span>";
      if (segment.vertical === "sup") {
        return "<sup>" + content + "</sup>";
      }
      if (segment.vertical === "sub") {
        return "<sub>" + content + "</sub>";
      }
      return content;
    })
    .join("");
}

// 将富文本编辑区产生的内容转成统一的富文本片段模型。
export function editorHtmlToSegments(html) {
  const container = document.createElement("div");
  container.innerHTML = html || "";
  const segments = [];
  walkEditorNode(container, {
    bold: false,
    vertical: "normal",
    color: DEFAULT_COLOR
  }, segments);

  const merged = [];
  segments.forEach(function (segment) {
    if (!segment.text) {
      return;
    }
    const last = merged[merged.length - 1];
    if (last && last.bold === segment.bold && last.vertical === segment.vertical && last.color === segment.color) {
      last.text += segment.text;
    } else {
      merged.push({
        text: segment.text,
        vertical: segment.vertical,
        bold: segment.bold,
        color: segment.color
      });
    }
  });

  if (!merged.length) {
    merged.push({
      text: "文本",
      vertical: "normal",
      bold: false,
      color: DEFAULT_COLOR
    });
  }

  return merged.map(function (segment) {
    return {
      text: segment.text,
      vertical: segment.vertical,
      bold: segment.bold,
      color: segment.color,
      fontSize: segment.vertical === "normal" ? DEFAULT_FONT_SIZE : DEFAULT_SUPSUB_FONT_SIZE
    };
  });
}

// 递归读取编辑器节点，并继承粗体、上下标、颜色等样式。
function walkEditorNode(node, inheritedStyle, segments) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue) {
      segments.push({
        text: node.nodeValue.replace(/\u00a0/g, " "),
        vertical: inheritedStyle.vertical,
        bold: inheritedStyle.bold,
        color: inheritedStyle.color
      });
    }
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  const tag = node.tagName.toLowerCase();
  if (tag === "br") {
    return;
  }

  const nextStyle = {
    bold: inheritedStyle.bold,
    vertical: inheritedStyle.vertical,
    color: inheritedStyle.color
  };

  if (tag === "b" || tag === "strong") {
    nextStyle.bold = true;
  }
  if (tag === "sup") {
    nextStyle.vertical = "sup";
  }
  if (tag === "sub") {
    nextStyle.vertical = "sub";
  }
  if (node.style && node.style.color) {
    nextStyle.color = node.style.color;
  }
  if (node.style && node.style.verticalAlign) {
    const verticalAlign = String(node.style.verticalAlign).toLowerCase();
    if (verticalAlign === "super") {
      nextStyle.vertical = "sup";
    }
    if (verticalAlign === "sub") {
      nextStyle.vertical = "sub";
    }
  }
  if (node.style && node.style.fontWeight) {
    const weight = parseInt(node.style.fontWeight, 10);
    if ((!Number.isNaN(weight) && weight >= 600) || String(node.style.fontWeight).toLowerCase() === "bold") {
      nextStyle.bold = true;
    }
  }

  Array.from(node.childNodes).forEach(function (child) {
    walkEditorNode(child, nextStyle, segments);
  });
}

// 规范编辑器内容，确保下拉弹层和表格单元格展示一致。
export function normalizeOptionConfigHtml(html) {
  const safeHtml = html || '<span style="color:' + DEFAULT_COLOR + '">文本</span>';
  return optionSegmentsToHtml(editorHtmlToSegments(safeHtml));
}

// 渲染单个选项的富文本内容，用于配置列表、预览和下拉弹层。
export function renderOptionConfigHtml(optionConfig) {
  return normalizeOptionConfigHtml(optionConfig && optionConfig.html ? optionConfig.html : "");
}

// 将弹框里的选项配置转换为下拉和单元格写入所需的数据结构。
export function optionConfigToOption(optionConfig) {
  return {
    id: optionConfig.id,
    segments: editorHtmlToSegments(optionConfig.html)
  };
}

// 将中间片段模型转换成表格单元格需要的富文本值。
export function createRichTextValue(option) {
  return {
    richText: option.segments
      .filter(function (segment) {
        return segment.text !== "";
      })
      .map(function (segment) {
        return {
          text: segment.text,
          style: {
            font: (segment.bold ? "bold " : "normal ") + segment.fontSize + "px Cambria Math",
            foreColor: segment.color,
            vertAlign: VERTICAL_ALIGN_MAP[segment.vertical]
          }
        };
      })
  };
}

// 深拷贝选项配置，并规范富文本内容。
export function cloneOptionConfigs(options) {
  return options.map(function (option) {
    return {
      id: option.id,
      html: normalizeOptionConfigHtml(option.html)
    };
  });
}

// 创建默认富文本选项配置。
export function createDefaultOptionConfigs() {
  return [
    {
      id: "gravity",
      html:
        '<span style="color:#22303c">F = (G * M</span><sub><span style="color:#22303c">1</span></sub><span style="color:#22303c"> * M</span><sub><span style="color:#22303c">2</span></sub><span style="color:#22303c">) / R</span><sup><span style="color:#22303c">2</span></sup>'
    },
    {
      id: "chemistry",
      html:
        '<strong><span style="color:#1d6c74">H</span></strong><sub><strong><span style="color:#1d6c74">2</span></strong></sub><strong><span style="color:#1d6c74">SO</span></strong><sub><strong><span style="color:#1d6c74">4</span></strong></sub>'
    },
    {
      id: "energy",
      html:
        '<strong><span style="color:#9a3412">E = mc</span></strong><sup><strong><span style="color:#9a3412">2</span></strong></sup>'
    }
  ];
}
