import { isCvWithinLimit, MAX_CV_MB } from '@/lib/document-limits';

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
      (response.status === 404
        ? 'La ruta no fue encontrada (404). Verifica que el gateway publique las rutas /api/v1 y que la URL base sea correcta.'
        : `La API respondió con el estado ${response.status}.`);

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
  data?: unknown;
}

export type AuthMethod = 'password' | 'google';

export interface AuthenticatedSessionResponse {
  token: string;
  user: ApiUser;
}

function isApiUser(value: unknown): value is ApiUser {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const user = value as Record<string, unknown>;
  return (
    (typeof user.id === 'string' || typeof user.id === 'number') &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'student' || user.role === 'company' || user.role === 'admin')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getAuthenticatedSession(
  response: AuthResponse,
  method: AuthMethod,
): AuthenticatedSessionResponse {
  if (!response || response.success !== true || !isRecord(response.data)) {
    throw new ApiError(
      typeof response?.message === 'string' && response.message
        ? response.message
        : 'El servidor no pudo validar las credenciales.',
      401,
    );
  }
  const token = response.data.token;
  const rawUser = response.data.user;
  if (typeof token !== 'string' || !token || !isRecord(rawUser)) {
    throw new ApiError('El servidor devolvió datos de sesión incompletos o inválidos.', 502);
  }
  const role = rawUser.role;
  if (role !== 'student' && role !== 'company' && role !== 'admin') {
    throw new ApiError('El servidor devolvió un rol de cuenta no válido.', 502);
  }
  if (!isApiUser(rawUser)) {
    throw new ApiError('El servidor devolvió datos de sesión incompletos o inválidos.', 502);
  }
  if (method === 'google' && rawUser.role !== 'student') {
    throw new ApiError(
      'El inicio de sesión con Google solo está disponible para estudiantes. Usa correo y contraseña para este tipo de cuenta.',
      403,
    );
  }

  return { token, user: rawUser };
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
  if (!isCvWithinLimit(file.size)) {
    throw new ApiError(
      `El archivo supera el tamaño máximo permitido de ${MAX_CV_MB} MB.`,
      413,
    );
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
  contact_person: string;
  /** Optional at sign-up: the company completes these from its dashboard. */
  sector?: string;
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

export interface ApiListPage<T> {
  items: T[];
  currentPage: number;
  perPage: number;
  total?: number;
  hasMore: boolean;
}

function readPageNumber(value: unknown, fallback: number, allowZero = false): number {
  if (value === undefined || value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < (allowZero ? 0 : 1)) {
    throw new ApiError('La API devolvió metadatos de paginación inválidos.', 502);
  }
  return parsed;
}

export function unwrapPage<T>(
  response: ApiEnvelope<unknown>,
  requestedPage = 1,
  requestedPerPage = 12,
): ApiListPage<T> {
  const data = unwrapData(response);
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      currentPage: requestedPage,
      perPage: requestedPerPage,
      hasMore: data.length >= requestedPerPage,
    };
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError('La API devolvió una página con formato inesperado.', 502);
  }

  const pageData = (data as { data?: unknown }).data;
  if (!Array.isArray(pageData)) {
    throw new ApiError('La API devolvió una página con formato inesperado.', 502);
  }

  const pageRecord = data as {
    meta?: unknown;
    current_page?: unknown;
    per_page?: unknown;
    total?: unknown;
  };
  const rawMeta = pageRecord.meta ?? pageRecord;
  if (rawMeta !== undefined && (!rawMeta || typeof rawMeta !== 'object' || Array.isArray(rawMeta))) {
    throw new ApiError('La API devolvió metadatos de paginación inválidos.', 502);
  }
  const meta = (rawMeta || {}) as Record<string, unknown>;
  const currentPage = readPageNumber(meta.current_page, requestedPage);
  const perPage = readPageNumber(meta.per_page, requestedPerPage);
  const total = meta.total === undefined
    ? undefined
    : readPageNumber(meta.total, 0, true);

  return {
    items: pageData as T[],
    currentPage,
    perPage,
    total,
    hasMore: total === undefined
      ? pageData.length >= perPage
      : currentPage * perPage < total,
  };
}

const MAX_LIST_PAGES = 50;

/**
 * Recorre todas las páginas de un listado para que las secciones muestren el
 * histórico completo y sus indicadores no se limiten a la primera página.
 */
export async function fetchAllPages(
  fetchPage: (page: number) => Promise<ApiEnvelope<unknown>>,
  perPage = 20,
): Promise<{ items: unknown[]; total: number }> {
  const items: unknown[] = [];
  let total = 0;

  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    const result = unwrapPage<unknown>(await fetchPage(page), page, perPage);
    items.push(...result.items);
    total = result.total ?? items.length;

    if (!result.hasMore || result.items.length === 0) break;
  }

  return { items, total };
}

