import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();


const originalTree = [
    {
        name: "a1",
        children: [
            {
                name: "a1-1",
                children: [
                    {
                        name: "a1-1-1",
                    },
                ],
            },
            {
                name: "a1-2",
                children: [
                    {
                        name: "a1-2-1",
                    },
                ],
            },
        ],
    },
];

function flattenTree(tree, level = 0) {
    const result = [];

    tree.forEach((node) => {
        result.push({ name: node.name, level: level.toString() });
        if (node.children) {
            result.push(...flattenTree(node.children, level + 1));
        }
    });

    return result;
}

const flattenedTree = flattenTree(originalTree);
console.log(flattenedTree);

let i = 0;
for (const item of flattenedTree) {
    sheet.setValue(i, 0, item.name);
    sheet.getCell(i, 0).textIndent(item.level);
    i++;
}

sheet.outlineColumn.options({
    columnIndex: 0,
    maxLevel: 10,
});
sheet.showRowOutline(false);
sheet.outlineColumn.refresh();