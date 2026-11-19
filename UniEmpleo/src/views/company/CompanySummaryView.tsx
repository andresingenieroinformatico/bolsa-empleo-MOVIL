import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CompanyProfile,
  CompanySummary,
  CompanyTab,
} from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon, IconName } from '@/components/ui/icon';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard, StatsGrid } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatRelativeDate, pluralize } from '@/lib/format';

interface CompanySummaryViewProps {
  company: CompanyProfile;
  summary: CompanySummary | null;
  onOpenTab: (tab: CompanyTab) => void;
}

const STATUS_COPY: Record<CompanyProfile['status'], string> = {
  pending: 'Tu registro está en revisión por la administración.',
  approved: 'Empresa verificada para publicar vacantes.',
  rejected: 'Tu registro fue rechazado. Actualiza el perfil y contacta a UNIPAZ.',
  inactive: 'La cuenta está inactiva. Contacta a la administración.',
};

export function CompanySummaryView({ company, summary, onOpenTab }: CompanySummaryViewProps) {
  const recent = summary?.recentApplications ?? [];

  const actions: { key: CompanyTab; label: string; icon: IconName; description: string }[] = [
    {
      key: 'vacantes',
      label: 'Gestionar vacantes',
      icon: 'briefcase-outline',
      description: 'Publica, edita y pausa tus ofertas.',
    },
    {
      key: 'candidatos',
      label: 'Revisar candidatos',
      icon: 'people-outline',
      description: 'Evalúa postulaciones recibidas.',
    },
    {
      key: 'reportes',
      label: 'Ver reportes',
      icon: 'bar-chart-outline',
      description: 'Indicadores y descarga en PDF.',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Avatar name={company.name} size={52} tone="soft" />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Panel de empresa</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {company.name}
              </Text>
              <Text style={styles.heroSubtitle} numberOfLines={1}>
                {company.sector || 'Sector por completar'}
              </Text>
            </View>
          </View>
          <View style={styles.heroStatus}>
            <StatusBadge status={company.status} size="small" />
            <Text style={styles.heroStatusText}>{STATUS_COPY[company.status]}</Text>
          </View>
        </View>

        <SectionHeader
          overline="Actividad"
          title="Resumen de tu gestión"
          subtitle="Indicadores actualizados de tus vacantes y postulaciones."
        />

        <StatsGrid>
          <StatCard
            label="Vacantes publicadas"
            value={summary?.jobsTotal ?? 0}
            icon="briefcase-outline"
            tone="navy"
          />
          <StatCard
            label="Vacantes activas"
            value={summary?.jobsActive ?? 0}
            icon="radio-button-on-outline"
            tone="green"
          />
          <StatCard
            label="Postulaciones"
            value={summary?.applicationsTotal ?? 0}
            icon="document-text-outline"
            tone="blue"
          />
          <StatCard
            label="Por revisar"
            value={summary?.applicationsPending ?? 0}
            icon="time-outline"
            tone="amber"
            helper="Postulaciones pendientes"
          />
        </StatsGrid>

        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <View key={action.key} style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Icon name={action.icon} size={18} color={Brand.greenDark} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.label}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Button
                label="Abrir"
                onPress={() => onOpenTab(action.key)}
                variant="ghost"
                size="sm"
                iconRight="arrow-forward"
                accessibilityLabel={`Abrir ${action.label}`}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            overline="Movimiento reciente"
            title="Últimas postulaciones"
            subtitle="Candidatos que aplicaron a tus vacantes."
            action={
              recent.length > 0 ? (
                <Button
                  label="Ver todas"
                  onPress={() => onOpenTab('candidatos')}
                  variant="ghost"
                  size="sm"
                  iconRight="arrow-forward"
                />
              ) : undefined
            }
          />

          {recent.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="Aún no hay postulaciones"
              description="Cuando un estudiante aplique a una de tus vacantes aparecerá aquí."
            />
          ) : (
            <View style={styles.list}>
              {recent.map((application) => (
                <View key={application.id} style={styles.applicationRow}>
                  <Avatar name={application.studentName} size={36} tone="soft" />
                  <View style={styles.applicationCopy}>
                    <Text style={styles.applicationName} numberOfLines={1}>
                      {application.studentName}
                    </Text>
                    <Text style={styles.applicationJob} numberOfLines={1}>
                      {application.jobTitle} · {formatRelativeDate(application.appliedAt)}
                    </Text>
                  </View>
                  <StatusBadge status={application.status} size="small" />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Icon name="shield-checkmark-outline" size={20} color={Brand.greenDark} />
          </View>
          <View style={styles.footerCopy}>
            <Text style={styles.footerTitle}>Convenio UNIPAZ</Text>
            <Text style={styles.footerText}>
              {pluralize(
                summary?.applicationsTotal ?? 0,
                'estudiante ha participado',
                'estudiantes han participado',
              )}{' '}
              en tus procesos de selección.
            </Text>
          </View>
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
  hero: {
    backgroundColor: Brand.navy,
    borderRadius: Radius.xxl,
    padding: Space.xl,
    gap: Space.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  heroCopy: {
    flex: 1,
    gap: 2,
  },
  heroEyebrow: {
    ...Type.overline,
    color: Brand.greenLine,
    fontSize: 9,
  },
  heroTitle: {
    ...Type.titleSmall,
    color: Brand.surface,
  },
  heroSubtitle: {
    ...Type.caption,
    color: 'rgba(255, 255, 255, 0.66)',
  },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: Brand.navyLine,
  },
  heroStatusText: {
    ...Type.caption,
    flex: 1,
    minWidth: 180,
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  actionsGrid: {
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 1,
  },
  actionTitle: {
    ...Type.label,
    color: Brand.ink,
  },
  actionDescription: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  section: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
  },
  list: {
    gap: 6,
  },
  applicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  applicationCopy: {
    flex: 1,
    gap: 1,
  },
  applicationName: {
    ...Type.bodyStrong,
    fontSize: 13,
    color: Brand.ink,
  },
  applicationJob: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Brand.greenTint,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.greenLine,
    padding: Space.lg,
  },
  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCopy: {
    flex: 1,
    gap: 2,
  },
  footerTitle: {
    ...Type.label,
    color: Brand.greenDeep,
  },
  footerText: {
    ...Type.caption,
    fontSize: 11.5,
    color: Brand.greenDeep,
  },
});
