import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { Application, ApplicationStatus, JobOffer } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { InfoRow } from '@/components/ui/info-row';
import { pluralize } from '@/lib/format';

interface CandidatosViewProps {
  jobs: JobOffer[];
  onLoadApplicants: (jobId: string) => Promise<Application[]>;
  onUpdateApplicationStatus: (
    appId: string,
    newStatus: ApplicationStatus,
    companyNotes?: string,
    interviewNote?: string,
  ) => Promise<void>;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; icon: IconName }[] = [
  { value: 'reviewed', label: 'Revisado', icon: 'eye-outline' },
  { value: 'interview', label: 'Entrevista', icon: 'calendar-outline' },
  { value: 'accepted', label: 'Aceptar', icon: 'checkmark-circle-outline' },
  { value: 'rejected', label: 'Rechazar', icon: 'close-circle-outline' },
];

export const HU07_CandidatosView: React.FC<CandidatosViewProps> = ({
  jobs,
  onLoadApplicants,
  onUpdateApplicationStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);

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
  const selectedJob = jobs.find((job) => job.id === selectedJobId);

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
    setActionError(null);
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
      setActionError(
        error instanceof Error ? error.message : 'No fue posible actualizar la postulación.',
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={jobApplications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeader
              overline="Selección"
              title="Candidatos"
              subtitle="Evalúa a los estudiantes postulados y registra el avance del proceso."
            />

            {jobs.length === 0 ? null : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.jobTabs}>
                {jobs.map((job) => {
                  const isActive = selectedJobId === job.id;
                  return (
                    <Pressable
                      key={job.id}
                      accessibilityRole="tab"
                      accessibilityLabel={job.title}
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setSelectedJobId(job.id)}
                      style={({ pressed }) => [
                        styles.jobTab,
                        isActive && styles.jobTabActive,
                        pressed && styles.pressed,
                      ]}>
                      <Text
                        style={[styles.jobTabText, isActive && styles.jobTabTextActive]}
                        numberOfLines={1}>
                        {job.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            {selectedJob ? (
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Icon name="briefcase-outline" size={18} color={Brand.greenDark} />
                </View>
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle} numberOfLines={1}>
                    {selectedJob.title}
                  </Text>
                  <Text style={styles.summaryMeta}>
                    {selectedJob.modality} · {selectedJob.contractType} ·{' '}
                    {pluralize(jobApplications.length, 'candidato', 'candidatos')}
                  </Text>
                </View>
              </View>
            ) : null}

            {loadError ? (
              <Notice
                tone="error"
                message={loadError}
                actionLabel="Reintentar"
                onAction={() => setApplicantReloadKey((current) => current + 1)}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoadingApplicants ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Cargando candidatos"
              style={styles.listContentSkeleton}>
              {Array.from({ length: 3 }, (_, index) => (
                <View key={`candidate-skeleton-${index}`} style={styles.skeletonCard}>
                  <View style={styles.skeletonHeader}>
                    <SkeletonBlock style={styles.skeletonAvatar} />
                    <View style={styles.skeletonCopy}>
                      <SkeletonBlock style={styles.skeletonName} />
                      <SkeletonBlock style={styles.skeletonMeta} />
                    </View>
                  </View>
                  <SkeletonBlock style={styles.skeletonLine} />
                  <SkeletonBlock style={styles.skeletonLineShort} />
                </View>
              ))}
            </View>
          ) : loadError ? undefined : (
            <EmptyState
              icon="people-outline"
              title={selectedJob ? 'Sin postulantes todavía' : 'No tienes vacantes'}
              description={
                selectedJob
                  ? 'Los estudiantes que se postulen a esta vacante aparecerán aquí para su evaluación.'
                  : 'Cuando publiques una vacante, sus candidatos aparecerán aquí.'
              }
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Evaluar a ${item.studentName}`}
            onPress={() => handleOpenManageModal(item)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.cardTop}>
              <Avatar name={item.studentName} size={42} tone="navy" />
              <View style={styles.cardTopCopy}>
                <Text style={styles.candidateName}>{item.studentName}</Text>
                <Text style={styles.candidateProgram} numberOfLines={1}>
                  {item.studentProgram}
                </Text>
              </View>
              <StatusBadge status={item.status} size="small" />
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icon name="calendar-outline" size={13} color={Brand.slateSoft} />
                <Text style={styles.detailText}>{item.appliedAt}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="document-text-outline" size={13} color={Brand.greenDark} />
                <Text style={styles.cvText} numberOfLines={1}>
                  {item.cvFileName}
                </Text>
              </View>
            </View>

            {item.companyNotes ? (
              <View style={styles.notesPreview}>
                <Icon name="lock-closed-outline" size={12} color={Brand.slateSoft} />
                <Text style={styles.notesPreviewText} numberOfLines={1}>
                  {item.companyNotes}
                </Text>
              </View>
            ) : null}

            <View style={styles.cardAction}>
              <Text style={styles.manageHint}>Evaluar candidato</Text>
              <Icon name="arrow-forward" size={14} color={Brand.greenDark} />
            </View>
          </Pressable>
        )}
      />

      <Sheet
        visible={activeApplication !== null}
        onClose={() => setActiveApplication(null)}
        title={activeApplication?.studentName}
        subtitle={
          activeApplication
            ? `${activeApplication.studentProgram} · ${activeApplication.jobTitle}`
            : undefined
        }
        icon="person-circle-outline"
        closeLabel="Cerrar gestión de candidato"
        footer={
          <Button
            label={isSavingStatus ? 'Guardando…' : 'Guardar evaluación'}
            onPress={() => void handleSaveStatus()}
            loading={isSavingStatus}
            size="lg"
            iconRight="checkmark"
            fullWidth
          />
        }>
        {activeApplication ? (
          <>
            <View style={styles.infoCard}>
              <InfoRow
                icon="calendar-outline"
                label="Fecha de postulación"
                value={activeApplication.appliedAt}
              />
              <InfoRow
                icon="mail-outline"
                label="Correo"
                value={activeApplication.studentEmail}
                last
              />
            </View>

            <Text style={styles.sectionLabel}>Actualizar estado del proceso</Text>
            <View style={styles.statusGrid}>
              {STATUS_OPTIONS.map((option) => {
                const isSelected = newStatus === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setNewStatus(option.value)}
                    style={({ pressed }) => [
                      styles.statusOption,
                      isSelected && styles.statusOptionActive,
                      pressed && styles.pressed,
                    ]}>
                    <Icon
                      name={isSelected ? 'radio-button-on' : option.icon}
                      size={isSelected ? 18 : 16}
                      color={isSelected ? Brand.greenDark : Brand.slateSoft}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        isSelected && styles.statusOptionTextActive,
                      ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {newStatus === 'interview' ? (
              <TextField
                label="Citación a entrevista"
                hint="Este mensaje sí es visible para el estudiante."
                value={interviewNote}
                onChangeText={setInterviewNote}
                placeholder="Ej. Entrevista técnica el viernes a las 3:00 PM."
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            ) : null}

            <TextField
              label="Notas internas"
              hint="Confidencial: el estudiante no puede ver este campo."
              value={companyNotes}
              onChangeText={setCompanyNotes}
              placeholder="Fortalezas, dudas o expectativas salariales del candidato."
              multiline
              numberOfLines={3}
              maxLength={1000}
              icon="lock-closed-outline"
            />

            {statusUpdatedSuccess ? (
              <Notice tone="success" message={statusUpdatedSuccess} />
            ) : null}
            {actionError ? (
              <Notice tone="error" message={actionError} onDismiss={() => setActionError(null)} />
            ) : null}
          </>
        ) : null}
      </Sheet>
    </View>
  );
};

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
  jobTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  jobTab: {
    maxWidth: 230,
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.surface,
  },
  jobTabActive: {
    backgroundColor: Brand.navy,
    borderColor: Brand.navy,
  },
  jobTabText: {
    ...Type.label,
    color: Brand.slate,
  },
  jobTabTextActive: {
    color: Brand.surface,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
  },
  summaryCopy: {
    flex: 1,
    gap: 1,
  },
  summaryTitle: {
    ...Type.bodyStrong,
    color: Brand.greenDeep,
  },
  summaryMeta: {
    ...Type.caption,
    fontSize: 11,
    color: '#39724E',
  },
  listContentSkeleton: {
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    gap: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonAvatar: { width: 42, height: 42, borderRadius: 21 },
  skeletonCopy: { flex: 1, gap: 6 },
  skeletonName: { width: '46%', height: 14 },
  skeletonMeta: { width: '32%', height: 10 },
  skeletonLine: { width: '84%', height: 10 },
  skeletonLineShort: { width: '56%', height: 10 },
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
    gap: 2,
  },
  candidateName: {
    ...Type.heading,
    color: Brand.ink,
  },
  candidateProgram: {
    ...Type.caption,
    color: Brand.slate,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    paddingTop: Space.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  detailText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  cvText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.greenDark,
    fontWeight: '600',
    maxWidth: 180,
  },
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surfaceMuted,
  },
  notesPreviewText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
    fontStyle: 'italic',
    flex: 1,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
  },
  manageHint: {
    ...Type.label,
    color: Brand.greenDark,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    paddingHorizontal: Space.md,
  },
  sectionLabel: {
    ...Type.heading,
    color: Brand.ink,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minWidth: '47%',
    flexGrow: 1,
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.surface,
  },
  statusOptionActive: {
    borderColor: Brand.greenLine,
    backgroundColor: Brand.greenTint,
  },
  statusOptionText: {
    ...Type.label,
    color: Brand.slate,
  },
  statusOptionTextActive: {
    color: Brand.greenDeep,
    fontWeight: '800',
  },
});
