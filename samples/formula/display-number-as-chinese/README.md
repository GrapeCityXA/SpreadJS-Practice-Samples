## 一、Demo 概述

本示例演示了如何在 SpreadJS 中通过自定义函数将阿拉伯数字转换为中文数字格式。通过注册名为 `NUMBERSTRING` 的自定义函数,支持三种转换模式:中文小写数字、中文大写数字和逐位转换。该功能常用于财务报表、合同文档等需要规范化数字显示的场景。

示例实现了完整的数字转中文转换算法,支持 1-16 位整数及小数的转换,并提供了灵活的模式选择机制,开发者可以根据实际业务需求选择合适的转换方式。

## 二、解决的问题

在实际业务场景中,经常需要将数字转换为中文表述:

* **财务单据规范化**:发票、收据等财务凭证要求金额必须使用中文大写数字,防止篡改
* **合同文档生成**:合同中的金额、数量等关键数据需要同时显示阿拉伯数字和中文大写
* **报表展示优化**:在某些报表中,使用中文数字可以提升可读性和专业性
* **数据校验提示**:在数据录入界面提供实时的中文数字预览,帮助用户确认输入正确性

## 三、实现思路

### 3.1 核心技术点

#### 3.1.1 自定义函数注册

SpreadJS 提供了 `defineGlobalCustomFunction` 方法用于注册全局自定义函数。需要继承 `GC.Spread.CalcEngine.Functions.Function` 基类并实现 `evaluate` 方法:

```javascript
function NumberStringFunction() {
    this.name = "NUMBERSTRING";
    this.maxArgs = 2;
    this.minArgs = 2;
}
NumberStringFunction.prototype = new GC.Spread.CalcEngine.Functions.Function();

NumberStringFunction.prototype.evaluate = function (num, type) {
    switch (type) {
        case 1:
            return number2chinesenumber(num)
        case 2:
            return number2chinesenumber(num, "max")
        case 3:
            return toZh(num);
    }
    return "Err";
};

GC.Spread.CalcEngine.Functions.defineGlobalCustomFunction("NUMBERSTRING", new NumberStringFunction());
```

关键参数说明:

* `this.name`: 函数名称,即在表格中使用的函数标识符
* `this.maxArgs` 和 `this.minArgs`: 限定函数接受的参数数量
* `evaluate`: 函数执行逻辑,接收的参数对应公式中的参数

#### 3.1.2 中文数字转换算法

核心转换逻辑封装在 `number2chinesenumber.js` 模块中,采用分段处理策略:

```javascript
const ltTenThousand = (digit, mode = 'default') => {
  const chineseDigitTable =
    mode === 'max' || mode === 'maxAmount' ? maxChineseDigits : chineseDigits;

  const ploy = {
    ltHundred(digital) {
      const multiple = (digital / 10) | 0;
      const chineseDigit = chineseDigitTable[multiple] + chineseDigitTable[10];
      const remainder = digital % 10;
      if (remainder === 0) {
        return chineseDigit;
      }
      return chineseDigit + chineseDigitTable[remainder];
    },
    ltThousand(digital) {
      let chineseDigit =
        chineseDigitTable[(digital / 100) | 0] + chineseDigitTable[11];
      const remainder = digital % 100;
      if (remainder === 0) {
        return chineseDigit;
      }
      if (remainder < 10) {
        return (
          chineseDigit + chineseDigitTable[0] + chineseDigitTable[remainder]
        );
      }
      return chineseDigit + ploy.ltHundred(remainder);
    }
  };

  if (digit < 100) {
    return ploy.ltHundred(digit);
  }
  if (digit < 1000) {
    return ploy.ltThousand(digit);
  }
  return ploy.ltTenThousand(digit);
};
```

算法特点:

* 按照百、千、万为单位递归处理
* 自动处理"零"的插入规则(如 101 转换为"一百零一")
* 支持小写和大写两种字符集切换

#### 3.1.3 三种转换模式实现

示例提供了三种不同的转换模式:

```javascript
// 模式 1: 中文小写数字(一十二亿三千四百五十六万七千八百九十)
number2chinesenumber(1234567890)

// 模式 2: 中文大写数字(壹拾贰亿叁仟肆佰伍拾陆万柒仟捌佰玖拾)
number2chinesenumber(1234567890, "max")

// 模式 3: 逐位转换(一二三四五六七八九〇)
function toZh(digit) {
    digit = typeof digit === 'number' ? String(digit) : digit;
    let zh = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let result = '';
    for (let i = 0; i < digit.length; i++) {
        result += (digit[i] === "." ? "点": zh[digit[i]]);
    }
    return result;
}
```

#### 3.1.4 公式应用与列宽设置

在工作表中使用自定义函数:

