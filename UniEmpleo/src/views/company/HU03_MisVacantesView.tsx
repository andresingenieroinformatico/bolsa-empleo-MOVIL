import React, { useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { CompanyProfile, ContractType, JobModality, JobOffer } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { CompanyProfileCompletionSheet } from '@/components/CompanyProfileCompletionSheet';
import { getMissingCompanyProfileFields } from '@/lib/company-profile';
import { formatDate, pluralize } from '@/lib/format';

const JOB_MODALITIES: JobModality[] = ['Presencial', 'Remoto', 'Híbrido'];
const CONTRACT_TYPES: ContractType[] = [
  'Medio tiempo',
  'Por horas',
  'Prácticas',
  'Tiempo completo',
];

const STATUS_LABEL: Record<CompanyProfile['status'], string> = {
  pending: 'pendiente de aprobación',
  approved: 'aprobada',
  rejected: 'rechazada',
  inactive: 'inactiva',
};

interface MisVacantesViewProps {
  company: CompanyProfile;
  jobs: JobOffer[];
  onAddJob: (newJob: JobOffer) => Promise<void>;
  onUpdateJob: (updatedJob: JobOffer) => Promise<void>;
  onToggleJobStatus: (jobId: string) => Promise<void>;
  onUpdateCompany: (updatedCompany: CompanyProfile) => Promise<void>;
}

export const HU03_MisVacantesView: React.FC<MisVacantesViewProps> = ({
  company,
  jobs,
  onAddJob,
  onUpdateJob,
  onToggleJobStatus,
  onUpdateCompany,
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [area, setArea] = useState('');
  const [program, setProgram] = useState('');
  const [modality, setModality] = useState<JobModality>('Presencial');
  const [contractType, setContractType] = useState<ContractType>('Medio tiempo');
  const [schedule, setSchedule] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);
  const [positions, setPositions] = useState('1');
  const [requiresCv, setRequiresCv] = useState(true);
  const [deadline, setDeadline] = useState(getDefaultDeadline());
  const [location, setLocation] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  const companyJobs = jobs.filter((job) => job.companyId === company.id);
  const isRestricted = company.status !== 'approved';
  const blocked = isRestricted && !editingJob;

  const openCreateForm = () => {
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setRequirementsText('');
    setResponsibilities('');
    setArea('');
    setProgram('');
    setModality('Presencial');
    setContractType('Medio tiempo');
    setSchedule('');
    setSalaryRange('');
    setSalaryNegotiable(false);
    setPositions('1');
    setRequiresCv(true);
    setDeadline(getDefaultDeadline());
    setLocation('');
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenCreateModal = () => {
    if (company.status !== 'approved') {
      setEditingJob(null);
      setFormError(null);
      setShowFormModal(true);
      return;
    }

    if (getMissingCompanyProfileFields(company).length > 0) {
      setShowProfileCompletion(true);
      return;
    }

    openCreateForm();
  };

  const handleOpenEditModal = (job: JobOffer) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRequirementsText(job.requirements.join('\n'));
    setResponsibilities(job.responsibilities || '');
    setArea(job.area === 'No especificada' ? '' : job.area);
    setProgram(job.program);
    setModality(job.modality);
    setContractType(job.contractType);
    setSchedule(job.schedule || '');
    setSalaryRange(job.salaryRange || '');
    setSalaryNegotiable(job.salaryNegotiable || false);
    setPositions(String(job.vacanciesCount));
    setRequiresCv(job.requiresCv);
    setDeadline(job.deadline);
    setLocation(job.location);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveJob = async () => {
    const parsedPositions = Number(positions);
    if (
      !title.trim() ||
      !description.trim() ||
      !requirementsText.trim() ||
      !responsibilities.trim() ||
      !area.trim() ||
      !program.trim() ||
      !location.trim()
    ) {
      setFormError('Completa todos los campos obligatorios.');
      return;
    }
    if (!Number.isInteger(parsedPositions) || parsedPositions < 1) {
      setFormError('El número de vacantes debe ser un entero mayor que cero.');
      return;
    }
    if (!isFutureDate(deadline)) {
      setFormError('La fecha límite debe tener formato AAAA-MM-DD y ser posterior a hoy.');
      return;
    }

    const requirements = requirementsText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setIsSaving(true);
    try {
      const job: JobOffer = {
        id: editingJob?.id || '',
        companyId: company.id,
        companyName: company.name,
        title: title.trim(),
        description: description.trim(),
        requirements,
        responsibilities: responsibilities.trim(),
        area: area.trim(),
        program: program.trim(),
        modality,
        contractType,
        schedule: schedule.trim() || undefined,
        salaryRange: salaryRange.trim() || undefined,
        salaryNegotiable,
        deadline,
        location: location.trim(),
        status: editingJob?.status || 'active',
        vacanciesCount: parsedPositions,
        requiresCv,
      };
      if (editingJob) await onUpdateJob(job);
      else await onAddJob(job);
      setShowFormModal(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible guardar la vacante.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleJob = async (jobId: string) => {
    setActionError(null);
    setUpdatingJobId(jobId);
    try {
      await onToggleJobStatus(jobId);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No fue posible cambiar el estado.');
    } finally {
      setUpdatingJobId(null);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={companyJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeader
              overline="Gestión de ofertas"
              title="Mis vacantes"
              subtitle={`${pluralize(companyJobs.length, 'oferta publicada', 'ofertas publicadas')} para estudiantes UNIPAZ.`}
            />
            <Button
              label="Publicar vacante"
              onPress={handleOpenCreateModal}
              icon="add"
              fullWidth
            />
            {isRestricted ? (
              <Notice
                tone={company.status === 'rejected' ? 'error' : 'warning'}
                title={
                  company.status === 'rejected'
                    ? 'Gestión de vacantes deshabilitada'
                    : 'Publicación pendiente de aprobación'
                }
                message={
                  company.status === 'rejected'
                    ? 'Corrige la información de tu empresa desde la pestaña Empresa y guarda los cambios para reenviar la solicitud.'
                    : 'Podrás publicar, editar y pausar vacantes cuando UNIPAZ apruebe tu cuenta.'
                }
              />
            ) : null}
            {actionError ? (
              <Notice tone="error" message={actionError} onDismiss={() => setActionError(null)} />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="Aún no has publicado vacantes"
            description="Crea tu primera oferta laboral para recibir postulaciones de estudiantes de UNIPAZ."
            actionLabel="Crear mi primera vacante"
            onAction={handleOpenCreateModal}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopCopy}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <View style={styles.metaRow}>
                  <MetaTag icon="location-outline" label={item.location} />
                  <MetaTag icon="briefcase-outline" label={item.modality} />
                  <MetaTag icon="time-outline" label={item.contractType} />
                </View>
              </View>
              <StatusBadge status={item.status} size="small" />
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            {item.salaryRange ? (
              <View style={styles.salaryRow}>
                <Icon name="cash-outline" size={14} color={Brand.greenDark} />
                <Text style={styles.salaryLabel}>
                  {item.salaryRange}
                  {item.salaryNegotiable ? ' · Negociable' : ''}
                </Text>
              </View>
            ) : null}

            <View style={styles.cardFooter}>
              <View style={styles.deadline}>
                <Icon name="calendar-outline" size={13} color={Brand.slateSoft} />
                <Text style={styles.deadlineText}>Cierra el {formatDate(item.deadline)}</Text>
              </View>
              <View style={styles.actions}>
                <Button
                  label={item.status === 'active' ? 'Pausar' : 'Activar'}
                  onPress={() => void handleToggleJob(item.id)}
                  loading={updatingJobId === item.id}
                  disabled={isRestricted}
                  variant="secondary"
                  size="sm"
                  icon={item.status === 'active' ? 'pause' : 'play'}
                />
                <Button
                  label="Editar"
                  onPress={() => handleOpenEditModal(item)}
                  disabled={isRestricted}
                  variant="tonal"
                  size="sm"
                  icon="create-outline"
                />
              </View>
            </View>
          </View>
        )}
      />

      <Sheet
        visible={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingJob ? 'Editar vacante' : 'Nueva vacante'}
        subtitle={blocked ? company.name : 'Información visible para los estudiantes'}
        icon={editingJob ? 'create-outline' : 'briefcase-outline'}
        closeLabel="Cerrar formulario de vacante"
        footer={
          blocked ? (
            <Button
              label="Entendido"
              onPress={() => setShowFormModal(false)}
              size="lg"
              fullWidth
            />
          ) : (
            <Button
              label={isSaving ? 'Guardando…' : editingJob ? 'Guardar cambios' : 'Publicar vacante'}
              onPress={() => void handleSaveJob()}
              loading={isSaving}
              size="lg"
              iconRight="arrow-forward"
              fullWidth
            />
          )
        }>
        {blocked ? (
          <View style={styles.blockedWrap}>
            <View style={styles.blockedIcon}>
              <Icon name="lock-closed-outline" size={26} color={Brand.red} />
            </View>
            <Text style={styles.blockedTitle}>Publicación bloqueada</Text>
            <Text style={styles.blockedText}>
              Tu empresa está {STATUS_LABEL[company.status]}. Para garantizar la formalidad de las
              ofertas, el administrador de UNIPAZ debe aprobar la cuenta antes de publicar.
            </Text>
            <Notice
              tone="info"
              message={
                company.status === 'rejected'
                  ? 'Corrige la información solicitada desde la pestaña Empresa y guarda el perfil para reenviar la solicitud.'
                  : 'Puedes completar tu perfil de empresa mientras la solicitud se revisa.'
              }
            />
          </View>
        ) : (
          <>
            <TextField
              label="Título de la vacante"
              required
              value={title}
              onChangeText={setTitle}
              placeholder="Ej. Desarrollador Junior React Native"
              maxLength={200}
            />

            <TextField
              label="Descripción del cargo"
              required
              value={description}
              onChangeText={setDescription}
              placeholder="Describe el rol y las responsabilidades principales."
              multiline
              maxLength={5000}
              numberOfLines={4}
            />

            <TextField
              label="Requisitos"
              required
              hint="Escribe un requisito por línea."
              value={requirementsText}
              onChangeText={setRequirementsText}
              placeholder={'TypeScript básico\nDisponibilidad en las tardes'}
              multiline
              maxLength={3000}
              numberOfLines={4}
            />

            <TextField
              label="Responsabilidades"
              required
              value={responsibilities}
              onChangeText={setResponsibilities}
              placeholder="Funciones concretas del cargo"
              multiline
              maxLength={3000}
              numberOfLines={3}
            />

            <View style={styles.row}>
              <TextField
                label="Área profesional"
                required
                value={area}
                onChangeText={setArea}
                placeholder="Tecnología"
                maxLength={100}
                containerStyle={styles.rowItem}
              />
              <TextField
                label="Programas objetivo"
                required
                value={program}
                onChangeText={setProgram}
                placeholder="Ingeniería de Sistemas"
                maxLength={120}
                containerStyle={styles.rowItem}
              />
            </View>

            <ChoiceField label="Modalidad">
              {JOB_MODALITIES.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  tone="green"
                  selected={modality === option}
                  onPress={() => setModality(option)}
                />
              ))}
            </ChoiceField>

            <ChoiceField label="Tipo de contrato">
              {CONTRACT_TYPES.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  tone="green"
                  selected={contractType === option}
                  onPress={() => setContractType(option)}
                />
              ))}
            </ChoiceField>

            <View style={styles.row}>
              <TextField
                label="Fecha límite"
                required
                hint="AAAA-MM-DD"
                value={deadline}
                onChangeText={setDeadline}
                placeholder="2026-12-31"
                maxLength={10}
                containerStyle={styles.rowItem}
              />
              <TextField
                label="Ubicación"
                required
                value={location}
                onChangeText={setLocation}
                placeholder="Barrancabermeja"
                maxLength={120}
                containerStyle={styles.rowItem}
              />
            </View>

            <View style={styles.row}>
              <TextField
                label="Horario"
                optionalLabel="Opcional"
                value={schedule}
                onChangeText={setSchedule}
                placeholder="Lunes a viernes, 8:00 a 17:00"
                maxLength={100}
                containerStyle={styles.rowItem}
              />
              <TextField
                label="Vacantes"
                required
                value={positions}
                onChangeText={setPositions}
                keyboardType="number-pad"
                maxLength={4}
                containerStyle={styles.rowItemNarrow}
              />
            </View>

            <TextField
              label="Salario o rango"
              optionalLabel="Opcional"
              value={salaryRange}
              onChangeText={setSalaryRange}
              placeholder="Ej. $2.000.000 COP o A convenir"
              maxLength={100}
            />

            <View style={styles.switches}>
              <SwitchRow
                label="Salario negociable"
                icon="cash-outline"
                value={salaryNegotiable}
                onValueChange={setSalaryNegotiable}
              />
              <SwitchRow
                label="Requiere hoja de vida"
                icon="document-text-outline"
                value={requiresCv}
                onValueChange={setRequiresCv}
              />
            </View>

            {formError ? (
              <Notice tone="error" message={formError} onDismiss={() => setFormError(null)} />
            ) : null}
          </>
        )}
      </Sheet>

      {showProfileCompletion ? (
        <CompanyProfileCompletionSheet
          visible
          company={company}
          context="publish"
          onClose={() => setShowProfileCompletion(false)}
          onSave={async (updatedCompany) => {
            await onUpdateCompany(updatedCompany);
          }}
          onSaved={openCreateForm}
        />
      ) : null}
    </View>
  );
};

function MetaTag({ icon, label }: { icon: React.ComponentProps<typeof Icon>['name']; label: string }) {
  return (
    <View style={styles.metaTag}>
      <Icon name={icon} size={12} color={Brand.slateSoft} />
      <Text style={styles.metaTagText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function ChoiceField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.choiceField}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={styles.choices}>{children}</View>
    </View>
  );
}

function SwitchRow({
  label,
  icon,
  value,
  onValueChange,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchLabel}>
        <Icon name={icon} size={17} color={Brand.slateSoft} />
        <Text style={styles.switchText}>{label}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Brand.lineStrong, true: Brand.greenTintStrong }}
        thumbColor={value ? Brand.greenDark : Brand.surface}
        ios_backgroundColor={Brand.lineStrong}
      />
    </View>
  );
}

