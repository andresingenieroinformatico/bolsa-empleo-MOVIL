import assert from 'node:assert/strict';
import test from 'node:test';
import { getAuthenticatedSession } from '../src/services/api.ts';

test('accepts student, company, and admin roles from password login', () => {
  for (const role of ['student', 'company', 'admin']) {
    const session = getAuthenticatedSession({
      success: true,
      data: {
        token: 'access-token',
        user: { id: 7, name: 'Test User', email: 'test@example.test', role },
      },
    }, 'password');

    assert.equal(session.user.role, role);
  }
});

test('allows Google authentication only for student accounts', () => {
  assert.equal(
    getAuthenticatedSession({
      success: true,
      data: {
        token: 'access-token',
        user: {
          id: 'student-1',
          name: 'Student',
          email: 'student@example.test',
          role: 'student',
        },
      },
    }, 'google').user.role,
    'student',
  );

  assert.throws(
    () => getAuthenticatedSession({
      success: true,
      data: {
        token: 'access-token',
        user: {
          id: 'company-1',
          name: 'Company',
          email: 'company@example.test',
          role: 'company',
        },
      },
    }, 'google'),
    /solo está disponible para estudiantes/i,
  );
});

test('rejects login responses without a supported server role', () => {
  assert.throws(
    () => getAuthenticatedSession({
      success: true,
      data: {
        token: 'access-token',
        user: {
          id: 'user-1',
          name: 'User',
          email: 'user@example.test',
          role: 'superuser',
        },
      },
    }, 'password'),
    /rol de cuenta no válido/i,
  );
});
