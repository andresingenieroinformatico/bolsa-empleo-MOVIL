import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { CompanyProfile } from '@/data/mock-data';

interface PerfilEmpresaViewProps {
  company: CompanyProfile;
  allCompanies: CompanyProfile[];
  onRegisterCompany: (newCompany: CompanyProfile) => void;
  onUpdateCompany: (updated: CompanyProfile) => void;
}

export const HU02_PerfilEmpresaView: React.FC<PerfilEmpresaViewProps> = ({
  company,
  allCompanies,
  onRegisterCompany,
  onUpdateCompany,
}) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNit, setRegNit] = useState('');
  const [regSector, setRegSector] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Criterio HU-02 Escenarios 1 y 2
  const handleRegister = () => {
    setRegisterError(null);
    setRegisterSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegisterError('Por favor completa los campos obligatorios (Nombre, Email, Contraseña).');
      return;
    }

    // Escenario 2: Email ya existente
    const emailExists = allCompanies.some(
      (c) => c.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setRegisterError('Error: El email corporativo ya se encuentra registrado en el sistema.');
      return;
    }

    const newCompany: CompanyProfile = {
      id: `comp-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      nit: regNit.trim() || 'Pendiente por adjuntar',
      sector: regSector.trim() || 'Servicios Generales',
      description: regDesc.trim() || 'Empresa registrada en UniEmpleo.',
      status: 'pending', // Escenario 1: se crea en pending
    };

    onRegisterCompany(newCompany);
    setRegisterSuccess('¡Empresa registrada exitosamente! Tu cuenta quedó en estado "pending" en espera de aprobación por UNIPAZ.');
    setTimeout(() => {
      setShowRegisterModal(false);
      setRegisterSuccess(null);
      setRegName('');
      setRegEmail('');
      setRegNit('');
      setRegSector('');
      setRegDesc('');
      setRegPassword('');
    }, 1800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.companyIconBox}>
          <Text style={styles.companyIconText}>🏢</Text>
        </View>
        <Text style={styles.companyName}>{company.name}</Text>
        <Text style={styles.companySector}>{company.sector} · Barrancabermeja</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado de verificación:</Text>
          <StatusBadge status={company.status} />
        </View>

        {/* Mensaje de estado pending (Criterio HU-02 Escenario 1) */}
        {company.status === 'pending' && (
          <View style={styles.pendingWarning}>
            <Text style={styles.pendingTitle}>⚠️ Solicitud en revisión institucional</Text>
            <Text style={styles.pendingDesc}>
              Tu empresa está en proceso de verificación por la administración de UNIPAZ. Aún no puedes publicar vacantes hasta ser aprobada.
            </Text>
          </View>
        )}

        {/* Mensaje de estado rechazada (Criterio HU-02 Escenario 4) */}
        {company.status === 'rejected' && (
          <View style={styles.rejectedWarning}>
            <Text style={styles.rejectedTitle}>❌ Solicitud rechazada</Text>
            <Text style={styles.rejectedDesc}>
              Motivo: {company.rejectionReason || 'Documentación incompleta.'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardHeading}>Datos de la Empresa</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>NIT / Identificación:</Text>
          <Text style={styles.infoValue}>{company.nit}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Correo de contacto:</Text>
          <Text style={styles.infoValue}>{company.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Descripción:</Text>
          <Text style={styles.infoValue}>{company.description}</Text>
        </View>
      </View>

      {/* Botón para probar Registro de otra Empresa (HU-02) */}
      <TouchableOpacity
        style={styles.registerAnotherBtn}
        activeOpacity={0.85}
        onPress={() => setShowRegisterModal(true)}>
        <Text style={styles.registerAnotherText}>
          📝 Probar Formulario de Registro de Empresa (HU-02)
        </Text>
      </TouchableOpacity>

      {/* Modal de Registro de Empresa (HU-02) */}
      <Modal
        visible={showRegisterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.tag}>HU-02 · Registro de Empresa</Text>
              <TouchableOpacity
                onPress={() => setShowRegisterModal(false)}
                style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Registro de Empleador</Text>
            <Text style={styles.modalSubtitle}>
              Publica vacantes dirigidas a estudiantes y practicantes de UNIPAZ
            </Text>

            <ScrollView style={{ maxHeight: 360 }}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Razón Social o Nombre Comercial *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Logística Petrolera S.A.S."
                  value={regName}
                  onChangeText={setRegName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>NIT (Opcional en registro inicial)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 901.345.678-9"
                  value={regNit}
                  onChangeText={setRegNit}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Email Corporativo Único *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="talento@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={regEmail}
                  onChangeText={setRegEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  secureTextEntry
                  value={regPassword}
                  onChangeText={setRegPassword}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Sector Económico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Tecnología, Minero, Servicios"
                  value={regSector}
                  onChangeText={setRegSector}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Breve Descripción de la Empresa</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  multiline
                  placeholder="Describe la actividad de la empresa..."
                  value={regDesc}
                  onChangeText={setRegDesc}
                />
              </View>
            </ScrollView>

            {registerError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {registerError}</Text>
              </View>
            )}

            {registerSuccess && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>✅ {registerSuccess}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
              <Text style={styles.submitBtnText}>Enviar Solicitud de Registro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyIconText: {
    fontSize: 28,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  companySector: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  pendingWarning: {
    marginTop: 14,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  pendingDesc: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  rejectedWarning: {
    marginTop: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  rejectedDesc: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    marginTop: 1,
  },
  registerAnotherBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F766E',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerAnotherText: {
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  formGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  successText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
});
