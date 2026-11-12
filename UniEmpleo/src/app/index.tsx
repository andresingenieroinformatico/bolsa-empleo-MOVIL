import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RoleHeader } from '@/components/RoleHeader';
import { HU01_LoginModal } from '@/components/HU01_LoginModal';
import {
  Application,
  ApplicationStatus,
  CompanyProfile,
  JobOffer,
  StudentProfile,
  UserRole,
} from '@/data/mock-data';
import {
  ApiDocument,
  ApiError,
  CompanyRegistrationInput,
  JobSearchFilters,
  applyToJob,
  createJob,
  getAuthenticatedUser,
  getCompanyJobs,
  getCompanyProfile,
  getCompanyStatus,
  getJobApplicants,
  getJobs,
  getPendingCompanies,
  getStudentApplications,
  getStudentProfile,
  logout,
  registerCompany,
  unwrapData,
  unwrapList,
  unwrapPage,
  updateApplicationStatus,
  updateCompanyApproval,
  updateCompanyProfile,
  updateJob,
  updateStudentProfile,
  uploadStudentCv,
  toJobWriteInput,
} from '@/services/api';
import {
  mapApplication,
  mapCompany,
  mapJob,
  mapStudentProfile,
} from '@/services/api-mappers';
import {
  AuthSession,
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from '@/services/auth-session';
import { HU00_LandingPage } from '@/components/HU00_LandingPage';
import { HU00_RegistrationModal } from '@/components/HU00_RegistrationModal';
import { resolveRoleEntry } from '@/services/role-navigation';
import { SkeletonBlock } from '@/components/SkeletonBlock';
import { useStudentGoogleLogin } from '@/hooks/use-student-google-login';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';

// Vistas de Estudiante
import { HU04_VacantesView } from '@/views/student/HU04_VacantesView';
import { HU06_PostulacionesView } from '@/views/student/HU06_PostulacionesView';
import { HU09_PerfilView } from '@/views/student/HU09_PerfilView';

// Vistas de Empresa
import { HU02_PerfilEmpresaView } from '@/views/company/HU02_PerfilEmpresaView';
import { HU03_MisVacantesView } from '@/views/company/HU03_MisVacantesView';
import { HU07_CandidatosView } from '@/views/company/HU07_CandidatosView';

// Vista de Administrador
import { HU08_AdminDashboardView } from '@/views/admin/HU08_AdminDashboardView';

const EMPTY_STUDENT: StudentProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  program: '',
  semester: 0,
  availability: {},
};

