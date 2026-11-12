import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRoleEntry } from '../src/services/role-navigation.ts';

test('asks guests to sign in with the role they selected', () => {
  assert.deepEqual(resolveRoleEntry(null, 'company'), {
    destination: 'login',
    role: 'company',
  });
});

test('opens the dashboard for the role returned by the authenticated account', () => {
  for (const role of ['student', 'company', 'admin']) {
    assert.deepEqual(resolveRoleEntry(role, 'student'), {
      destination: 'dashboard',
      role,
    });
  }
});

test('keeps an authenticated user in their own role panel', () => {
  assert.deepEqual(resolveRoleEntry('admin', 'student'), {
    destination: 'dashboard',
    role: 'admin',
  });
});
