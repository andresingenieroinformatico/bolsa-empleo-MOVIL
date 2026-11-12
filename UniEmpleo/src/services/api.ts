export class ApiError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function resolveApiBaseUrl(configuredUrl: string | undefined): string {
  const value = configuredUrl?.trim();
  if (!value) {
    throw new Error(
      'Falta configurar EXPO_PUBLIC_API_URL con la URL del gateway de la API.',
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL debe ser una URL absoluta válida.');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('EXPO_PUBLIC_API_URL debe usar HTTP o HTTPS.');
  }

  const path = url.pathname.replace(/\/+$/, '');
  url.pathname = path.endsWith('/api/v1') ? path : `${path}/api/v1`;
  url.search = '';
  url.hash = '';

  return url.toString().replace(/\/+$/, '');
}

export async function apiRequest<T>(
  path: string,
  options: {
    token?: string | null;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const baseUrl = resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  const requestUrl = new URL(path.replace(/^\/+/, ''), `${baseUrl}/`);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: options.method ?? 'GET',
      headers,
      body,
    });
  } catch {
    throw new ApiError(
      'No fue posible conectar con la API. Revisa EXPO_PUBLIC_API_URL y que el servidor esté disponible.',
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = responseBody as
      | { message?: unknown; error?: { message?: unknown } }
      | null;
    const message =
      (typeof body?.message === 'string' && body.message) ||
      (typeof body?.error?.message === 'string' && body.error.message) ||
      `La API respondió con el estado ${response.status}.`;

    throw new ApiError(message, response.status);
  }

  return responseBody as T;
}

export interface ApiUser {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'company' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: ApiUser;
  };
}

export interface ApiDocument {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  file?: Blob;
}

function assertPdfWithinLimit(file: ApiDocument): void {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.mimeType !== 'application/pdf') {
    throw new ApiError('Selecciona una hoja de vida en formato PDF.', 422);
  }
  if (file.size !== undefined && file.size !== null && file.size > 5 * 1024 * 1024) {
    throw new ApiError('El archivo supera el tamaño máximo permitido de 5 MB.', 413);
  }
}

function appendDocument(formData: FormData, file: ApiDocument): void {
  if (file.file) {
    formData.append('cv', file.file, file.name);
    return;
  }

  const nativeFile = {
    uri: file.uri,
    name: file.name,
    type: file.mimeType || 'application/pdf',
  };
  formData.append('cv', nativeFile as unknown as Blob);
}

export async function authenticateWithGoogle(
  idToken: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('auth/google', {
    method: 'POST',
    body: { id_token: idToken },
  });
}

export async function authenticateWithPassword(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export interface CompanyRegistrationInput {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  company_name: string;
  nit: string;
  sector?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  description?: string;
}

export function registerCompany(
  input: CompanyRegistrationInput,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('auth/register/company', {
    method: 'POST',
    body: input,
  });
}

export function getAuthenticatedUser(
  token: string,
): Promise<ApiEnvelope<ApiUser>> {
  return apiRequest<ApiEnvelope<ApiUser>>('auth/me', { token });
}

export function logout(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('auth/logout', {
    token,
    method: 'POST',
  });
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export function unwrapData<T>(response: ApiEnvelope<T>): T {
  if (!response || response.success !== true || response.data === undefined) {
    throw new ApiError(
      response?.message || 'La API devolvió una respuesta incompleta.',
      502,
    );
  }
  return response.data;
}

export function unwrapList<T>(response: ApiEnvelope<unknown>): T[] {
  const data = unwrapData(response);
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const paginatedData = (data as { data?: unknown }).data;
    if (Array.isArray(paginatedData)) {
      return paginatedData as T[];
    }
  }
  throw new ApiError('La API devolvió una lista con formato inesperado.', 502);
}

export function getJobs(
  token?: string | null,
  filters: { search?: string; modality?: string; location?: string } = {},
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  if (filters.search) query.set('search', filters.search);
  if (filters.modality) query.set('modalidad', filters.modality);
  if (filters.location) query.set('ciudad', filters.location);
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<ApiEnvelope<unknown>>(`jobs${suffix}`, { token });
}

export function getStudentProfile(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('students/profile', { token });
}

export function updateStudentProfile(
  token: string,
  profile: Record<string, unknown>,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('students/profile', {
    token,
    method: 'PUT',
    body: profile,
  });
}

export function getStudentApplications(
  token: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('applications/student', { token });
}

export async function applyToJob(
  token: string,
  jobId: string,
  cvFile?: ApiDocument,
): Promise<ApiEnvelope<unknown>> {
  if (cvFile) {
    assertPdfWithinLimit(cvFile);
    const body = new FormData();
    body.append('job_offer_id', jobId);
    appendDocument(body, cvFile);
    return apiRequest<ApiEnvelope<unknown>>('applications', {
      token,
      method: 'POST',
      body,
    });
  }

  return apiRequest<ApiEnvelope<unknown>>('applications', {
    token,
    method: 'POST',
    body: { job_offer_id: jobId },
  });
}

export async function uploadStudentCv(
  token: string,
  file: ApiDocument,
): Promise<ApiEnvelope<unknown>> {
  assertPdfWithinLimit(file);
  const body = new FormData();
  appendDocument(body, file);
  return apiRequest<ApiEnvelope<unknown>>('students/upload-cv', {
    token,
    method: 'POST',
    body,
  });
}

export function getCompanyProfile(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('companies/profile', { token });
}

export function getCompanyStatus(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('companies/status', { token });
}

export function updateCompanyProfile(
  token: string,
  profile: Record<string, unknown>,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('companies/profile', {
    token,
    method: 'PUT',
    body: profile,
  });
}

export function getCompanyJobs(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('company/jobs', { token });
}

export function createJob(
  token: string,
  job: Record<string, unknown>,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('jobs', {
    token,
    method: 'POST',
    body: job,
  });
}

export function updateJob(
  token: string,
  jobId: string,
  job: Record<string, unknown>,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(`jobs/${encodeURIComponent(jobId)}`, {
    token,
    method: 'PUT',
    body: job,
  });
}

export function getJobApplicants(
  token: string,
  jobId: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `applications/job/${encodeURIComponent(jobId)}`,
    { token },
  );
}

export function updateApplicationStatus(
  token: string,
  applicationId: string,
  update: Record<string, unknown>,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `applications/${encodeURIComponent(applicationId)}/status`,
    { token, method: 'PUT', body: update },
  );
}

export function getPendingCompanies(
  token: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('admin/companies/pending', { token });
}

export function updateCompanyApproval(
  token: string,
  companyId: string,
  approved: boolean,
  reason?: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `admin/companies/${encodeURIComponent(companyId)}/approve`,
    {
      token,
      method: 'PUT',
      body: { aprobada: approved, reason },
    },
  );
}
