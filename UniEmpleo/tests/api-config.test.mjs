import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, apiRequest, resolveApiBaseUrl } from '../src/services/api.ts';

test('requires a configured API URL', () => {
  assert.throws(() => resolveApiBaseUrl(''), /EXPO_PUBLIC_API_URL/);
});

test('normalizes a gateway host to the versioned API path', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.example.test/'),
    'https://api.example.test/api/v1'
  );
});

test('does not duplicate the API path', () => {
  assert.equal(
    resolveApiBaseUrl('https://api.example.test/api/v1/'),
    'https://api.example.test/api/v1'
  );
});

test('rejects unsupported URL protocols', () => {
  assert.throws(() => resolveApiBaseUrl('ftp://api.example.test'), /HTTP o HTTPS/);
});

test('sends bearer tokens and surfaces API error messages', async () => {
  const originalUrl = process.env.EXPO_PUBLIC_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test';
  let requestUrl;
  let requestHeaders;
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestHeaders = init.headers;
    return new Response(JSON.stringify({ message: 'No autorizado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    await assert.rejects(
      apiRequest('auth/me', { token: 'secret-token' }),
      (error) =>
        error instanceof ApiError &&
        error.status === 401 &&
        error.message === 'No autorizado.',
    );
    assert.equal(requestUrl, 'https://api.example.test/api/v1/auth/me');
    assert.equal(requestHeaders.Authorization, 'Bearer secret-token');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalUrl;
    }
  }
});
