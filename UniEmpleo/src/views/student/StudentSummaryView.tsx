import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Application, JobOffer, StudentProfile, StudentTab } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard, StatsGrid } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate, formatRelativeDate } from '@/lib/format';

interface StudentSummaryViewProps {
  student: StudentProfile;
  applications: Application[];
  jobs: JobOffer[];
  onOpenTab: (tab: StudentTab) => void;
}

export function StudentSummaryView({
  student,
  applications,
  jobs,
  onOpenTab,
}: StudentSummaryViewProps) {
  const pending = applications.filter(
    (application) => application.status === 'pending' || application.status === 'reviewed',
  ).length;
  const interviews = applications.filter((application) => application.status === 'interview').length;
  const accepted = applications.filter((application) => application.status === 'accepted').length;
  const appliedJobIds = new Set(applications.map((application) => application.jobId));
  const suggestions = jobs
    .filter((job) => job.status === 'active' && !appliedJobIds.has(job.id))
    .slice(0, 3);
  const recent = [...applications].slice(0, 3);
  const firstName = student.name?.split(' ')[0] || 'estudiante';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Avatar name={student.name} size={52} tone="soft" />
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Panel de estudiante</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                Hola, {firstName}
              </Text>
              <Text style={styles.heroSubtitle} numberOfLines={2}>
                {student.program}
                {student.semester ? ` · Semestre ${student.semester}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Icon name="school-outline" size={14} color={Brand.greenLine} />
            <Text style={styles.heroFooterText}>Universidad de la Paz — UNIPAZ</Text>
          </View>
        </View>

        <SectionHeader
          overline="Mi actividad"
          title="Resumen de postulaciones"
          subtitle="Así avanzan tus procesos con las empresas aliadas."
        />

        <StatsGrid>
          <StatCard
            label="Postulaciones"
            value={applications.length}
            icon="document-text-outline"
            tone="navy"
          />
          <StatCard
            label="En proceso"
            value={pending}
            icon="time-outline"
            tone="amber"
            helper="Pendientes o en revisión"
          />
          <StatCard label="Entrevistas" value={interviews} icon="people-outline" tone="blue" />
          <StatCard
            label="Aceptadas"
            value={accepted}
            icon="checkmark-done-outline"
            tone="green"
          />
        </StatsGrid>

        <View style={styles.quickRow}>
          <Button
            label="Explorar vacantes"
            onPress={() => onOpenTab('vacantes')}
            variant="primary"
            size="md"
            icon="search-outline"
            style={styles.quickButton}
          />
          <Button
            label="Mis postulaciones"
            onPress={() => onOpenTab('postulaciones')}
            variant="secondary"
            size="md"
            icon="document-text-outline"
            style={styles.quickButton}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            overline="Seguimiento"
            title="Postulaciones recientes"
            subtitle="Consulta el estado de tus procesos activos."
            action={
              applications.length > 0 ? (
                <Button
                  label="Ver todas"
                  onPress={() => onOpenTab('postulaciones')}
                  variant="ghost"
                  size="sm"
                  iconRight="arrow-forward"
                />
              ) : undefined
            }
          />

          {recent.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Aún no te has postulado"
              description="Explora las vacantes disponibles y envía tu primera postulación."
            />
          ) : (
            <View style={styles.list}>
              {recent.map((application) => (
                <View key={application.id} style={styles.applicationRow}>
                  <View style={styles.applicationIcon}>
                    <Icon name="briefcase-outline" size={17} color={Brand.greenDark} />
                  </View>
                  <View style={styles.applicationCopy}>
                    <Text style={styles.applicationTitle} numberOfLines={1}>
                      {application.jobTitle}
                    </Text>
                    <Text style={styles.applicationMeta} numberOfLines={1}>
                      {application.companyName} · {formatRelativeDate(application.appliedAt)}
                    </Text>
                  </View>
                  <StatusBadge status={application.status} size="small" />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            overline="Oportunidades"
            title="Recomendadas para ti"
            subtitle="Vacantes activas en las que aún no te has postulado."
            action={
              <Button
                label="Ver todas"
                onPress={() => onOpenTab('vacantes')}
                variant="ghost"
                size="sm"
                iconRight="arrow-forward"
              />
            }
          />

          {suggestions.length === 0 ? (
            <EmptyState
              icon="sparkles-outline"
              title="Sin nuevas sugerencias"
              description="Vuelve pronto: las empresas publican nuevas vacantes cada semana."
            />
          ) : (
            <View style={styles.list}>
              {suggestions.map((job) => (
                <View key={job.id} style={styles.jobRow}>
                  <View style={styles.jobTop}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.jobCompany} numberOfLines={1}>
                      {job.companyName}
                    </Text>
                  </View>
                  <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="location-outline" size={13} color={Brand.slateSoft} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {job.location}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="calendar-outline" size={13} color={Brand.slateSoft} />
                      <Text style={styles.metaText}>{formatDate(job.deadline)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Icon name="person-circle-outline" size={20} color={Brand.greenDark} />
          </View>
          <View style={styles.footerCopy}>
            <Text style={styles.footerTitle}>Mantén tu perfil actualizado</Text>
            <Text style={styles.footerText}>
              {student.cvFile
                ? `Tu hoja de vida está cargada: ${student.cvFile.name}.`
                : 'Sube tu hoja de vida para que las empresas conozcan tu experiencia.'}
            </Text>
          </View>
          <Button
            label={student.cvFile ? 'Revisar' : 'Completar'}
            onPress={() => onOpenTab('perfil')}
            variant="ghost"
            size="sm"
            iconRight="arrow-forward"
          />
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
    fontSize: 9,
    color: Brand.greenLine,
  },
  heroTitle: {
    ...Type.titleSmall,
    color: Brand.surface,
  },
  heroSubtitle: {
    ...Type.caption,
    color: 'rgba(255, 255, 255, 0.68)',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: Brand.navyLine,
  },
  heroFooterText: {
    ...Type.caption,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    flexGrow: 1,
    flexBasis: 160,
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
  applicationIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationCopy: {
    flex: 1,
    gap: 1,
  },
  applicationTitle: {
    ...Type.bodyStrong,
    fontSize: 13,
    color: Brand.ink,
  },
  applicationMeta: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  jobRow: {
    gap: 4,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  jobTop: {
    gap: 1,
  },
  jobTitle: {
    ...Type.bodyStrong,
    fontSize: 13,
    color: Brand.ink,
  },
  jobCompany: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Type.caption,
    fontSize: 10.5,
    color: Brand.slateSoft,
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
