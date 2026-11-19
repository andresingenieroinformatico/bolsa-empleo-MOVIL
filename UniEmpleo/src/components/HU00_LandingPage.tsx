import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { JobOffer, UserRole } from '@/data/mock-data';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Notice } from '@/components/ui/notice';

interface LandingPageProps {
  jobs: JobOffer[];
  hasSession: boolean;
  sessionRole?: UserRole | null;
  userName?: string;
  isLoading: boolean;
  errorMessage?: string | null;
  sessionNotice?: string | null;
  onDismissSessionNotice?: () => void;
  onExplore: () => void;
  onLogin: (role: UserRole) => void;
  onCreateAccount: () => void;
  /** Continues in the section the user was viewing before going home. */
  onResumeSession?: () => void;
  /** Opens the main dashboard of the signed-in role. */
  onOpenDashboard?: () => void;
  onLogout?: () => void;
}

const SESSION_ROLE_LABEL: Record<UserRole, string> = {
  student: 'Estudiante',
  company: 'Empresa',
  admin: 'Administrador',
};

const STEPS = [
  { number: '01', title: 'Explora', copy: 'Filtra por área, modalidad y jornada.' },
  { number: '02', title: 'Postúlate', copy: 'Adjunta tu hoja de vida en segundos.' },
  { number: '03', title: 'Avanza', copy: 'Sigue cada etapa del proceso.' },
];

