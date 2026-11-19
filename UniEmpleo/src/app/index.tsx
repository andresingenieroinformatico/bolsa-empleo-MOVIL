import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RoleHeader } from '@/components/RoleHeader';
import { HU01_LoginModal } from '@/components/HU01_LoginModal';
import {
  AdminProfile,
  AdminReports,
  AdminSummary,
  AdminTab,
  AdminUser,
  AppNotification,
  Application,
  ApplicationStatus,
  CompanyProfile,
  CompanyReports,
  CompanySummary,
  CompanyTab,
  JobOffer,
  StudentProfile,
  StudentTab,
  UserRole,
} from '@/data/mock-data';
import {
  ApiDocument,
  ApiError,
  ApiUser,
  CompanyRegistrationInput,
  JobSearchFilters,
  applyToJob,
  createJob,
  fetchAllPages,
  getAdminCompanies,
  getAdminDashboard,
  getAdminJobs,
  getAdminProfile,
  getAdminReports,
  getAdminUsers,
  getAuthenticatedUser,
  getCompanyJobs,
  getCompanyProfile,
  getCompanyReports,
  getCompanyStatus,
  getCompanySummary,
  getJobApplicants,
  getJobs,
  getStudentApplications,
  getStudentProfile,
  logout,
  registerCompany,
  toggleAdminJob,
  toggleAdminUser,
  unwrapData,
  unwrapPage,
  updateAdminProfile,
  updateAdminUser,
  updateApplicationStatus,
  updateCompanyApproval,
  updateCompanyProfile,
  updateJob,
  updateStudentProfile,
  uploadStudentCv,
  toJobWriteInput,
} from '@/services/api';
import {
  mapAdminProfile,
  mapAdminReports,
  mapAdminSummary,
  mapAdminUser,
  mapApplication,
  mapCompany,
  mapCompanyReports,
  mapCompanySummary,
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
import { CompanyProfileCompletionSheet } from '@/components/CompanyProfileCompletionSheet';
import {
  describeMissingCompanyFields,
  getMissingCompanyProfileFields,
} from '@/lib/company-profile';

// Vistas de Estudiante
import { HU04_VacantesView } from '@/views/student/HU04_VacantesView';
import { HU06_PostulacionesView } from '@/views/student/HU06_PostulacionesView';
import { HU09_PerfilView } from '@/views/student/HU09_PerfilView';
import { StudentSummaryView } from '@/views/student/StudentSummaryView';

// Vistas de Empresa
import { HU02_PerfilEmpresaView } from '@/views/company/HU02_PerfilEmpresaView';
import { HU03_MisVacantesView } from '@/views/company/HU03_MisVacantesView';
import { HU07_CandidatosView } from '@/views/company/HU07_CandidatosView';
import { CompanySummaryView } from '@/views/company/CompanySummaryView';
import { CompanyReportsView } from '@/views/company/CompanyReportsView';

// Vistas de Administrador
import { AdminSummaryView } from '@/views/admin/AdminSummaryView';
import { AdminStudentsView } from '@/views/admin/AdminStudentsView';
import { AdminCompaniesView } from '@/views/admin/AdminCompaniesView';
import { AdminJobsView } from '@/views/admin/AdminJobsView';
import { AdminProfileView } from '@/views/admin/AdminProfileView';

import { useNotifications } from '@/hooks/use-notifications';
import { NotificationsSheet } from '@/components/notifications-sheet';
import { downloadReportPdf } from '@/lib/download-report';

const EMPTY_STUDENT: StudentProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  program: '',
  semester: 0,
  availability: {},
};

