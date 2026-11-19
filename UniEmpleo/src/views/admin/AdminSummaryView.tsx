import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AdminReports,
  AdminSummary,
  AdminTab,
  CompanyProfile,
} from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { InfoRow } from '@/components/ui/info-row';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { pluralize } from '@/lib/format';

interface AdminSummaryViewProps {
  summary: AdminSummary | null;
  reports: AdminReports | null;
  pendingCompanies: CompanyProfile[];
  onApproveCompany: (companyId: string) => Promise<void>;
  onRejectCompany: (companyId: string, reason?: string) => Promise<void>;
  onOpenTab: (tab: AdminTab) => void;
  onDownloadReport: () => void;
  isDownloadingReport: boolean;
  downloadError: string | null;
  onDismissDownloadError: () => void;
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const COMPANY_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendientes',
  approved: 'Aprobadas',
  rejected: 'Rechazadas',
  inactive: 'Inactivas',
};
const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendientes',
  reviewed: 'En revisión',
  interview: 'Entrevista',
  accepted: 'Aceptadas',
  rejected: 'Rechazadas',
};

function monthLabel(month: string): string {
  const index = Number(month) - 1;
  return MONTHS[index] ?? month;
}

export const AdminSummaryView: React.FC<AdminSummaryViewProps> = ({
  summary,
  reports,
  pendingCompanies,
  onApproveCompany,
  onRejectCompany,
  onOpenTab,
  onDownloadReport,
  isDownloadingReport,
  downloadError,
  onDismissDownloadError,
}) => {
  const [rejectingCompanyId, setRejectingCompanyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingCompanyId, setProcessingCompanyId] = useState<string | null>(null);

  const metrics: { key: string; label: string; value: number; icon: IconName }[] = [
    { key: 'students', label: 'Estudiantes', value: summary?.studentsTotal ?? 0, icon: 'school-outline' },
    {
      key: 'companies',
      label: 'Empresas aprobadas',
      value: summary?.companiesApproved ?? 0,
      icon: 'business-outline',
    },
    { key: 'jobs', label: 'Vacantes activas', value: summary?.jobsActive ?? 0, icon: 'briefcase-outline' },
    {
      key: 'applications',
      label: 'Postulaciones',
      value: summary?.applicationsTotal ?? 0,
      icon: 'document-text-outline',
    },
  ];

  const monthly = [...(summary?.monthlyApplications ?? [])].sort(
    (a, b) => Number(a.month) - Number(b.month),
  );
  const monthlyMax = Math.max(1, ...monthly.map((entry) => entry.total));
  const areas = reports?.jobsByArea?.length ? reports.jobsByArea : summary?.topAreas ?? [];
  const areaMax = Math.max(1, ...areas.map((entry) => entry.total));
  const companyStatuses = Object.entries(reports?.companiesByStatus ?? {});
  const applicationStatuses = Object.entries(reports?.applicationsByStatus ?? {});

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
    const reason = rejectionReason.trim();
    if (reason.length < 10) {
      setError('Describe con al menos 10 caracteres la información que la empresa debe corregir.');
      return;
    }
    setNotice(null);
    setError(null);
    setProcessingCompanyId(rejectingCompanyId);
    try {
      await onRejectCompany(rejectingCompanyId, reason);
      setRejectingCompanyId(null);
      setRejectionReason('');
      setNotice('La solicitud fue rechazada y se notificó a la empresa con el motivo indicado.');
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
          title="Resumen de la plataforma"
          subtitle="Indicadores, solicitudes pendientes y reportes institucionales de UniEmpleo."
        />

        <View style={styles.metrics}>
          {metrics.map((metric) => (
            <View key={metric.key} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Icon name={metric.icon} size={19} color={Brand.navy} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        {summary && summary.companiesPending > 0 ? (
          <Notice
            tone="warning"
            title="Solicitudes por revisar"
            message={`${pluralize(
              summary.companiesPending,
              'empresa espera',
              'empresas esperan',
            )} aprobación para publicar vacantes.`}
            actionLabel="Revisar abajo"
            onAction={() => undefined}
          />
        ) : null}

        <View style={styles.quickRow}>
          <Button
            label="Estudiantes"
            onPress={() => onOpenTab('estudiantes')}
            variant="secondary"
            size="sm"
            icon="school-outline"
            style={styles.quickButton}
          />
          <Button
            label="Empresas"
            onPress={() => onOpenTab('empresas')}
            variant="secondary"
            size="sm"
            icon="business-outline"
            style={styles.quickButton}
          />
          <Button
            label="Vacantes"
            onPress={() => onOpenTab('vacantes')}
            variant="secondary"
            size="sm"
            icon="briefcase-outline"
            style={styles.quickButton}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            overline="Reportes"
            title="Actividad institucional"
            subtitle="Datos consolidados de empresas, vacantes y postulaciones."
          />

          <Button
            label={isDownloadingReport ? 'Generando…' : 'Descargar reporte PDF'}
            onPress={onDownloadReport}
            loading={isDownloadingReport}
            variant="primary"
            size="md"
            icon="download-outline"
            fullWidth
          />

          {downloadError ? (
            <Notice tone="error" message={downloadError} onDismiss={onDismissDownloadError} />
          ) : null}

          <View style={styles.reportBlock}>
            <Text style={styles.reportTitle}>Postulaciones por estado</Text>
            {applicationStatuses.length === 0 ? (
              <Text style={styles.reportEmpty}>Aún no hay postulaciones registradas.</Text>
            ) : (
              <View style={styles.pillRow}>
                {applicationStatuses.map(([status, total]) => (
                  <View key={status} style={styles.reportPill}>
                    <Text style={styles.reportPillValue}>{total}</Text>
                    <Text style={styles.reportPillLabel}>
                      {APPLICATION_STATUS_LABEL[status] ?? status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.reportBlock}>
            <Text style={styles.reportTitle}>Empresas por estado</Text>
            {companyStatuses.length === 0 ? (
              <Text style={styles.reportEmpty}>Aún no hay empresas registradas.</Text>
            ) : (
              <View style={styles.pillRow}>
                {companyStatuses.map(([status, total]) => (
                  <View key={status} style={styles.reportPill}>
                    <Text style={styles.reportPillValue}>{total}</Text>
                    <Text style={styles.reportPillLabel}>
                      {COMPANY_STATUS_LABEL[status] ?? status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {monthly.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.reportBlock}>
                <Text style={styles.reportTitle}>Postulaciones por mes</Text>
                <View style={styles.chart}>
                  {monthly.slice(-6).map((entry) => (
                    <View key={entry.month} style={styles.chartColumn}>
                      <Text style={styles.chartValue}>{entry.total}</Text>
                      <View style={styles.chartTrack}>
                        <View
                          style={[
                            styles.chartBar,
                            { height: `${Math.max(8, (entry.total / monthlyMax) * 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartLabel}>{monthLabel(entry.month)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}

          {areas.length > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.reportBlock}>
                <Text style={styles.reportTitle}>Vacantes por área</Text>
                <View style={styles.bars}>
                  {areas.slice(0, 5).map((entry) => (
                    <View key={entry.area} style={styles.barRow}>
                      <View style={styles.barHeader}>
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {entry.area}
                        </Text>
                        <Text style={styles.barValue}>{entry.total}</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${Math.max(6, (entry.total / areaMax) * 100)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionHeader
            overline="Solicitudes"
            title="Empresas pendientes"
            subtitle="Revisa cada registro y confirma la decisión institucional."
            action={<StatusBadge status="pending" label={String(pendingCompanies.length)} size="small" />}
          />

          {notice ? (
            <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} />
          ) : null}
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
                <View key={company.id} style={styles.companyCard}>
                  <View style={styles.companyTop}>
                    <Avatar name={company.name} size={44} tone="green" />
                    <View style={styles.companyIdentity}>
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
                      icon="person-outline"
                      label="Responsable"
                      value={company.contactPerson || 'No registrado'}
                    />
                    <InfoRow
                      icon="document-text-outline"
                      label="Descripción"
                      value={company.description || 'Sin descripción'}
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
        </View>
      </ScrollView>

      <Sheet
        visible={rejectingCompanyId !== null}
        onClose={closeRejectSheet}
        title="Rechazar solicitud"
        subtitle="Indica a la empresa qué información debe corregir."
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
              disabled={rejectionReason.trim().length < 10 || processingCompanyId !== null}
              loading={processingCompanyId !== null}
              variant="danger"
              size="md"
              style={styles.actionGrow}
            />
          </View>
        }>
        <TextField
          label="Motivo del rechazo"
          required
          hint="Mínimo 10 caracteres. La empresa verá este mensaje."
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="Ej. El NIT no coincide con el registrado en RUES. Adjunta o corrige la información."
          multiline
          numberOfLines={3}
          maxLength={1000}
        />
        <Notice
          tone="warning"
          message="La empresa podrá corregir su información y guardar el perfil para volver a enviar la solicitud a revisión."
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
    maxWidth: 980,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.lg,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.md,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 150,
    minWidth: 140,
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: 4,
    ...Shadows.card,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Brand.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    ...Type.title,
    color: Brand.ink,
  },
  metricLabel: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.slate,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    flexGrow: 1,
    flexBasis: 140,
  },
  section: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.lg,
    ...Shadows.card,
  },
  reportBlock: {
    gap: 10,
  },
  reportTitle: {
    ...Type.label,
    color: Brand.inkSoft,
  },
  reportEmpty: {
    ...Type.caption,
    color: Brand.slateSoft,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportPill: {
    minWidth: 92,
    flexGrow: 1,
    flexBasis: 92,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    backgroundColor: Brand.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 1,
  },
  reportPillValue: {
    ...Type.heading,
    color: Brand.ink,
  },
  reportPillLabel: {
    ...Type.caption,
    fontSize: 10.5,
    color: Brand.slate,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.lineSoft,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 128,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartValue: {
    ...Type.caption,
    fontSize: 10,
    color: Brand.slate,
  },
  chartTrack: {
    flex: 1,
    width: '100%',
    maxWidth: 34,
    justifyContent: 'flex-end',
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  chartBar: {
    width: '100%',
    backgroundColor: Brand.green,
    borderRadius: Radius.sm,
  },
  chartLabel: {
    ...Type.caption,
    fontSize: 10,
    color: Brand.slateSoft,
  },
  bars: {
    gap: 10,
  },
  barRow: {
    gap: 5,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  barLabel: {
    ...Type.caption,
    flex: 1,
    color: Brand.inkSoft,
  },
  barValue: {
    ...Type.label,
    color: Brand.slate,
  },
  barTrack: {
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Brand.green,
  },
  companyCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
  },
  companyTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  companyIdentity: {
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
