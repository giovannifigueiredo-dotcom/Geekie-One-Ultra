// Personalização de título + ícone + fonte
const availableFonts = [
  {family:'Poppins',label:'Poppins'}, {family:'Orbitron',label:'Orbitron'},
  {family:'Space Grotesk',label:'Space Grotesk'}, {family:'Fira Code',label:'Fira Code'}
];
const availableIcons = ['fa-graduation-cap','fa-book-open','fa-brain','fa-fire','fa-star'];

function applyPageTitle() {
  savedTitle = document.getElementById('pageTitleInput').value.trim();
  document.title = savedTitle;
  localStorage.setItem('geekiePageTitle', savedTitle);
  localStorage.setItem('geekieTitleFont', selectedFont);
  localStorage.setItem('geekieTitleIcon', selectedIcon);
}