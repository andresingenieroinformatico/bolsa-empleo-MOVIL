import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyToJob,
  authenticateWithGoogle,
  authenticateWithPassword,
  getJobs,
  registerCompany,
  unwrapPage,
  updateCompanyProfile,
  uploadStudentCv,
} from '../src/services/api.ts';

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
    cvFile: {
      uri: 'file:///resume.pdf',
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      size: file.size,
      file,
    },
    coverLetter: 'Me interesa aportar al equipo de desarrollo.',
  });

  assert.equal(request.url, 'https://api.example.test/api/v1/applications');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.Authorization, 'Bearer session-token');
  assert.equal(request.options.body.get('job_offer_id'), 'job-42');
  assert.equal(request.options.body.get('cv').name, 'resume.pdf');
  assert.equal(request.options.body.get('cover_letter'), 'Me interesa aportar al equipo de desarrollo.');
});

test('includes an optional cover letter when applying without an attached CV', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ success: true, data: {} }), { status: 201 });
  };

  await applyToJob('session-token', 'job-42', {
    coverLetter: 'Tengo experiencia en soporte técnico.',
  });

  assert.deepEqual(JSON.parse(request.options.body), {
    job_offer_id: 'job-42',
    cover_letter: 'Tengo experiencia en soporte técnico.',
  });
});

test('rejects cover letters longer than the documented limit', async () => {
  let requested = false;
  globalThis.fetch = async () => {
    requested = true;
    return new Response('{}', { status: 200 });
  };

  await assert.rejects(
    applyToJob('session-token', 'job-42', { coverLetter: 'x'.repeat(2001) }),
    /2.000 caracteres/,
  );
  assert.equal(requested, false);
});

test('forwards supported job filters and pagination to the API', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ success: true, data: [] }), { status: 200 });
  };

  await getJobs('session-token', {
    search: 'React Native',
    modality: 'Híbrido',
    location: 'Barrancabermeja',
    page: 2,
    perPage: 12,
  });

  const url = new URL(request.url);
  assert.equal(url.pathname, '/api/v1/jobs');
  assert.equal(url.searchParams.get('search'), 'React Native');
  assert.equal(url.searchParams.get('modalidad'), 'Híbrido');
  assert.equal(url.searchParams.get('ciudad'), 'Barrancabermeja');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('per_page'), '12');
  assert.equal(request.options.headers.Authorization, 'Bearer session-token');
});

test('unwraps paginated responses and identifies whether another page exists', () => {
  const response = {
    success: true,
    data: {
      data: [{ id: 'job-13' }],
      meta: { current_page: 2, total: 25 },
    },
  };

  assert.deepEqual(unwrapPage(response, 2, 12), {
    items: [{ id: 'job-13' }],
    currentPage: 2,
    perPage: 12,
    total: 25,
    hasMore: true,
  });
});

test('marks the final page as having no more results', () => {
  const response = {
    success: true,
    data: {
      data: [{ id: 'job-25' }],
      meta: { current_page: 3, total: 25 },
    },
  };

  assert.equal(unwrapPage(response, 3, 12).hasMore, false);
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
    sector: 'Tecnología',
    contact_person: 'Andrés Morales',
    phone: '+57 310 999 8888',
    address: 'Zona Industrial, Barrancabermeja',
    description: 'Empresa dedicada a servicios tecnológicos.',
  });

  assert.equal(request.url, 'https://api.example.test/api/v1/auth/register/company');
  assert.equal(request.options.body, JSON.stringify({
    name: 'RRHH',
    email: 'rrhh@example.test',
    password: 'not-a-real-password',
    password_confirmation: 'not-a-real-password',
    company_name: 'Example SAS',
    sector: 'Tecnología',
    contact_person: 'Andrés Morales',
    phone: '+57 310 999 8888',
    address: 'Zona Industrial, Barrancabermeja',
    description: 'Empresa dedicada a servicios tecnológicos.',
  }));
});

test('allows company registration without a NIT', async () => {
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
    sector: 'Tecnología',
    contact_person: 'Andrés Morales',
    phone: '+57 310 999 8888',
    address: 'Zona Industrial, Barrancabermeja',
    description: 'Empresa dedicada a servicios tecnológicos.',
  });

  assert.equal(JSON.parse(request.options.body).nit, undefined);
});

test('updates the authenticated company profile through the documented gateway route', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({ success: true, data: {} }), { status: 200 });
  };

  await updateCompanyProfile('company-token', {
    company_name: 'Example SAS',
    nit: '900123456',
    sector: 'Tecnología',
    description: 'Servicios de desarrollo de software.',
  });

  assert.equal(request.url, 'https://api.example.test/api/v1/companies/profile');
  assert.equal(request.options.method, 'PUT');
  assert.equal(request.options.headers.Authorization, 'Bearer company-token');
  assert.deepEqual(JSON.parse(request.options.body), {
    company_name: 'Example SAS',
    nit: '900123456',
    sector: 'Tecnología',
    description: 'Servicios de desarrollo de software.',
  });
});

test('authenticates all account roles through email and password', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({
      success: true,
      data: {
        token: 'access-token',
        user: { id: 10, name: 'Company User', email: 'user@example.test', role: 'company' },
      },
    }), { status: 200 });
  };

  const response = await authenticateWithPassword('user@example.test', 'password');

  assert.equal(request.url, 'https://api.example.test/api/v1/auth/login');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), {
    email: 'user@example.test',
    password: 'password',
  });
  assert.equal(response.data.user.role, 'company');
});

test('sends Google ID tokens only to the student authentication route', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url: String(url), options };
    return new Response(JSON.stringify({
      success: true,
      data: {
        token: 'access-token',
        user: { id: 11, name: 'Student', email: 'student@example.test', role: 'student' },
      },
    }), { status: 200 });
  };

  await authenticateWithGoogle('google-id-token');

  assert.equal(request.url, 'https://api.example.test/api/v1/auth/google');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { id_token: 'google-id-token' });
});
