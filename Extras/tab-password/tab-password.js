// Gerador com crypto.getRandomValues
function generatePassword() {
  var length = parseInt(document.getElementById('pwdLength').value);
  var charSets = '';
  if (upper) charSets += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) charSets += 'abcdefghijklmnopqrstuvwxyz';
  if (numbers) charSets += '0123456789';
  if (symbols) charSets += '!@#$%&*()_+-=[]{}|;:,.<>?';
  
  var arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  var pwd = '';
  for (var i = 0; i < length; i++) pwd += charSets[arr[i] % charSets.length];
  
  var entropy = length * Math.log2(pool);
  // strength: Fraca < 40 bits, Muito Forte > 80 bits
}