export interface JobSearchFilters {
  search?: string;
  modality?: string;
  location?: string;
  page?: number;
  perPage?: number;
}

export interface JobWriteInput {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  area: string;
  contract_type: string;
  modality: string;
  schedule: string | null;
  location: string;
  salary_range: string | null;
  salary_negotiable: boolean;
  positions: number;
  deadline: string;
  requires_cv: boolean;
  programs_targeted: string[];
  status?: JobOfferStatus;
}

export interface JobFormInput {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string;
  area: string;
  contractType: string;
  modality: string;
  schedule?: string;
  location: string;
  salaryRange?: string;
  salaryNegotiable: boolean;
  positions: number;
  deadline: string;
  requiresCv: boolean;
  programsTargeted: string[];
  status?: JobOfferStatus;
}

type JobOfferStatus = 'active' | 'paused' | 'closed';

export function toJobWriteInput(job: JobFormInput): JobWriteInput {
  return {
    title: job.title.trim(),
    description: job.description.trim(),
    requirements: job.requirements.map((requirement) => requirement.trim()).filter(Boolean).join('\n'),
    responsibilities: job.responsibilities.trim(),
    area: job.area.trim(),
    contract_type: job.contractType,
    modality: job.modality,
    schedule: job.schedule?.trim() || null,
    location: job.location.trim(),
    salary_range: job.salaryRange?.trim() || null,
    salary_negotiable: job.salaryNegotiable,
    positions: job.positions,
    deadline: job.deadline,
    requires_cv: job.requiresCv,
    programs_targeted: job.programsTargeted.map((program) => program.trim()).filter(Boolean),
    ...(job.status ? { status: job.status } : {}),
  };
}

export function getJobs(
  token?: string | null,
  filters: JobSearchFilters = {},
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.modality) query.set('modalidad', filters.modality);
  if (filters.location?.trim()) query.set('ciudad', filters.location.trim());
  if (filters.page !== undefined) {
    query.set('page', String(readPageNumber(filters.page, 1)));
  }
  if (filters.perPage !== undefined) {
    query.set('per_page', String(readPageNumber(filters.perPage, 12)));
  }
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
  page = 1,
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams({ page: String(readPageNumber(page, 1)) });
  return apiRequest<ApiEnvelope<unknown>>(`applications/student?${query.toString()}`, { token });
}

export interface ApplyToJobInput {
  cvFile?: ApiDocument;
  coverLetter?: string;
}