function withSessionIdentity(profile: StudentProfile, user: ApiUser): StudentProfile {
  return {
    ...profile,
    id: String(user.id),
    name: user.name || profile.name,
    email: user.email || profile.email,
  };
}

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
  const [studentTab, setStudentTab] = useState<StudentTab>('resumen');
  const [companyTab, setCompanyTab] = useState<CompanyTab>('resumen');
  const [adminTab, setAdminTab] = useState<AdminTab>('resumen');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [jobsPage, setJobsPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companySummary, setCompanySummary] = useState<CompanySummary | null>(null);
  const [companyReports, setCompanyReports] = useState<CompanyReports | null>(null);
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [adminReports, setAdminReports] = useState<AdminReports | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersTotal, setAdminUsersTotal] = useState(0);
  const [adminJobs, setAdminJobs] = useState<JobOffer[]>([]);
  const [adminJobsTotal, setAdminJobsTotal] = useState(0);
  const [adminCompanies, setAdminCompanies] = useState<CompanyProfile[]>([]);
  const [adminCompaniesTotal, setAdminCompaniesTotal] = useState(0);
  const [adminSectionLoading, setAdminSectionLoading] = useState(false);
  const [adminCompaniesInitialStatus, setAdminCompaniesInitialStatus] = useState<
    CompanyProfile['status'] | 'all'
  >('all');
  const [adminCompaniesViewKey, setAdminCompaniesViewKey] = useState(0);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleDataLoading, setIsRoleDataLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCompanyProfileCompletion, setShowCompanyProfileCompletion] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportPdfError, setReportPdfError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const notifications = useNotifications(session?.token);
  const sessionRef = useRef<AuthSession | null>(null);
  const showLandingRef = useRef(true);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    showLandingRef.current = showLanding;
  }, [showLanding]);

  const adminCompanyFilters = useRef<{
    status: 'all' | 'pending' | 'approved' | 'rejected' | 'inactive';
    search: string;
  }>({ status: 'all', search: '' });
  const adminJobFilters = useRef<{
    status: 'all' | 'active' | 'paused' | 'closed';
    search: string;
  }>({ status: 'all', search: '' });
  const adminUserFilters = useRef<{
    search: string;
    active?: boolean;
    profile?: 'complete' | 'incomplete';
  }>({ search: '' });

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
        const [profileResponse, applicationsResult] = await Promise.all([
          getStudentProfile(token),
          fetchAllPages((page) => getStudentApplications(token, page), 12),
        ]);
        setStudent(
          withSessionIdentity(
            mapStudentProfile(unwrapData(profileResponse)),
            activeSession.user,
          ),
        );
        setApplications(
          applicationsResult.items.map((item) => mapApplication(item)),
        );
        setCompany(null);
        setCompanies([]);
        setCompanySummary(null);
        setCompanyReports(null);
        break;
      }
      case 'company': {
        const [profileResponse, statusResponse, jobsResult, summaryResponse, reportsResponse] =
          await Promise.all([
            getCompanyProfile(token),
            getCompanyStatus(token),
            fetchAllPages((page) => getCompanyJobs(token, page), 12),
            getCompanySummary(token),
            getCompanyReports(token),
          ]);
        const activeCompany = mapCompany(
          unwrapData(profileResponse),
          unwrapData(statusResponse),
        );
        const companyJobs = jobsResult.items.map(mapJob);
        setCompany(activeCompany);
        setCompanies([activeCompany]);
        setJobs(companyJobs);
        setCompanySummary(mapCompanySummary(unwrapData(summaryResponse)));
        setCompanyReports(mapCompanyReports(unwrapData(reportsResponse)));
        setJobsPage(1);
        setHasMoreJobs(false);
        setApplications([]);
        setStudent(null);
        break;
      }
      case 'admin': {
        const [
          dashboardResponse,
          reportsResponse,
          profileResponse,
          usersResult,
          jobsResult,
          companiesResult,
        ] = await Promise.all([
          getAdminDashboard(token),
          getAdminReports(token),
          getAdminProfile(token),
          fetchAllPages((page) => getAdminUsers(token, { role: 'student', page }), 20),
          fetchAllPages((page) => getAdminJobs(token, { page }), 15),
          fetchAllPages((page) => getAdminCompanies(token, { page }), 15),
        ]);

        const summary = mapAdminSummary(unwrapData(dashboardResponse));

        setAdminSummary(summary);
        setAdminReports(mapAdminReports(unwrapData(reportsResponse)));
        setAdminProfile(mapAdminProfile(unwrapData(profileResponse)));
        setAdminUsers(usersResult.items.map((item) => mapAdminUser(item)));
        setAdminUsersTotal(usersResult.total);
        setAdminJobs(jobsResult.items.map((item) => mapJob(item)));
        setAdminJobsTotal(jobsResult.total);
        setAdminCompanies(companiesResult.items.map((item) => mapCompany(item)));
        setAdminCompaniesTotal(companiesResult.total);
        setCompanies(summary.recentCompanies.filter((item) => item.status === 'pending'));
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

  const showApiError = useCallback((error: unknown) => {
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
        if (verifiedSession.user.role === 'student') {
          await loadPublicJobs({}, 1, false, verifiedSession.token);
        }
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        setSession(null);
        setCurrentRole('student');
        setShowLanding(true);
        setSessionNotice(
          'Tu sesión expiró. Inicia sesión de nuevo para volver a tu panel.',
        );
      } else {
        showApiError(error);
      }
    } finally {
      setIsLoading(false);
      setIsRoleDataLoading(false);
    }
  }, [loadPublicJobs, loadRoleData, showApiError]);

  useEffect(() => {
    const timeout = setTimeout(() => void hydrateApp(), 0);
    return () => clearTimeout(timeout);
  }, [hydrateApp]);

  // After signing out, browser/Android back must not reopen the previous panel:
  // it always returns to the landing page and explains that the session is closed.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handlePopState = () => {
        if (sessionRef.current) return;
        setShowLanding(true);
        setSessionNotice(
          'Cerraste sesión. Por seguridad no puedes volver al panel anterior; inicia sesión de nuevo para continuar.',
        );
        window.history.pushState({ uniempleo: 'sesion-cerrada' }, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }

    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showLandingRef.current) return false;
        setShowLanding(true);
        if (!sessionRef.current) {
          setSessionNotice(
            'Cerraste sesión. Por seguridad no puedes volver al panel anterior; inicia sesión de nuevo para continuar.',
          );
        }
        return true;
      });
      return () => subscription.remove();
    }
  }, []);

  const handleLoginSuccess = async (nextSession: AuthSession) => {
    const entry = resolveRoleEntry(nextSession.user.role, currentRole);
    setSession(nextSession);
    setCurrentRole(entry.role);
    setShowLanding(entry.destination !== 'dashboard');
    setApiError(null);
    setSessionNotice(null);
    setIsLoading(true);
    setIsRoleDataLoading(true);
    try {
      await loadRoleData(nextSession);
      if (nextSession.user.role === 'student') {
        await loadPublicJobs({}, 1, false, nextSession.token);
      }
    } catch (error) {
      showApiError(error);
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
      const applicationsResult = await fetchAllPages(
        (page) => getStudentApplications(session.token, page),
        12,
      );
      setApplications(applicationsResult.items.map((item) => mapApplication(item)));
      setApiError(null);
    } catch (error) {
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
      setStudent(
        withSessionIdentity(
          mapStudentProfile(unwrapData(await getStudentProfile(session.token))),
          session.user,
        ),
      );
      setApiError(null);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveAvailability = async (
    availability: StudentProfile['availability'],
  ) => {
    if (!session || session.user.role !== 'student') {
      throw new Error('Inicia sesión para guardar tus horarios.');
    }
    await updateStudentProfile(session.token, { availability });
    setStudent((current) =>
      current
        ? withSessionIdentity({ ...current, availability }, session.user)
        : current,
    );
  };

  const handleUploadCv = async (file: ApiDocument) => {
    if (!session || session.user.role !== 'student') {
      throw new Error('Inicia sesión para subir tu hoja de vida.');
    }
    try {
      await uploadStudentCv(session.token, file);
      const updated = withSessionIdentity(
        mapStudentProfile(unwrapData(await getStudentProfile(session.token))),
        session.user,
      );
      setStudent(updated);
      setApiError(null);
      return updated;
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateCompany = async (updated: CompanyProfile) => {
    if (!session || session.user.role !== 'company') {
      throw new Error('Inicia sesión como empresa para actualizar el perfil.');
    }
    try {
      const response = await updateCompanyProfile(session.token, {
        company_name: updated.name,
        nit: updated.nit,
        sector: updated.sector,
        contact_person: updated.contactPerson || '',
        phone: updated.phone || '',
        address: updated.address || '',
        description: updated.description,
      });
      // The backend may move a rejected company back to "pending" when it
      // resubmits, so the refreshed server state is the source of truth.
      const refreshed = mapCompany(unwrapData(response));
      setCompany(refreshed);
      setCompanies((current) =>
        current.some((item) => item.id === refreshed.id)
          ? current.map((item) => (item.id === refreshed.id ? refreshed : item))
          : [refreshed],
      );
      setApiError(null);
    } catch (error) {
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
      throw error;
    }
  };

  const handleLoadJobApplicants = useCallback(async (jobId: string) => {
    if (!session || session.user.role !== 'company') {
      throw new Error('Inicia sesión como empresa para consultar candidatos.');
    }
    const result = await fetchAllPages(
      (page) => getJobApplicants(session.token, jobId, page),
      15,
    );
    return result.items.map((item) => mapApplication(item, true));
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
      throw error;
    }
  };

  const refreshAdminCompanies = useCallback(async () => {
    if (!session || session.user.role !== 'admin') return;
    const { status, search } = adminCompanyFilters.current;
    const result = await fetchAllPages(
      (page) =>
        getAdminCompanies(session.token, {
          status: status === 'all' ? undefined : status,
          search,
          page,
        }),
      15,
    );
    setAdminCompanies(result.items.map((item) => mapCompany(item)));
    setAdminCompaniesTotal(result.total);
  }, [session]);

  const refreshAdminUsers = useCallback(async () => {
    if (!session || session.user.role !== 'admin') return;
    const { search, active, profile } = adminUserFilters.current;
    const result = await fetchAllPages(
      (page) =>
        getAdminUsers(session.token, {
          role: 'student',
          search,
          active,
          profile,
          page,
        }),
      20,
    );
    setAdminUsers(result.items.map((item) => mapAdminUser(item)));
    setAdminUsersTotal(result.total);
  }, [session]);

  const refreshAdminJobs = useCallback(async () => {
    if (!session || session.user.role !== 'admin') return;
    const { status, search } = adminJobFilters.current;
    const result = await fetchAllPages(
      (page) =>
        getAdminJobs(session.token, {
          status: status === 'all' ? undefined : status,
          search,
          page,
        }),
      15,
    );
    setAdminJobs(result.items.map((item) => mapJob(item)));
    setAdminJobsTotal(result.total);
  }, [session]);

  const runAdminSection = async (action: () => Promise<void>) => {
    setAdminSectionLoading(true);
    setApiError(null);
    try {
      await action();
    } catch (error) {
      throw error;
    } finally {
      setAdminSectionLoading(false);
    }
  };

  const handleFilterAdminCompanies = async (
    status: 'all' | 'pending' | 'approved' | 'rejected' | 'inactive',
  ) => {
    adminCompanyFilters.current.status = status;
    // Keeps the chip selection aligned if the view is remounted later.
    setAdminCompaniesInitialStatus(status);
    await runAdminSection(refreshAdminCompanies);
  };

  const handleSearchAdminCompanies = async (search: string) => {
    adminCompanyFilters.current.search = search;
    await runAdminSection(refreshAdminCompanies);
  };

  const handleQueryAdminUsers = async (query: {
    search: string;
    active?: boolean;
    profile?: 'complete' | 'incomplete';
  }) => {
    adminUserFilters.current = {
      search: query.search.trim(),
      active: query.active,
      profile: query.profile,
    };
    await runAdminSection(refreshAdminUsers);
  };

  const handleToggleAdminUser = async (userId: string) => {
    if (!session || session.user.role !== 'admin') {
      throw new Error('Inicia sesión como administrador para continuar.');
    }
    await runAdminSection(async () => {
      await toggleAdminUser(session.token, userId);
      await refreshAdminUsers();
    });
  };

  const handleUpdateAdminUser = async (
    userId: string,
    input: {
      name: string;
      email: string;
      program: string;
      semester?: string;
      phone?: string;
      studentCode?: string;
      password?: string;
      passwordConfirmation?: string;
    },
  ) => {
    if (!session || session.user.role !== 'admin') {
      throw new Error('Inicia sesión como administrador para continuar.');
    }
    await runAdminSection(async () => {
      await updateAdminUser(session.token, userId, input);
      await refreshAdminUsers();
    });
  };

  const handleFilterAdminJobs = async (
    status: 'all' | 'active' | 'paused' | 'closed',
  ) => {
    adminJobFilters.current.status = status;
    await runAdminSection(refreshAdminJobs);
  };

  const handleSearchAdminJobs = async (search: string) => {
    adminJobFilters.current.search = search;
    await runAdminSection(refreshAdminJobs);
  };

  const handleToggleAdminJob = async (jobId: string) => {
    if (!session || session.user.role !== 'admin') {
      throw new Error('Inicia sesión como administrador para continuar.');
    }
    await runAdminSection(async () => {
      await toggleAdminJob(session.token, jobId);
      await refreshAdminJobs();
    });
  };

  const handleUpdateAdminProfile = async (input: {
    name: string;
    email: string;
    password?: string;
    passwordConfirmation?: string;
  }) => {
    if (!session || session.user.role !== 'admin') {
      throw new Error('Inicia sesión como administrador para continuar.');
    }
    try {
      await updateAdminProfile(session.token, {
        name: input.name,
        email: input.email,
        ...(input.password
          ? {
              password: input.password,
              password_confirmation: input.passwordConfirmation ?? '',
            }
          : {}),
      });
      const updated = mapAdminProfile(unwrapData(await getAdminProfile(session.token)));
      setAdminProfile(updated);
      const nextSession: AuthSession = {
        ...session,
        user: { ...session.user, name: updated.name, email: updated.email },
      };
      setSession(nextSession);
      await saveAuthSession(nextSession);
      setApiError(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadReport = async (scope: 'admin' | 'company') => {
    if (!session) throw new Error('Inicia sesión para descargar el reporte.');
    setIsDownloadingReport(true);
    setReportPdfError(null);
    try {
      await downloadReportPdf(session.token, scope);
    } catch (error) {
      setReportPdfError(
        error instanceof Error ? error.message : 'No fue posible descargar el reporte.',
      );
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await logout(session.token);
      } catch {
        // The local session is cleared regardless, so a failed server logout
        // must not interrupt the user with an extra error pop-up.
      }
    }
    await clearAuthSession();
    setSession(null);
    setStudent(null);
    setCompany(null);
    setCompanies([]);
    setApplications([]);
    setCurrentRole('student');
    setStudentTab('resumen');
    setCompanyTab('resumen');
    setAdminTab('resumen');
    setShowLoginModal(false);
    setShowRegistrationModal(false);
    setShowNotifications(false);
    setShowCompanyProfileCompletion(false);
    setReportPdfError(null);
    setShowLanding(true);
    setSessionNotice(
      'Cerraste sesión correctamente. Por seguridad no puedes volver al panel anterior; inicia sesión de nuevo cuando quieras continuar.',
    );

    if (Platform.OS === 'web') {
      // Keeps a sentinel entry so the browser Back button cannot leave the session flow.
      window.history.pushState({ uniempleo: 'sesion-cerrada' }, '', window.location.href);
    }
  };

  const handleResumeSession = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    // Keeps the section the user was viewing so "Continuar" returns there.
    setCurrentRole(session.user.role);
    setShowLanding(false);
    setSessionNotice(null);
    void notifications.refresh();
  };

  const handleOpenRoleDashboard = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    const role = session.user.role;
    // "Mi panel" always starts on the main dashboard of the signed-in role.
    if (role === 'student') setStudentTab('resumen');
    if (role === 'company') setCompanyTab('resumen');
    if (role === 'admin') setAdminTab('resumen');
    setCurrentRole(role);
    setShowLoginModal(false);
    setShowRegistrationModal(false);
    setShowLanding(false);
    setSessionNotice(null);
    void notifications.refresh();
  };

  /**
   * A notification is only useful if it takes the reader to the place where
   * they must act. The sheet marks the row as read first, then this handler
   * closes the sheet and opens the role's matching section.
   */
  const handleOpenNotification = (notification: AppNotification) => {
    setShowNotifications(false);
    if (!session) return;

    const role = session.user.role;
    setCurrentRole(role);
    setShowLanding(false);
    setSessionNotice(null);

    if (role === 'student') {
      if (notification.type === 'application_status') {
        setStudentTab('postulaciones');
        // The process may have changed after the notification was created.
        void loadRoleData(session);
      } else {
        setStudentTab('resumen');
      }
      void notifications.refresh({ silent: true });
      return;
    }

    if (role === 'company') {
      if (notification.type === 'new_application') {
        setCompanyTab('candidatos');
      } else if (notification.type === 'company_rejected') {
        setCompanyTab('perfil');
      } else if (notification.type === 'company_approved') {
        setCompanyTab('vacantes');
      } else {
        setCompanyTab('resumen');
      }
      void notifications.refresh({ silent: true });
      return;
    }

    if (
      notification.type === 'company_resubmitted' ||
      notification.type === 'company_registration'
    ) {
      // These reviews always start from the pending queue.
      adminCompanyFilters.current = { status: 'pending', search: '' };
      setAdminCompaniesInitialStatus('pending');
      setAdminCompaniesViewKey((current) => current + 1);
      setAdminTab('empresas');
      void notifications.refresh({ silent: true });
      void runAdminSection(refreshAdminCompanies);
      return;
    }

    setAdminTab('resumen');
    void notifications.refresh({ silent: true });
  };

  const handleOpenLogin = (role: UserRole) => {
    const entry = resolveRoleEntry(session?.user.role ?? null, role);
    setCurrentRole(entry.role);
    if (entry.destination === 'dashboard') {
      setShowLanding(false);
      setShowLoginModal(false);
      setSessionNotice(null);
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
  const showBottomNav = hasActiveRole;
  const showCompanyMissingProfile =
    !isLoading && !apiError && !company && currentRole === 'company' && hasActiveRole;
  const missingCompanyProfileFields =
    currentRole === 'company' && hasActiveRole && company
      ? getMissingCompanyProfileFields(company)
      : [];
  const showCompanyProfileBanner = missingCompanyProfileFields.length > 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: showLanding ? Brand.canvas : Brand.navy }]}
      edges={['top']}>
      <StatusBar style={showLanding ? 'dark' : 'light'} />

      {showLanding ? (
        <HU00_LandingPage
          jobs={jobs}
          hasSession={Boolean(session)}
          sessionRole={session?.user.role ?? null}
          userName={session?.user.name}
          isLoading={isLoading}
          errorMessage={apiError}
          sessionNotice={sessionNotice}
          onDismissSessionNotice={() => setSessionNotice(null)}
          onExplore={handleExplore}
          onLogin={handleOpenLogin}
          onCreateAccount={() => setShowRegistrationModal(true)}
          onResumeSession={session ? handleResumeSession : undefined}
          onOpenDashboard={session ? handleOpenRoleDashboard : undefined}
          onLogout={session ? handleLogout : undefined}
        />
      ) : (
        <View style={styles.appShell}>
          <RoleHeader
            currentRole={currentRole}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onGoHome={() => setShowLanding(true)}
            onOpenNotifications={() => {
              setShowNotifications(true);
              void notifications.refresh();
            }}
            unreadNotifications={notifications.unreadCount}
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
                {showCompanyProfileBanner && company ? (
                  <View style={styles.companyProfileBanner}>
                    <Notice
                      tone="warning"
                      title="Completa el registro de tu empresa"
                      message={`Faltan datos: ${describeMissingCompanyFields(
                        missingCompanyProfileFields,
                      )}. Completa el registro para habilitar todas las funciones.`}
                      actionLabel="Completar ahora"
                      onAction={() => setShowCompanyProfileCompletion(true)}
                    />
                  </View>
                ) : null}

                {currentRole === 'company' && hasActiveRole && company?.status === 'rejected' ? (
                  <View style={styles.companyProfileBanner}>
                    <Notice
                      tone="error"
                      title="Tu empresa fue rechazada"
                      message={`${
                        company.rejectionReason
                          ? `Motivo: ${company.rejectionReason.replace(/\.+\s*$/, '')}. `
                          : ''
                      }Corrige la información solicitada y guarda el perfil: la solicitud volverá a revisión automáticamente.`}
                      actionLabel="Actualizar información"
                      onAction={() => setCompanyTab('perfil')}
                    />
                  </View>
                ) : null}

                {currentRole === 'student' && studentTab === 'resumen' && (
                  <StudentSummaryView
                    student={student || EMPTY_STUDENT}
                    applications={applications}
                    jobs={jobs}
                    onOpenTab={setStudentTab}
                  />
                )}
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
                    onSaveAvailability={handleSaveAvailability}
                    onUploadCv={handleUploadCv}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'resumen' && (
                  <CompanySummaryView
                    company={company}
                    summary={companySummary}
                    onOpenTab={setCompanyTab}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'vacantes' && (
                  <HU03_MisVacantesView
                    company={company}
                    jobs={jobs}
                    onAddJob={handleAddJob}
                    onUpdateJob={handleUpdateJob}
                    onToggleJobStatus={handleToggleJobStatus}
                    onUpdateCompany={handleUpdateCompany}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'candidatos' && (
                  <HU07_CandidatosView
                    jobs={jobs}
                    readOnly={company.status === 'rejected'}
                    readOnlyMessage={
                      company.rejectionReason
                        ? `Motivo del rechazo: ${company.rejectionReason}`
                        : undefined
                    }
                    onLoadApplicants={handleLoadJobApplicants}
                    onUpdateApplicationStatus={handleUpdateApplicationStatus}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'reportes' && (
                  <CompanyReportsView
                    company={company}
                    reports={companyReports}
                    isDownloading={isDownloadingReport}
                    downloadError={reportPdfError}
                    onDownload={() => handleDownloadReport('company')}
                    onDismissError={() => setReportPdfError(null)}
                  />
                )}
                {currentRole === 'company' && hasActiveRole && company && companyTab === 'perfil' && (
                  <HU02_PerfilEmpresaView
                    company={company}
                    onUpdateCompany={handleUpdateCompany}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && adminTab === 'resumen' && (
                  <AdminSummaryView
                    summary={adminSummary}
                    reports={adminReports}
                    pendingCompanies={companies}
                    onApproveCompany={handleApproveCompany}
                    onRejectCompany={handleRejectCompany}
                    onOpenTab={setAdminTab}
                    onDownloadReport={() => handleDownloadReport('admin')}
                    isDownloadingReport={isDownloadingReport}
                    downloadError={reportPdfError}
                    onDismissDownloadError={() => setReportPdfError(null)}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && adminTab === 'estudiantes' && (
                  <AdminStudentsView
                    users={adminUsers}
                    total={adminUsersTotal}
                    isLoading={adminSectionLoading}
                    onQuery={handleQueryAdminUsers}
                    onToggleUser={handleToggleAdminUser}
                    onUpdateUser={handleUpdateAdminUser}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && adminTab === 'empresas' && (
                  <AdminCompaniesView
                    key={`admin-companies-${adminCompaniesViewKey}`}
                    initialStatus={adminCompaniesInitialStatus}
                    companies={adminCompanies}
                    total={adminCompaniesTotal}
                    isLoading={adminSectionLoading}
                    onFilter={handleFilterAdminCompanies}
                    onSearch={handleSearchAdminCompanies}
                    onApproveCompany={handleApproveCompany}
                    onRejectCompany={handleRejectCompany}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && adminTab === 'vacantes' && (
                  <AdminJobsView
                    jobs={adminJobs}
                    total={adminJobsTotal}
                    isLoading={adminSectionLoading}
                    onFilter={handleFilterAdminJobs}
                    onSearch={handleSearchAdminJobs}
                    onToggleJob={handleToggleAdminJob}
                  />
                )}
                {currentRole === 'admin' && hasActiveRole && adminTab === 'perfil' && adminProfile && (
                  <AdminProfileView profile={adminProfile} onSave={handleUpdateAdminProfile} />
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
              adminTab={adminTab}
              onChangeStudentTab={setStudentTab}
              onChangeCompanyTab={setCompanyTab}
              onChangeAdminTab={setAdminTab}
              bottomInset={insets.bottom}
            />
          )}
        </View>
      )}

      {apiError && !showLanding && (
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

      {showCompanyProfileCompletion && company ? (
        <CompanyProfileCompletionSheet
          visible
          company={company}
          onClose={() => setShowCompanyProfileCompletion(false)}
          onSave={handleUpdateCompany}
        />
      ) : null}

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

      <NotificationsSheet
        visible={showNotifications}
        role={currentRole}
        notifications={notifications.notifications}
        unreadCount={notifications.unreadCount}
        isLoading={notifications.isLoading}
        error={notifications.error}
        onClose={() => setShowNotifications(false)}
        onRefresh={() => void notifications.refresh()}
        onMarkRead={notifications.markRead}
        onMarkAllRead={notifications.markAllRead}
        onOpenNotification={handleOpenNotification}
      />
    </SafeAreaView>
  );
}

interface BottomNavigationProps {
  role: UserRole;
  studentTab: StudentTab;
  companyTab: CompanyTab;
  adminTab: AdminTab;
  onChangeStudentTab: (tab: StudentTab) => void;
  onChangeCompanyTab: (tab: CompanyTab) => void;
  onChangeAdminTab: (tab: AdminTab) => void;
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
  adminTab,
  onChangeStudentTab,
  onChangeCompanyTab,
  onChangeAdminTab,
  bottomInset,
}: BottomNavigationProps) {
  const items: TabItem[] =
    role === 'student'
      ? [
          {
            key: 'resumen',
            label: 'Resumen',
            icon: 'grid-outline',
            iconActive: 'grid',
            active: studentTab === 'resumen',
            onPress: () => onChangeStudentTab('resumen'),
          },
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
      : role === 'company'
        ? [
            {
              key: 'resumen',
              label: 'Resumen',
              icon: 'grid-outline',
              iconActive: 'grid',
              active: companyTab === 'resumen',
              onPress: () => onChangeCompanyTab('resumen'),
            },
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
              key: 'reportes',
              label: 'Reportes',
              icon: 'bar-chart-outline',
              iconActive: 'bar-chart',
              active: companyTab === 'reportes',
              onPress: () => onChangeCompanyTab('reportes'),
            },
            {
              key: 'perfil',
              label: 'Empresa',
              icon: 'business-outline',
              iconActive: 'business',
              active: companyTab === 'perfil',
              onPress: () => onChangeCompanyTab('perfil'),
            },
          ]
        : [
            {
              key: 'resumen',
              label: 'Resumen',
              icon: 'grid-outline',
              iconActive: 'grid',
              active: adminTab === 'resumen',
              onPress: () => onChangeAdminTab('resumen'),
            },
            {
              key: 'estudiantes',
              label: 'Estudiantes',
              icon: 'school-outline',
              iconActive: 'school',
              active: adminTab === 'estudiantes',
              onPress: () => onChangeAdminTab('estudiantes'),
            },
            {
              key: 'empresas',
              label: 'Empresas',
              icon: 'business-outline',
              iconActive: 'business',
              active: adminTab === 'empresas',
              onPress: () => onChangeAdminTab('empresas'),
            },
            {
              key: 'vacantes',
              label: 'Vacantes',
              icon: 'briefcase-outline',
              iconActive: 'briefcase',
              active: adminTab === 'vacantes',
              onPress: () => onChangeAdminTab('vacantes'),
            },
            {
              key: 'perfil',
              label: 'Perfil',
              icon: 'person-outline',
              iconActive: 'person',
              active: adminTab === 'perfil',
              onPress: () => onChangeAdminTab('perfil'),
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
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.1}
            style={[styles.navLabel, item.active && styles.navLabelActive]}>
            {item.label}
          </Text>
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
  companyProfileBanner: {
    width: '100%',
    maxWidth: 920,
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
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
