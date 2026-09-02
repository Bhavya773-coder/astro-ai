const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('Vastu consultant uses skill prompt, supports history, and deducts only after Gemini succeeds', () => {
  const skill = read('skills/vastu-consultant/SKILL.md');
  const controller = read('controllers/vastuConsultant.controller.js');
  const history = read('controllers/readingHistory.controller.js');
  const model = read('models/ImageReading.js');
  const vision = read('services/geminiVisionService.js');

  assert.match(skill, /Respond only with valid JSON/i);
  assert.match(skill, /Never invent compass directions/i);
  assert.match(model, /'vastu'/);
  assert.match(history, /'vastu'/);
  assert.match(vision, /vastu-consultant/);

  const aiCall = controller.indexOf('geminiVisionService.generateReading');
  const deduction = controller.indexOf('findOneAndUpdate');
  const save = controller.indexOf('ImageReading.create');
  assert.ok(aiCall > -1 && deduction > aiCall, 'credits must be deducted after Gemini returns');
  assert.ok(save > deduction, 'report should be saved only after successful deduction');
  assert.match(controller, /VASTU_COST = 50/);
});