function getDefaultDeadline(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function isFutureDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const [year, month, day] = value.split('-').map(Number);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.md,
  },
  header: {
    gap: Space.md,
    marginBottom: Space.xs,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardTopCopy: {
    flex: 1,
    gap: 6,
  },
  jobTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surfaceMuted,
    maxWidth: '100%',
  },
  metaTagText: {
    ...Type.caption,
    fontSize: 10.5,
    color: Brand.slate,
    flexShrink: 1,
  },
  description: {
    ...Type.body,
    color: Brand.slate,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  salaryLabel: {
    ...Type.label,
    color: Brand.greenDark,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    paddingTop: Space.md,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  deadlineText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: Space.md,
  },
  rowItem: {
    flex: 1,
  },
  rowItemNarrow: {
    flex: 0.55,
  },
  choiceField: {
    gap: 8,
  },
  choiceLabel: {
    ...Type.label,
    color: Brand.inkSoft,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  switches: {
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.lg,
    backgroundColor: Brand.surfaceMuted,
    paddingHorizontal: Space.md,
  },
  switchRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  switchText: {
    ...Type.body,
    color: Brand.inkSoft,
  },
  blockedWrap: {
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
  },
  blockedIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Brand.redTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedTitle: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  blockedText: {
    ...Type.body,
    color: Brand.slate,
    textAlign: 'center',
    lineHeight: 21,
  },
});
