const calc = document.querySelector('#calc');
const num1 = document.querySelector('#firstnumber');
const num2 = document.querySelector('#secondnumber');
var num1Check;
var num2Check;

num1.onblur = function () {
    if (Number.isNaN(parseFloat(num1.value)) && !num1.validity.valueMissing) {
        warning.innerHTML = 'Giá trị nhập ở ô <em>Số thứ nhất</em> không phải là số thực.';
        num1Check = false;
    } else
        num1Check = true;
}

num2.onblur = function () {
    if (Number.isNaN(parseFloat(num2.value)) && !num2.validity.valueMissing) {
        warning.innerHTML = 'Giá trị nhập ở ô <em>Số thứ hai</em> không phải là số thực.';
        num2Check = false;
    } else
        num2Check = true;
}
calc.onclick = function () {
    let expressions = document.getElementsByName('expression');
    let selectedExpression;
    let res = document.querySelector('#result');

    for (const selected of expressions) {
        if (selected.checked) {
            selectedExpression = selected.value;
            break;
        }
    }
    let exprCheck = true;
    let numCheck = true;
    if (selectedExpression === undefined) {
        warning.innerText = 'Bạn chưa chọn phép tính.';
        exprCheck = false;
    }

    if (num2.validity.valueMissing) {
        warning.innerHTML = 'Bạn chưa nhập số ở ô <em>Số thứ hai</em>.';
        numCheck = false;
    }

    if (num1.validity.valueMissing) {
        warning.innerHTML = 'Bạn chưa nhập số ở ô <em>Số thứ nhất</em>.';
        numCheck = false;
    }

    if (exprCheck && numCheck && num1Check && num2Check) {
        warning.innerHTML = '';
        switch (selectedExpression) {
            case 'plus':
                res.value = parseFloat(num1.value) + parseFloat(num2.value);
                break;
            case 'minus':
                res.value = parseFloat(num1.value) - parseFloat(num2.value);
                break;
            case 'multiply':
                res.value = parseFloat(num1.value) * parseFloat(num2.value);
                break;
            case 'divide':
                res.value = parseFloat((parseFloat(num1.value) / parseFloat(num2.value)).toFixed(4));
                break;
        }
    } else res.value = '';
}