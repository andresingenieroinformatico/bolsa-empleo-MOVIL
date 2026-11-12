import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import {
  AdminKPIs,
  CompanyProfile,
  INITIAL_USERS_MANAGEMENT,
} from '@/data/mock-data';

interface AdminDashboardViewProps {
  kpis: AdminKPIs;
  companies: CompanyProfile[];
  onApproveCompany: (companyId: string) => void;
  onRejectCompany: (companyId: string, reason: string) => void;
}

export const HU08_AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  kpis,
  companies,
  onApproveCompany,
  onRejectCompany,
}) => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'companies' | 'users'>('kpis');

  // Gestión de usuarios (HU-08)
  const [users, setUsers] = useState(INITIAL_USERS_MANAGEMENT);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('todos');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Modal de rechazo de empresa con motivo (HU-02)
  const [rejectingCompanyId, setRejectingCompanyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  const pendingCompanies = companies.filter((c) => c.status === 'pending');

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'todos' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Criterio HU-08 Escenario 3 y 4: Desactivar usuario con protección de admin
  const handleToggleUserActive = (userId: string) => {
    setAdminNotice(null);
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    // Escenario 4: Admin no puede desactivar a otro administrador
    if (targetUser.role === 'admin') {
      setAdminNotice('Seguridad: No está permitido desactivar cuentas con rol Administrador.');
      setTimeout(() => setAdminNotice(null), 3000);
      return;
    }

    setUsers(
      users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  const handleApprove = (companyId: string, name: string) => {
    onApproveCompany(companyId);
    setApprovalNotice(`¡Empresa "${name}" aprobada exitosamente! Ya tiene habilitada la publicación de vacantes.`);
    setTimeout(() => setApprovalNotice(null), 3000);
  };

  const handleConfirmReject = () => {
    if (!rejectingCompanyId) return;
    onRejectCompany(
      rejectingCompanyId,
      rejectionReason.trim() || 'Documentación corporativa no verificada.'
    );
    setRejectingCompanyId(null);
    setRejectionReason('');
    setApprovalNotice('La empresa fue rechazada con notificación de motivo por correo.');
    setTimeout(() => setApprovalNotice(null), 3000);
  };

  return (
    <View style={styles.container}>
      {/* Selector de Pestañas del Panel Admin */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'kpis' && styles.tabBtnActive]}
          onPress={() => setActiveTab('kpis')}>
          <Text style={[styles.tabBtnText, activeTab === 'kpis' && styles.tabBtnTextActive]}>
            📊 KPIs y Gráficos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'companies' && styles.tabBtnActive]}
          onPress={() => setActiveTab('companies')}>
          <Text style={[styles.tabBtnText, activeTab === 'companies' && styles.tabBtnTextActive]}>
            🏢 Empresas ({pendingCompanies.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}>
          <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
            👥 Usuarios
          </Text>
        </TouchableOpacity>
      </View>

      {approvalNotice && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>🔔 {approvalNotice}</Text>
        </View>
      )}

      {adminNotice && (
        <View style={styles.errorNoticeBanner}>
          <Text style={styles.errorNoticeText}>⚠️ {adminNotice}</Text>
        </View>
      )}

      {/* PESTAÑA 1: KPIs y Gráficos (HU-08 Escenarios 1 y 2) */}
      {activeTab === 'kpis' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.sectionHeader}>Métricas del Sistema en Tiempo Real</Text>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiNumber}>{kpis.totalStudents}</Text>
              <Text style={styles.kpiLabel}>Total de Estudiantes</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={[styles.kpiNumber, { color: '#059669' }]}>
                {kpis.approvedCompanies}
              </Text>
              <Text style={styles.kpiLabel}>Empresas Aprobadas</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={[styles.kpiNumber, { color: '#D97706' }]}>
                {pendingCompanies.length}
              </Text>
              <Text style={styles.kpiLabel}>Empresas Pendientes</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={[styles.kpiNumber, { color: '#2563EB' }]}>
                {kpis.activeJobs}
              </Text>
              <Text style={styles.kpiLabel}>Vacantes Activas</Text>
            </View>

            <View style={[styles.kpiCard, { width: '100%' }]}>
              <Text style={[styles.kpiNumber, { color: '#7C3AED' }]}>
                {kpis.totalApplications}
              </Text>
              <Text style={styles.kpiLabel}>Total de Postulaciones Gestionadas</Text>
            </View>
          </View>

          {/* Gráfico Mensual de Barras (HU-08 Escenario 2) */}
          <View style={styles.chartCard}>
            <View style={styles.chartTitleRow}>
              <Text style={styles.chartTitle}>Postulaciones Mensuales (Año 2026)</Text>
              <Text style={styles.tag}>HU-08</Text>
            </View>
            <Text style={styles.chartSubtitle}>
              Tendencia de intermediación laboral en Barrancabermeja
            </Text>

            <View style={styles.barChartContainer}>
              {kpis.monthlyStats.map((item) => {
                const heightPercent = Math.min(100, (item.applications / 45) * 100);
                return (
                  <View key={item.month} style={styles.barColumn}>
                    <Text style={styles.barValue}>{item.applications}</Text>
                    <View style={styles.barBackground}>
                      <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.month.slice(0, 3)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}

      {/* PESTAÑA 2: Aprobación / Rechazo de Empresas (HU-02 y HU-08) */}
      {activeTab === 'companies' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.sectionHeader}>Solicitudes de Empresas Pendientes</Text>
          <Text style={styles.sectionSub}>
            Verifica el NIT y la razón social antes de habilitar la publicación de vacantes
          </Text>

          {pendingCompanies.length === 0 ? (
            <View style={styles.allClearCard}>
              <Text style={styles.allClearIcon}>✅</Text>
              <Text style={styles.allClearTitle}>No hay empresas pendientes</Text>
              <Text style={styles.allClearText}>
                Todas las solicitudes de registro han sido evaluadas oportunamente.
              </Text>
            </View>
          ) : (
            pendingCompanies.map((comp) => (
              <View key={comp.id} style={styles.companyAdminCard}>
                <View style={styles.companyAdminHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.compAdminName}>{comp.name}</Text>
                    <Text style={styles.compAdminMeta}>
                      NIT: {comp.nit} · {comp.sector}
                    </Text>
                    <Text style={styles.compAdminEmail}>✉️ {comp.email}</Text>
                  </View>
                  <StatusBadge status="pending" size="small" />
                </View>

                <Text style={styles.compAdminDesc}>{comp.description}</Text>

                <View style={styles.companyActionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(comp.id, comp.name)}>
                    <Text style={styles.approveBtnText}>✓ Aprobar Empresa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => setRejectingCompanyId(comp.id)}>
                    <Text style={styles.rejectBtnText}>✕ Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>
            Empresas ya evaluadas ({companies.length - pendingCompanies.length})
          </Text>
          {companies
            .filter((c) => c.status !== 'pending')
            .map((comp) => (
              <View key={comp.id} style={styles.evalCompanyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.evalName}>{comp.name}</Text>
                  <Text style={styles.evalMeta}>NIT: {comp.nit} · {comp.sector}</Text>
                </View>
                <StatusBadge status={comp.status} size="small" />
              </View>
            ))}
        </ScrollView>
      )}

      {/* PESTAÑA 3: Gestión de Usuarios (HU-08 Escenarios 3, 4, 5, 6) */}
      {activeTab === 'users' && (
        <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Buscador de Usuarios (Escenario 6) */}
          <View style={styles.userSearchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.userSearchInput}
              placeholder="Buscar por nombre o email..."
              value={userSearchQuery}
              onChangeText={setUserSearchQuery}
            />
          </View>

          {/* Filtros por Rol (Escenario 5) */}
          <View style={styles.roleFilterRow}>
            {['todos', 'student', 'company', 'admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleFilterChip,
                  userRoleFilter === role && styles.roleFilterChipActive,
                ]}
                onPress={() => setUserRoleFilter(role)}>
                <Text
                  style={[
                    styles.roleFilterText,
                    userRoleFilter === role && styles.roleFilterTextActive,
                  ]}>
                  {role === 'todos'
                    ? 'Todos'
                    : role === 'student'
                    ? 'Estudiantes'
                    : role === 'company'
                    ? 'Empresas'
                    : 'Admins'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Listado de Usuarios con Switch Activo/Inactivo (Escenario 3 y 4) */}
          <View style={styles.usersList}>
            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userRoleTag}>
                      {user.role === 'student'
                        ? '🎓 Estudiante'
                        : user.role === 'company'
                        ? '🏢 Empresa'
                        : '🛡️ Admin'}
                    </Text>
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>

                <View style={styles.userSwitchArea}>
                  <Text style={[styles.userStatusLabel, !user.active && { color: '#991B1B' }]}>
                    {user.active ? 'Activo' : 'Inactivo'}
                  </Text>
                  <Switch
                    value={user.active}
                    onValueChange={() => handleToggleUserActive(user.id)}
                    trackColor={{ false: '#FECACA', true: '#A7F3D0' }}
                    thumbColor={user.active ? '#0F766E' : '#991B1B'}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Modal de Rechazo de Empresa con Motivo (HU-02 Escenario 4) */}
      <Modal
        visible={rejectingCompanyId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectingCompanyId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rechazar Solicitud de Empresa</Text>
            <Text style={styles.modalDesc}>
              Ingresa el motivo que se enviará por correo a la empresa para que subsane los requisitos:
            </Text>

            <TextInput
              style={[styles.reasonInput, { height: 80 }]}
              multiline
              placeholder="Ej. NIT no verificado en RUES, falta certificado de existencia y representación legal..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRejectingCompanyId(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectBtn}
                onPress={handleConfirmReject}>
                <Text style={styles.confirmRejectBtnText}>Confirmar Rechazo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  tabBtnText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  noticeBanner: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noticeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '600',
  },
  errorNoticeBanner: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorNoticeText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F766E',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 16,
    marginTop: 2,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    width: 38,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4,
  },
  barBackground: {
    width: 18,
    height: 90,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: '#0F766E',
    borderRadius: 6,
    width: '100%',
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '600',
  },
  allClearCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  allClearIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  allClearTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  allClearText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  companyAdminCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  companyAdminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  compAdminName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  compAdminMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  compAdminEmail: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '600',
    marginTop: 2,
  },
  compAdminDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginVertical: 8,
  },
  companyActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#991B1B',
    fontWeight: '700',
    fontSize: 12,
  },
  evalCompanyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  evalName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  evalMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
  userSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 42,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  userSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  roleFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  roleFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  roleFilterChipActive: {
    backgroundColor: '#0F766E',
  },
  roleFilterText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
  },
  usersList: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  userRoleTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userEmail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  userSwitchArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  userStatusLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  reasonInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#111827',
    marginBottom: 16,
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 12,
  },
  confirmRejectBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  confirmRejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
