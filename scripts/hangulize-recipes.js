/* one-shot — recipes.json 한글화 + beanName + 일부 긴 이름 테스트
 * 회의 피드백: 커피명 한글 디폴트, 최대 60자, 노트 한글
 */
const fs = require('fs');
const path = require('path');

const MAP = {
  'Ethiopia Yirgacheffe':  { name: '에티오피아 예가체프',
                             beanName: '에티오피아 예가체프 G1 코체레 워시드',
                             notes: '꽃 향과 시트러스 노트. 가벼운 바디감과 산뜻한 산미.' },
  'Colombia Supremo':      { name: '콜롬비아 수프리모',
                             beanName: '콜롬비아 수프리모 우일라 17/18',
                             notes: '고소함과 캐러멜 단맛. 미디엄 바디, 균형감 좋음.' },
  'Guatemala Antigua':     { name: '과테말라 안티구아',
                             beanName: '과테말라 안티구아 SHB 산타카타리나',
                             notes: '초콜릿, 스모키. 풀바디에 낮은 산미.' },
  'Kenya AA Peaberry':     { name: '케냐 AA 피베리',
                             beanName: '케냐 AA 피베리 키리냐가 워시드',
                             notes: '베리, 와인 같은 산미. 복합적이고 생동감 있음.' },
  'Brazil Santos':         { name: '브라질 산토스',
                             beanName: '브라질 산토스 NY2 17/18 펄프드 내추럴',
                             notes: '부드럽고 고소함, 낮은 산미. 달콤한 초콜릿 피니시.' },
  'Panama Geisha':         { name: '파나마 게이샤',
                             beanName: '파나마 보케테 게이샤 워시드 (스페셜티)',
                             notes: '재스민, 베르가못, 열대 과일. 섬세하고 비범한 컵.' },
  // 회의 피드백: 최대 60자 케이스 — marquee/말줄임 동작 확인용
  'Rwanda Nyungwe':        { name: '르완다 뉸궤 내추럴 라마간 마이크로랏 G1 (해발 1850m, 2025-08)',
                             beanName: '르완다 뉸궤 내추럴 라마간 마이크로랏 G1 SHG 해발 1850m 2025-08 로스팅 8월',
                             notes: '사과, 꿀 같은 단맛. 깔끔하고 균형감 있음. 핸드픽 G1 등급의 마이크로랏 한정 입고.' },
  'Costa Rica Tarrazú':    { name: '코스타리카 따라주',
                             beanName: '코스타리카 따라주 라파스 허니',
                             notes: '산뜻한 시트러스, 흑설탕. 깔끔한 컵, 미디엄 바디.' },
  'Indonesia Mandheling':  { name: '인도네시아 만델링 토라자 길링바사',
                             beanName: '인도네시아 술라웨시 토라자 만델링 G1 길링바사 워시드 (싱글 오리진)',
                             notes: '흙내음, 허브, 풀바디. 낮은 산미, 진한 마우스필.' },
  'Yemen Mocha Haraz':     { name: '예멘 모카 하라즈',
                             beanName: '예멘 모카 하라즈 마타리 내추럴',
                             notes: '복합적인 와인, 건과일, 초콜릿. 강렬한 단맛.' }
};

const p = path.join(__dirname, '..', 'mock', 'recipes.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

let changed = 0;
data.forEach(r => {
  const m = MAP[r.name];
  if (!m) {
    console.warn('skip (no mapping):', r.name);
    return;
  }
  r.name = m.name;
  r.beanName = m.beanName;
  r.notes = m.notes;
  changed += 1;
});

fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('✓ updated', changed, '/', data.length, 'recipes');
console.log('  · 한글 이름 + beanName 필드 추가');
console.log('  · 일부 (Rwanda, Indonesia) 긴 이름 (50-60자) → marquee/말줄임 테스트용');
