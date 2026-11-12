import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { JobOffer, UserRole } from '@/data/mock-data';
import { SkeletonBlock } from '@/components/SkeletonBlock';

interface LandingPageProps {
  jobs: JobOffer[];
  hasSession: boolean;
  isLoading: boolean;
  errorMessage?: string | null;
  onExplore: () => void;
  onLogin: (role: UserRole) => void;
  onCreateAccount: () => void;
}

export function HU00_LandingPage({
  jobs,
  hasSession,
  isLoading,
  errorMessage,
  onExplore,
  onLogin,
  onCreateAccount,
}: LandingPageProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 760;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={[styles.shell, wide && styles.wideShell]}>
        <View style={styles.navigation}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}><Text style={styles.brandMarkText}>U</Text></View>
            <View>
              <Text style={styles.brandName}>UniEmpleo</Text>
              <Text style={styles.brandMeta}>UNIPAZ · Barrancabermeja</Text>
            </View>
          </View>
          <View style={styles.navigationActions}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => onLogin('student')}
              style={styles.navLogin}>
              <Text style={styles.navLoginText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onCreateAccount}
              style={styles.navRegister}>
              <Text style={styles.navRegisterText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.hero, wide && styles.heroWide]}>
          <View style={[styles.heroCopy, wide && styles.heroCopyWide]}>
            <Text style={styles.eyebrow}>TALENTO UNIPAZ · OPORTUNIDADES LOCALES</Text>
            <Text style={[styles.headline, wide && styles.headlineWide]}>
              El siguiente paso de tu carrera empieza aquí.
            </Text>
            <Text style={styles.description}>
              Encuentra prácticas y empleos conectados con tu formación. Las empresas pueden
              publicar oportunidades y gestionar sus procesos en un solo lugar.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={onExplore}
                style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Explorar vacantes</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onLogin('company')}
                style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Ingresar como empresa</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.trustLine}>Acceso con cuenta institucional · Gestión segura de postulaciones</Text>
          </View>

          <View style={[styles.preview, wide && styles.previewWide]}>
            <View style={styles.previewTop}>
              <View>
                <Text style={styles.previewLabel}>TU ESPACIO PROFESIONAL</Text>
                <Text style={styles.previewTitle}>Oportunidades que conectan</Text>
              </View>
              <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>UNIPAZ</Text></View>
            </View>
            <View style={styles.searchPreview}>
              <Text style={styles.searchLabel}>¿Qué estás buscando?</Text>
              <Text style={styles.searchValue}>Prácticas, empleo o tu primera experiencia</Text>
              <View style={styles.searchDivider} />
              <Text style={styles.searchLabel}>¿Dónde?</Text>
              <Text style={styles.searchValue}>Barrancabermeja y opciones remotas</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={onExplore}
                style={styles.searchAction}>
                <Text style={styles.searchActionText}>Ver oportunidades</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.previewFooter}>
              <View style={styles.previewStep}><Text style={styles.stepNumber}>01</Text><Text style={styles.stepLabel}>Explora</Text></View>
              <View style={styles.stepRule} />
              <View style={styles.previewStep}><Text style={styles.stepNumber}>02</Text><Text style={styles.stepLabel}>Postúlate</Text></View>
              <View style={styles.stepRule} />
              <View style={styles.previewStep}><Text style={styles.stepNumber}>03</Text><Text style={styles.stepLabel}>Avanza</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.opportunitiesSection}>
          <View style={styles.opportunitiesHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>VACANTES PUBLICADAS</Text>
              <Text style={styles.sectionTitle}>Oportunidades disponibles</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onExplore}
              style={styles.textAction}>
              <Text style={styles.textActionLabel}>Ver todas</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Cargando vacantes"
              style={styles.jobPreviewList}>
              {Array.from({ length: 3 }, (_, index) => (
                <View key={`job-skeleton-${index}`} style={styles.jobPreview}>
                  <SkeletonBlock style={styles.skeletonCompany} />
                  <SkeletonBlock style={styles.skeletonTitle} />
                  <SkeletonBlock style={styles.skeletonDetails} />
                </View>
              ))}
            </View>
          ) : errorMessage ? (
            <View accessibilityRole="alert" style={styles.jobsEmpty}>
              <Text style={styles.jobsError}>{errorMessage}</Text>
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.jobsEmpty}>
              <Text style={styles.jobsMessage}>
                {hasSession
                  ? 'No hay vacantes publicadas en este momento.'
                  : 'Inicia sesión para consultar las vacantes disponibles.'}
              </Text>
            </View>
          ) : (
            <View style={styles.jobPreviewList}>
              {jobs.slice(0, 3).map((job) => (
                <View key={job.id} style={styles.jobPreview}>
                  <Text style={styles.jobCompany}>{job.companyName}</Text>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobDetails}>
                    {job.modality} · {job.location}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionEyebrow}>DISEÑADO PARA CADA ETAPA</Text>
            <Text style={styles.sectionTitle}>Un espacio para conectar talento y oportunidades.</Text>
          </View>
          <View style={[styles.audienceGrid, wide && styles.audienceGridWide]}>
            <View style={styles.audienceCard}>
              <Text style={styles.audienceIndex}>01 / ESTUDIANTES</Text>
              <Text style={styles.audienceTitle}>Tu formación, en movimiento.</Text>
              <Text style={styles.audienceBody}>
                Descubre ofertas afines a tu programa, organiza tu perfil y consulta el avance de
                tus postulaciones.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onLogin('student')}
                style={styles.textAction}>
                <Text style={styles.textActionLabel}>Entrar como estudiante</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.audienceCard}>
              <Text style={styles.audienceIndex}>02 / EMPRESAS</Text>
              <Text style={styles.audienceTitle}>Encuentra el talento que buscas.</Text>
              <Text style={styles.audienceBody}>
                Publica vacantes, revisa perfiles postulados y acompaña cada proceso de selección.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onLogin('company')}
                style={styles.textAction}>
                <Text style={styles.textActionLabel}>Acceso para empresas</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>UniEmpleo · UNIPAZ</Text>
          <Text style={styles.footerText}>Plataforma de oportunidades para la comunidad universitaria.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F4F5F7' },
  pageContent: { alignItems: 'center' },
  shell: { width: '100%', maxWidth: 1180, paddingHorizontal: 22 },
  wideShell: { paddingHorizontal: 44 },
  navigation: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EAE7',
    gap: 12,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#00963F',
    alignItems: 'center', justifyContent: 'center',
  },
  brandMarkText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  brandName: { color: '#1A1F36', fontSize: 17, fontWeight: '800' },
  brandMeta: { color: '#6B7F7A', fontSize: 10, marginTop: 1 },
  navigationActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogin: { paddingHorizontal: 10, paddingVertical: 9 },
  navLoginText: { color: '#31554F', fontSize: 12, fontWeight: '700' },
  navRegister: { paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#E6F7ED', borderRadius: 7 },
  navRegisterText: { color: '#007832', fontSize: 12, fontWeight: '700' },
  hero: { paddingTop: 42, paddingBottom: 42, gap: 28 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 66, paddingBottom: 74, gap: 50 },
  heroCopy: { gap: 14 },
  heroCopyWide: { flex: 1.05 },
  eyebrow: { color: '#00963F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  headline: { color: '#1A1F36', fontSize: 38, lineHeight: 43, fontWeight: '800', letterSpacing: -1.2 },
  headlineWide: { fontSize: 54, lineHeight: 59, maxWidth: 560 },
  description: { color: '#6B7280', fontSize: 15, lineHeight: 23, maxWidth: 560 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 4 },
  primaryAction: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#00963F',
    paddingHorizontal: 17, paddingVertical: 13, borderRadius: 7,
  },
  primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  actionArrow: { color: '#00963F', fontSize: 17, fontWeight: '700' },
  secondaryAction: { paddingHorizontal: 12, paddingVertical: 12 },
  secondaryActionText: { color: '#31554F', fontSize: 12, fontWeight: '700' },
  trustLine: { color: '#7A8C87', fontSize: 10, lineHeight: 16, marginTop: 5 },
  preview: { backgroundColor: '#EAF2EF', padding: 18, borderRadius: 12, gap: 12 },
  previewWide: { flex: 0.95, padding: 24 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  previewLabel: { color: '#71847E', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  previewTitle: { color: '#1A1F36', fontSize: 17, fontWeight: '800', marginTop: 4 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: '#FFFFFF', borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00963F' },
  liveText: { color: '#6B7280', fontSize: 8, fontWeight: '800' },
  searchPreview: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, gap: 5 },
  searchLabel: { color: '#82918D', fontSize: 9, fontWeight: '700' },
  searchValue: { color: '#1A1F36', fontSize: 12, fontWeight: '600' },
  searchDivider: { height: 1, backgroundColor: '#E7ECEA', marginVertical: 5 },
  searchAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11 },
  searchActionText: { color: '#00963F', fontSize: 11, fontWeight: '800' },
  previewFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  previewStep: { alignItems: 'center', gap: 3 },
  stepNumber: { color: '#00963F', fontSize: 11, fontWeight: '800' },
  stepLabel: { color: '#526C65', fontSize: 9, fontWeight: '600' },
  stepRule: { height: 1, flex: 1, backgroundColor: '#C8D9D3' },
  opportunitiesSection: { paddingTop: 24, paddingBottom: 28, borderTopWidth: 1, borderTopColor: '#E4EAE7', gap: 14 },
  opportunitiesHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  jobsEmpty: { padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4EAE7', borderRadius: 8 },
  jobsMessage: { color: '#6B7280', fontSize: 12, lineHeight: 18 },
  jobsError: { color: '#991B1B', fontSize: 12, lineHeight: 18 },
  jobPreviewList: { gap: 8 },
  jobPreview: { padding: 14, gap: 4, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4EAE7', borderRadius: 8 },
  skeletonCompany: { width: '34%', height: 9 },
  skeletonTitle: { width: '72%', height: 14, marginVertical: 3 },
  skeletonDetails: { width: '48%', height: 10 },
  jobCompany: { color: '#007832', fontSize: 10, fontWeight: '700' },
  jobTitle: { color: '#1A1F36', fontSize: 14, fontWeight: '700' },
  jobDetails: { color: '#6B7280', fontSize: 11 },
  section: { paddingTop: 24, paddingBottom: 42, borderTopWidth: 1, borderTopColor: '#E4EAE7', gap: 20 },
  sectionHeading: { gap: 7 },
  sectionEyebrow: { color: '#00963F', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { color: '#1A1F36', fontSize: 22, lineHeight: 28, fontWeight: '800', maxWidth: 560 },
  audienceGrid: { gap: 12 },
  audienceGridWide: { flexDirection: 'row' },
  audienceCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4EAE7', borderRadius: 9, padding: 18, gap: 10 },
  audienceIndex: { color: '#00963F', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  audienceTitle: { color: '#1A1F36', fontSize: 17, fontWeight: '800' },
  audienceBody: { color: '#6B7280', fontSize: 12, lineHeight: 19, minHeight: 58 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
  textActionLabel: { color: '#00963F', fontSize: 11, fontWeight: '800' },
  footer: { paddingVertical: 22, borderTopWidth: 1, borderTopColor: '#E4EAE7', gap: 4 },
  footerBrand: { color: '#31554F', fontSize: 11, fontWeight: '800' },
  footerText: { color: '#7A8C87', fontSize: 10, lineHeight: 15 },
});
