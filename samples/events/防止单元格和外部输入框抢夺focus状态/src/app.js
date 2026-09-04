import * as GC from "@grapecity-software/spread-sheets";

const spread = new GC.Spread.Sheets.Workbook(document.getElementById("ss"));
const sheet = spread.getActiveSheet();

sheet.setValue(1, 1, "点击这里")

const modalMask = document.querySelector('.modal-mask');
const modalContainer = document.querySelector('.modal-container');

const ageIpt = document.getElementById("ageipt")
const genderIpt = document.getElementById("gendeript")
const nameIpt = document.getElementById("nameipt")
// 打开弹窗
function openModal() {
    modalMask.classList.add('active');
    modalContainer.classList.add('active');
    // setTimeout(function () {
    //     nameIpt.focus()
    // }, 200)
    nameIpt.focus()
}

// 关闭弹窗
function closeModal() {
    modalMask.classList.remove('active');
    modalContainer.classList.remove('active');
}

modalMask.addEventListener('click', closeModal);

document.querySelector('.btn-cancel').addEventListener('click', closeModal);

document.getElementById('infoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let str = `我是${nameIpt.value}，性别为${genderIpt.value}, 今年${ageIpt.value}岁`
    let row = sheet.getActiveRowIndex()
    let col = sheet.getActiveColumnIndex()
    sheet.setValue(row, col, str)
    closeModal();
});

// 输入框交互效果
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('mouseenter', () => {
        input.style.boxShadow = '0 2px 8px rgba(64,158,255,0.1)';
    });
    input.addEventListener('mouseleave', () => {
        input.style.boxShadow = 'none';
    });
});


spread.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    if (info.row == 1 && info.col == 1) {
        spread.focus(false)
        setTimeout(()=>openModal(),500);
        // openModal()
    }
})

