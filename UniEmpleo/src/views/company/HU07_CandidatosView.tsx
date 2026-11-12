import React, { useEffect, useState } from 'react';
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
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { Application, ApplicationStatus, JobOffer } from '@/data/mock-data';

interface CandidatosViewProps {
  jobs: JobOffer[];
  onLoadApplicants: (jobId: string) => Promise<Application[]>;
  onUpdateApplicationStatus: (
    appId: string,
    newStatus: ApplicationStatus,
    companyNotes?: string,
    interviewNote?: string
  ) => Promise<void>;
}

export const HU07_CandidatosView: React.FC<CandidatosViewProps> = ({
  jobs,
  onLoadApplicants,
  onUpdateApplicationStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(
    jobs[0]?.id || ''
  );
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

  // Estados del modal de gestión
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('reviewed');
  const [companyNotes, setCompanyNotes] = useState('');
  const [interviewNote, setInterviewNote] = useState('');
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicantReloadKey, setApplicantReloadKey] = useState(0);

  const jobApplications = applications.filter((app) => app.jobId === selectedJobId);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  useEffect(() => {
    if (!selectedJobId) return;
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return undefined;
        setApplications([]);
        setLoadError(null);
        setIsLoadingApplicants(true);
        return onLoadApplicants(selectedJobId);
      })
      .then((items) => {
        if (!cancelled && items) setApplications(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : 'No fue posible cargar los candidatos.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingApplicants(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicantReloadKey, onLoadApplicants, selectedJobId]);

  const handleOpenManageModal = (app: Application) => {
    setActiveApplication(app);
    setNewStatus(app.status);
    setCompanyNotes(app.companyNotes || '');
    setInterviewNote(app.interviewNote || '');
    setStatusUpdatedSuccess(null);
  };

  const handleSaveStatus = async () => {
    if (!activeApplication) return;
    setActionError(null);
    setIsSavingStatus(true);
    try {
      await onUpdateApplicationStatus(
        activeApplication.id,
        newStatus,
        companyNotes.trim(),
        newStatus === 'interview' ? interviewNote.trim() : undefined,
      );
      setApplications((current) =>
        current.map((application) =>
          application.id === activeApplication.id
            ? {
                ...application,
                status: newStatus,
                companyNotes: companyNotes.trim(),
                interviewNote:
                  newStatus === 'interview' ? interviewNote.trim() : application.interviewNote,
              }
            : application,
        ),
      );
      setStatusUpdatedSuccess(`El estado se actualizó a "${newStatus}".`);
      setTimeout(() => {
        setActiveApplication(null);
        setStatusUpdatedSuccess(null);
      }, 900);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No fue posible actualizar la postulación.');
    } finally {
      setIsSavingStatus(false);
    }
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
              accessibilityRole="button"
              accessibilityState={{ selected: selectedJobId === job.id }}
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

      {loadError && (
        <View style={styles.loadError}>
          <Text style={styles.loadErrorText}>{loadError}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={() => setApplicantReloadKey((current) => current + 1)}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoadingApplicants ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Cargando candidatos"
          style={styles.loadingState}>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={`candidate-skeleton-${index}`} style={styles.candidateSkeleton}>
              <View style={styles.candidateSkeletonHeader}>
                <SkeletonBlock style={styles.candidateSkeletonAvatar} />
                <View style={styles.candidateSkeletonCopy}>
                  <SkeletonBlock style={styles.candidateSkeletonName} />
                  <SkeletonBlock style={styles.candidateSkeletonMeta} />
                </View>
              </View>
              <SkeletonBlock style={styles.candidateSkeletonLine} />
              <SkeletonBlock style={styles.candidateSkeletonLineShort} />
            </View>
          ))}
        </View>
      ) : (
      /* Listado de Candidatos */
      <FlatList
        data={jobApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loadError ? undefined : (
            <EmptyState
              icon="👥"
              title={selectedJob ? 'Sin postulantes todavía' : 'No tienes vacantes'}
              description={
                selectedJob
                  ? 'Los estudiantes que se postulen a esta vacante aparecerán en esta lista para su evaluación.'
                  : 'Cuando publiques una vacante, sus candidatos aparecerán aquí.'
              }
            />
          )
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
      )}

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

                {actionError && (
                  <View style={styles.errorAlert}>
                    <Text style={styles.errorAlertText}>{actionError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveActionBtn, isSavingStatus && styles.disabledButton]}
                  disabled={isSavingStatus}
                  onPress={() => void handleSaveStatus()}>
                  <Text style={styles.saveActionText}>
                    {isSavingStatus ? 'Guardando…' : 'Guardar evaluación'}
                  </Text>
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
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    backgroundColor: '#F4F5F7',
  },
  jobSelectorArea: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
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
    backgroundColor: '#F4F5F7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  jobTabActive: {
    backgroundColor: '#00963F',
    borderColor: '#00963F',
  },
  jobTabText: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#E6F7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F7ED',
  },
  loadingState: {
    gap: 12,
    padding: 16,
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },
  candidateSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  candidateSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  candidateSkeletonAvatar: { width: 38, height: 38, borderRadius: 19 },
  candidateSkeletonCopy: { flex: 1, gap: 6 },
  candidateSkeletonName: { width: '46%', height: 14 },
  candidateSkeletonMeta: { width: '32%', height: 10 },
  candidateSkeletonLine: { width: '84%', height: 10 },
  candidateSkeletonLineShort: { width: '56%', height: 10 },
  loadError: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
  },
  loadErrorText: {
    color: '#991B1B',
    fontSize: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 6,
  },
  retryText: {
    color: '#10235F',
    fontWeight: '700',
    fontSize: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00963F',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#007832',
    marginTop: 2,
  },
  listContent: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
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
    backgroundColor: '#00963F',
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
    color: '#1A1F36',
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
    borderTopColor: '#F4F5F7',
  },
  appliedDateText: {
    fontSize: 11,
    color: '#6B7280',
  },
  cvFileText: {
    fontSize: 11,
    color: '#00963F',
    fontWeight: '600',
  },
  notesPreviewBox: {
    backgroundColor: '#F4F5F7',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  notesPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
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
    color: '#00963F',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
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
  modalCandidateName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F36',
    marginTop: 6,
  },
  modalCandidateSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    color: '#991B1B',
    fontSize: 10,
    lineHeight: 14,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1F36',
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
    backgroundColor: '#F4F5F7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusSelectBtnActive: {
    backgroundColor: '#00963F',
    borderColor: '#00963F',
  },
  statusSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
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
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#1A1F36',
  },
  saveActionBtn: {
    backgroundColor: '#00963F',
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
    backgroundColor: '#E6F7ED',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  successAlertText: {
    color: '#007832',
    fontSize: 11,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
