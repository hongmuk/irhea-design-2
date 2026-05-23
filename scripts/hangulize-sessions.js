/* brew-sessions.json — recipeName 한글로 (recipes.json 과 동기화) */
const fs = require('fs');
const path = require('path');

const MAP = {
  'Ethiopia Yirgacheffe':  '에티오피아 예가체프',
  'Colombia Supremo':      '콜롬비아 수프리모',
  'Guatemala Antigua':     '과테말라 안티구아',
  'Kenya AA Peaberry':     '케냐 AA 피베리',
  'Brazil Santos':         '브라질 산토스',
  'Panama Geisha':         '파나마 게이샤',
  'Rwanda Nyungwe':        '르완다 뉸궤 내추럴 라마간 마이크로랏 G1 (해발 1850m, 2025-08)',
  'Costa Rica Tarrazú':    '코스타리카 따라주',
  'Indonesia Mandheling':  '인도네시아 만델링 토라자 길링바사',
  'Yemen Mocha Haraz':     '예멘 모카 하라즈'
};

const p = path.join(__dirname, '..', 'mock', 'brew-sessions.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

let changed = 0;
data.forEach(s => {
  if (MAP[s.recipeName]) {
    s.recipeName = MAP[s.recipeName];
    changed += 1;
  }
});

fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('✓ updated', changed, '/', data.length, 'brew-sessions');
