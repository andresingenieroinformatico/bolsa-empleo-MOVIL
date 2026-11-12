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
  onUpdateCompany: (updated: CompanyProfile) => Promise<void>;
}

export const HU02_PerfilEmpresaView: React.FC<PerfilEmpresaViewProps> = ({
  company,
  onUpdateCompany,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(company.name);
  const [nit, setNit] = useState(company.nit === 'No especificado' ? '' : company.nit);
  const [sector, setSector] = useState(company.sector === 'No especificado' ? '' : company.sector);
  const [description, setDescription] = useState(company.description);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const closeEditor = () => {
    if (isSaving) return;
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updated = {
      ...company,
      name: name.trim(),
      nit: nit.trim() || 'No especificado',
      sector: sector.trim(),
      description: description.trim(),
    };
    if (!updated.name || !updated.sector || !updated.description) {
      setError('Completa el nombre, el sector y la descripción para guardar.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onUpdateCompany(updated);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No fue posible actualizar el perfil de la empresa.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.companyIconBox}>
          <Text style={styles.companyIconText}>🏢</Text>
        </View>
        <Text style={styles.companyName}>{company.name}</Text>
        <Text style={styles.companySector}>{company.sector}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Estado de verificación</Text>
          <StatusBadge status={company.status} />
        </View>

        {company.status === 'pending' && (
          <View style={styles.pendingWarning}>
            <Text style={styles.warningTitle}>Solicitud en revisión institucional</Text>
            <Text style={styles.warningText}>
              UNIPAZ está verificando la información de tu empresa. Podrás publicar vacantes
              cuando la solicitud sea aprobada.
            </Text>
          </View>
        )}

        {company.status === 'rejected' && (
          <View style={styles.rejectedWarning}>
            <Text style={styles.warningTitle}>Solicitud rechazada</Text>
            <Text style={styles.warningText}>
              Motivo: {company.rejectionReason || 'Consulta con la administración de UNIPAZ.'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeading}>Datos de la empresa</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              setError(null);
              setName(company.name);
              setNit(company.nit === 'No especificado' ? '' : company.nit);
              setSector(company.sector === 'No especificado' ? '' : company.sector);
              setDescription(company.description);
              setIsEditing(true);
            }}
            style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
        <InfoRow label="Razón social" value={company.name} />
        <InfoRow label="NIT / Identificación" value={company.nit} />
        <InfoRow label="Sector económico" value={company.sector} />
        <InfoRow label="Correo de contacto" value={company.email} />
        <InfoRow label="Descripción" value={company.description} />
      </View>

      <Modal
        visible={isEditing}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.modalTitle}>Editar perfil de empresa</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cerrar edición"
                disabled={isSaving}
                onPress={closeEditor}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.form}>
              <FormField
                label="Razón social o nombre comercial *"
                value={name}
                onChangeText={setName}
                maxLength={255}
              />
              <FormField
                label="NIT / Identificación"
                value={nit}
                onChangeText={setNit}
                maxLength={20}
              />
              <FormField
                label="Sector económico *"
                value={sector}
                onChangeText={setSector}
                maxLength={100}
              />
              <FormField
                label="Descripción *"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={3000}
              />
            </ScrollView>

            {error && (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => void handleSave()}
              style={[styles.saveButton, isSaving && styles.disabledButton]}>
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Guardando…' : 'Guardar cambios'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'No especificado'}</Text>
    </View>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  maxLength: number;
  multiline?: boolean;
}

function FormField({ label, multiline = false, ...props }: FormFieldProps) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    backgroundColor: '#F4F5F7',
  },
  content: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
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
    backgroundColor: '#E6F7ED',
    borderWidth: 1,
    borderColor: '#34D399',
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
    color: '#1A1F36',
    textAlign: 'center',
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
    color: '#6B7280',
  },
  pendingWarning: {
    marginTop: 14,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
  },
  rejectedWarning: {
    marginTop: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1F36',
    marginBottom: 3,
  },
  warningText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1F36',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#E6F7ED',
  },
  editButtonText: {
    color: '#007832',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A1F36',
    fontWeight: '500',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    maxHeight: '90%',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1F36',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '700',
  },
  form: {
    marginTop: 14,
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 5,
  },
  input: {
    minHeight: 42,
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1A1F36',
  },
  multilineInput: {
    minHeight: 100,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#00963F',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
