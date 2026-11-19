import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompanyProfile, CompanyReports } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard, StatsGrid } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { pluralize } from '@/lib/format';

interface CompanyReportsViewProps {
  company: CompanyProfile;
  reports: CompanyReports | null;
  isDownloading: boolean;
  downloadError: string | null;
  onDownload: () => Promise<void>;
  onDismissError: () => void;
}

const APPLICATION_STATUS: { key: string; label: string; color: string }[] = [
  { key: 'pending', label: 'Pendientes', color: Brand.amber },
  { key: 'reviewed', label: 'En revisión', color: Brand.blue },
  { key: 'interview', label: 'Entrevistas', color: Brand.teal },
  { key: 'accepted', label: 'Aceptadas', color: Brand.greenDark },
  { key: 'rejected', label: 'No seleccionadas', color: Brand.red },
];

export function CompanyReportsView({
  company,
  reports,
  isDownloading,
  downloadError,
  onDownload,
  onDismissError,
}: CompanyReportsViewProps) {
  const statuses = reports?.applicationsByStatus ?? {};
  const performance = reports?.jobsPerformance ?? [];
  const maxApplications = Math.max(
    1,
    ...performance.map((job) => job.applicationsCount ?? 0),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader
          overline="Analítica"
          title="Reportes de la empresa"
          subtitle="Consolidado de vacantes, postulaciones y desempeño de tus procesos."
        />

        <View style={styles.downloadCard}>
          <View style={styles.downloadIcon}>
            <Icon name="document-text-outline" size={22} color={Brand.greenDark} />
          </View>
          <View style={styles.downloadCopy}>
            <Text style={styles.downloadTitle}>Reporte institucional en PDF</Text>
            <Text style={styles.downloadText}>
              Descarga el documento oficial de {company.name} con los indicadores y el detalle de
              vacantes para tus registros.
            </Text>
          </View>
          <Button
            label={isDownloading ? 'Generando…' : 'Descargar reporte'}
            onPress={() => void onDownload()}
            loading={isDownloading}
            icon="download-outline"
            variant="primary"
            size="md"
            fullWidth
          />
        </View>

        {downloadError ? (
          <Notice tone="error" message={downloadError} onDismiss={onDismissError} />
        ) : null}

        <StatsGrid>
          <StatCard
            label="Vacantes publicadas"
            value={reports?.jobsTotal ?? 0}
            icon="briefcase-outline"
            tone="navy"
          />
          <StatCard
            label="Vacantes activas"
            value={reports?.jobsActive ?? 0}
            icon="radio-button-on-outline"
            tone="green"
          />
          <StatCard
            label="Postulaciones recibidas"
            value={reports?.applicationsTotal ?? 0}
            icon="document-text-outline"
            tone="blue"
          />
          <StatCard
            label="Candidatos aceptados"
            value={reports?.applicationsAccepted ?? 0}
            icon="checkmark-done-outline"
            tone="green"
          />
        </StatsGrid>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Postulaciones por estado</Text>
          <View style={styles.pillRow}>
            {APPLICATION_STATUS.map((status) => (
              <View key={status.key} style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={styles.statusValue}>{statuses[status.key] ?? 0}</Text>
                <Text style={styles.statusLabel}>{status.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempeño por vacante</Text>
          {performance.length === 0 ? (
            <EmptyState
              icon="briefcase-outline"
              title="Sin vacantes registradas"
              description="Publica tu primera vacante para comenzar a medir el interés de los estudiantes."
            />
          ) : (
            <View style={styles.performanceList}>
              {performance.map((job) => {
                const value = job.applicationsCount ?? 0;
                return (
                  <View key={job.id} style={styles.performanceRow}>
                    <View style={styles.performanceHeader}>
                      <Text style={styles.performanceTitle} numberOfLines={1}>
                        {job.title}
                      </Text>
                      <StatusBadge status={job.status} size="small" />
                    </View>
                    <View style={styles.performanceMeta}>
                      <Text style={styles.performanceCompany} numberOfLines={1}>
                        {job.area}
                      </Text>
                      <Text style={styles.performanceCount}>
                        {pluralize(value, 'postulación', 'postulaciones')}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.max(5, (value / maxApplications) * 100)}%` },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
  downloadCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.greenLine,
    padding: Space.xl,
    gap: Space.md,
    ...Shadows.card,
  },
  downloadIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadCopy: {
    gap: 4,
  },
  downloadTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  downloadText: {
    ...Type.caption,
    color: Brand.slate,
  },
  section: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
    ...Shadows.card,
  },
  sectionTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    flexGrow: 1,
    flexBasis: 128,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    backgroundColor: Brand.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusValue: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  statusLabel: {
    ...Type.caption,
    fontSize: 10.5,
    color: Brand.slate,
  },
  performanceList: {
    gap: Space.md,
  },
  performanceRow: {
    gap: 5,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  performanceTitle: {
    ...Type.bodyStrong,
    flex: 1,
    fontSize: 13,
    color: Brand.ink,
  },
  performanceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  performanceCompany: {
    ...Type.caption,
    flex: 1,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  performanceCount: {
    ...Type.label,
    fontSize: 10.5,
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
});
