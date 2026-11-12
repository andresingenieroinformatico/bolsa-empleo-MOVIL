import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import {
  CompanyProfile,
  ContractType,
  JobModality,
  JobOffer,
} from '@/data/mock-data';

const JOB_MODALITIES: JobModality[] = ['Presencial', 'Remoto', 'Híbrido'];
const CONTRACT_TYPES: ContractType[] = [
  'Medio tiempo',
  'Por horas',
  'Prácticas',
  'Tiempo completo',
];

interface MisVacantesViewProps {
  company: CompanyProfile;
  jobs: JobOffer[];
  onAddJob: (newJob: JobOffer) => Promise<void>;
  onUpdateJob: (updatedJob: JobOffer) => Promise<void>;
  onToggleJobStatus: (jobId: string) => Promise<void>;
}

export const HU03_MisVacantesView: React.FC<MisVacantesViewProps> = ({
  company,
  jobs,
  onAddJob,
  onUpdateJob,
  onToggleJobStatus,
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
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

  // Filtrar solo las vacantes de esta empresa
  const companyJobs = jobs.filter((j) => j.companyId === company.id);

  const handleOpenCreateModal = () => {
    // Criterio HU-03 Escenario 2: Empresa no aprobada intenta publicar
    if (company.status !== 'approved') {
      setFormError(
        'Acceso denegado: Tu empresa está en estado "' +
          company.status +
          '". Debes ser aprobada por la administración de UNIPAZ antes de publicar vacantes.'
      );
      setShowFormModal(true);
      return;
    }

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
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

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
      <View style={styles.topBar}>
      <View style={styles.topBarCopy}>
          <Text style={styles.heading}>Mis Vacantes Publicadas</Text>
          <Text style={styles.subheading}>
            {companyJobs.length} ofertas registradas para estudiantes UNIPAZ
          </Text>
        </View>
        {actionError && <Text style={styles.actionError}>{actionError}</Text>}

        <TouchableOpacity
          style={styles.newJobBtn}
          activeOpacity={0.85}
          onPress={handleOpenCreateModal}>
          <Text style={styles.newJobBtnText}>+ Publicar Vacante</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={companyJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="💼"
            title="Aún no has publicado vacantes"
            description="Crea tu primera oferta laboral para recibir postulaciones de estudiantes de UNIPAZ."
            actionLabel="+ Crear mi primera vacante"
            onAction={handleOpenCreateModal}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.jobCard}>
            <View style={styles.jobCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobMeta}>
                  {item.modality} · {item.contractType} · {item.program}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>
            {item.salaryRange ? (
              <Text style={styles.salaryLabel}>
                Salario: {item.salaryRange}
                {item.salaryNegotiable ? ' · Negociable' : ''}
              </Text>
            ) : null}

            <View style={styles.jobFooter}>
              <Text style={styles.deadlineLabel}>📅 Vence: {item.deadline}</Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.toggleBtn}
                  disabled={updatingJobId === item.id}
                  onPress={() => void handleToggleJob(item.id)}>
                  <Text style={styles.toggleBtnText}>
                    {updatingJobId === item.id
                      ? 'Actualizando…'
                      : item.status === 'active' ? 'Pausar' : 'Activar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEditModal(item)}>
                  <Text style={styles.editBtnText}>✏️ Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal de Publicar / Editar Vacante (HU-03) */}
      <Modal
        visible={showFormModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFormModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.tag}>HU-03 · Publicación de Vacante</Text>
              <TouchableOpacity
                onPress={() => setShowFormModal(false)}
                style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>
              {editingJob ? 'Editar Vacante' : 'Nueva Vacante'}
            </Text>

            {company.status !== 'approved' && !editingJob ? (
              // Criterio Escenario 2: Empresa pending bloqueada
              <View style={styles.deniedBox}>
                <Text style={styles.deniedTitle}>🚫 Publicación Bloqueada</Text>
                <Text style={styles.deniedText}>
                  Tu empresa se encuentra en estado &quot;{company.status}&quot;. Para garantizar la formalidad a los estudiantes de UNIPAZ, el administrador debe aprobar tu cuenta primero.
                </Text>
                <TouchableOpacity
                  style={styles.closeDeniedBtn}
                  onPress={() => setShowFormModal(false)}>
                  <Text style={styles.closeDeniedText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 520 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Título de la vacante *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Desarrollador Junior React Native"
                    maxLength={200}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Descripción del cargo *</Text>
                  <TextInput
                    style={[styles.input, { height: 70 }]}
                    multiline
                    placeholder="Detalla las responsabilidades principales..."
                    maxLength={5000}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Requisitos (uno por línea) *</Text>
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    multiline
                    placeholder="TypeScript básico&#10;Disponibilidad en las tardes"
                    maxLength={3000}
                    value={requirementsText}
                    onChangeText={setRequirementsText}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Responsabilidades *</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    maxLength={3000}
                    placeholder="Describe las funciones del cargo"
                    value={responsibilities}
                    onChangeText={setResponsibilities}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Área profesional *</Text>
                  <TextInput
                    style={styles.input}
                    maxLength={100}
                    placeholder="Tecnología, logística, producción..."
                    value={area}
                    onChangeText={setArea}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Programas objetivo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingeniería Informática"
                    value={program}
                    onChangeText={setProgram}
                  />
                </View>

                <ChoiceRow
                  label="Modalidad"
                  value={modality}
                  options={JOB_MODALITIES}
                  onChange={setModality}
                />
                <ChoiceRow
                  label="Tipo de contrato"
                  value={contractType}
                  options={CONTRACT_TYPES}
                  onChange={setContractType}
                />

                <View style={styles.rowFields}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Fecha límite (AAAA-MM-DD) *</Text>
                    <TextInput
                      style={styles.input}
                      value={deadline}
                      onChangeText={setDeadline}
                      placeholder="AAAA-MM-DD"
                      maxLength={10}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Ubicación *</Text>
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Barrancabermeja"
                    />
                  </View>
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Horario</Text>
                    <TextInput
                      style={styles.input}
                      maxLength={100}
                      placeholder="Lunes a viernes, 8:00 a 17:00"
                      value={schedule}
                      onChangeText={setSchedule}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Vacantes disponibles *</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={positions}
                      onChangeText={setPositions}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Salario o rango (opcional)</Text>
                  <TextInput
                    style={styles.input}
                    maxLength={100}
                    placeholder="Ej. $2.000.000 COP o A convenir"
                    value={salaryRange}
                    onChangeText={setSalaryRange}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Salario negociable</Text>
                  <Switch
                    accessibilityLabel="Salario negociable"
                    value={salaryNegotiable}
                    onValueChange={setSalaryNegotiable}
                    trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                    thumbColor={salaryNegotiable ? '#007832' : '#FFFFFF'}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.inputLabel}>Requiere hoja de vida</Text>
                  <Switch
                    accessibilityLabel="Requiere hoja de vida"
                    value={requiresCv}
                    onValueChange={setRequiresCv}
                    trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                    thumbColor={requiresCv ? '#007832' : '#FFFFFF'}
                  />
                </View>

                {formError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {formError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.disabledButton]}
                  disabled={isSaving}
                  onPress={() => void handleSaveJob()}>
                  <Text style={styles.saveBtnText}>
                    {isSaving ? 'Guardando…' : editingJob ? 'Guardar cambios' : 'Publicar vacante'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    backgroundColor: '#F4F5F7',
  },
  topBar: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBarCopy: { flex: 1, minWidth: 190 },
  heading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1F36',
  },
  subheading: {
    fontSize: 12,
    color: '#6B7280',
  },
  newJobBtn: {
    backgroundColor: '#00963F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  newJobBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1F36',
  },
  jobMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  salaryLabel: {
    color: '#007832',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
    paddingTop: 10,
  },
  deadlineLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00963F',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F36',
    marginTop: 6,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 10,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceGroup: {
    marginBottom: 10,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  choiceActive: {
    borderColor: '#00963F',
    backgroundColor: '#E6F7ED',
  },
  choiceText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#007832',
  },
  switchRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1A1F36',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#00963F',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionError: {
    color: '#991B1B',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 11,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600',
  },
  deniedBox: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  deniedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
  },
  deniedText: {
    fontSize: 13,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  closeDeniedBtn: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeDeniedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

interface ChoiceRowProps<Value extends string> {
  label: string;
  value: Value;
  options: Value[];
  onChange: (value: Value) => void;
}

function ChoiceRow<Value extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceRowProps<Value>) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.inputLabel}>{label} *</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <TouchableOpacity
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option)}
              style={[styles.choice, isSelected && styles.choiceActive]}>
              <Text style={[styles.choiceText, isSelected && styles.choiceTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
