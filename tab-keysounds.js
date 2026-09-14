// 10 sons via Web Audio API
const keySoundsData = [
  { id: 'ks-click', name: 'Click Magnético', xpCost: 0 },
  { id: 'ks-soft', name: 'Toque Veludo', xpCost: 50 },
  // ... 8 mais
  { id: 'ks-zen', name: 'Sino Zen', xpCost: 1000 }
];

const ksSoundGenerators = {
  'ks-click': function(ctx) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(1400, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.start(); o.stop(ctx.currentTime + 0.07);
  }
  // ... 9 mais
};