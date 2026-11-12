import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
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
import {
  Application,
  JobOffer,
  StudentProfile,
} from '@/data/mock-data';
import { ApiDocument, JobSearchFilters } from '@/services/api';

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

  // Modal de Detalle (HU-04) y Postulación (HU-05)
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useProfileCv, setUseProfileCv] = useState(true);
  const [uploadedCv, setUploadedCv] = useState<ApiDocument | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const modalities = ['Todas', 'Remoto', 'Presencial', 'Híbrido'];
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

    // Criterio HU-05 Escenario 3: Verificación de postulación duplicada
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

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cargo, empresa o tecnología..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => void handleSearch()}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpiar búsqueda" onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.locationRow}>
        <TextInput
          style={styles.locationInput}
          placeholder="Ciudad o ubicación"
          placeholderTextColor="#9CA3AF"
          value={locationQuery}
          onChangeText={setLocationQuery}
          returnKeyType="search"
          onSubmitEditing={() => void handleSearch()}
        />
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isLoading}
          style={[styles.searchButton, isLoading && styles.disabledButton]}
          onPress={() => void handleSearch()}>
          <Text style={styles.searchButtonText}>{isLoading ? 'Buscando…' : 'Buscar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Modalidad:</Text>
          {modalities.map((modality) => (
            <TouchableOpacity
              key={modality}
              style={[
                styles.chip,
                selectedModality === modality && styles.chipActive,
              ]}
              onPress={() => setSelectedModality(modality)}>
              <Text
                style={[
                  styles.chipText,
                  selectedModality === modality && styles.chipTextActive,
                ]}>
                {modality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {searchError && (
        <Text accessibilityRole="alert" style={styles.searchError}>{searchError}</Text>
      )}

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={isLoading ? (
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
            icon="📋"
            title="No hay vacantes disponibles"
            description="No encontramos ofertas que coincidan con tu búsqueda. Intenta cambiar los filtros."
            actionLabel="Limpiar filtros"
            onAction={handleClearFilters}
          />
        )}
        ListFooterComponent={hasMoreJobs ? (
          isLoading ? (
            <View accessibilityRole="progressbar" accessibilityLabel="Cargando más vacantes">
              <SkeletonBlock style={styles.skeletonLoadMore} />
            </View>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.loadMoreButton}
              onPress={() => void handleLoadMore()}>
              <Text style={styles.loadMoreText}>Cargar más vacantes</Text>
            </TouchableOpacity>
          )
        ) : undefined}
        renderItem={({ item }) => {
          const applied = isAlreadyApplied(item.id);
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleOpenJobDetail(item)}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.companyName}>{item.companyName}</Text>
                  <Text style={styles.jobTitle}>{item.title}</Text>
                </View>
                {applied ? (
                  <StatusBadge status="pending" label="Postulado" size="small" />
                ) : (
                  <StatusBadge status="active" label={item.modality} size="small" />
                )}
              </View>

              <Text style={styles.descriptionSnippet} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.tagsRow}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>🎓 {item.program}</Text>
                </View>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>💼 {item.contractType}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.deadLineText}>
                  📅 Límite: {item.deadline}
                </Text>
                <Text style={styles.viewDetailsText}>Ver detalle →</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal de Detalle de Vacante (HU-04) */}
      <Modal
        visible={selectedJob !== null && !showApplyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedJob(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedJob && (
              <>
                <View style={styles.modalTopRow}>
                  <Text style={styles.modalCompany}>{selectedJob.companyName}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedJob(null)}
                    style={styles.closeModalBtn}>
                    <Text style={styles.closeModalText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedJob.title}</Text>

                <View style={styles.modalBadgesRow}>
                  <StatusBadge status="active" label={selectedJob.modality} />
                  <StatusBadge status="pending" label={selectedJob.contractType} />
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.sectionHeading}>Descripción del cargo</Text>
                  <Text style={styles.modalText}>{selectedJob.description}</Text>

                  <Text style={styles.sectionHeading}>Requisitos</Text>
                  {selectedJob.requirements.map((req, idx) => (
                    <Text key={idx} style={styles.bulletItem}>
                      • {req}
                    </Text>
                  ))}

                  <Text style={styles.sectionHeading}>Ubicación y Fechas</Text>
                  <Text style={styles.modalText}>📍 {selectedJob.location}</Text>
                  <Text style={styles.modalText}>
                    📅 Postulaciones abiertas hasta el {selectedJob.deadline}
                  </Text>
                  <Text style={styles.modalText}>
                    📄 Requiere hoja de vida: {selectedJob.requiresCv ? 'Sí (PDF max 5MB)' : 'No obligatoria'}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {isAlreadyApplied(selectedJob.id) ? (
                    <View style={styles.appliedBanner}>
                      <Text style={styles.appliedBannerText}>
                        ✅ Ya estás postulado a esta vacante
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      activeOpacity={0.85}
                      onPress={() => setShowApplyModal(true)}>
                      <Text style={styles.primaryBtnText}>Postularme a esta vacante</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Postulación con Selección de Hoja de Vida (HU-05) */}
      <Modal
        visible={showApplyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApplyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedJob && (
              <>
                <View style={styles.modalTopRow}>
                  <Text style={styles.tag}>HU-05 · Postulación</Text>
                  <TouchableOpacity
                    onPress={() => setShowApplyModal(false)}
                    style={styles.closeModalBtn}>
                    <Text style={styles.closeModalText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>Confirmar Postulación</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedJob.title} en {selectedJob.companyName}
                </Text>

                <Text style={styles.sectionHeading}>Opciones de Hoja de Vida</Text>

                {/* Opción 1: Usar CV de perfil (Criterio Escenario 4) */}
                <TouchableOpacity
                  style={[styles.cvOptionCard, useProfileCv && styles.cvOptionActive]}
                  onPress={() => {
                    setUseProfileCv(true);
                    setUploadedCv(null);
                    setApplyError(null);
                  }}>
                  <Text style={styles.radioIcon}>{useProfileCv ? '🔘' : '⚪'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cvOptionTitle}>Usar el CV de mi perfil</Text>
                    <Text style={styles.cvOptionDesc}>
                      {student.cvFile?.name || 'No has cargado una hoja de vida'}
                      {student.cvFile?.sizeMb ? ` (${student.cvFile.sizeMb} MB)` : ''}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Opción 2: Adjuntar archivo nuevo */}
                <TouchableOpacity
                  style={[styles.cvOptionCard, !useProfileCv && styles.cvOptionActive]}
                  onPress={() => {
                    setUseProfileCv(false);
                    setApplyError(null);
                  }}>
                  <Text style={styles.radioIcon}>{!useProfileCv ? '🔘' : '⚪'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cvOptionTitle}>Adjuntar otra hoja de vida</Text>
                    <Text style={styles.cvOptionDesc}>
                      {uploadedCv
                        ? `Seleccionado: ${uploadedCv.name}`
                        : 'Selecciona un archivo PDF (máximo 5 MB)'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {!useProfileCv && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.simulatorBtn}
                    onPress={() => void handleChooseCv()}>
                    <Text style={styles.simulatorBtnText}>
                      {uploadedCv ? 'Elegir otro PDF' : 'Seleccionar PDF'}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.coverLetterSection}>
                  <Text style={styles.sectionHeading}>Carta de presentación (opcional)</Text>
                  <TextInput
                    accessibilityLabel="Carta de presentación, máximo 2.000 caracteres"
                    style={styles.coverLetterInput}
                    value={coverLetter}
                    onChangeText={setCoverLetter}
                    placeholder="Cuéntale a la empresa por qué te interesa esta oportunidad."
                    multiline
                    maxLength={2000}
                  />
                  <Text style={styles.characterCount}>{coverLetter.length}/2000</Text>
                </View>

                {applyError && (
                  <View style={styles.errorAlert}>
                    <Text style={styles.errorAlertText}>⚠️ {applyError}</Text>
                  </View>
                )}

                {applySuccess && (
                  <View style={styles.successAlert}>
                    <Text style={styles.successAlertText}>✅ {applySuccess}</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    disabled={isApplying}
                    onPress={() => void handleConfirmApply()}>
                    <Text style={styles.primaryBtnText}>
                      {isApplying ? 'Enviando…' : 'Enviar mi postulación'}
                    </Text>
                  </TouchableOpacity>
                </View>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  locationInput: {
    minHeight: 44,
    flex: 1,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    color: '#1A1F36',
    fontSize: 13,
  },
  searchButton: {
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#00963F',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchError: {
    marginHorizontal: 16,
    color: '#991B1B',
    fontSize: 12,
    lineHeight: 18,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1F36',
  },
  clearSearch: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '700',
    padding: 4,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 4,
  },
  chip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActive: {
    backgroundColor: '#00963F',
  },
  chipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  loadingState: {
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderRadius: 8,
  },
  loadMoreButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#10235F',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  loadMoreText: {
    color: '#10235F',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  companyName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1F36',
    marginTop: 2,
  },
  descriptionSnippet: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: '#E6F7ED',
    borderWidth: 1,
    borderColor: '#E6F7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#00963F',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
    paddingTop: 10,
  },
  deadLineText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#00963F',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    maxHeight: '85%',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalCompany: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
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
  closeModalBtn: {
    padding: 6,
  },
  closeModalText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1F36',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modalBody: {
    maxHeight: 320,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F36',
    marginTop: 12,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 6,
  },
  modalActions: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4F5F7',
  },
  coverLetterSection: {
    marginTop: 12,
    gap: 6,
  },
  coverLetterInput: {
    minHeight: 90,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    color: '#1A1F36',
    fontSize: 13,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'right',
  },
  primaryBtn: {
    backgroundColor: '#00963F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  appliedBanner: {
    backgroundColor: '#E6F7ED',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  appliedBannerText: {
    color: '#007832',
    fontWeight: '700',
    fontSize: 13,
  },
  cvOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    gap: 10,
  },
  cvOptionActive: {
    borderColor: '#00963F',
    backgroundColor: '#E6F7ED',
  },
  radioIcon: {
    fontSize: 18,
  },
  cvOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1F36',
  },
  cvOptionDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  fileSimulatorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  simulatorBtn: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  simulatorBtnText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  simulatorErrorBtn: {
    backgroundColor: '#FEE2E2',
  },
  simulatorErrorText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  successAlert: {
    backgroundColor: '#E6F7ED',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  successAlertText: {
    color: '#007832',
    fontSize: 12,
    fontWeight: '600',
  },
});