function toJobPayload(job: JobOffer) {
  return toJobWriteInput({
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities || '',
    area: job.area,
    contractType: job.contractType,
    modality: job.modality,
    schedule: job.schedule,
    location: job.location,
    salaryRange: job.salaryRange,
    salaryNegotiable: job.salaryNegotiable ?? false,
    positions: job.vacanciesCount,
    deadline: job.deadline,
    requiresCv: job.requiresCv,
    programsTargeted: job.program.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean),
    status: job.status,
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [studentTab, setStudentTab] = useState<'vacantes' | 'postulaciones' | 'perfil'>('vacantes');
  const [companyTab, setCompanyTab] = useState<'vacantes' | 'candidatos' | 'perfil'>('vacantes');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleDataLoading, setIsRoleDataLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const loadPublicJobs = useCallback(async (
    filters: JobSearchFilters = {},
    page = 1,
    append = false,
    token?: string | null,
  ) => {
    const response = await getJobs(token, { ...filters, page, perPage: 12 });
    const result = unwrapPage<unknown>(response, page, 12);
    const nextJobs = result.items.map(mapJob);
    setJobs((currentJobs) => {
      if (!append) return nextJobs;
      const currentIds = new Set(currentJobs.map((job) => job.id));
      return [...currentJobs, ...nextJobs.filter((job) => !currentIds.has(job.id))];
    });
    setJobsPage(result.currentPage);
    setHasMoreJobs(result.hasMore);
    return nextJobs;
  }, []);

  const loadRoleData = useCallback(async (activeSession: AuthSession) => {
    const token = activeSession.token;
    switch (activeSession.user.role) {
      case 'student': {
        const [profileResponse, applicationsResponse] = await Promise.all([
          getStudentProfile(token),
          getStudentApplications(token),
        ]);
        setStudent(mapStudentProfile(unwrapData(profileResponse)));
        setApplications(
          unwrapList<unknown>(applicationsResponse).map((item) => mapApplication(item)),
        );
        setCompany(null);
        setCompanies([]);
        break;
      }
      case 'company': {
        const [profileResponse, statusResponse, jobsResponse] = await Promise.all([
          getCompanyProfile(token),
          getCompanyStatus(token),
          getCompanyJobs(token),
        ]);
        const activeCompany = mapCompany(
          unwrapData(profileResponse),
          unwrapData(statusResponse),
        );
        const companyJobs = unwrapList<unknown>(jobsResponse).map(mapJob);
        setCompany(activeCompany);
        setCompanies([activeCompany]);
        setJobs(companyJobs);
        setJobsPage(1);
        setHasMoreJobs(false);
        setApplications([]);
        setStudent(null);
        break;
      }
      case 'admin': {
        const pendingCompanies = unwrapList<unknown>(
          await getPendingCompanies(token),
        ).map(mapCompany);
        setCompanies(pendingCompanies);
        setCompany(null);
        setStudent(null);
        setJobs([]);
        setJobsPage(1);
        setHasMoreJobs(false);
        setApplications([]);
        break;
      }
    }
  }, []);

  const reportError = useCallback((error: unknown) => {
    setApiError(
      error instanceof Error ? error.message : 'Ocurrió un error inesperado al conectar con la API.',
    );
  }, []);

  const hydrateApp = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const savedSession = await loadAuthSession();
      if (savedSession) {
        setIsRoleDataLoading(true);
        setSession(savedSession);
        setCurrentRole(savedSession.user.role);
        setShowLanding(false);
      }

      if (savedSession) {
        const user = unwrapData(await getAuthenticatedUser(savedSession.token));
        if (user.role !== savedSession.user.role) {
          throw new ApiError('El rol de la sesión guardada no coincide con la cuenta del servidor.', 403);
        }
        const verifiedSession = { ...savedSession, user };
        await saveAuthSession(verifiedSession);
        setSession(verifiedSession);
        await loadRoleData(verifiedSession);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        setSession(null);
        setCurrentRole('student');
        setShowLanding(true);
      }
      reportError(error);
    } finally {
      setIsLoading(false);
      setIsRoleDataLoading(false);
    }
  }, [loadRoleData, reportError]);

  useEffect(() => {
    const timeout = setTimeout(() => void hydrateApp(), 0);
    return () => clearTimeout(timeout);
  }, [hydrateApp]);

  const handleLoginSuccess = async (nextSession: AuthSession) => {
    const entry = resolveRoleEntry(nextSession.user.role, currentRole);
    setSession(nextSession);
    setCurrentRole(entry.role);
    setShowLanding(entry.destination !== 'dashboard');
    setApiError(null);
    setIsLoading(true);
    setIsRoleDataLoading(true);
    try {
      await loadRoleData(nextSession);
      if (nextSession.user.role === 'student') {
        await loadPublicJobs({}, 1, false, nextSession.token);
      }
    } catch (error) {
      reportError(error);
    } finally {
      setIsLoading(false);
      setIsRoleDataLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (nextSession: AuthSession) => {
    await handleLoginSuccess(nextSession);
    setShowLoginModal(false);
    setShowRegistrationModal(false);
  };

  const googleLogin = useStudentGoogleLogin({
    onAuthenticated: handleGoogleLoginSuccess,
  });

  const handleApplyToJob = async (
    job: JobOffer,
    useProfileCv: boolean,
    customCv?: ApiDocument,
    coverLetter?: string,
  ) => {
    if (!session || session.user.role !== 'student') {
      setCurrentRole('student');
      setShowLoginModal(true);
      throw new Error('Inicia sesión con Google o correo y contraseña para postularte.');
    }
    try {
      await applyToJob(session.token, job.id, {
        cvFile: useProfileCv ? undefined : customCv,
        coverLetter,
      });
      const response = await getStudentApplications(session.token);
      setApplications(unwrapList<unknown>(response).map((item) => mapApplication(item)));
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleSearchJobs = async (filters: JobSearchFilters) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await loadPublicJobs(
        filters,
        1,
        false,
        session?.user.role === 'student' ? session.token : undefined,
      );
    } catch (error) {
      reportError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreJobs = async (filters: JobSearchFilters) => {
    if (!hasMoreJobs || isLoading) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await loadPublicJobs(
        filters,
        jobsPage + 1,
        true,
        session?.user.role === 'student' ? session.token : undefined,
      );
    } catch (error) {
      reportError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStudent = async (updated: StudentProfile) => {
    if (!session || session.user.role !== 'student') {
      throw new Error('Inicia sesión para guardar tu perfil.');
    }
    try {
      await updateStudentProfile(session.token, {
        program: updated.program,
        semester: String(updated.semester),
        phone: updated.phone,
        availability: updated.availability,
      });
      setStudent(mapStudentProfile(unwrapData(await getStudentProfile(session.token))));
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleUploadCv = async (file: ApiDocument) => {
    if (!session || session.user.role !== 'student') {
      throw new Error('Inicia sesión para subir tu hoja de vida.');
    }
    try {
      await uploadStudentCv(session.token, file);
      const updated = mapStudentProfile(unwrapData(await getStudentProfile(session.token)));
      setStudent(updated);
      setApiError(null);
      return updated;
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleAddJob = async (newJob: JobOffer) => {
    if (!session || session.user.role !== 'company') throw new Error('Inicia sesión como empresa para publicar una vacante.');
    try {
      await createJob(session.token, toJobPayload(newJob));
      await loadRoleData(session);
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleUpdateJob = async (updated: JobOffer) => {
    if (!session || session.user.role !== 'company') throw new Error('Inicia sesión como empresa para editar vacantes.');
    try {
      await updateJob(session.token, updated.id, toJobPayload(updated));
      await loadRoleData(session);
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleToggleJobStatus = async (jobId: string) => {
    const selectedJob = jobs.find((job) => job.id === jobId);
    if (!selectedJob) throw new Error('No se encontró la vacante que intentas actualizar.');
    await handleUpdateJob({
      ...selectedJob,
      status: selectedJob.status === 'active' ? 'paused' : 'active',
    });
  };

  const handleUpdateApplicationStatus = async (
    appId: string,
    newStatus: ApplicationStatus,
    companyNotes?: string,
    interviewNote?: string,
  ) => {
    if (!session || session.user.role !== 'company') throw new Error('Inicia sesión como empresa para evaluar candidatos.');
    try {
      await updateApplicationStatus(session.token, appId, {
        status: newStatus,
        company_notes: companyNotes,
        interview_note: interviewNote,
      });
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleLoadJobApplicants = useCallback(async (jobId: string) => {
    if (!session || session.user.role !== 'company') {
      throw new Error('Inicia sesión como empresa para consultar candidatos.');
    }
    return unwrapList<unknown>(
      await getJobApplicants(session.token, jobId),
    ).map((item) => mapApplication(item, true));
  }, [session]);

  const handleRegisterCompany = async (input: CompanyRegistrationInput) => {
    const response = await registerCompany(input);
    if (!response.success) {
      throw new Error(response.message || 'El servidor no pudo completar el registro.');
    }
    setApiError(null);
  };

  const handleApproveCompany = async (companyId: string) => {
    if (!session || session.user.role !== 'admin') throw new Error('Inicia sesión como administrador para continuar.');
    try {
      await updateCompanyApproval(session.token, companyId, true);
      await loadRoleData(session);
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleRejectCompany = async (companyId: string, reason?: string) => {
    if (!session || session.user.role !== 'admin') throw new Error('Inicia sesión como administrador para continuar.');
    try {
      await updateCompanyApproval(session.token, companyId, false, reason);
      await loadRoleData(session);
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await logout(session.token);
      } catch (error) {
        reportError(error);
      }
    }
    await clearAuthSession();
    setSession(null);
    setStudent(null);
    setCompany(null);
    setCompanies([]);
    setApplications([]);
    setCurrentRole('student');
    setStudentTab('vacantes');
    setShowLanding(true);
  };

  const handleOpenLogin = (role: UserRole) => {
    const entry = resolveRoleEntry(session?.user.role ?? null, role);
    setCurrentRole(entry.role);
    if (entry.destination === 'dashboard') {
      setShowLanding(false);
      setShowLoginModal(false);
      return;
    }
    setShowLoginModal(true);
  };

  const handleExplore = () => {
    setStudentTab('vacantes');
    handleOpenLogin('student');
  };

  const handleCompanyLogin = () => {
    setShowRegistrationModal(false);
    handleOpenLogin('company');
  };

  const hasActiveRole = session?.user.role === currentRole;
  const accessRequiresLogin = !hasActiveRole;
  const showBottomNav = (currentRole === 'student' || currentRole === 'company') && !accessRequiresLogin;
  const showCompanyMissingProfile =
    !isLoading && !apiError && !company && currentRole === 'company' && hasActiveRole;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: showLanding ? Brand.canvas : Brand.navy }]}
      edges={['top']}>
      <StatusBar style={showLanding ? 'dark' : 'light'} />

      {showLanding ? (
        <HU00_LandingPage
          jobs={jobs}
          hasSession={Boolean(session)}
          isLoading={isLoading}
          errorMessage={apiError}
          onExplore={handleExplore}
          onLogin={handleOpenLogin}
          onCreateAccount={() => setShowRegistrationModal(true)}
        />
      ) : (
        <View style={styles.appShell}>
          <RoleHeader
            currentRole={currentRole}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onGoHome={() => setShowLanding(true)}
            userName={session?.user.name}
          />

          {isLoading && (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Sincronizando con UniEmpleo"
              style={styles.syncBar}>
              <ActivityIndicator size="small" color={Brand.greenDark} />
              <Text style={styles.syncText}>Actualizando tu información…</Text>
            </View>
          )}

          <View style={styles.mainContent}>
            {accessRequiresLogin ? (
              <AccessRequired role={currentRole} onLogin={() => handleOpenLogin(currentRole)} />
            ) : isRoleDataLoading ? (
              <RoleContentSkeleton />
            ) : (
              <>
                {currentRole === 'student' && studentTab === 'vacantes' && (
                  <HU04_VacantesView
                    jobs={jobs}
                    student={student || EMPTY_STUDENT}
                    applications={applications}
                    isLoading={isLoading}
                    hasMoreJobs={hasMoreJobs}
                    onSearch={handleSearchJobs}
                    onLoadMore={handleLoadMoreJobs}
                    onApply={handleApplyToJob}
                  />
                )}
                {currentRole === 'student' && studentTab === 'postulaciones' && (
                  <HU06_PostulacionesView applications={applications} />
                )}
                {currentRole === 'student' && studentTab === 'perfil' && student && (
                  <HU09_PerfilView
                    student={student}
                    onUpdateStudent={handleUpdateStudent}
                    onUploadCv={handleUploadCv}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'vacantes' && (
                  <HU03_MisVacantesView
                    company={company}
                    jobs={jobs}
                    onAddJob={handleAddJob}
                    onUpdateJob={handleUpdateJob}
                    onToggleJobStatus={handleToggleJobStatus}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'candidatos' && (
                  <HU07_CandidatosView
                    jobs={jobs}
                    onLoadApplicants={handleLoadJobApplicants}
                    onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'perfil' && (
                  <HU02_PerfilEmpresaView
                    company={company}
                    onUpdateCompany={async (updated) => {
                      if (!session || session.user.role !== 'company') {
                        throw new Error('Inicia sesión como empresa para actualizar el perfil.');
                      }
                      await updateCompanyProfile(session.token, {
                        company_name: updated.name,
                        nit: updated.nit,
                        sector: updated.sector,
                        description: updated.description,
                      });
                      setCompany(updated);
                      setCompanies((current) =>
                        current.map((item) => item.id === updated.id ? updated : item),
                      );
                    }}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && (
                  <HU08_AdminDashboardView
                    companies={companies}
                    onApproveCompany={handleApproveCompany}
                    onRejectCompany={handleRejectCompany}
                  />
                )}
                {showCompanyMissingProfile && (
                  <AccessRequired
                    role="company"
                    title="No pudimos cargar tu empresa"
                    description="Revisa tu conexión e inténtalo de nuevo. Tu sesión sigue activa."
                    actionLabel="Volver a intentar"
                    onLogin={() => void hydrateApp()}
                  />
                )}
              </>
            )}
          </View>

          {showBottomNav && (
            <BottomNavigation
              role={currentRole}
              studentTab={studentTab}
              companyTab={companyTab}
              onChangeStudentTab={setStudentTab}
              onChangeCompanyTab={setCompanyTab}
              bottomInset={insets.bottom}
            />
          )}
        </View>
      )}

      {apiError && (
        <View
          pointerEvents="box-none"
          style={[
            styles.errorDock,
            { bottom: (showBottomNav ? 74 : 16) + Math.max(insets.bottom, 8) },
          ]}>
          <Notice
            tone="error"
            title="No pudimos completar la acción"
            message={apiError}
            onDismiss={() => setApiError(null)}
            actionLabel="Reintentar"
            onAction={() => void hydrateApp()}
          />
        </View>
      )}

      <HU01_LoginModal
        visible={showLoginModal}
        role={currentRole}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRoleChange={setCurrentRole}
        onGoogleLogin={googleLogin.startLogin}
        googleLoginLoading={googleLogin.isLoading}
        googleLoginReady={googleLogin.isReady}
        googleClientConfigured={googleLogin.isConfigured}
        onCreateAccount={() => {
          setShowLoginModal(false);
          setShowRegistrationModal(true);
        }}
        onGoHome={() => {
          setShowLoginModal(false);
          setShowLanding(true);
        }}
      />
      {showRegistrationModal && (
        <HU00_RegistrationModal
          visible={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onRegisterCompany={handleRegisterCompany}
          onStudentGoogleLogin={googleLogin.startLogin}
          googleLoginLoading={googleLogin.isLoading}
          onLoginCompany={handleCompanyLogin}
          onGoHome={() => {
            setShowRegistrationModal(false);
            setShowLanding(true);
          }}
        />
      )}
    </SafeAreaView>
  );
}

interface BottomNavigationProps {
  role: UserRole;
  studentTab: 'vacantes' | 'postulaciones' | 'perfil';
  companyTab: 'vacantes' | 'candidatos' | 'perfil';
  onChangeStudentTab: (tab: 'vacantes' | 'postulaciones' | 'perfil') => void;
  onChangeCompanyTab: (tab: 'vacantes' | 'candidatos' | 'perfil') => void;
  bottomInset: number;
}

type TabItem = {
  key: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  active: boolean;
  onPress: () => void;
};

function BottomNavigation({
  role,
  studentTab,
  companyTab,
  onChangeStudentTab,
  onChangeCompanyTab,
  bottomInset,
}: BottomNavigationProps) {
  const items: TabItem[] =
    role === 'student'
      ? [
          {
            key: 'vacantes',
            label: 'Vacantes',
            icon: 'search-outline',
            iconActive: 'search',
            active: studentTab === 'vacantes',
            onPress: () => onChangeStudentTab('vacantes'),
          },
          {
            key: 'postulaciones',
            label: 'Postulaciones',
            icon: 'document-text-outline',
            iconActive: 'document-text',
            active: studentTab === 'postulaciones',
            onPress: () => onChangeStudentTab('postulaciones'),
          },
          {
            key: 'perfil',
            label: 'Mi perfil',
            icon: 'person-outline',
            iconActive: 'person',
            active: studentTab === 'perfil',
            onPress: () => onChangeStudentTab('perfil'),
          },
        ]
      : [
          {
            key: 'vacantes',
            label: 'Vacantes',
            icon: 'briefcase-outline',
            iconActive: 'briefcase',
            active: companyTab === 'vacantes',
            onPress: () => onChangeCompanyTab('vacantes'),
          },
          {
            key: 'candidatos',
            label: 'Candidatos',
            icon: 'people-outline',
            iconActive: 'people',
            active: companyTab === 'candidatos',
            onPress: () => onChangeCompanyTab('candidatos'),
          },
          {
            key: 'perfil',
            label: 'Empresa',
            icon: 'business-outline',
            iconActive: 'business',
            active: companyTab === 'perfil',
            onPress: () => onChangeCompanyTab('perfil'),
          },
        ];

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.active }}
          onPress={item.onPress}
          style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}>
          <View style={[styles.navIconWrap, item.active && styles.navIconWrapActive]}>
            <Icon
              name={item.active ? item.iconActive : item.icon}
              size={20}
              color={item.active ? Brand.greenDark : Brand.slateSoft}
            />
          </View>
          <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

interface AccessRequiredProps {
  role: UserRole;
  title?: string;
  description?: string;
  actionLabel?: string;
  onLogin: () => void;
}

function AccessRequired({
  role,
  title = 'Inicia sesión para continuar',
  description = 'Esta sección requiere una cuenta autenticada con el rol seleccionado.',
  actionLabel = 'Iniciar sesión',
  onLogin,
}: AccessRequiredProps) {
  const roleName =
    role === 'student' ? 'estudiante' : role === 'company' ? 'empresa' : 'administrador';

  return (
    <View style={styles.accessWrap}>
      <View style={styles.accessCard}>
        <View style={styles.accessIcon}>
          <Icon name="lock-closed-outline" size={26} color={Brand.greenDark} />
        </View>
        <Text style={styles.accessTitle}>{title}</Text>
        <Text style={styles.accessDescription}>{description}</Text>
        <Text style={styles.accessRole}>Acceso para {roleName}</Text>
        <Button
          label={actionLabel}
          onPress={onLogin}
          icon="log-in-outline"
          fullWidth
          style={styles.accessButton}
        />
      </View>
    </View>
  );
}

function RoleContentSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Cargando tu espacio de UniEmpleo"
      style={styles.roleSkeleton}>
      <SkeletonBlock style={styles.roleSkeletonHeading} />
      <SkeletonBlock style={styles.roleSkeletonSubheading} />
      {Array.from({ length: 3 }, (_, index) => (
        <View key={`role-skeleton-${index}`} style={styles.roleSkeletonCard}>
          <SkeletonBlock style={styles.roleSkeletonLabel} />
          <SkeletonBlock style={styles.roleSkeletonTitle} />
          <SkeletonBlock style={styles.roleSkeletonLine} />
          <SkeletonBlock style={styles.roleSkeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
    backgroundColor: Brand.canvas,
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    backgroundColor: Brand.greenTint,
    borderBottomWidth: 1,
    borderBottomColor: Brand.greenLine,
  },
  syncText: {
    ...Type.caption,
    color: Brand.greenDeep,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
    alignItems: 'center',
  },
  errorDock: {
    position: 'absolute',
    left: Space.md,
    right: Space.md,
    zIndex: 20,
    maxWidth: 720,
    alignSelf: 'center',
    ...Shadows.floating,
    borderRadius: Radius.lg,
  },
  roleSkeleton: {
    width: '100%',
    maxWidth: 920,
    padding: Space.lg,
    gap: 12,
    alignSelf: 'center',
  },
  roleSkeletonHeading: { width: '54%', height: 22 },
  roleSkeletonSubheading: { width: '74%', height: 12, marginBottom: 4 },
  roleSkeletonCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: 10,
  },
  roleSkeletonLabel: { width: '30%', height: 9 },
  roleSkeletonTitle: { width: '62%', height: 15 },
  roleSkeletonLine: { width: '92%', height: 11 },
  roleSkeletonLineShort: { width: '56%', height: 11 },
  accessWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xxl,
  },
  accessCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    paddingVertical: Space.xxxl,
    paddingHorizontal: Space.xxl,
    ...Shadows.card,
  },
  accessIcon: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    backgroundColor: Brand.greenTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.lg,
  },
  accessTitle: {
    ...Type.titleSmall,
    color: Brand.ink,
    textAlign: 'center',
  },
  accessDescription: {
    ...Type.body,
    color: Brand.slate,
    textAlign: 'center',
    marginTop: 6,
  },
  accessRole: {
    ...Type.overline,
    color: Brand.greenDark,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: Space.lg,
  },
  accessButton: {
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Brand.surface,
    borderTopWidth: 1,
    borderTopColor: Brand.line,
    paddingTop: 8,
    paddingHorizontal: 10,
    ...Shadows.raised,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    borderRadius: Radius.lg,
  },
  navItemPressed: {
    backgroundColor: Brand.surfaceMuted,
  },
  navIconWrap: {
    width: 42,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: Brand.greenTint,
  },
  navLabel: {
    ...Type.label,
    fontSize: 10.5,
    color: Brand.slateSoft,
  },
  navLabelActive: {
    color: Brand.greenDark,
    fontWeight: '800',
  },
});
