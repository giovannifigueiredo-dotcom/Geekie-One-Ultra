// Calculadora com histórico
let calcState = { expr: '', val: '0', hasResult: false };

function calcCompute() {
  let e = calcState.expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/√/g,'Math.sqrt');
  e = e.replace(/(\d+(?:\.\d+)?)x²/g, 'Math.pow($1,2)');
  let result = Function('return (' + e + ')')();
  calcState.val = String(Math.round(result * 1e10) / 1e10);
  calcState.hasResult = true;
}

function calcAction(action) {
  if (action === 'clear') { calcState = {expr:'',val:'0',hasResult:false}; }
  else if (action === '=') calcCompute();
  else calcState.expr += action;
  calcRender();
}