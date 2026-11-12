import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Application } from '@/data/mock-data';

interface PostulacionesViewProps {
  applications: Application[];
  onRefresh?: () => void;
}

export const HU06_PostulacionesView: React.FC<PostulacionesViewProps> = ({
  applications,
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const getStatusExplanation = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'Tu postulación fue recibida y está en espera de ser revisada por el equipo de selección.';
      case 'reviewed':
        return 'La empresa ha revisado tu hoja de vida y tu perfil está siendo evaluado activamente.';
      case 'interview':
        return '¡Felicitaciones! Has sido seleccionado para una entrevista. Revisa las instrucciones de contacto.';
      case 'accepted':
        return '¡Proceso exitoso! La empresa ha aceptado tu postulación para iniciar la vinculación.';
      case 'rejected':
        return 'El proceso para esta vacante ha concluido y no continuaste a la siguiente fase. ¡Sigue postulándote a otras ofertas!';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Mis Postulaciones</Text>
        <Text style={styles.headerSubtitle}>
          Monitorea en tiempo real el avance de tus postulaciones laborales
        </Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="Sin postulaciones aún"
            description="Explora las ofertas disponibles en la pestaña 'Vacantes' y postúlate con tu hoja de vida."
          />
        }
        renderItem={({ item }) => {
          const isInterview = item.status === 'interview';
          const isAccepted = item.status === 'accepted';

          return (
            <TouchableOpacity
              style={[
                styles.card,
                isInterview && styles.cardHighlightInterview,
                isAccepted && styles.cardHighlightAccepted,
              ]}
              activeOpacity={0.85}
              onPress={() => setSelectedApp(item)}>
              <View style={styles.cardTopRow}>
                <Text style={styles.companyName}>{item.companyName}</Text>
                <StatusBadge status={item.status} />
              </View>

              <Text style={styles.jobTitle}>{item.jobTitle}</Text>

              {/* Alerta de entrevista destacada (Criterio Escenario 3) */}
              {isInterview && (
                <View style={styles.interviewAlertBox}>
                  <Text style={styles.interviewAlertTitle}>
                    🎉 ¡Citación a Entrevista!
                  </Text>
                  <Text style={styles.interviewAlertText}>
                    {item.interviewNote || 'Has sido programado para entrevista. Revisa los detalles.'}
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.metaText}>📅 Postulado: {item.appliedAt}</Text>
                <Text style={styles.metaCv}>📎 {item.cvFileName}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal de Detalle de Postulación (Criterio HU-06 Escenario 6: company_notes oculto) */}
      <Modal
        visible={selectedApp !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedApp(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedApp && (
              <>
                <View style={styles.modalTopRow}>
                  <Text style={styles.tag}>HU-06 · Detalle de Postulación</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedApp(null)}
                    style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalJobTitle}>{selectedApp.jobTitle}</Text>
                <Text style={styles.modalCompany}>{selectedApp.companyName}</Text>

                <View style={styles.statusBox}>
                  <Text style={styles.statusBoxLabel}>Estado actual:</Text>
                  <StatusBadge status={selectedApp.status} />
                </View>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationText}>
                    {getStatusExplanation(selectedApp.status)}
                  </Text>
                </View>

                {selectedApp.status === 'interview' && selectedApp.interviewNote && (
                  <View style={styles.interviewDetailsCard}>
                    <Text style={styles.interviewTitle}>Detalles de la cita:</Text>
                    <Text style={styles.interviewBody}>{selectedApp.interviewNote}</Text>
                  </View>
                )}

                <View style={styles.detailsList}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha de postulación:</Text>
                    <Text style={styles.detailValue}>{selectedApp.appliedAt}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hoja de vida adjunta:</Text>
                    <Text style={styles.detailValue}>{selectedApp.cvFileName}</Text>
                  </View>

                  {/* Garantía del criterio HU-06 Escenario 6 */}
                  <View style={styles.privacyNotice}>
                    <Text style={styles.privacyNoticeText}>
                      🔒 Privacidad: Las notas y evaluaciones internas de la empresa no son visibles para el estudiante conforme a la política de selección.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeActionBtn}
                  onPress={() => setSelectedApp(null)}>
                  <Text style={styles.closeActionText}>Entendido</Text>
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
  headerInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHighlightInterview: {
    borderColor: '#C4B5FD',
    backgroundColor: '#FAF5FF',
  },
  cardHighlightAccepted: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  interviewAlertBox: {
    backgroundColor: '#EDE9FE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  interviewAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 2,
  },
  interviewAlertText: {
    fontSize: 12,
    color: '#6D28D9',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaCv: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
  modalJobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  modalCompany: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 14,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  explanationBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  explanationText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  interviewDetailsCard: {
    backgroundColor: '#EDE9FE',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  interviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 4,
  },
  interviewBody: {
    fontSize: 12,
    color: '#4C1D95',
    lineHeight: 17,
  },
  detailsList: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  privacyNotice: {
    marginTop: 6,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  privacyNoticeText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  closeActionBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
