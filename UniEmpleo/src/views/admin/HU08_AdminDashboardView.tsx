import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { CompanyProfile } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { InfoRow } from '@/components/ui/info-row';
import { SectionHeader } from '@/components/ui/section-header';
import { pluralize } from '@/lib/format';

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
      setNotice(`La solicitud de ${company.name} fue aprobada.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible aprobar la empresa.',
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
      setNotice('La solicitud fue rechazada.');
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'No fue posible rechazar la empresa.',
      );
    } finally {
      setProcessingCompanyId(null);
    }
  };

  const closeRejectSheet = () => {
    if (processingCompanyId === null) setRejectingCompanyId(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <SectionHeader
          overline="Administración"
          title="Solicitudes de empresas"
          subtitle="Revisa cada solicitud y confirma la decisión institucional."
        />

        <View style={styles.countCard}>
          <View style={styles.countIcon}>
            <Icon name="business-outline" size={22} color={Brand.navy} />
          </View>
          <View style={styles.countCopy}>
            <Text style={styles.count}>{pendingCompanies.length}</Text>
            <Text style={styles.countLabel}>
              {pluralize(pendingCompanies.length, 'empresa pendiente', 'empresas pendientes')} de revisión
            </Text>
          </View>
        </View>

        {notice ? <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} /> : null}
        {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

        {pendingCompanies.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="No hay solicitudes pendientes"
            description="Cuando una empresa se registre, aparecerá aquí para su revisión."
          />
        ) : (
          pendingCompanies.map((company) => {
            const isProcessing = processingCompanyId === company.id;
            return (
              <View key={company.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar name={company.name} size={44} tone="green" />
                  <View style={styles.identity}>
                    <Text style={styles.companyName}>{company.name}</Text>
                    <Text style={styles.companyEmail} numberOfLines={1}>
                      {company.email}
                    </Text>
                  </View>
                  <StatusBadge status="pending" size="small" />
                </View>

                <View style={styles.infoCard}>
                  <InfoRow icon="card-outline" label="NIT" value={company.nit} />
                  <InfoRow icon="layers-outline" label="Sector" value={company.sector} />
                  <InfoRow
                    icon="document-text-outline"
                    label="Descripción"
                    value={company.description}
                    last
                    muted
                  />
                </View>

                <View style={styles.actions}>
                  <Button
                    label={isProcessing ? 'Procesando…' : 'Aprobar'}
                    onPress={() => void handleApprove(company)}
                    loading={isProcessing}
                    variant="primary"
                    size="sm"
                    icon="checkmark"
                    style={styles.actionGrow}
                  />
                  <Button
                    label="Rechazar"
                    onPress={() => {
                      setError(null);
                      setRejectingCompanyId(company.id);
                    }}
                    disabled={processingCompanyId !== null}
                    variant="danger"
                    size="sm"
                    icon="close"
                    style={styles.actionGrow}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Sheet
        visible={rejectingCompanyId !== null}
        onClose={closeRejectSheet}
        title="Rechazar solicitud"
        subtitle="La empresa recibirá el motivo si lo escribes."
        icon="close-circle-outline"
        closeLabel="Cerrar rechazo de solicitud"
        footer={
          <View style={styles.rejectActions}>
            <Button
              label="Cancelar"
              onPress={closeRejectSheet}
              disabled={processingCompanyId !== null}
              variant="secondary"
              size="md"
              style={styles.actionGrow}
            />
            <Button
              label="Confirmar rechazo"
              onPress={() => void handleReject()}
              loading={processingCompanyId !== null}
              variant="danger"
              size="md"
              style={styles.actionGrow}
            />
          </View>
        }>
        <TextField
          label="Motivo del rechazo"
          optionalLabel="Opcional"
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="Ej. NIT no verificado en RUES o documentación incompleta."
          multiline
          numberOfLines={3}
          maxLength={500}
        />
        <Notice
          tone="warning"
          message="La empresa podrá corregir su información y volver a enviar la solicitud."
        />
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
  content: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.lg,
  },
  countCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.xl,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    ...Shadows.card,
  },
  countIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Brand.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCopy: {
    flex: 1,
    gap: 1,
  },
  count: {
    ...Type.title,
    color: Brand.ink,
  },
  countLabel: {
    ...Type.caption,
    color: Brand.slate,
  },
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
  identity: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    ...Type.heading,
    color: Brand.ink,
  },
  companyEmail: {
    ...Type.caption,
    color: Brand.slate,
  },
  infoCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    paddingHorizontal: Space.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionGrow: {
    flex: 1,
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
