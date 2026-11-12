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
  Application,
  JobModality,
  JobOffer,
  StudentProfile,
} from '@/data/mock-data';

interface VacantesViewProps {
  jobs: JobOffer[];
  student: StudentProfile;
  applications: Application[];
  onApply: (job: JobOffer, useProfileCv: boolean, customFileName?: string) => void;
}

export const HU04_VacantesView: React.FC<VacantesViewProps> = ({
  jobs,
  student,
  applications,
  onApply,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('Todas');
  const [selectedProgram, setSelectedProgram] = useState<string>('Todos');
  const [selectedArea, setSelectedArea] = useState<string>('Todas');

  // Modal de Detalle (HU-04) y Postulación (HU-05)
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [useProfileCv, setUseProfileCv] = useState(true);
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  const modalities = ['Todas', 'Remoto', 'Presencial', 'Híbrido'];
  const programs = [
    'Todos',
    'Ingeniería de Sistemas',
    'Ingeniería de Producción',
    'Ingeniería Agronómica',
  ];
  const areas = ['Todas', 'Tecnología', 'Producción', 'Agronomía'];

  // Filtrado según criterios HU-04
  const filteredJobs = jobs.filter((job) => {
    if (job.status !== 'active') return false;

    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModality =
      selectedModality === 'Todas' || job.modality === selectedModality;

    const matchesProgram =
      selectedProgram === 'Todos' || job.program === selectedProgram;

    const matchesArea = selectedArea === 'Todas' || job.area === selectedArea;

    return matchesSearch && matchesModality && matchesProgram && matchesArea;
  });

  const isAlreadyApplied = (jobId: string) => {
    return applications.some((app) => app.jobId === jobId);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedModality('Todas');
    setSelectedProgram('Todos');
    setSelectedArea('Todas');
  };

  const handleOpenJobDetail = (job: JobOffer) => {
    setSelectedJob(job);
    setApplyError(null);
    setApplySuccess(null);
    setUseProfileCv(true);
    setUploadedCvName(null);
  };

  const handleConfirmApply = () => {
    if (!selectedJob) return;

    // Criterio HU-05 Escenario 3: Verificación de postulación duplicada
    if (isAlreadyApplied(selectedJob.id)) {
      setApplyError('Ya te has postulado previamente a esta vacante. No se pueden crear postulaciones duplicadas.');
      return;
    }

    if (selectedJob.requiresCv && !useProfileCv && !uploadedCvName) {
      setApplyError('Esta vacante requiere hoja de vida. Selecciona el CV de tu perfil o adjunta un archivo.');
      return;
    }

    onApply(selectedJob, useProfileCv, uploadedCvName || undefined);
    setApplySuccess('¡Tu postulación ha sido registrada con éxito en estado pendiente!');
    setTimeout(() => {
      setShowApplyModal(false);
      setSelectedJob(null);
    }, 1200);
  };

  const handleSimulateLargeFile = () => {
    // Criterio HU-09 Escenario 5: Tamaño de archivo mayor al límite (> 5MB)
    setApplyError('Error: El archivo seleccionado (6.2 MB) supera el límite máximo permitido de 5 MB.');
  };

  const handleSimulateValidFile = () => {
    setApplyError(null);
    setUploadedCvName('CV_Actualizado_Carlos_2026.pdf');
    setUseProfileCv(false);
  };

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cargo, empresa o tecnología..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de Filtros Rápidos (HU-04) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Modalidad:</Text>
          {modalities.map((mod) => (
            <TouchableOpacity
              key={mod}
              style={[
                styles.chip,
                selectedModality === mod && styles.chipActive,
              ]}
              onPress={() => setSelectedModality(mod)}>
              <Text
                style={[
                  styles.chipText,
                  selectedModality === mod && styles.chipTextActive,
                ]}>
                {mod}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Filtro por Programa Académico UNIPAZ (HU-04) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Programa UNIPAZ:</Text>
          {programs.map((prog) => (
            <TouchableOpacity
              key={prog}
              style={[
                styles.chip,
                selectedProgram === prog && styles.chipActive,
              ]}
              onPress={() => setSelectedProgram(prog)}>
              <Text
                style={[
                  styles.chipText,
                  selectedProgram === prog && styles.chipTextActive,
                ]}>
                {prog === 'Todos' ? 'Todos' : prog.replace('Ingeniería de ', 'Ing. ').replace('Ingeniería ', 'Ing. ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Listado de Vacantes */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          // Criterio HU-04 Escenario 5: No hay vacantes disponibles con filtros
          <EmptyState
            icon="📋"
            title="No hay vacantes disponibles"
            description="No encontramos ofertas que coincidan con los filtros aplicados. Intenta cambiar de modalidad o programa."
            actionLabel="Limpiar filtros"
            onAction={handleClearFilters}
          />
        }
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
                    setUploadedCvName(null);
                    setApplyError(null);
                  }}>
                  <Text style={styles.radioIcon}>{useProfileCv ? '🔘' : '⚪'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cvOptionTitle}>Usar el CV de mi perfil</Text>
                    <Text style={styles.cvOptionDesc}>
                      {student.cvFile?.name || 'CV_Carlos_Mendoza_UNIPAZ.pdf'} (
                      {student.cvFile?.sizeMb || 1.8} MB)
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
                      {uploadedCvName
                        ? `Seleccionado: ${uploadedCvName}`
                        : 'Selecciona un archivo PDF o DOCX (máximo 5 MB)'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Botones de simulación de archivos */}
                {!useProfileCv && (
                  <View style={styles.fileSimulatorRow}>
                    <TouchableOpacity
                      style={styles.simulatorBtn}
                      onPress={handleSimulateValidFile}>
                      <Text style={styles.simulatorBtnText}>
                        📎 Cargar PDF válido (2.1 MB)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.simulatorBtn, styles.simulatorErrorBtn]}
                      onPress={handleSimulateLargeFile}>
                      <Text style={styles.simulatorErrorText}>
                        ⚠️ Probar archivo &gt; 5MB
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

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
                    onPress={handleConfirmApply}>
                    <Text style={styles.primaryBtnText}>Enviar mi postulación</Text>
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
    backgroundColor: '#F3F4F6',
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
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
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
    color: '#4B5563',
    marginRight: 4,
  },
  chip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  chipActive: {
    backgroundColor: '#0F766E',
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
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
    color: '#111827',
    marginTop: 2,
  },
  descriptionSnippet: {
    fontSize: 13,
    color: '#4B5563',
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
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  deadLineText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#0F766E',
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
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
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
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#4B5563',
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
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  bulletItem: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 6,
  },
  modalActions: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#0F766E',
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
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  appliedBannerText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 13,
  },
  cvOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    gap: 10,
  },
  cvOptionActive: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  radioIcon: {
    fontSize: 18,
  },
  cvOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
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
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
});
