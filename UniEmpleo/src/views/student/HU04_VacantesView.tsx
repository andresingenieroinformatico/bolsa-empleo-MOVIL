import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { Application, JobOffer, StudentProfile } from '@/data/mock-data';
import { ApiDocument, JobSearchFilters } from '@/services/api';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Avatar } from '@/components/ui/avatar';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { InfoRow } from '@/components/ui/info-row';
import { pluralize } from '@/lib/format';

interface VacantesViewProps {
  jobs: JobOffer[];
  student: StudentProfile;
  applications: Application[];
  isLoading: boolean;
  hasMoreJobs: boolean;
  onSearch: (filters: JobSearchFilters) => Promise<void>;
  onLoadMore: (filters: JobSearchFilters) => Promise<void>;
  onApply: (
    job: JobOffer,
    useProfileCv: boolean,
    customFile?: ApiDocument,
    coverLetter?: string,
  ) => Promise<void>;
}

const MODALITIES = ['Todas', 'Remoto', 'Presencial', 'Híbrido'];

export const HU04_VacantesView: React.FC<VacantesViewProps> = ({
  jobs,
  student,
  applications,
  isLoading,
  hasMoreJobs,
  onSearch,
  onLoadMore,
  onApply,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('Todas');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useProfileCv, setUseProfileCv] = useState(true);
  const [uploadedCv, setUploadedCv] = useState<ApiDocument | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const filteredJobs = jobs.filter((job) => job.status === 'active');
  const currentFilters: JobSearchFilters = {
    search: searchQuery,
    modality: selectedModality === 'Todas' ? undefined : selectedModality,
    location: locationQuery,
  };

  const isAlreadyApplied = (jobId: string) => {
    return applications.some((app) => app.jobId === jobId);
  };

  const handleSearch = async () => {
    setSearchError(null);
    try {
      await onSearch(currentFilters);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'No fue posible buscar vacantes.');
    }
  };

  const handleLoadMore = async () => {
    setSearchError(null);
    try {
      await onLoadMore(currentFilters);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'No fue posible cargar más vacantes.');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedModality('Todas');
    setLocationQuery('');
    setSearchError(null);
    void onSearch({});
  };

  const handleOpenJobDetail = (job: JobOffer) => {
    setSelectedJob(job);
    setApplyError(null);
    setApplySuccess(null);
    setUseProfileCv(true);
    setUploadedCv(null);
    setCoverLetter('');
  };

  const handleConfirmApply = async () => {
    if (!selectedJob) return;

    if (isAlreadyApplied(selectedJob.id)) {
      setApplyError('Ya te has postulado previamente a esta vacante. No se pueden crear postulaciones duplicadas.');
      return;
    }

    if (selectedJob.requiresCv && useProfileCv && !student.cvFile) {
      setApplyError('Primero sube una hoja de vida PDF desde la sección Mi perfil.');
      return;
    }

    if (selectedJob.requiresCv && !useProfileCv && !uploadedCv) {
      setApplyError('Esta vacante requiere hoja de vida. Selecciona el CV de tu perfil o adjunta un archivo.');
      return;
    }
    if (coverLetter.trim().length > 2000) {
      setApplyError('La carta de presentación no puede superar los 2.000 caracteres.');
      return;
    }

    setIsApplying(true);
    setApplyError(null);
    try {
      await onApply(selectedJob, useProfileCv, uploadedCv || undefined, coverLetter);
      setApplySuccess('Tu postulación fue recibida por el servidor.');
      setTimeout(() => {
        setShowApplyModal(false);
        setSelectedJob(null);
      }, 900);
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : 'No fue posible enviar la postulación.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleChooseCv = async () => {
    setApplyError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.mimeType !== 'application/pdf') {
        setApplyError('El archivo seleccionado no es un PDF.');
        return;
      }
      if (file.size !== undefined && file.size > 5 * 1024 * 1024) {
        setApplyError('El archivo seleccionado supera el tamaño máximo permitido de 5 MB.');
        return;
      }
      setUploadedCv({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        file: file.file,
      });
      setUseProfileCv(false);
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : 'No fue posible abrir los archivos.');
    }
  };

  const applied = selectedJob ? isAlreadyApplied(selectedJob.id) : false;

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Icon name="search-outline" size={19} color={Brand.slateSoft} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cargo, empresa o tecnología"
                  placeholderTextColor={Brand.slateFaint}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  onSubmitEditing={() => void handleSearch()}
                  accessibilityLabel="Buscar vacantes"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar búsqueda"
                    hitSlop={8}
                    onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={18} color={Brand.slateFaint} />
                  </Pressable>
                )}
              </View>

              <View style={styles.searchDivider} />

              <View style={styles.locationRow}>
                <View style={styles.locationField}>
                  <Icon name="location-outline" size={17} color={Brand.slateSoft} />
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Ciudad o ubicación"
                    placeholderTextColor={Brand.slateFaint}
                    value={locationQuery}
                    onChangeText={setLocationQuery}
                    returnKeyType="search"
                    onSubmitEditing={() => void handleSearch()}
                    accessibilityLabel="Ciudad o ubicación"
                  />
                </View>
                <Button
                  label={isLoading ? 'Buscando…' : 'Buscar'}
                  onPress={() => void handleSearch()}
                  icon="search"
                  size="sm"
                />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}>
              <Text style={styles.filterLabel}>Modalidad</Text>
              {MODALITIES.map((modality) => (
                <Chip
                  key={modality}
                  label={modality}
                  selected={selectedModality === modality}
                  tone="green"
                  onPress={() => setSelectedModality(modality)}
                />
              ))}
            </ScrollView>

            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                {pluralize(filteredJobs.length, 'vacante disponible', 'vacantes disponibles')}
              </Text>
              {(searchQuery || locationQuery || selectedModality !== 'Todas') && (
                <Pressable accessibilityRole="button" onPress={handleClearFilters} hitSlop={6}>
                  <Text style={styles.clearFilters}>Limpiar filtros</Text>
                </Pressable>
              )}
            </View>

            {searchError ? <Notice tone="error" message={searchError} /> : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Cargando vacantes"
              style={styles.loadingState}>
              {Array.from({ length: 3 }, (_, index) => (
                <View key={`job-skeleton-${index}`} style={styles.skeletonCard}>
                  <View style={styles.skeletonHeader}>
                    <SkeletonBlock style={styles.skeletonCompany} />
                    <SkeletonBlock style={styles.skeletonBadge} />
                  </View>
                  <SkeletonBlock style={styles.skeletonTitle} />
                  <SkeletonBlock style={styles.skeletonDescription} />
                  <SkeletonBlock style={styles.skeletonFooter} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="No hay vacantes para mostrar"
              description="No encontramos ofertas que coincidan con tu búsqueda. Prueba con otros filtros o vuelve más tarde."
              actionLabel="Limpiar filtros"
              onAction={handleClearFilters}
            />
          )
        }
        ListFooterComponent={
          hasMoreJobs ? (
            isLoading ? (
              <View accessibilityRole="progressbar" accessibilityLabel="Cargando más vacantes">
                <SkeletonBlock style={styles.skeletonLoadMore} />
              </View>
            ) : (
              <Button
                label="Cargar más vacantes"
                variant="secondary"
                onPress={() => void handleLoadMore()}
                icon="chevron-down"
                fullWidth
              />
            )
          ) : filteredJobs.length > 0 ? (
            <Text style={styles.listEnd}>Has visto todas las vacantes disponibles.</Text>
          ) : undefined
        }
        renderItem={({ item }) => {
          const alreadyApplied = isAlreadyApplied(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title} en ${item.companyName}`}
              onPress={() => handleOpenJobDetail(item)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <View style={styles.cardTop}>
                <Avatar name={item.companyName} size={42} tone="green" />
                <View style={styles.cardTopCopy}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {item.companyName}
                  </Text>
                  <Text style={styles.jobTitle}>{item.title}</Text>
                </View>
                <StatusBadge
                  status={alreadyApplied ? 'pending' : 'active'}
                  label={alreadyApplied ? 'Postulado' : item.modality}
                  size="small"
                />
              </View>

              <Text style={styles.descriptionSnippet} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.metaRow}>
                <JobMeta icon="school-outline" label={item.program} />
                <JobMeta icon="briefcase-outline" label={item.contractType} />
                <JobMeta icon="location-outline" label={item.location} />
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerMeta}>
                  <Icon name="calendar-outline" size={13} color={Brand.slateSoft} />
                  <Text style={styles.deadline}>Cierra {item.deadline}</Text>
                </View>
                <View style={styles.detailLink}>
                  <Text style={styles.detailLinkText}>Ver detalle</Text>
                  <Icon name="arrow-forward" size={14} color={Brand.greenDark} />
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <Sheet
        visible={selectedJob !== null && !showApplyModal}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title}
        subtitle={selectedJob?.companyName}
        icon="briefcase-outline"
        closeLabel="Cerrar detalle de la vacante"
        footer={
          selectedJob ? (
            applied ? (
              <Notice
                tone="success"
                message="Ya estás postulado a esta vacante. Puedes seguir el proceso desde Postulaciones."
              />
            ) : (
              <Button
                label="Postularme a esta vacante"
                onPress={() => setShowApplyModal(true)}
                size="lg"
                iconRight="arrow-forward"
                fullWidth
              />
            )
          ) : null
        }>
        {selectedJob ? (
          <>
            <View style={styles.badgeRow}>
              <StatusBadge status="active" label={selectedJob.modality} />
              <StatusBadge status="pending" label={selectedJob.contractType} />
            </View>

            <Text style={styles.sheetSectionTitle}>Descripción del cargo</Text>
            <Text style={styles.bodyText}>{selectedJob.description}</Text>

            <Text style={styles.sheetSectionTitle}>Requisitos</Text>
            <View style={styles.reqList}>
              {selectedJob.requirements.map((req, idx) => (
                <View key={idx} style={styles.reqItem}>
                  <Icon name="checkmark-circle" size={16} color={Brand.green} />
                  <Text style={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sheetSectionTitle}>Detalles de la oferta</Text>
            <View style={styles.infoCard}>
              <InfoRow icon="location-outline" label="Ubicación" value={selectedJob.location} />
              <InfoRow icon="calendar-outline" label="Cierre" value={selectedJob.deadline} />
              <InfoRow
                icon="document-text-outline"
                label="Hoja de vida"
                value={selectedJob.requiresCv ? 'Obligatoria (PDF, máx. 5 MB)' : 'No obligatoria'}
                last
              />
            </View>
          </>
        ) : null}
      </Sheet>

      <Sheet
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Confirmar postulación"
        subtitle={
          selectedJob ? `${selectedJob.title} · ${selectedJob.companyName}` : undefined
        }
        icon="send-outline"
        closeLabel="Cerrar postulación"
        footer={
          <Button
            label={isApplying ? 'Enviando…' : 'Enviar mi postulación'}
            onPress={() => void handleConfirmApply()}
            loading={isApplying}
            size="lg"
            iconRight="send"
            fullWidth
          />
        }>
        <Text style={styles.sheetSectionTitle}>Hoja de vida</Text>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: useProfileCv }}
          onPress={() => {
            setUseProfileCv(true);
            setUploadedCv(null);
            setApplyError(null);
          }}
          style={[styles.cvOption, useProfileCv && styles.cvOptionActive]}>
          <Icon
            name={useProfileCv ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={useProfileCv ? Brand.greenDark : Brand.slateFaint}
          />
          <View style={styles.cvOptionCopy}>
            <Text style={styles.cvOptionTitle}>Usar el CV de mi perfil</Text>
            <Text style={styles.cvOptionDesc}>
              {student.cvFile?.name || 'Aún no has cargado una hoja de vida'}
              {student.cvFile?.sizeMb ? ` · ${student.cvFile.sizeMb} MB` : ''}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: !useProfileCv }}
          onPress={() => {
            setUseProfileCv(false);
            setApplyError(null);
          }}
          style={[styles.cvOption, !useProfileCv && styles.cvOptionActive]}>
          <Icon
            name={!useProfileCv ? 'radio-button-on' : 'radio-button-off'}
            size={20}
            color={!useProfileCv ? Brand.greenDark : Brand.slateFaint}
          />
          <View style={styles.cvOptionCopy}>
            <Text style={styles.cvOptionTitle}>Adjuntar otra hoja de vida</Text>
            <Text style={styles.cvOptionDesc}>
              {uploadedCv
                ? `Seleccionado: ${uploadedCv.name}`
                : 'Selecciona un archivo PDF (máximo 5 MB)'}
            </Text>
          </View>
        </Pressable>

        {!useProfileCv ? (
          <Button
            label={uploadedCv ? 'Elegir otro PDF' : 'Seleccionar PDF'}
            variant="tonal"
            size="sm"
            icon="cloud-upload-outline"
            onPress={() => void handleChooseCv()}
          />
        ) : null}

        <TextField
          label="Carta de presentación"
          optionalLabel={`${coverLetter.length}/2000`}
          value={coverLetter}
          onChangeText={setCoverLetter}
          placeholder="Cuéntale a la empresa por qué te interesa esta oportunidad."
          multiline
          maxLength={2000}
          numberOfLines={4}
        />

        {applyError ? (
          <Notice tone="error" message={applyError} onDismiss={() => setApplyError(null)} />
        ) : null}

        {applySuccess ? <Notice tone="success" message={applySuccess} /> : null}
      </Sheet>
    </View>
  );
};

function JobMeta({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={13} color={Brand.slateSoft} />
      <Text style={styles.metaText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
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
  searchCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.md,
    gap: Space.sm,
    ...Shadows.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 2,
  },
  searchInput: {
    flex: 1,
    ...Type.body,
    color: Brand.ink,
    paddingVertical: 8,
  },
  searchDivider: {
    height: 1,
    backgroundColor: Brand.lineSoft,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceMuted,
  },
  locationInput: {
    flex: 1,
    ...Type.body,
    fontSize: 13,
    color: Brand.ink,
    paddingVertical: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  filterLabel: {
    ...Type.label,
    color: Brand.slateSoft,
    marginRight: 2,
  },
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resultsText: {
    ...Type.caption,
    color: Brand.slate,
  },
  clearFilters: {
    ...Type.label,
    color: Brand.greenDark,
  },
  loadingState: {
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    gap: 10,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonCompany: { width: '34%', height: 10 },
  skeletonBadge: { width: 76, height: 22, borderRadius: 12 },
  skeletonTitle: { width: '68%', height: 16 },
  skeletonDescription: { width: '92%', height: 12 },
  skeletonFooter: { width: '48%', height: 10, marginTop: 4 },
  skeletonLoadMore: {
    height: 44,
    borderRadius: Radius.lg,
  },
  listEnd: {
    ...Type.caption,
    color: Brand.slateSoft,
    textAlign: 'center',
    paddingVertical: Space.md,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    gap: 10,
    ...Shadows.card,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTopCopy: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.greenDark,
  },
  jobTitle: {
    ...Type.heading,
    fontSize: 16.5,
    color: Brand.ink,
  },
  descriptionSnippet: {
    ...Type.body,
    color: Brand.slate,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.sm,
    maxWidth: '100%',
  },
  metaText: {
    ...Type.caption,
    fontSize: 10.5,
    color: Brand.slate,
    flexShrink: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    paddingTop: 10,
    gap: 8,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  deadline: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    ...Type.label,
    color: Brand.greenDark,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sheetSectionTitle: {
    ...Type.heading,
    color: Brand.ink,
    marginTop: 4,
  },
  bodyText: {
    ...Type.body,
    color: Brand.slate,
  },
  reqList: {
    gap: 8,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reqText: {
    ...Type.body,
    color: Brand.slate,
    flex: 1,
  },
  infoCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    paddingHorizontal: Space.md,
  },
  cvOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Space.md,
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  cvOptionActive: {
    borderColor: Brand.greenLine,
    backgroundColor: Brand.greenTint,
  },
  cvOptionCopy: {
    flex: 1,
    gap: 2,
  },
  cvOptionTitle: {
    ...Type.bodyStrong,
    color: Brand.ink,
  },
  cvOptionDesc: {
    ...Type.caption,
    color: Brand.slate,
  },
});
