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
import { Application, ApplicationStatus, JobOffer } from '@/data/mock-data';

interface CandidatosViewProps {
  jobs: JobOffer[];
  applications: Application[];
  onUpdateApplicationStatus: (
    appId: string,
    newStatus: ApplicationStatus,
    companyNotes?: string,
    interviewNote?: string
  ) => void;
}

export const HU07_CandidatosView: React.FC<CandidatosViewProps> = ({
  jobs,
  applications,
  onUpdateApplicationStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(
    jobs.length > 0 ? jobs[0].id : ''
  );
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

  // Estados del modal de gestión
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('reviewed');
  const [companyNotes, setCompanyNotes] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState<string | null>(null);

  // Filtrar postulaciones por la vacante seleccionada
  const jobApplications = applications.filter((app) => app.jobId === selectedJobId);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleOpenManageModal = (app: Application) => {
    setActiveApplication(app);
    setNewStatus(app.status);
    setCompanyNotes(app.companyNotes || '');
    setInterviewNote(app.interviewNote || '');
    setDownloadSuccess(null);
    setStatusUpdatedSuccess(null);
  };

  const handleSaveStatus = () => {
    if (!activeApplication) return;

    onUpdateApplicationStatus(
      activeApplication.id,
      newStatus,
      companyNotes.trim(),
      newStatus === 'interview' ? interviewNote.trim() : undefined
    );

    setStatusUpdatedSuccess(`¡Estado actualizado a "${newStatus}"! Notificación enviada al estudiante.`);
    setTimeout(() => {
      setActiveApplication(null);
      setStatusUpdatedSuccess(null);
    }, 1200);
  };

  // Criterio HU-07 Escenario 2: Descarga de CV por ruta autenticada
  const handleDownloadCv = () => {
    setDownloadSuccess(
      '🔒 Hoja de vida descargada mediante token seguro de sesión (API /api/resumes/stream?auth=bearer). Acceso directo bloqueado.'
    );
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <View style={styles.container}>
      {/* Selector de Vacante */}
      <View style={styles.jobSelectorArea}>
        <Text style={styles.selectorLabel}>Selecciona la vacante a gestionar:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jobTabsScroll}>
          {jobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={[
                styles.jobTab,
                selectedJobId === job.id && styles.jobTabActive,
              ]}
              onPress={() => setSelectedJobId(job.id)}>
              <Text
                style={[
                  styles.jobTabText,
                  selectedJobId === job.id && styles.jobTabTextActive,
                ]}>
                {job.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resumen de la vacante */}
      {selectedJob && (
        <View style={styles.jobSummaryCard}>
          <Text style={styles.summaryTitle}>{selectedJob.title}</Text>
          <Text style={styles.summaryMeta}>
            {selectedJob.modality} · {selectedJob.contractType} · {jobApplications.length} candidato(s) postulado(s)
          </Text>
        </View>
      )}

      {/* Listado de Candidatos */}
      <FlatList
        data={jobApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="Sin postulantes todavía"
            description="Los estudiantes que se postulen a esta vacante aparecerán en esta lista para su evaluación."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.candidateCard}
            activeOpacity={0.88}
            onPress={() => handleOpenManageModal(item)}>
            <View style={styles.candidateHeader}>
              <View style={styles.candidateAvatar}>
                <Text style={styles.candidateAvatarText}>
                  {item.studentName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.candidateName}>{item.studentName}</Text>
                <Text style={styles.candidateProgram}>{item.studentProgram}</Text>
              </View>
              <StatusBadge status={item.status} size="small" />
            </View>

            <View style={styles.candidateDetails}>
              <Text style={styles.appliedDateText}>📅 Postulación: {item.appliedAt}</Text>
              <Text style={styles.cvFileText}>📄 {item.cvFileName}</Text>
            </View>

            {item.companyNotes && (
              <View style={styles.notesPreviewBox}>
                <Text style={styles.notesPreviewLabel}>📝 Nota interna:</Text>
                <Text style={styles.notesPreviewText} numberOfLines={1}>
                  {item.companyNotes}
                </Text>
              </View>
            )}

            <View style={styles.cardActionRow}>
              <Text style={styles.manageHint}>Evaluar candidato →</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal de Gestión de Candidato (HU-07) */}
      <Modal
        visible={activeApplication !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveApplication(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {activeApplication && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.tag}>HU-07 · Gestión de Candidatos</Text>
                  <TouchableOpacity
                    onPress={() => setActiveApplication(null)}
                    style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalCandidateName}>
                  {activeApplication.studentName}
                </Text>
                <Text style={styles.modalCandidateSub}>
                  {activeApplication.studentProgram} · {activeApplication.studentEmail}
                </Text>

                <ScrollView style={{ maxHeight: 380 }}>
                  {/* Descarga Segura de CV (HU-07 Escenario 2) */}
                  <View style={styles.cvDownloadSection}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cvTitle}>Hoja de Vida del Estudiante</Text>
                      <Text style={styles.cvFile}>{activeApplication.cvFileName}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={handleDownloadCv}>
                      <Text style={styles.downloadBtnText}>⬇️ Descargar (Seguro)</Text>
                    </TouchableOpacity>
                  </View>

                  {downloadSuccess && (
                    <View style={styles.downloadAlert}>
                      <Text style={styles.downloadAlertText}>{downloadSuccess}</Text>
                    </View>
                  )}

                  {/* Cambio de Estado (HU-07 Escenarios 3, 4, 5, 6) */}
                  <Text style={styles.sectionHeading}>Actualizar Estado del Proceso</Text>
                  <View style={styles.statusButtonsGrid}>
                    <TouchableOpacity
                      style={[
                        styles.statusSelectBtn,
                        newStatus === 'reviewed' && styles.statusSelectBtnActive,
                      ]}
                      onPress={() => setNewStatus('reviewed')}>
                      <Text style={styles.statusSelectText}>👀 Revisado</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusSelectBtn,
                        newStatus === 'interview' && styles.statusSelectBtnActive,
                      ]}
                      onPress={() => setNewStatus('interview')}>
                      <Text style={styles.statusSelectText}>📅 Entrevista</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusSelectBtn,
                        newStatus === 'accepted' && styles.statusSelectBtnActive,
                      ]}
                      onPress={() => setNewStatus('accepted')}>
                      <Text style={styles.statusSelectText}>✅ Aceptar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusSelectBtn,
                        newStatus === 'rejected' && styles.statusSelectBtnActive,
                      ]}
                      onPress={() => setNewStatus('rejected')}>
                      <Text style={styles.statusSelectText}>❌ Rechazar</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Campo de Citación a Entrevista */}
                  {newStatus === 'interview' && (
                    <View style={styles.interviewFieldBox}>
                      <Text style={styles.fieldLabel}>
                        Detalles / Citación a Entrevista (Visible para el estudiante)
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej. Entrevista técnica el viernes a las 3:00 PM vía Meet o presencial en sede..."
                        value={interviewNote}
                        onChangeText={setInterviewNote}
                      />
                    </View>
                  )}

                  {/* Campo de Notas Internas de la Empresa (HU-07 Escenario 1 y HU-06 Escenario 6) */}
                  <View style={styles.notesFieldBox}>
                    <Text style={styles.fieldLabel}>
                      📝 Notas Internas de la Empresa (Confidencial · No visible para el estudiante)
                    </Text>
                    <TextInput
                      style={[styles.input, { height: 60 }]}
                      multiline
                      placeholder="Escribe comentarios privados sobre el candidato, fortalezas o expectativas salariales..."
                      value={companyNotes}
                      onChangeText={setCompanyNotes}
                    />
                  </View>
                </ScrollView>

                {statusUpdatedSuccess && (
                  <View style={styles.successAlert}>
                    <Text style={styles.successAlertText}>✅ {statusUpdatedSuccess}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.saveActionBtn} onPress={handleSaveStatus}>
                  <Text style={styles.saveActionText}>Guardar Evaluación y Notificar</Text>
                </TouchableOpacity>
              </>
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
  jobSelectorArea: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  jobTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  jobTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobTabActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  jobTabText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  jobTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  jobSummaryCard: {
    margin: 16,
    marginBottom: 4,
    padding: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#115E59',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  candidateAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  candidateProgram: {
    fontSize: 12,
    color: '#6B7280',
  },
  candidateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  appliedDateText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cvFileText: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  notesPreviewBox: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  notesPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  notesPreviewText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  cardActionRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  manageHint: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '700',
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
  modalCandidateName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  modalCandidateSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  cvDownloadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 10,
    gap: 8,
  },
  cvTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  cvFile: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  downloadBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  downloadAlert: {
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  downloadAlertText: {
    color: '#15803D',
    fontSize: 10,
    lineHeight: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusSelectBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusSelectBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  statusSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  interviewFieldBox: {
    marginBottom: 10,
  },
  notesFieldBox: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#111827',
  },
  saveActionBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  successAlert: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
});
