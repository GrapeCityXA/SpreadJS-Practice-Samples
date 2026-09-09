import * as GC from "@grapecity-software/spread-sheets";
let SpreadTypes = GC.Spread.Sheets.Shapes.AutoShapeType
let normal = SpreadTypes.flowchartProcess
let judge = SpreadTypes.flowchartDecision


let shapeInfo = {
    elements: [
        {
            id: 1,
            text: "申请退换货",
            type: normal,
            process: 2
        },
        {
            id: 2,
            text: "是否申请成功",
            type: judge,
            width: 150,
            height: 120,
            process: 2
        },
        {
            id: 3,
            text: "申请成功",
            type: normal,
            process: 2
        },
        {
            id: 4,
            text: "上门换新",
            type: normal,
            process: 2
        },
        {
            id: 5,
            text: "上门取件",
            type: normal,
            process: 2
        },
        {
            id: 6,
            text: "客服发货",
            type: normal,
            process: 2
        },
        {
            id: 7,
            text: "客户送货",
            type: normal,
            process: 2
        },
        {
            id: 8,
            text: "登记",
            type: normal,
            process: 2
        },
        {
            id: 9,
            text: "是否符合三包法",
            type: judge,
            width: 150,
            process: 2,
            height: 120
        },
        {
            id: 10,
            text: "符合三包法",
            type: normal,
            process: 2
        },
        {
            id: 11,
            text: "不符合三包法",
            type: normal,
        },
        {
            id: 12,
            text: "返修",
            type: normal,
        },
        {
            id: 13,
            text: "换货",
            type: normal,
            process: 1
        },
        {
            id: 14,
            text: "退货",
            type: normal,
        },
        {
            id: 15,
            text: "原物返回",
            type: normal,
        },
        {
            id: 16,
            text: "申请失败",
            type: normal,
        },
        {
            id: 17,
            text: "受理终止",
            type: normal,
        },
    ],
    edge: [
        {
            source: 1,
            target: 2
        },
        {
            source: 2,
            target: 3,
            flag: 1
        },
        {
            source: 2,
            target: 16,
            flag: 0
        },
        {
            source: 3,
            target: 4
        },
        {
            source: 3,
            target: 5
        },
        {
            source: 3,
            target: 6
        },
        {
            source: 3,
            target: 7
        },
        {
            source: 5,
            target: 8
        },
        {
            source: 6,
            target: 8
        },
        {
            source: 7,
            target: 8
        },
        {
            source: 8,
            target: 9
        },
        {
            source: 9,
            target: 10,
            flag: 1
        },
        {
            source: 9,
            target: 11,
            flag: 0
        },
        {
            source: 10,
            target: 12,
        },
        {
            source: 10,
            target: 13
        },
        {
            source: 10,
            target: 14
        },
        {
            source: 11,
            target: 15
        },
        {
            source: 16,
            target: 17
        }
    ]
}

export default {
    shapeInfo
}