import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { CompanyProfile } from '@/data/mock-data';

interface AdminDashboardViewProps {
  companies: CompanyProfile[];
  onApproveCompany: (companyId: string) => Promise<void>;
  onRejectCompany: (companyId: string, reason?: string) => Promise<void>;
}

export const HU08_AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  companies,
  onApproveCompany,
  onRejectCompany,
}) => {
  const [rejectingCompanyId, setRejectingCompanyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingCompanyId, setProcessingCompanyId] = useState<string | null>(null);
  const pendingCompanies = companies.filter((company) => company.status === 'pending');

  const handleApprove = async (company: CompanyProfile) => {
    setNotice(null);
    setError(null);
    setProcessingCompanyId(company.id);
    try {
      await onApproveCompany(company.id);
      setNotice(`La solicitud de ${company.name} fue aprobada por el servidor.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible aprobar la empresa.',
      );
    } finally {
      setProcessingCompanyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingCompanyId) return;
    setNotice(null);
    setError(null);
    setProcessingCompanyId(rejectingCompanyId);
    try {
      await onRejectCompany(rejectingCompanyId, rejectionReason.trim() || undefined);
      setRejectingCompanyId(null);
      setRejectionReason('');
      setNotice('La solicitud fue rechazada por el servidor.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible rechazar la empresa.',
      );
    } finally {
      setProcessingCompanyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ADMINISTRACIÓN</Text>
          <Text style={styles.title}>Solicitudes de empresas</Text>
          <Text style={styles.subtitle}>
            Revisa las solicitudes pendientes y confirma cada decisión con el servidor.
          </Text>
        </View>

        <View style={styles.countCard}>
          <Text style={styles.count}>{pendingCompanies.length}</Text>
          <Text style={styles.countLabel}>empresas pendientes de revisión</Text>
        </View>

        {notice && (
          <View accessibilityRole="status" style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        )}
        {error && (
          <View accessibilityRole="alert" style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {pendingCompanies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay solicitudes pendientes</Text>
            <Text style={styles.emptyDescription}>
              Cuando una empresa se registre, aparecerá aquí para su revisión.
            </Text>
          </View>
        ) : (
          pendingCompanies.map((company) => {
            const isProcessing = processingCompanyId === company.id;
            return (
              <View key={company.id} style={styles.companyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.companyIdentity}>
                    <Text style={styles.companyName}>{company.name}</Text>
                    <Text style={styles.companyEmail}>{company.email}</Text>
                  </View>
                  <StatusBadge status="pending" size="small" />
                </View>

                <View style={styles.details}>
                  <Text style={styles.detailText}>NIT: {company.nit}</Text>
                  <Text style={styles.detailText}>Sector: {company.sector}</Text>
                  {company.description ? (
                    <Text style={styles.description}>{company.description}</Text>
                  ) : null}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={processingCompanyId !== null}
                    style={[styles.approveButton, isProcessing && styles.disabledButton]}
                    onPress={() => void handleApprove(company)}>
                    <Text style={styles.approveText}>
                      {isProcessing ? 'Procesando…' : 'Aprobar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={processingCompanyId !== null}
                    style={[styles.rejectButton, processingCompanyId !== null && styles.disabledButton]}
                    onPress={() => {
                      setError(null);
                      setRejectingCompanyId(company.id);
                    }}>
                    <Text style={styles.rejectText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={rejectingCompanyId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (processingCompanyId === null) setRejectingCompanyId(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rechazar solicitud</Text>
            <Text style={styles.modalDescription}>
              Puedes agregar un motivo para comunicar la decisión a la empresa.
            </Text>
            <TextInput
              accessibilityLabel="Motivo del rechazo, opcional"
              style={styles.reasonInput}
              multiline
              maxLength={500}
              placeholder="Escribe el motivo (opcional)"
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={processingCompanyId !== null}
                style={styles.cancelButton}
                onPress={() => setRejectingCompanyId(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={processingCompanyId !== null}
                style={[styles.rejectButton, processingCompanyId !== null && styles.disabledButton]}
                onPress={() => void handleReject()}>
                <Text style={styles.rejectText}>
                  {processingCompanyId ? 'Procesando…' : 'Confirmar rechazo'}
                </Text>
              </TouchableOpacity>
            </View>
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
  content: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  heading: {
    gap: 5,
    marginBottom: 4,
  },
  eyebrow: {
    color: '#10235F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#1A1F36',
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
  },
  countCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8E5',
  },
  count: {
    color: '#10235F',
    fontSize: 25,
    fontWeight: '800',
  },
  countLabel: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  notice: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E6F7ED',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  noticeText: {
    color: '#007832',
    fontSize: 13,
  },
  error: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8E5',
  },
  emptyTitle: {
    color: '#1A1F36',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    marginTop: 6,
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  companyCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8E5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  companyIdentity: {
    flex: 1,
  },
  companyName: {
    color: '#1A1F36',
    fontSize: 16,
    fontWeight: '700',
  },
  companyEmail: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 12,
  },
  details: {
    marginTop: 14,
    gap: 5,
  },
  detailText: {
    color: '#6B7280',
    fontSize: 12,
  },
  description: {
    marginTop: 5,
    color: '#1A1F36',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  approveButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 7,
    backgroundColor: '#00963F',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 7,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectText: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 20,
    gap: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    color: '#1A1F36',
    fontSize: 18,
    fontWeight: '800',
  },
  modalDescription: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
  },
  reasonInput: {
    minHeight: 100,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D9E2DE',
    borderRadius: 7,
    color: '#1A1F36',
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 7,
    backgroundColor: '#F4F5F7',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
});
