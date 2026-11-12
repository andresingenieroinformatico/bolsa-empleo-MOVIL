import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RoleHeader } from '@/components/RoleHeader';
import { HU01_LoginModal } from '@/components/HU01_LoginModal';
import {
  AdminKPIs,
  Application,
  ApplicationStatus,
  CompanyProfile,
  INITIAL_ADMIN_KPIS,
  JobOffer,
  StudentProfile,
  UserRole,
} from '@/data/mock-data';
import {
  ApiDocument,
  ApiError,
  CompanyRegistrationInput,
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
  updateApplicationStatus,
  updateCompanyApproval,
  updateCompanyProfile,
  updateJob,
  updateStudentProfile,
  uploadStudentCv,
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

export default function HomeScreen() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [studentTab, setStudentTab] = useState<'vacantes' | 'postulaciones' | 'perfil'>('vacantes');
  const [companyTab, setCompanyTab] = useState<'vacantes' | 'candidatos' | 'perfil'>('vacantes');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [kpis] = useState<AdminKPIs>(INITIAL_ADMIN_KPIS);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const loadPublicJobs = useCallback(async () => {
    const response = await getJobs();
    const nextJobs = unwrapList<unknown>(response).map(mapJob);
    setJobs(nextJobs);
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
        const applicantLists = await Promise.all(
          companyJobs.map(async (job) =>
            unwrapList<unknown>(await getJobApplicants(token, job.id)).map((item) =>
              mapApplication(item, true),
            ),
          ),
        );
        setCompany(activeCompany);
        setCompanies([activeCompany]);
        setJobs(companyJobs);
        setApplications(applicantLists.flat());
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
        setSession(savedSession);
        setCurrentRole(savedSession.user.role);
        setShowLanding(false);
      }

      await loadPublicJobs();

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
    }
  }, [loadPublicJobs, loadRoleData, reportError]);

  useEffect(() => {
    const timeout = setTimeout(() => void hydrateApp(), 0);
    return () => clearTimeout(timeout);
  }, [hydrateApp]);

  const handleLoginSuccess = async (nextSession: AuthSession) => {
    setSession(nextSession);
    setCurrentRole(nextSession.user.role);
    setShowLanding(false);
    setApiError(null);
    setIsLoading(true);
    try {
      await loadRoleData(nextSession);
      if (nextSession.user.role === 'student') await loadPublicJobs();
    } catch (error) {
      reportError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (session?.user.role === role) {
      setShowLanding(false);
      return;
    }
    if (role !== 'student') setShowLoginModal(true);
  };

  const handleApplyToJob = async (
    job: JobOffer,
    useProfileCv: boolean,
    customCv?: ApiDocument,
  ) => {
    if (!session || session.user.role !== 'student') {
      setCurrentRole('student');
      setShowLoginModal(true);
      throw new Error('Inicia sesión con Google para postularte a una vacante.');
    }
    try {
      await applyToJob(session.token, job.id, useProfileCv ? undefined : customCv);
      const response = await getStudentApplications(session.token);
      setApplications(unwrapList<unknown>(response).map((item) => mapApplication(item)));
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
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
      await createJob(session.token, {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements,
        area: newJob.area,
        program: newJob.program,
        contract_type: newJob.contractType,
        modality: newJob.modality,
        location: newJob.location,
        deadline: newJob.deadline,
        positions: newJob.vacanciesCount,
        requires_cv: newJob.requiresCv,
      });
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
      await updateJob(session.token, updated.id, {
        title: updated.title,
        description: updated.description,
        requirements: updated.requirements,
        area: updated.area,
        program: updated.program,
        contract_type: updated.contractType,
        modality: updated.modality,
        location: updated.location,
        deadline: updated.deadline,
        positions: updated.vacanciesCount,
        requires_cv: updated.requiresCv,
      });
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
      await loadRoleData(session);
      setApiError(null);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

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

  const handleRejectCompany = async (companyId: string, reason: string) => {
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
    setCurrentRole(role);
    setShowLoginModal(true);
  };

  const handleExplore = () => {
    setCurrentRole('student');
    setStudentTab('vacantes');
    setShowLanding(false);
    void loadPublicJobs().catch(reportError);
  };

  const handleCompanyLogin = () => {
    setShowRegistrationModal(false);
    handleOpenLogin('company');
  };

  const hasActiveRole = session?.user.role === currentRole;
  const accessRequiresLogin =
    (currentRole !== 'student' && !hasActiveRole) ||
    (currentRole === 'student' && studentTab !== 'vacantes' && !hasActiveRole);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={showLanding ? 'dark-content' : 'light-content'} />

      {showLanding ? (
        <HU00_LandingPage
          onExplore={handleExplore}
          onLogin={handleOpenLogin}
          onCreateAccount={() => setShowRegistrationModal(true)}
        />
      ) : (
        <>
          <RoleHeader
            currentRole={currentRole}
            onSelectRole={handleSelectRole}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onGoHome={() => setShowLanding(true)}
            userName={session?.user.name}
          />

          {isLoading && (
            <View style={styles.loadingBanner}>
              <ActivityIndicator size="small" color="#0F766E" />
              <Text style={styles.loadingText}>Sincronizando con UniEmpleo…</Text>
            </View>
          )}

          {currentRole === 'student' && (
            <View style={styles.subNavBar}>
              <TouchableOpacity
                style={[styles.subNavItem, studentTab === 'vacantes' && styles.subNavItemActive]}
                onPress={() => setStudentTab('vacantes')}>
                <Text style={[styles.subNavText, studentTab === 'vacantes' && styles.subNavTextActive]}>
                  Vacantes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subNavItem, studentTab === 'postulaciones' && styles.subNavItemActive]}
                onPress={() => setStudentTab('postulaciones')}>
                <Text style={[styles.subNavText, studentTab === 'postulaciones' && styles.subNavTextActive]}>
                  Mis postulaciones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subNavItem, studentTab === 'perfil' && styles.subNavItemActive]}
                onPress={() => setStudentTab('perfil')}>
                <Text style={[styles.subNavText, studentTab === 'perfil' && styles.subNavTextActive]}>
                  Mi perfil
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {currentRole === 'company' && (
            <View style={styles.subNavBar}>
              <TouchableOpacity
                style={[styles.subNavItem, companyTab === 'vacantes' && styles.subNavItemActive]}
                onPress={() => setCompanyTab('vacantes')}>
                <Text style={[styles.subNavText, companyTab === 'vacantes' && styles.subNavTextActive]}>
                  Mis vacantes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subNavItem, companyTab === 'candidatos' && styles.subNavItemActive]}
                onPress={() => setCompanyTab('candidatos')}>
                <Text style={[styles.subNavText, companyTab === 'candidatos' && styles.subNavTextActive]}>
                  Candidatos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subNavItem, companyTab === 'perfil' && styles.subNavItemActive]}
                onPress={() => setCompanyTab('perfil')}>
                <Text style={[styles.subNavText, companyTab === 'perfil' && styles.subNavTextActive]}>
                  Empresa
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mainContent}>
            {accessRequiresLogin ? (
              <View style={styles.accessRequired}>
                <Text style={styles.accessTitle}>Inicia sesión para continuar</Text>
                <Text style={styles.accessDescription}>
                  Esta sección requiere una cuenta autenticada con el rol seleccionado.
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.accessButton}
                  onPress={() => setShowLoginModal(true)}>
                  <Text style={styles.accessButtonText}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {currentRole === 'student' && studentTab === 'vacantes' && (
                  <HU04_VacantesView
                    jobs={jobs}
                    student={student || EMPTY_STUDENT}
                    applications={applications}
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
                    applications={applications}
                    onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'perfil' && (
                  <HU02_PerfilEmpresaView
                    company={company}
                    allCompanies={companies}
                    onRegisterCompany={handleRegisterCompany}
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
                    }}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && (
                  <HU08_AdminDashboardView
                    kpis={kpis}
                    companies={companies}
                    onApproveCompany={handleApproveCompany}
                    onRejectCompany={handleRejectCompany}
                  />
                )}
                {!isLoading && !apiError && !company && currentRole === 'company' && hasActiveRole && (
                  <View style={styles.accessRequired}>
                    <Text style={styles.accessTitle}>No se pudo cargar el perfil de empresa.</Text>
                    <TouchableOpacity accessibilityRole="button" onPress={() => void hydrateApp()}>
                      <Text style={styles.retryText}>Volver a intentar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </>
      )}

      {apiError && (
        <View style={styles.apiErrorBanner}>
          <Text accessibilityRole="alert" style={styles.apiErrorText}>{apiError}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => void hydrateApp()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <HU01_LoginModal
        visible={showLoginModal}
        role={currentRole}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <HU00_RegistrationModal
        visible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onRegisterCompany={handleRegisterCompany}
        onRegisterStudent={() => handleOpenLogin('student')}
        onLoginCompany={handleCompanyLogin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F766E',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  subNavBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  subNavItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subNavItemActive: {
    borderBottomColor: '#0F766E',
  },
  subNavText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  subNavTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#F0FDFA',
  },
  loadingText: {
    color: '#115E59',
    fontSize: 13,
    fontWeight: '600',
  },
  accessRequired: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  accessTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  accessDescription: {
    marginTop: 8,
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  accessButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0F766E',
  },
  accessButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  apiErrorBanner: {
    position: 'absolute',
    zIndex: 10,
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  apiErrorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
});
