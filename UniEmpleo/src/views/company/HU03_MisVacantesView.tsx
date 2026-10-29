import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
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

interface MisVacantesViewProps {
  company: CompanyProfile;
  jobs: JobOffer[];
  onAddJob: (newJob: JobOffer) => void;
  onUpdateJob: (updatedJob: JobOffer) => void;
  onToggleJobStatus: (jobId: string) => void;
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
  const [program, setProgram] = useState('Ingeniería de Sistemas');
  const [modality, setModality] = useState<JobModality>('Presencial');
  const [contractType, setContractType] = useState<ContractType>('Medio tiempo');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [location, setLocation] = useState('Barrancabermeja');

  const [formError, setFormError] = useState<string | null>(null);

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
    setProgram('Ingeniería de Sistemas');
    setModality('Presencial');
    setContractType('Medio tiempo');
    setDeadline('2026-11-30');
    setLocation('Barrancabermeja');
    setFormError(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (job: JobOffer) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRequirementsText(job.requirements.join('\n'));
    setProgram(job.program);
    setModality(job.modality);
    setContractType(job.contractType);
    setDeadline(job.deadline);
    setLocation(job.location);
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSaveJob = () => {
    if (!title.trim() || !description.trim()) {
      setFormError('El título y la descripción son obligatorios.');
      return;
    }

    const requirements = requirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (editingJob) {
      // Criterio HU-03 Escenario 3: Edición de vacante
      const updated: JobOffer = {
        ...editingJob,
        title: title.trim(),
        description: description.trim(),
        requirements,
        program,
        modality,
        contractType,
        deadline,
        location,
      };
      onUpdateJob(updated);
    } else {
      // Criterio HU-03 Escenario 1: Creación de vacante activa
      const newJob: JobOffer = {
        id: `job-${Date.now()}`,
        companyId: company.id,
        companyName: company.name,
        title: title.trim(),
        description: description.trim(),
        requirements,
        area: 'Tecnología y Operaciones',
        program,
        modality,
        contractType,
        deadline,
        location,
        status: 'active',
        vacanciesCount: 1,
        requiresCv: true,
      };
      onAddJob(newJob);
    }

    setShowFormModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>Mis Vacantes Publicadas</Text>
          <Text style={styles.subheading}>
            {companyJobs.length} ofertas registradas para estudiantes UNIPAZ
          </Text>
        </View>

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

            <View style={styles.jobFooter}>
              <Text style={styles.deadlineLabel}>📅 Vence: {item.deadline}</Text>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => onToggleJobStatus(item.id)}>
                  <Text style={styles.toggleBtnText}>
                    {item.status === 'active' ? '⏸️ Pausar' : '▶️ Activar'}
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
                  Tu empresa se encuentra en estado "{company.status}". Para garantizar la formalidad a los estudiantes de UNIPAZ, el administrador debe aprobar tu cuenta primero.
                </Text>
                <TouchableOpacity
                  style={styles.closeDeniedBtn}
                  onPress={() => setShowFormModal(false)}>
                  <Text style={styles.closeDeniedText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Título de la vacante *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Desarrollador Junior React Native"
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
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Requisitos (uno por línea)</Text>
                  <TextInput
                    style={[styles.input, { height: 60 }]}
                    multiline
                    placeholder="TypeScript básico&#10;Disponibilidad en las tardes"
                    value={requirementsText}
                    onChangeText={setRequirementsText}
                  />
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Modalidad</Text>
                    <TextInput
                      style={styles.input}
                      value={modality}
                      onChangeText={(t) => setModality(t as JobModality)}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Contrato</Text>
                    <TextInput
                      style={styles.input}
                      value={contractType}
                      onChangeText={(t) => setContractType(t as ContractType)}
                    />
                  </View>
                </View>

                <View style={styles.rowFields}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Fecha Límite</Text>
                    <TextInput
                      style={styles.input}
                      value={deadline}
                      onChangeText={setDeadline}
                      placeholder="AAAA-MM-DD"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Ubicación</Text>
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>

                {formError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {formError}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveJob}>
                  <Text style={styles.saveBtnText}>
                    {editingJob ? 'Guardar Cambios' : 'Publicar Vacante'}
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
    backgroundColor: '#F3F4F6',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  subheading: {
    fontSize: 12,
    color: '#6B7280',
  },
  newJobBtn: {
    backgroundColor: '#0F766E',
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
    color: '#111827',
  },
  jobMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
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
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
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
    color: '#111827',
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#0F766E',
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
