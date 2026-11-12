import assert from 'node:assert/strict';
import test from 'node:test';
import { applyToJob, registerCompany, uploadStudentCv } from '../src/services/api.ts';

const originalUrl = process.env.EXPO_PUBLIC_API_URL;
const originalFetch = globalThis.fetch;

test.beforeEach(() => {
  process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test/api/v1';
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalUrl === undefined) {
    delete process.env.EXPO_PUBLIC_API_URL;
  } else {
    process.env.EXPO_PUBLIC_API_URL = originalUrl;
  }
});

test('applies with a selected CV as multipart data', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ success: true, data: {} }), { status: 201 });
  };

  const file = new Blob(['pdf contents'], { type: 'application/pdf' });
  await applyToJob('session-token', 'job-42', {
    uri: 'file:///resume.pdf',
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    size: file.size,
    file,
  });

  assert.equal(request.url, 'https://api.example.test/api/v1/applications');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer session-token');
  assert.equal(request.options.body.get('job_offer_id'), 'job-42');
  assert.equal(request.options.body.get('cv').name, 'resume.pdf');
});

test('rejects a CV larger than five megabytes before uploading', async () => {
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    return new Response('{}', { status: 200 });
  };

  await assert.rejects(
    uploadStudentCv('session-token', {
      uri: 'file:///large.pdf',
      name: 'large.pdf',
      mimeType: 'application/pdf',
      size: 5 * 1024 * 1024 + 1,
    }),
    /5 MB/,
  );
  assert.equal(requested, false);
});

test('registers companies through the documented gateway route', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ success: true, data: {} }), { status: 201 });
  };

  await registerCompany({
    name: 'RRHH',
    email: 'rrhh@example.test',
    password: 'not-a-real-password',
    password_confirmation: 'not-a-real-password',
    company_name: 'Example SAS',
    nit: '900123456',
  });

  assert.equal(request.url, 'https://api.example.test/api/v1/auth/register/company');
  assert.equal(request.options.body, JSON.stringify({
    name: 'RRHH',
    email: 'rrhh@example.test',
    password: 'not-a-real-password',
    password_confirmation: 'not-a-real-password',
    company_name: 'Example SAS',
    nit: '900123456',
  }));
});