export async function applyToJob(
  token: string,
  jobId: string,
  input: ApplyToJobInput = {},
): Promise<ApiEnvelope<unknown>> {
  const coverLetter = input.coverLetter?.trim();
  if (coverLetter && coverLetter.length > 2000) {
    throw new ApiError('La carta de presentación no puede superar los 2.000 caracteres.', 422);
  }

  if (input.cvFile) {
    assertPdfWithinLimit(input.cvFile);
    const body = new FormData();
    body.append('job_offer_id', jobId);
    appendDocument(body, input.cvFile);
    if (coverLetter) body.append('cover_letter', coverLetter);
    return apiRequest<ApiEnvelope<unknown>>('applications', {
      token,
      method: 'POST',
      body,
    });
  }

  return apiRequest<ApiEnvelope<unknown>>('applications', {
    token,
    method: 'POST',
    body: {
      job_offer_id: jobId,
      ...(coverLetter ? { cover_letter: coverLetter } : {}),
    },
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

export function getCompanyJobs(token: string, page = 1): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams({ page: String(readPageNumber(page, 1)) });
  return apiRequest<ApiEnvelope<unknown>>(`company/jobs?${query.toString()}`, { token });
}

export function getCompanySummary(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('company/dashboard', { token });
}

export function getCompanyReports(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('company/reports', { token });
}

export function createJob(
  token: string,
  job: JobWriteInput,
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
  job: JobWriteInput,
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
  page = 1,
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams({ page: String(readPageNumber(page, 1)) });
  return apiRequest<ApiEnvelope<unknown>>(
    `applications/job/${encodeURIComponent(jobId)}?${query.toString()}`,
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

export function getAdminCompanies(
  token: string,
  filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'inactive';
    search?: string;
    page?: number;
  } = {},
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.page !== undefined) {
    query.set('page', String(readPageNumber(filters.page, 1)));
  }
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<ApiEnvelope<unknown>>(`admin/companies${suffix}`, { token });
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

/* -------------------------------------------------------------------------- */
/*  Administración                                                            */
/* -------------------------------------------------------------------------- */

export interface AdminUserFilters {
  role?: 'student' | 'company' | 'admin';
  search?: string;
  /** Filters by account access state. */
  active?: boolean;
  /** Filters by student profile completeness. */
  profile?: 'complete' | 'incomplete';
  page?: number;
}

export interface AdminJobFilters {
  status?: 'active' | 'paused' | 'closed';
  search?: string;
  page?: number;
}

export function getAdminDashboard(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('admin/dashboard', { token });
}

export function getAdminReports(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('admin/reports', { token });
}

export function getAdminProfile(token: string): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('admin/profile', { token });
}

export function updateAdminProfile(
  token: string,
  input: {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
  },
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('admin/profile', {
    token,
    method: 'PUT',
    body: input,
  });
}

export function getAdminUsers(
  token: string,
  filters: AdminUserFilters = {},
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  if (filters.role) query.set('role', filters.role);
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.active !== undefined) query.set('active', filters.active ? '1' : '0');
  if (filters.profile) query.set('profile', filters.profile);
  if (filters.page !== undefined) {
    query.set('page', String(readPageNumber(filters.page, 1)));
  }
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<ApiEnvelope<unknown>>(`admin/users${suffix}`, { token });
}

export function toggleAdminUser(
  token: string,
  userId: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `admin/users/${encodeURIComponent(userId)}/toggle`,
    { token, method: 'PATCH' },
  );
}

export interface AdminUserUpdateInput {
  name: string;
  email: string;
  program: string;
  semester?: string;
  phone?: string;
  studentCode?: string;
  /** Optional new password. Requires confirmation. */
  password?: string;
  passwordConfirmation?: string;
}

export function updateAdminUser(
  token: string,
  userId: string,
  input: AdminUserUpdateInput,
): Promise<ApiEnvelope<unknown>> {
  const password = input.password?.trim() ? input.password : undefined;
  return apiRequest<ApiEnvelope<unknown>>(
    `admin/users/${encodeURIComponent(userId)}`,
    {
      token,
      method: 'PUT',
      body: {
        name: input.name.trim(),
        email: input.email.trim(),
        program: input.program.trim(),
        semester: input.semester?.trim() || null,
        phone: input.phone?.trim() || null,
        student_code: input.studentCode?.trim() || null,
        ...(password ? { password, password_confirmation: input.passwordConfirmation } : {}),
      },
    },
  );
}

export function getAdminJobs(
  token: string,
  filters: AdminJobFilters = {},
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.page !== undefined) {
    query.set('page', String(readPageNumber(filters.page, 1)));
  }
  const suffix = query.size ? `?${query.toString()}` : '';
  return apiRequest<ApiEnvelope<unknown>>(`admin/jobs${suffix}`, { token });
}

export function toggleAdminJob(
  token: string,
  jobId: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `admin/jobs/${encodeURIComponent(jobId)}/toggle`,
    { token, method: 'PATCH' },
  );
}

/* -------------------------------------------------------------------------- */
/*  Notificaciones                                                            */
/* -------------------------------------------------------------------------- */

export function getNotifications(
  token: string,
  page = 1,
): Promise<ApiEnvelope<unknown>> {
  const query = new URLSearchParams();
  query.set('page', String(readPageNumber(page, 1)));
  return apiRequest<ApiEnvelope<unknown>>(`notifications?${query.toString()}`, {
    token,
  });
}

export function getNotificationsUnreadCount(
  token: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('notifications/unread-count', { token });
}

export function markNotificationAsRead(
  token: string,
  notificationId: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>(
    `notifications/${encodeURIComponent(notificationId)}/read`,
    { token, method: 'PATCH' },
  );
}

export function markAllNotificationsAsRead(
  token: string,
): Promise<ApiEnvelope<unknown>> {
  return apiRequest<ApiEnvelope<unknown>>('notifications/mark-all-read', {
    token,
    method: 'POST',
  });
}
