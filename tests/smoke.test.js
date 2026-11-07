import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './helpers/boot.js';

test('start: bez dzieci pokazuje ekran wyboru dziecka', () => {
  const t = boot();
  assert.deepEqual(t.visible(), ['who']);
  t.assertClean(assert);
  t.close();
});

test('po dodaniu dziecka widać menu i każdą grę da się otworzyć', () => {
  const t = boot();
  t.addChild('Ola');
  assert.deepEqual(t.visible(), ['menu']);
  for (const [btn, section] of [['#goFall', 'fall'], ['#goSyl', 'fall'], ['#goFrog', 'frog'], ['#goAbc', 'abc'],
    ['#goBuild', 'build'], ['#goBlocks', 'blocks'], ['#goLogo', 'logo'], ['#goStats', 'stats']]) {
    t.click(btn);
    assert.deepEqual(t.visible(), [section], btn);
    t.back();
    assert.deepEqual(t.visible(), ['menu'], 'powrót po ' + btn);
  }
  t.assertClean(assert);
  t.close();
});
