let Calculator = (function () {
    let result = 0, expression = '', prevOperation = '', displayExpression = '';
    const display = document.getElementById('num_result');

    const init = function () {
        bindEvent();
        showDisplay('0');
    };

    const bindEvent = function () {
        let btn = document.getElementsByClassName('btn_calc');
        for (let i = 0; i < btn.length; i++) {
            btn[i].addEventListener("click", function (e) {
                let _this = e.target;
                let val = _this.value;
                let text = _this.innerText;

                if (!isValid(val)) {
                    return;
                }

                switch (val) {
                    case 'C':
                        clear();
                        break;
                    case '=':
                        equal();
                        break;
                    case 'sign':
                        sign();
                        break;
                    default :
                        prevOperation = CalculatorUtil.isOperator(val) ? val : prevOperation + val;
                        displayExpression += text;
                        expression += val;
                        showDisplay();
                }

            });
        }
    };

    let clear = function () {
        expression = '';
        displayExpression = '';
        result = '';
        showDisplay('0');
    };

    let showDisplay = function (s) {
        if (s) {
            display.innerHTML = CalculatorUtil.numFormat(s);
        } else {
            display.innerHTML = displayExpression.toString();
        }
    };

    let equal = function () {
        if (result) {
            expression = result + prevOperation;
        }

        let postfix_exp = getPostfix(expression);
        let oprd_stack = [];

        let symbolToOperator = function (symbol) {
            switch (symbol) {
                case '+':
                    return plus;
                case '-':
                    return minus;
                case '*':
                    return multiply;
                case '/':
                    return divide;
            }
        };

        postfix_exp.map(function (v) {
            if (!isNaN(v)) {
                oprd_stack.push(Number(v));
            } else {
                let oprd2 = oprd_stack.pop();

                if (oprd_stack.length === 0 && v === '-') {
                    oprd_stack.push(oprd2 * -1);

                } else {
                    let oprd1 = oprd_stack.pop()

                    oprd_stack.push(compute(oprd1, symbolToOperator(v), oprd2));
                }

            }
        });

        result = parseFloat(CalculatorUtil.floor(oprd_stack.pop())).toString();
        displayExpression = result;
        expression = result;
        showDisplay(result);
    };

    let sign = function () {
        let pattern = /^-\(.*\)$/g;
        let exp = expression;
        let displayExp = displayExpression;

        if (exp.search(pattern) !== -1) {
            exp = exp.substring(2, exp.length - 1);
            displayExp = displayExp.substring(2, displayExp.length - 1);
        } else {
            exp = `-(${exp})`;
            displayExp = `-(${displayExp})`;
        }

        expression = exp;
        displayExpression = displayExp;
        showDisplay();
    };

    let getPostfix = function (expression) {
        let postfix = [];
        let infix = [];
        let isPrevNum = false;

        let precedence = function (operator) {
            switch (operator) {
                case "*":
                case "/":
                    return 9;
                case "+":
                case "-":
                    return 7;
                case "(":
                    return 5
                default:
                    return -1;
            }
        }

        for (let i = 0; i < expression.length; i++) {
            let c = expression.charAt(i);
            if (!isNaN(parseInt(c)) || c === '.') {
                if (isPrevNum) {
                    postfix.push(postfix.pop() + c);
                } else {
                    postfix.push(c);
                }

                isPrevNum = true;
            } else if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
                while (c !== "^" && infix.length && (precedence(c) <= precedence(infix[infix.length - 1]))) {
                    postfix.push(infix.pop());
                }
                infix.push(c);
                isPrevNum = false;
            }
        }
        while (infix.length) {
            postfix.push(infix.pop());
        }

        return postfix;
    };

    let plus = function (a, b) {
        return a + b;
    };

    let minus = function (a, b) {
        return (a - b);
    };

    let multiply = function (a, b) {
        return a * b;
    };

    let divide = function (a, b) {
        return a / b;
    };

    let compute = function (a, operator, b) {
        return operator(a, b);
    };

    let isValid = function (v) {
        let displayExp = displayExpression;
        let exp = expression;
        let last = exp.slice(-1);
        let pattern = /\+|\-|\*|\//g;

        if (!exp.length) {
            if (v === '.') {
                displayExpression = '0';
                return true;
            } else if (isNaN(v) || v === '0') {
                return false;
            }
        } else if (CalculatorUtil.isOperator(v) && CalculatorUtil.isOperator(last)) {
            if (last === v) {
                return false;
            } else {
                displayExpression = displayExp.substring(0, displayExp.length - 1);
                expression = exp.substring(0, exp.length - 1);
            }

        } else if (v === '.') {
            if (prevOperation.indexOf('.') !== -1) {
                return false;
            }
        } else if (v === '=') {
            if (CalculatorUtil.isOperator(last)) {
                return false;
            }

            if (result.length) {
                return true;
            }

            if (exp.search(pattern) === -1) {
                return false;
            }

        } else if (v === 'sign') {
            if (CalculatorUtil.isOperator(last)) {
                return false;
            }

            if (result.length) {
                result = '';
                prevOperation = '';
            }
        } else {
            if (result.length) {
                if (CalculatorUtil.isOperator(v)) {
                    result = '';
                } else {
                    clear();
                    if (v === '0') {
                        return false;
                    }
                }
            } else {
                if (!isNaN(v) && last === ')') {
                    expression += '*';
                }
            }
        }
        return true;
    };

    return {
        callInit: function () {
            "use strict";
            init();
            console.log('init');
        }
    }
})();


let CalculatorUtil = {
    isOperator: function (op) {
        switch (op) {
            case '+':
            case '-':
            case '*':
            case '/':
                return true;
            default:
                return false;
        }
    },
    numFormat: function (n) {
        let parts = n.toString().split(".");
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
    },
    floor: function (num) {
        return num.toString().match(/^.*\.\d{5}/) || num;
    }
};

window.addEventListener('DOMContentLoaded', function () {
    Calculator.callInit();
});