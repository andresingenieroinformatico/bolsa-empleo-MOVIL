import assert from 'node:assert/strict';
import test from 'node:test';
import { mapProgramsTargeted } from '../src/Api/lib/job-input.ts';

test('maps a single program into the targeted programs list', () => {
  assert.deepEqual(
    mapProgramsTargeted({ program: 'Ingeniería de Sistemas' }),
    ['Ingeniería de Sistemas'],
  );
});

test('trims and removes empty targeted programs', () => {
  assert.deepEqual(
    mapProgramsTargeted({
      programs_targeted: [' Sistemas ', '', 2, 'Administración'],
    }),
    ['Sistemas', 'Administración'],
  );
});

test('returns null when no targeted program was provided', () => {
  assert.equal(mapProgramsTargeted({ program: '  ' }), null);
});
