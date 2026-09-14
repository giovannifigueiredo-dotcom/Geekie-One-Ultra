// 16 grupos de caracteres especiais
const charsData = [
  { group: 'Matemática', icon: 'fa-calculator', categories: [
    { name: 'Operadores Básicos', chars: ['±','×','÷','≈','≠','≤','≥','∞','√'] },
    { name: 'Álgebra & Lógica', chars: ['∀','∃','∈','∉','⊂','⊃','∪','∩','∫','∑'] },
    // ... 4 mais
  ]},
  { group: 'Letras & Alfabetos', categories: [/* grego, circular */] },
  // ... 14 mais grupos
];

function copyCharEnhanced(char) {
  navigator.clipboard.writeText(char).then(() => {
    showToast('✅ "' + char + '" copiado!');
    addToHistory(char);
  });
}