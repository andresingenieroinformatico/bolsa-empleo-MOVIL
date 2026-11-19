import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Application } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Notice } from '@/components/ui/notice';
import { InfoRow } from '@/components/ui/info-row';
import { ProgressSteps, ProgressStep } from '@/components/ui/progress-steps';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from '@/components/ui/section-header';
import { formatDate } from '@/lib/format';

interface PostulacionesViewProps {
  applications: Application[];
  onRefresh?: () => void;
}

const PROGRESS_STEPS: ProgressStep[] = [
  { key: 'sent', label: 'Postulación enviada', description: 'La empresa recibió tu hoja de vida.' },
  { key: 'review', label: 'En revisión', description: 'Tu perfil está siendo evaluado.' },
  { key: 'interview', label: 'Entrevista', description: 'Coordinación de la cita con la empresa.' },
  { key: 'result', label: 'Decisión final', description: 'Resultado del proceso de selección.' },
];

function getProgressIndex(status: Application['status']): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'reviewed':
      return 1;
    case 'interview':
      return 2;
    case 'accepted':
      return 3;
    case 'rejected':
      return 2;
    default:
      return 0;
  }
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
        return 'Has sido seleccionado para una entrevista. Revisa las instrucciones de contacto.';
      case 'accepted':
        return 'Proceso exitoso. La empresa ha aceptado tu postulación para iniciar la vinculación.';
      case 'rejected':
        return 'El proceso para esta vacante ha concluido y no continuaste a la siguiente fase. Sigue postulándote a otras ofertas.';
    }
  };

  const inReview = applications.filter(
    (app) => app.status === 'pending' || app.status === 'reviewed',
  ).length;
  const interviews = applications.filter((app) => app.status === 'interview').length;

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <SectionHeader
              overline="Seguimiento"
              title="Mis postulaciones"
              subtitle="Consulta el avance de cada proceso en tiempo real."
            />
            <View style={styles.statsRow}>
              <StatTile label="Total" value={applications.length} icon="documents-outline" />
              <StatTile label="En revisión" value={inReview} icon="eye-outline" />
              <StatTile label="Entrevistas" value={interviews} icon="calendar-outline" />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="Aún no tienes postulaciones"
            description="Explora las vacantes disponibles en la pestaña Vacantes y postúlate con tu hoja de vida."
          />
        }
        renderItem={({ item }) => {
          const isInterview = item.status === 'interview';
          const isAccepted = item.status === 'accepted';

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Postulación a ${item.jobTitle} en ${item.companyName}`}
              onPress={() => setSelectedApp(item)}
              style={({ pressed }) => [
                styles.card,
                isInterview && styles.cardInterview,
                isAccepted && styles.cardAccepted,
                pressed && styles.cardPressed,
              ]}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardCompany}>
                  <Avatar name={item.companyName} size={38} tone="navy" />
                  <View style={styles.cardCompanyCopy}>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {item.companyName}
                    </Text>
                    <Text style={styles.jobTitle} numberOfLines={2}>
                      {item.jobTitle}
                    </Text>
                  </View>
                </View>
                <StatusBadge status={item.status} size="small" />
              </View>

              {isInterview ? (
                <View style={styles.interviewBox}>
                  <Icon name="calendar" size={16} color="#3B3F94" />
                  <View style={styles.interviewCopy}>
                    <Text style={styles.interviewTitle}>Citación a entrevista</Text>
                    <Text style={styles.interviewText} numberOfLines={2}>
                      {item.interviewNote || 'Has sido programado para entrevista. Revisa los detalles.'}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <View style={styles.footerMeta}>
                  <Icon name="calendar-outline" size={13} color={Brand.slateSoft} />
                  <Text style={styles.metaText}>Postulado el {formatDate(item.appliedAt)}</Text>
                </View>
                <View style={styles.footerMeta}>
                  <Icon name="document-attach-outline" size={13} color={Brand.greenDark} />
                  <Text style={styles.metaCv} numberOfLines={1}>
                    {item.cvFileName}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <Sheet
        visible={selectedApp !== null}
        onClose={() => setSelectedApp(null)}
        title={selectedApp?.jobTitle}
        subtitle={selectedApp?.companyName}
        icon="document-text-outline"
        closeLabel="Cerrar detalle de postulación"
        footer={
          <Button
            label="Entendido"
            onPress={() => setSelectedApp(null)}
            size="lg"
            fullWidth
          />
        }>
        {selectedApp ? (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Estado actual</Text>
              <StatusBadge status={selectedApp.status} />
            </View>

            <Notice
              tone={selectedApp.status === 'rejected' ? 'warning' : selectedApp.status === 'accepted' ? 'success' : 'info'}
              message={getStatusExplanation(selectedApp.status) ?? ''}
            />

            <View style={styles.progressCard}>
              <ProgressSteps
                steps={PROGRESS_STEPS}
                currentIndex={getProgressIndex(selectedApp.status)}
                failed={selectedApp.status === 'rejected'}
              />
            </View>

            {selectedApp.status === 'interview' && selectedApp.interviewNote ? (
              <View style={styles.interviewDetails}>
                <View style={styles.interviewDetailsHeader}>
                  <Icon name="calendar" size={16} color="#3B3F94" />
                  <Text style={styles.interviewDetailsTitle}>Detalles de la cita</Text>
                </View>
                <Text style={styles.interviewDetailsBody}>{selectedApp.interviewNote}</Text>
              </View>
            ) : null}

            <View style={styles.infoCard}>
              <InfoRow
                icon="calendar-outline"
                label="Fecha de postulación"
                value={formatDate(selectedApp.appliedAt)}
              />
              <InfoRow
                icon="document-attach-outline"
                label="Hoja de vida adjunta"
                value={selectedApp.cvFileName}
                last
              />
            </View>

            <View style={styles.privacy}>
              <Icon name="lock-closed-outline" size={15} color={Brand.slate} />
              <Text style={styles.privacyText}>
                Las notas y evaluaciones internas de la empresa no son visibles para el
                estudiante, conforme a la política de selección.
              </Text>
            </View>
          </>
        ) : null}
      </Sheet>
    </View>
  );
};

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: 'documents-outline' | 'eye-outline' | 'calendar-outline';
}) {
  return (
    <View style={styles.statTile}>
      <Icon name={icon} size={16} color={Brand.greenDark} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
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
    maxWidth: 840,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.md,
  },
  header: {
    gap: Space.md,
    marginBottom: Space.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    paddingVertical: Space.md,
    paddingHorizontal: Space.sm,
    alignItems: 'center',
    gap: 3,
    ...Shadows.card,
  },
  statValue: {
    ...Type.titleSmall,
    fontSize: 20,
    color: Brand.ink,
  },
  statLabel: {
    ...Type.caption,
    fontSize: 10,
    color: Brand.slate,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Brand.line,
    gap: Space.md,
    ...Shadows.card,
  },
  cardInterview: {
    borderColor: '#D5D9F7',
    backgroundColor: '#FBFCFF',
  },
  cardAccepted: {
    borderColor: Brand.greenLine,
    backgroundColor: '#F6FCF8',
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  cardCompanyCopy: {
    flex: 1,
    gap: 2,
  },
  companyName: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.slateSoft,
  },
  jobTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  interviewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: Space.md,
    backgroundColor: '#EEF0FD',
    borderWidth: 1,
    borderColor: '#D5D9F7',
    borderRadius: Radius.md,
  },
  interviewCopy: {
    flex: 1,
    gap: 1,
  },
  interviewTitle: {
    ...Type.label,
    color: '#3B3F94',
    fontWeight: '800',
  },
  interviewText: {
    ...Type.caption,
    color: '#4A4F9E',
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    paddingTop: 10,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    flexShrink: 1,
  },
  metaText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  metaCv: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.greenDark,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: 190,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusLabel: {
    ...Type.caption,
    color: Brand.slate,
  },
  progressCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    padding: Space.lg,
  },
  interviewDetails: {
    backgroundColor: '#EEF0FD',
    borderWidth: 1,
    borderColor: '#D5D9F7',
    borderRadius: Radius.lg,
    padding: Space.md,
    gap: 6,
  },
  interviewDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interviewDetailsTitle: {
    ...Type.label,
    color: '#3B3F94',
    fontWeight: '800',
  },
  interviewDetailsBody: {
    ...Type.body,
    color: '#4A4F9E',
  },
  infoCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    paddingHorizontal: Space.md,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceMuted,
  },
  privacyText: {
    ...Type.caption,
    color: Brand.slate,
    flex: 1,
    lineHeight: 17,
  },
});
