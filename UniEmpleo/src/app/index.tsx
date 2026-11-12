import React, { useState } from 'react';
import {
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
  INITIAL_APPLICATIONS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_STUDENT,
  JobOffer,
  StudentProfile,
  UserRole,
} from '@/data/mock-data';

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

export default function HomeScreen() {
  // Rol activo (Estudiante por defecto)
  const [currentRole, setCurrentRole] = useState<UserRole>('student');

  // Sub-pestañas por rol
  const [studentTab, setStudentTab] = useState<'vacantes' | 'postulaciones' | 'perfil'>('vacantes');
  const [companyTab, setCompanyTab] = useState<'vacantes' | 'candidatos' | 'perfil'>('vacantes');

  // Estado global simulado
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT);
  const [companies, setCompanies] = useState<CompanyProfile[]>(INITIAL_COMPANIES);
  const [jobs, setJobs] = useState<JobOffer[]>(INITIAL_JOBS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [kpis, setKpis] = useState<AdminKPIs>(INITIAL_ADMIN_KPIS);

  // Modal HU-01
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Empresa actualmente en sesión (la primera aprobada)
  const currentCompany = companies.find((c) => c.status === 'approved') || companies[0];

  // Acción: Estudiante se postula a vacante (HU-05)
  const handleApplyToJob = (
    job: JobOffer,
    useProfileCv: boolean,
    customCvName?: string
  ) => {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      studentId: student.id,
      studentName: student.name,
      studentProgram: student.program,
      studentEmail: student.email,
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      cvFileName: useProfileCv
        ? student.cvFile?.name || 'CV_Carlos_Mendoza_UNIPAZ.pdf'
        : customCvName || 'CV_Adjunto.pdf',
    };

    setApplications([newApplication, ...applications]);
    setKpis({
      ...kpis,
      totalApplications: kpis.totalApplications + 1,
    });
  };

  // Acción: Empresa publica nueva vacante (HU-03)
  const handleAddJob = (newJob: JobOffer) => {
    setJobs([newJob, ...jobs]);
    setKpis({
      ...kpis,
      activeJobs: kpis.activeJobs + 1,
    });
  };

  // Acción: Empresa edita vacante (HU-03)
  const handleUpdateJob = (updatedJob: JobOffer) => {
    setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
  };

  // Acción: Pausar/Activar vacante (HU-03)
  const handleToggleJobStatus = (jobId: string) => {
    setJobs(
      jobs.map((j) => {
        if (j.id === jobId) {
          const nextStatus = j.status === 'active' ? 'paused' : 'active';
          return { ...j, status: nextStatus };
        }
        return j;
      })
    );
  };

  // Acción: Empresa evalúa candidato y actualiza estado (HU-07)
  const handleUpdateApplicationStatus = (
    appId: string,
    newStatus: ApplicationStatus,
    companyNotes?: string,
    interviewNote?: string
  ) => {
    setApplications(
      applications.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: newStatus,
            companyNotes: companyNotes !== undefined ? companyNotes : app.companyNotes,
            interviewNote: interviewNote !== undefined ? interviewNote : app.interviewNote,
          };
        }
        return app;
      })
    );
  };

  // Acción: Registrar empresa (HU-02)
  const handleRegisterCompany = (newCompany: CompanyProfile) => {
    setCompanies([...companies, newCompany]);
    setKpis({
      ...kpis,
      pendingCompanies: kpis.pendingCompanies + 1,
    });
  };

  // Acción: Admin aprueba empresa (HU-02 y HU-08)
  const handleApproveCompany = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId ? { ...c, status: 'approved' } : c
      )
    );
    setKpis({
      ...kpis,
      approvedCompanies: kpis.approvedCompanies + 1,
      pendingCompanies: Math.max(0, kpis.pendingCompanies - 1),
    });
  };

  // Acción: Admin rechaza empresa (HU-02 y HU-08)
  const handleRejectCompany = (companyId: string, reason: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === companyId
          ? { ...c, status: 'rejected', rejectionReason: reason }
          : c
      )
    );
    setKpis({
      ...kpis,
      pendingCompanies: Math.max(0, kpis.pendingCompanies - 1),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />

      {/* Header con cambio de Rol y demostración de historias activas */}
      <RoleHeader
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Barra de Sub-Navegación para Estudiante */}
      {currentRole === 'student' && (
        <View style={styles.subNavBar}>
          <TouchableOpacity
            style={[styles.subNavItem, studentTab === 'vacantes' && styles.subNavItemActive]}
            onPress={() => setStudentTab('vacantes')}>
            <Text style={[styles.subNavText, studentTab === 'vacantes' && styles.subNavTextActive]}>
              🔍 Vacantes (HU-04/05)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, studentTab === 'postulaciones' && styles.subNavItemActive]}
            onPress={() => setStudentTab('postulaciones')}>
            <Text style={[styles.subNavText, studentTab === 'postulaciones' && styles.subNavTextActive]}>
              📋 Mis Postulaciones (HU-06)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, studentTab === 'perfil' && styles.subNavItemActive]}
            onPress={() => setStudentTab('perfil')}>
            <Text style={[styles.subNavText, studentTab === 'perfil' && styles.subNavTextActive]}>
              👤 Mi Perfil (HU-09)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de Sub-Navegación para Empresa */}
      {currentRole === 'company' && (
        <View style={styles.subNavBar}>
          <TouchableOpacity
            style={[styles.subNavItem, companyTab === 'vacantes' && styles.subNavItemActive]}
            onPress={() => setCompanyTab('vacantes')}>
            <Text style={[styles.subNavText, companyTab === 'vacantes' && styles.subNavTextActive]}>
              💼 Mis Vacantes (HU-03)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, companyTab === 'candidatos' && styles.subNavItemActive]}
            onPress={() => setCompanyTab('candidatos')}>
            <Text style={[styles.subNavText, companyTab === 'candidatos' && styles.subNavTextActive]}>
              👥 Candidatos (HU-07)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subNavItem, companyTab === 'perfil' && styles.subNavItemActive]}
            onPress={() => setCompanyTab('perfil')}>
            <Text style={[styles.subNavText, companyTab === 'perfil' && styles.subNavTextActive]}>
              🏢 Empresa (HU-02)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RENDERIZADO CONDICIONAL DE LA VISTA ACTIVA */}
      <View style={styles.mainContent}>
        {currentRole === 'student' && (
          <>
            {studentTab === 'vacantes' && (
              <HU04_VacantesView
                jobs={jobs}
                student={student}
                applications={applications}
                onApply={handleApplyToJob}
              />
            )}
            {studentTab === 'postulaciones' && (
              <HU06_PostulacionesView applications={applications} />
            )}
            {studentTab === 'perfil' && (
              <HU09_PerfilView
                student={student}
                onUpdateStudent={setStudent}
              />
            )}
          </>
        )}

        {currentRole === 'company' && (
          <>
            {companyTab === 'vacantes' && (
              <HU03_MisVacantesView
                company={currentCompany}
                jobs={jobs}
                onAddJob={handleAddJob}
                onUpdateJob={handleUpdateJob}
                onToggleJobStatus={handleToggleJobStatus}
              />
            )}
            {companyTab === 'candidatos' && (
              <HU07_CandidatosView
                jobs={jobs.filter((j) => j.companyId === currentCompany.id)}
                applications={applications}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
              />
            )}
            {companyTab === 'perfil' && (
              <HU02_PerfilEmpresaView
                company={currentCompany}
                allCompanies={companies}
                onRegisterCompany={handleRegisterCompany}
                onUpdateCompany={(updated) =>
                  setCompanies(
                    companies.map((c) => (c.id === updated.id ? updated : c))
                  )
                }
              />
            )}
          </>
        )}

        {currentRole === 'admin' && (
          <HU08_AdminDashboardView
            kpis={kpis}
            companies={companies}
            onApproveCompany={handleApproveCompany}
            onRejectCompany={handleRejectCompany}
          />
        )}
      </View>

      {/* Modal HU-01: Autenticación con Google */}
      <HU01_LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(mode) => {
          if (mode === 'first_time') {
            setStudentTab('perfil');
          } else {
            setStudentTab('vacantes');
          }
          setCurrentRole('student');
        }}
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
});