export function HU00_LandingPage({
  jobs,
  hasSession,
  sessionRole,
  userName,
  isLoading,
  errorMessage,
  sessionNotice,
  onDismissSessionNotice,
  onExplore,
  onLogin,
  onCreateAccount,
  onResumeSession,
  onOpenDashboard,
  onLogout,
}: LandingPageProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 860;

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.shell, wide && styles.wideShell]}>
        <View style={styles.navigation}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Icon name="briefcase" size={18} color={Brand.surface} />
            </View>
            <View>
              <Text style={styles.brandName}>UniEmpleo</Text>
              <Text style={styles.brandMeta}>UNIPAZ · Barrancabermeja</Text>
            </View>
          </View>

          <View style={styles.navigationActions}>
            {hasSession && (onOpenDashboard || onResumeSession) ? (
              <Button
                label="Mi panel"
                variant="primary"
                size="sm"
                iconRight="arrow-forward"
                onPress={onOpenDashboard ?? onResumeSession}
              />
            ) : (
              <>
                <Button
                  label="Iniciar sesión"
                  variant="ghost"
                  size="sm"
                  onPress={() => onLogin('student')}
                />
                <Button
                  label="Registrarse"
                  variant="primary"
                  size="sm"
                  onPress={onCreateAccount}
                />
              </>
            )}
          </View>
        </View>

        {sessionNotice ? (
          <View style={styles.sessionNoticeWrap}>
            <Notice
              tone="info"
              title="Sesión cerrada"
              message={sessionNotice}
              onDismiss={onDismissSessionNotice}
            />
          </View>
        ) : null}

        {hasSession && sessionRole ? (
          <View style={styles.sessionBar}>
            <View style={styles.sessionState}>
              <View style={styles.sessionDot} />
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionTitle}>Sesión activa</Text>
                <Text style={styles.sessionMeta} numberOfLines={1}>
                  {SESSION_ROLE_LABEL[sessionRole]}
                  {userName ? ` · ${userName}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.sessionActions}>
              {onResumeSession ? (
                <Button
                  label="Continuar"
                  variant="secondary"
                  size="sm"
                  iconRight="arrow-forward"
                  onPress={onResumeSession}
                />
              ) : null}
              {onLogout ? (
                <Button
                  label="Cerrar sesión"
                  variant="ghost"
                  size="sm"
                  icon="log-out-outline"
                  onPress={onLogout}
                />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.hero, wide && styles.heroWide]}>
          <View style={styles.heroGlow} />
          <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
            <View style={styles.eyebrowPill}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>TALENTO UNIPAZ · OPORTUNIDADES LOCALES</Text>
            </View>

            <Text style={[styles.headline, wide && styles.headlineWide]}>
              Tu siguiente oportunidad empieza en el campus.
            </Text>

            <Text style={styles.description}>
              Prácticas, empleos y primeros empleos conectados con tu formación. Un solo lugar
              para explorar vacantes, postularte y seguir el avance de cada proceso.
            </Text>

            <View style={styles.heroActions}>
              <Button
                label="Explorar vacantes"
                onPress={onExplore}
                size="lg"
                iconRight="arrow-forward"
              />
              <Button
                label="Ingresar como empresa"
                variant="outlineLight"
                size="lg"
                onPress={() => onLogin('company')}
              />
            </View>

            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Icon name="shield-checkmark-outline" size={15} color="rgba(255,255,255,0.72)" />
                <Text style={styles.trustText}>Cuenta institucional</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustItem}>
                <Icon name="briefcase-outline" size={15} color="rgba(255,255,255,0.72)" />
                <Text style={styles.trustText}>Gestión de postulaciones</Text>
              </View>
            </View>
          </View>

          <View style={[styles.preview, wide && styles.previewWide]}>
            <View style={styles.previewHeader}>
              <View style={styles.previewHeaderCopy}>
                <Text style={styles.previewLabel}>TU ESPACIO PROFESIONAL</Text>
                <Text style={styles.previewTitle}>Oportunidades que conectan</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>UNIPAZ</Text>
              </View>
            </View>

            <View style={styles.searchCard}>
              <View style={styles.searchRow}>
                <Icon name="search-outline" size={18} color={Brand.slateSoft} />
                <View style={styles.searchCopy}>
                  <Text style={styles.searchLabel}>¿Qué estás buscando?</Text>
                  <Text style={styles.searchValue}>Prácticas, empleo o primera experiencia</Text>
                </View>
              </View>
              <View style={styles.searchDivider} />
              <View style={styles.searchRow}>
                <Icon name="location-outline" size={18} color={Brand.slateSoft} />
                <View style={styles.searchCopy}>
                  <Text style={styles.searchLabel}>¿Dónde?</Text>
                  <Text style={styles.searchValue}>Barrancabermeja y opciones remotas</Text>
                </View>
              </View>
              <Button
                label="Ver oportunidades"
                onPress={onExplore}
                size="sm"
                fullWidth
                iconRight="arrow-forward"
                style={styles.searchAction}
              />
            </View>

            <View style={styles.stepsRow}>
              {STEPS.map((step, index) => (
                <React.Fragment key={step.number}>
                  <View style={styles.step}>
                    <Text style={styles.stepNumber}>{step.number}</Text>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepCopy}>{step.copy}</Text>
                  </View>
                  {index < STEPS.length - 1 ? <View style={styles.stepRule} /> : null}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.opportunitiesSection}>
          <View style={styles.opportunitiesHeader}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>VACANTES PUBLICADAS</Text>
              <Text style={styles.sectionTitle}>Oportunidades disponibles</Text>
            </View>
            <Button
              label="Ver todas"
              variant="ghost"
              size="sm"
              iconRight="arrow-forward"
              onPress={onExplore}
            />
          </View>

          {isLoading ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Cargando vacantes"
              style={styles.jobGrid}>
              {Array.from({ length: 3 }, (_, index) => (
                <View key={`job-skeleton-${index}`} style={styles.jobCard}>
                  <SkeletonBlock style={styles.skeletonCompany} />
                  <SkeletonBlock style={styles.skeletonTitle} />
                  <SkeletonBlock style={styles.skeletonDetails} />
                </View>
              ))}
            </View>
          ) : errorMessage ? (
            <View accessibilityRole="alert" style={styles.jobsEmpty}>
              <Icon name="alert-circle-outline" size={20} color={Brand.red} />
              <Text style={styles.jobsError}>{errorMessage}</Text>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.jobsEmpty}>
              <Icon name="briefcase-outline" size={20} color={Brand.slateSoft} />
              <Text style={styles.jobsMessage}>
                {hasSession
                  ? 'No hay vacantes publicadas en este momento.'
                  : 'Inicia sesión para consultar las vacantes disponibles.'}
              </Text>
            </View>
          ) : (
            <View style={styles.jobGrid}>
              {jobs.slice(0, 3).map((job) => (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobTop}>
                    <Avatar name={job.companyName} size={38} tone="green" />
                    <View style={styles.jobTopCopy}>
                      <Text style={styles.jobCompany} numberOfLines={1}>
                        {job.companyName}
                      </Text>
                      <Text style={styles.jobTitle} numberOfLines={2}>
                        {job.title}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.jobMeta}>
                    <View style={styles.jobMetaItem}>
                      <Icon name="location-outline" size={13} color={Brand.slateSoft} />
                      <Text style={styles.jobDetails} numberOfLines={1}>
                        {job.location}
                      </Text>
                    </View>
                    <View style={styles.jobMetaItem}>
                      <Icon name="time-outline" size={13} color={Brand.slateSoft} />
                      <Text style={styles.jobDetails} numberOfLines={1}>
                        {job.modality}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionEyebrow}>DISEÑADO PARA CADA ETAPA</Text>
            <Text style={styles.sectionTitle}>
              Un espacio para conectar talento y oportunidades.
            </Text>
          </View>

          <View style={[styles.audienceGrid, wide && styles.audienceGridWide]}>
            <View style={styles.audienceCard}>
              <View style={styles.audienceIcon}>
                <Icon name="school-outline" size={22} color={Brand.greenDark} />
              </View>
              <Text style={styles.audienceIndex}>01 · ESTUDIANTES</Text>
              <Text style={styles.audienceTitle}>Tu formación, en movimiento.</Text>
              <Text style={styles.audienceBody}>
                Descubre ofertas afines a tu programa, organiza tu perfil y consulta el avance de
                tus postulaciones.
              </Text>
              <Button
                label="Entrar como estudiante"
                variant="tonal"
                size="sm"
                iconRight="arrow-forward"
                onPress={() => onLogin('student')}
                style={styles.audienceAction}
              />
            </View>

            <View style={styles.audienceCard}>
              <View style={[styles.audienceIcon, styles.audienceIconNavy]}>
                <Icon name="business-outline" size={22} color={Brand.surface} />
              </View>
              <Text style={styles.audienceIndex}>02 · EMPRESAS</Text>
              <Text style={styles.audienceTitle}>Encuentra el talento que buscas.</Text>
              <Text style={styles.audienceBody}>
                Publica vacantes, revisa perfiles postulados y acompaña cada proceso de selección.
              </Text>
              <Button
                label="Acceso para empresas"
                variant="secondary"
                size="sm"
                iconRight="arrow-forward"
                onPress={() => onLogin('company')}
                style={styles.audienceAction}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBrandRow}>
            <View style={styles.footerMark}>
              <Icon name="briefcase" size={13} color={Brand.surface} />
            </View>
            <Text style={styles.footerBrand}>UniEmpleo · UNIPAZ</Text>
          </View>
          <Text style={styles.footerText}>
            Plataforma de oportunidades para la comunidad universitaria de Barrancabermeja.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Brand.canvas,
  },
  pageContent: {
    alignItems: 'center',
  },
  shell: {
    width: '100%',
    maxWidth: 1080,
    paddingHorizontal: Space.xl,
  },
  wideShell: {
    paddingHorizontal: Space.xxxl,
  },
  navigation: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...Type.heading,
    color: Brand.ink,
    fontSize: 17,
    letterSpacing: -0.35,
  },
  brandMeta: {
    ...Type.caption,
    fontSize: 10,
    color: Brand.slateSoft,
    marginTop: 1,
  },
  navigationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionNoticeWrap: {
    marginBottom: Space.sm,
  },
  sessionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: Space.md,
    marginBottom: Space.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.greenLine,
    backgroundColor: Brand.greenTint,
  },
  sessionState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Brand.greenDark,
  },
  sessionCopy: {
    flexShrink: 1,
    gap: 1,
  },
  sessionTitle: {
    ...Type.label,
    color: Brand.greenDeep,
    fontWeight: '800',
  },
  sessionMeta: {
    ...Type.caption,
    color: '#39724E',
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Brand.navy,
    borderRadius: Radius.sheet,
    padding: Space.xxl,
    gap: Space.xxl,
    marginTop: Space.xs,
    ...Shadows.raised,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.huge,
    gap: Space.huge,
  },
  heroGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(0, 150, 63, 0.18)',
    top: -170,
    right: -120,
  },
  heroCopy: {
    gap: 16,
    flexShrink: 1,
  },
  heroCopyWide: {
    flex: 1.02,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
  eyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Brand.green,
  },
  eyebrow: {
    ...Type.overline,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  headline: {
    ...Type.display,
    color: Brand.surface,
  },
  headlineWide: {
    ...Type.displayLarge,
    fontSize: 46,
    lineHeight: 51,
  },
  description: {
    ...Type.body,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255, 255, 255, 0.72)',
    maxWidth: 520,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    ...Type.caption,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.62)',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  preview: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: Brand.navyLine,
    borderRadius: Radius.xxl,
    padding: Space.lg,
    gap: Space.md,
  },
  previewWide: {
    flex: 0.98,
    padding: Space.xl,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  previewHeaderCopy: {
    flex: 1,
    gap: 3,
  },
  previewLabel: {
    ...Type.overline,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  previewTitle: {
    ...Type.titleSmall,
    fontSize: 17,
    color: Brand.surface,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Brand.navyLine,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.green,
  },
  liveText: {
    ...Type.overline,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchCopy: {
    flex: 1,
    gap: 1,
  },
  searchLabel: {
    ...Type.caption,
    fontSize: 10,
    color: Brand.slateSoft,
  },
  searchValue: {
    ...Type.bodyStrong,
    fontSize: 12.5,
    color: Brand.ink,
  },
  searchDivider: {
    height: 1,
    backgroundColor: Brand.lineSoft,
    marginVertical: 6,
  },
  searchAction: {
    marginTop: 10,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  step: {
    flex: 1,
    gap: 2,
    alignItems: 'center',
  },
  stepNumber: {
    ...Type.label,
    fontSize: 10,
    color: Brand.greenTint,
    letterSpacing: 0.5,
  },
  stepTitle: {
    ...Type.label,
    fontSize: 11,
    color: Brand.surface,
  },
  stepCopy: {
    ...Type.caption,
    fontSize: 9,
    lineHeight: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  stepRule: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginTop: 6,
  },
  opportunitiesSection: {
    paddingTop: Space.xxl,
    paddingBottom: Space.xxl,
    gap: Space.md,
  },
  opportunitiesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionHeading: {
    gap: 4,
    flexShrink: 1,
  },
  sectionEyebrow: {
    ...Type.overline,
    color: Brand.greenDark,
  },
  sectionTitle: {
    ...Type.title,
    color: Brand.ink,
    maxWidth: 620,
  },
  jobGrid: {
    gap: 10,
  },
  jobCard: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: 12,
    ...Shadows.card,
  },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  jobTopCopy: {
    flex: 1,
    gap: 2,
  },
  jobCompany: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.greenDark,
  },
  jobTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobDetails: {
    ...Type.caption,
    color: Brand.slate,
    fontSize: 11,
  },
  skeletonCompany: { width: '34%', height: 9 },
  skeletonTitle: { width: '72%', height: 14, marginVertical: 3 },
  skeletonDetails: { width: '48%', height: 10 },
  jobsEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Space.lg,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.xl,
  },
  jobsMessage: {
    ...Type.body,
    color: Brand.slate,
    flex: 1,
  },
  jobsError: {
    ...Type.body,
    color: Brand.red,
    flex: 1,
  },
  section: {
    paddingTop: Space.xxl,
    paddingBottom: Space.xxl,
    borderTopWidth: 1,
    borderTopColor: Brand.line,
    gap: Space.lg,
  },
  audienceGrid: {
    gap: 12,
  },
  audienceGridWide: {
    flexDirection: 'row',
  },
  audienceCard: {
    flex: 1,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.xxl,
    padding: Space.xl,
    gap: 8,
    ...Shadows.card,
  },
  audienceIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  audienceIconNavy: {
    backgroundColor: Brand.navy,
  },
  audienceIndex: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.greenDark,
  },
  audienceTitle: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  audienceBody: {
    ...Type.body,
    color: Brand.slate,
    minHeight: 60,
  },
  audienceAction: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  footer: {
    paddingVertical: Space.xxl,
    borderTopWidth: 1,
    borderTopColor: Brand.line,
    gap: 8,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerMark: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    ...Type.label,
    color: Brand.inkSoft,
  },
  footerText: {
    ...Type.caption,
    color: Brand.slateSoft,
  },
});
