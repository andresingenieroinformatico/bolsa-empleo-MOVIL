import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST as login } from "../app/api/v1/auth/login/route";
import { GET as getMe } from "../app/api/v1/auth/me/route";
import { GET as getJob } from "../app/api/v1/jobs/[id]/route";
import {
  addMobileDeviceName,
  normalizeLaravelResponse,
  resolveLaravelApiBaseUrl,
} from "../lib/laravel-bridge";

test("adds the required device name to Laravel authentication requests", () => {
  assert.deepEqual(
    addMobileDeviceName({ email: "Carlos.lopez@unipaz.edu.co", password: "EstudianteUNIPAZ2024*" }),
    {
      email: "Carlos.lopez@unipaz.edu.co",
      password: "EstudianteUNIPAZ2024*",
      device_name: "UniEmpleo",
    },
  );
});

test("normalizes a Laravel authentication response into the gateway contract", () => {
  const laravelResponse = {
    token: "sanctum-token",
    token_type: "Bearer",
    user: { id: 8, role: "student" },
  };

  assert.deepEqual(normalizeLaravelResponse(200, laravelResponse), {
    success: true,
    data: laravelResponse,
  });
});

test("unwraps Laravel resource data while keeping its message", () => {
  assert.deepEqual(
    normalizeLaravelResponse(201, {
      message: "Registro recibido.",
      data: { id: 3, status: "pending" },
    }),
    {
      success: true,
      message: "Registro recibido.",
      data: { id: 3, status: "pending" },
    },
  );
});

test("keeps Laravel pagination metadata inside the gateway data envelope", () => {
  const paginator = {
    current_page: 2,
    data: [{ id: 12 }],
    per_page: 12,
    total: 25,
  };

  assert.deepEqual(normalizeLaravelResponse(200, paginator), {
    success: true,
    data: paginator,
  });
});

test("does not convert Laravel error responses into successful envelopes", () => {
  const error = { message: "No autorizado." };

  assert.deepEqual(normalizeLaravelResponse(401, error), error);
});

test("preserves Laravel validation fields for mobile registration and login", () => {
  const validationError = {
    message: "The email field is required.",
    errors: {
      email: ["The email field is required."],
      password: ["The password field is required."],
    },
  };

  assert.deepEqual(normalizeLaravelResponse(422, validationError), validationError);
});

test("requires a valid Laravel base URL instead of silently targeting localhost", () => {
  assert.throws(() => resolveLaravelApiBaseUrl(undefined), /LARAVEL_API_URL/);
  assert.throws(() => resolveLaravelApiBaseUrl("ftp://api.example.test"), /HTTP o HTTPS/);
  assert.equal(
    resolveLaravelApiBaseUrl("https://laravel.example.test/").toString(),
    "https://laravel.example.test/",
  );
});

test("forwards mobile login with Laravel's required device name and returns the session envelope", async () => {
  const originalUrl = process.env.LARAVEL_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.LARAVEL_API_URL = "https://laravel.example.test";
  let requestUrl = "";
  let requestBody = "";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    requestBody = String(init?.body);
    return new Response(
      JSON.stringify({
        token: "sanctum-token",
        token_type: "Bearer",
        user: { id: 8, role: "student" },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const response = await login(
      new NextRequest("https://gateway.example.test/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "student@unipaz.edu.co", password: "password" }),
      }),
    );

    assert.equal(requestUrl, "https://laravel.example.test/api/v1/auth/login");
    assert.deepEqual(JSON.parse(requestBody), {
      email: "student@unipaz.edu.co",
      password: "password",
      device_name: "UniEmpleo",
    });
    assert.deepEqual(await response.json(), {
      success: true,
      data: {
        token: "sanctum-token",
        token_type: "Bearer",
        user: { id: 8, role: "student" },
      },
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.LARAVEL_API_URL;
    else process.env.LARAVEL_API_URL = originalUrl;
  }
});

test("forwards the gateway's auth/me alias to Laravel's /me endpoint", async () => {
  const originalUrl = process.env.LARAVEL_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.LARAVEL_API_URL = "https://laravel.example.test";
  let requestUrl = "";
  globalThis.fetch = async (input) => {
    requestUrl = String(input);
    return new Response(
      JSON.stringify({ data: { id: 8, name: "Student", role: "student" } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const response = await getMe(
      new NextRequest("https://gateway.example.test/api/v1/auth/me", {
        headers: { Authorization: "Bearer sanctum-token" },
      }),
    );

    assert.equal(requestUrl, "https://laravel.example.test/api/v1/me");
    assert.deepEqual(await response.json(), {
      success: true,
      data: { id: 8, name: "Student", role: "student" },
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.LARAVEL_API_URL;
    else process.env.LARAVEL_API_URL = originalUrl;
  }
});

test("forwards dynamic job routes using Next's asynchronous route params", async () => {
  const originalUrl = process.env.LARAVEL_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.LARAVEL_API_URL = "https://laravel.example.test";
  let requestUrl = "";
  let authorization = "";
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input);
    authorization = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(
      JSON.stringify({ data: { id: 42, title: "Desarrollador" } }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };

  try {
    const response = await getJob(
      new NextRequest("https://gateway.example.test/api/v1/jobs/42", {
        headers: { Authorization: "Bearer student-token" },
      }),
      { params: Promise.resolve({ id: "42" }) },
    );

    assert.equal(requestUrl, "https://laravel.example.test/api/v1/jobs/42");
    assert.equal(authorization, "Bearer student-token");
    assert.deepEqual(await response.json(), {
      success: true,
      data: { id: 42, title: "Desarrollador" },
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.LARAVEL_API_URL;
    else process.env.LARAVEL_API_URL = originalUrl;
  }
});