```javascript
const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setFormula(2, 1, '=NUMBERSTRING(1234567890,1)');
sheet.setFormula(3, 1, '=NUMBERSTRING(1234567890,2)');
sheet.setFormula(4, 1, '=NUMBERSTRING(1234567890,3)');

sheet.setColumnWidth(1, 300);  // 设置列宽以完整显示中文数字
```

### 3.2 技术栈

* **SpreadJS**: 17.0.8 - 核心表格组件
* **SystemJS**: 0.19.22 - 模块加载器
* **systemjs-plugin-babel**: 0.0.25 - ES6 模块转换支持

## 四、使用说明

### 4.1 运行方式

```bash
# 安装依赖
npm install

# 直接在浏览器中打开 index.html 即可运行
```

### 4.2 操作步骤

1. 打开 `index.html` 文件,页面将自动初始化 SpreadJS 工作簿
2. 查看 B3 单元格:显示 `1234567890` 的中文小写转换结果
3. 查看 B4 单元格:显示 `1234567890` 的中文大写转换结果
4. 查看 B5 单元格:显示 `1234567890` 的逐位转换结果
5. 可在其他单元格中输入 `=NUMBERSTRING(数字, 模式)` 测试不同数值

## 五、功能特点

### 5.1 优点

* **算法完整性**:支持 1-16 位整数及三位小数的转换,覆盖常见业务场景
* **模式灵活性**:提供三种转换模式,满足不同的展示需求
* **规则准确性**:严格遵循中文数字的表述规则,自动处理"零"的插入逻辑
* **易于集成**:封装为 SpreadJS 自定义函数,可在公式中灵活调用

### 5.2 局限性与扩展建议

* **金额模式缺失**:当前未实现带"元角分"的金额转换模式,可参考 `number2chinesenumber.js` 中的 `amount` 和 `maxAmount` 模式进行扩展
* **负数处理有限**:虽然转换算法支持负数,但示例中未展示,建议添加负数转换的测试用例
* **小数位数限制**:仅支持三位小数,超出部分会被截断,可根据需求调整 `threeDecimal` 的截取逻辑

## 六、关键代码片段

### 整数部分分组转换

```javascript
const ploy = {
  convertInteger() {
    let digitString = digital.toString();
    const digitLen = digitString.length;

    // 按 4 位分组填充
    if (digitLen <= 4) {
      digitString = digitString.padStart(4, '0');
    } else if (digitLen <= 8) {
      digitString = digitString.padStart(8, '0');
    } else if (digitLen <= 12) {
      digitString = digitString.padStart(12, '0');
    } else {
      digitString = digitString.padStart(16, '0');
    }

    // 每 4 位一组反向处理
    const digits = digitString
      .split(/([0-9]{4})/)
      .filter((item) => item !== '')
      .reverse();

    let chineseText = '';
    digits.forEach((item, index, arr) => {
      const num = Number(item);
      const text = ltTenThousand(num, mode);

      // 添加"万"、"亿"、"万亿"单位
      if (!num && !preNum) {
        return;
      }

      if (index === 1) {
        chineseText = chineseDigitTable[13] + chineseText; // 万
      } else if (index === 2) {
        chineseText = chineseDigitTable[14] + chineseText; // 亿
      } else if (index === 3) {
        chineseText = chineseDigitTable[15] + chineseText; // 万亿
      }

      chineseText = text + chineseText;
    });

    return chineseText;
  }
};
```

此代码实现了中文数字的分组转换逻辑,将数字按"万"、"亿"、"万亿"分组,再逐组转换并拼接,是整个转换算法的核心。

## 七、总结

本示例展示了如何在 SpreadJS 中通过自定义函数实现复杂的数字格式转换。开发者可以学习到:

* SpreadJS 自定义函数的注册机制和参数处理方式
* 中文数字转换的完整算法实现思路
* 模块化代码组织和第三方库的集成方法
* 公式函数在实际业务场景中的应用技巧

该方案具有良好的扩展性,可在此基础上添加更多转换模式(如金额模式、罗马数字等),也可以封装为独立的 SpreadJS 插件供多个项目复用。对于需要在电子表格中进行数字格式化展示的场景,这是一个实用且高效的解决方案。

For more information about SpreadJS, please visit:
SpreadJS Official Website: https://www.grapecity.com.cn/developer/spreadjs
SpreadJS API Document: https://demo.grapecity.com.cn/spreadjs/help/api/classes/GC.Spread.Sheets.Worksheet
SpreadJS Product Document: https://demo.grapecity.com.cn/spreadjs/help/docs/started-guide
SpreadJS Tutorial Samples: https://demo.grapecity.com.cn/spreadjs/SpreadJSTutorial/#/samples
