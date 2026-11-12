import {
  Application,
  ApplicationStatus,
  CompanyProfile,
  CompanyStatus,
  ContractType,
  JobModality,
  JobOffer,
  StudentProfile,
} from '../data/mock-data';
import { ApiError } from './api';

type JsonRecord = Record<string, unknown>;

function record(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(`La API devolvió ${label} con formato inesperado.`, 502);
  }
  return value as JsonRecord;
}

function nestedRecord(source: JsonRecord, key: string): JsonRecord {
  const value = source[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function stringValue(source: JsonRecord, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function requiredString(
  source: JsonRecord,
  label: string,
  ...keys: string[]
): string {
  const value = stringValue(source, ...keys);
  if (!value) {
    throw new ApiError(`Falta el campo ${label} en la respuesta de la API.`, 502);
  }
  return value;
}

function list(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function applicationStatus(value: unknown): ApplicationStatus {
  if (
    value === 'pending' ||
    value === 'reviewed' ||
    value === 'interview' ||
    value === 'accepted' ||
    value === 'rejected'
  ) {
    return value;
  }
  throw new ApiError('La API devolvió un estado de postulación desconocido.', 502);
}

function companyStatus(source: JsonRecord): CompanyStatus {
  const status = stringValue(source, 'status', 'estado');
  if (
    status === 'pending' ||
    status === 'approved' ||
    status === 'rejected' ||
    status === 'inactive'
  ) {
    return status;
  }
  if (source.aprobada === true) return 'approved';
  if (source.aprobada === false) return 'pending';
  throw new ApiError('La API devolvió un estado de empresa desconocido.', 502);
}

function modality(value: unknown): JobModality {
  if (typeof value !== 'string') return 'No especificada';
  const normalized = value.toLowerCase();
  if (normalized.includes('remote') || normalized.includes('remot')) return 'Remoto';
  if (normalized.includes('hybrid') || normalized.includes('híbrid')) return 'Híbrido';
  if (normalized.includes('onsite') || normalized.includes('presenc')) return 'Presencial';
  return 'No especificada';
}

function contractType(value: unknown): ContractType {
  if (typeof value !== 'string') return 'No especificado';
  const normalized = value.toLowerCase();
  if (normalized.includes('práct') || normalized.includes('practic')) return 'Prácticas';
  if (normalized.includes('hora')) return 'Por horas';
  if (normalized.includes('medio')) return 'Medio tiempo';
  if (
    normalized.includes('tiempo completo') ||
    normalized.includes('indefinido') ||
    normalized.includes('fijo')
  ) {
    return 'Tiempo completo';
  }
  return 'No especificado';
}

export function mapJob(value: unknown): JobOffer {
  const source = record(value, 'una vacante');
  const company = nestedRecord(source, 'company');
  const status = stringValue(source, 'status', 'estado');
  const requirements = list(source.requirements ?? source.requisitos).map(String);
  const mappedStatus =
    status === 'active' || status === 'paused' || status === 'closed'
      ? status
      : undefined;
  const targetedPrograms = list(source.programs_targeted ?? source.programs);
  if (!mappedStatus) {
    throw new ApiError('La API devolvió un estado de vacante desconocido.', 502);
  }

  return {
    id: requiredString(source, 'id', 'id'),
    companyId: stringValue(source, 'company_id', 'empresa_id') || stringValue(company, 'id') || '',
    companyName:
      stringValue(company, 'company_name', 'name') ||
      stringValue(source, 'company_name', 'nombre_empresa') ||
      'Empresa',
    title: requiredString(source, 'título', 'title', 'titulo'),
    description: stringValue(source, 'description', 'descripcion') || '',
    requirements,
    responsibilities: stringValue(source, 'responsibilities', 'responsabilidades') || '',
    area: stringValue(source, 'area', 'área') || 'No especificada',
    program:
      stringValue(source, 'program', 'programa') ||
      targetedPrograms.join(', ') ||
      'No especificado',
    modality: modality(source.modality ?? source.modalidad),
    contractType: contractType(source.contract_type ?? source.tipo_contrato),
    schedule: stringValue(source, 'schedule', 'horario'),
    salaryRange: stringValue(source, 'salary_range', 'salario'),
    salaryNegotiable: source.salary_negotiable === true,
    deadline: stringValue(source, 'deadline', 'fecha_limite') || '',
    location: stringValue(source, 'location', 'ubicacion', 'ciudad') || 'No especificada',
    status: mappedStatus,
    vacanciesCount: Number(source.positions ?? source.vacancies_count ?? 1),
    requiresCv: source.requires_cv !== false && source.requiere_cv !== false,
  };
}

export function mapStudentProfile(value: unknown): StudentProfile {
  const source = record(value, 'el perfil del estudiante');
  const profile =
    Object.keys(nestedRecord(source, 'student_profile')).length > 0
      ? nestedRecord(source, 'student_profile')
      : nestedRecord(source, 'profile');
  const user = nestedRecord(source, 'user');
  const data = Object.keys(profile).length ? profile : source;
  const name = stringValue(source, 'name') || stringValue(user, 'name') || '';
  const email = stringValue(source, 'email') || stringValue(user, 'email') || '';
  const cvPath = stringValue(data, 'cv_path', 'cv_url');

  return {
    id: requiredString(data, 'id', 'id'),
    name,
    email,
    phone: stringValue(data, 'phone', 'telefono') || '',
    program: stringValue(data, 'program', 'carrera') || 'No especificado',
    semester: Number(data.semester ?? data.semestre ?? 0),
    availability:
      data.availability && typeof data.availability === 'object'
        ? (data.availability as StudentProfile['availability'])
        : {},
    cvFile: cvPath
      ? {
          name: cvPath.split(/[\\/]/).pop() || 'Hoja de vida',
          sizeMb: 0,
          uploadDate: stringValue(data, 'cv_uploaded_at', 'updated_at') || '',
        }
      : undefined,
  };
}

export function mapCompany(value: unknown, statusValue?: unknown): CompanyProfile {
  const source = record(value, 'una empresa');
  const profile = nestedRecord(source, 'company_profile');
  const status = statusValue === undefined ? {} : record(statusValue, 'el estado de la empresa');
  const data = { ...source, ...profile, ...status };
  return {
    id: requiredString(data, 'id', 'id', 'empresa_id'),
    name: requiredString(data, 'nombre de empresa', 'company_name', 'nombre_empresa', 'name'),
    email: stringValue(data, 'email', 'correo') || '',
    nit: stringValue(data, 'nit') || 'No especificado',
    sector: stringValue(data, 'sector') || 'No especificado',
    description: stringValue(data, 'description', 'descripcion') || '',
    status: companyStatus(data),
    rejectionReason: stringValue(data, 'rejection_reason', 'motivo_rechazo'),
  };
}

export function mapApplication(value: unknown, includeCompanyNotes = false): Application {
  const source = record(value, 'una postulación');
  const job = nestedRecord(source, 'job');
  const jobOffer = nestedRecord(source, 'job_offer');
  const company = nestedRecord(source, 'company');
  const student = nestedRecord(source, 'student');
  const studentUser = nestedRecord(student, 'user');
  const user = nestedRecord(source, 'user');
  const cvPath = stringValue(source, 'cv_path', 'cv_url', 'resume_url');

  return {
    id: requiredString(source, 'id', 'id'),
    jobId:
      stringValue(source, 'job_offer_id', 'job_id') ||
      stringValue(job, 'id') ||
      requiredString(jobOffer, 'vacante', 'id'),
    jobTitle:
      stringValue(source, 'job_title', 'vacante_titulo') ||
      stringValue(job, 'title', 'titulo') ||
      stringValue(jobOffer, 'title', 'titulo') ||
      'Vacante',
    companyName:
      stringValue(source, 'company_name', 'nombre_empresa') ||
      stringValue(company, 'company_name', 'name') ||
      'Empresa',
    studentId:
      stringValue(source, 'student_id', 'estudiante_id') ||
      stringValue(student, 'id') ||
      '',
    studentName:
      stringValue(source, 'student_name', 'nombre_estudiante') ||
      stringValue(student, 'name') ||
      stringValue(studentUser, 'name') ||
      stringValue(user, 'name') ||
      'Estudiante',
    studentProgram:
      stringValue(source, 'student_program', 'program') ||
      stringValue(student, 'program', 'carrera') ||
      stringValue(nestedRecord(student, 'student_profile'), 'program', 'carrera') ||
      'No especificado',
    studentEmail:
      stringValue(source, 'student_email') ||
      stringValue(student, 'email') ||
      stringValue(studentUser, 'email') ||
      stringValue(user, 'email') ||
      '',
    appliedAt: stringValue(source, 'applied_at', 'created_at', 'fecha_postulacion') || '',
    status: applicationStatus(source.status ?? source.estado),
    cvFileName: cvPath?.split(/[\\/]/).pop() || 'Sin hoja de vida',
    interviewNote: stringValue(source, 'interview_note', 'nota_entrevista'),
    ...(includeCompanyNotes
      ? { companyNotes: stringValue(source, 'company_notes') }
      : {}),
  };
}
