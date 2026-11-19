import { CompanyProfile } from '@/data/mock-data';

export type CompanyProfileFieldKey =
  | 'nit'
  | 'sector'
  | 'contactPerson'
  | 'phone'
  | 'address';

export interface CompanyProfileField {
  key: CompanyProfileFieldKey;
  label: string;
}

const PLACEHOLDER = 'no especificado';

function hasValue(value?: string): boolean {
  if (!value) return false;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.toLowerCase() !== PLACEHOLDER;
}

/**
 * Fields the company must complete after sign-up. Sign-up only asks for the
 * legal name, responsible person, NIT, corporate email and password, so the
 * remaining institutional data is collected from the dashboard.
 */
export function getMissingCompanyProfileFields(company: CompanyProfile): CompanyProfileField[] {
  const missing: CompanyProfileField[] = [];
  if (!hasValue(company.nit)) missing.push({ key: 'nit', label: 'NIT' });
  if (!hasValue(company.sector)) missing.push({ key: 'sector', label: 'Sector' });
  if (!hasValue(company.contactPerson)) missing.push({ key: 'contactPerson', label: 'Responsable' });
  if (!hasValue(company.phone)) missing.push({ key: 'phone', label: 'Teléfono' });
  if (!hasValue(company.address)) missing.push({ key: 'address', label: 'Dirección' });
  return missing;
}

/** Human sentence used in banners: "sector, teléfono y dirección". */
export function describeMissingCompanyFields(fields: CompanyProfileField[]): string {
  if (fields.length === 0) return '';
  const labels = fields.map((field) =>
    field.key === 'nit' ? 'NIT' : field.label.toLowerCase(),
  );
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} y ${labels[labels.length - 1]}`;
}
