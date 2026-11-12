import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StudentProfile } from '@/data/mock-data';
import { ApiDocument } from '@/services/api';

interface PerfilViewProps {
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => Promise<void>;
  onUploadCv: (file: ApiDocument) => Promise<StudentProfile>;
}

export const HU09_PerfilView: React.FC<PerfilViewProps> = ({
  student,
  onUpdateStudent,
  onUploadCv,
}) => {
  const [phone, setPhone] = useState(student.phone);
  const [semester, setSemester] = useState(String(student.semester));
  const [program, setProgram] = useState(student.program);
  const [availability, setAvailability] = useState(student.availability);
  const [cvFile, setCvFile] = useState(student.cvFile);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvSuccess, setCvSuccess] = useState<string | null>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const timeSlots = ['Mañana', 'Tarde', 'Noche'];

  const toggleSlot = (day: string, slot: string) => {
    const currentSlots = availability[day] || [];
    const exists = currentSlots.includes(slot);
    const updated = exists
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot];

    const newAvailability = {
      ...availability,
      [day]: updated,
    };
    setAvailability(newAvailability);
  };

  const handleSaveProfile = async () => {
    setSaveMessage(null);
    setSaveError(null);
    const updatedStudent: StudentProfile = {
      ...student,
      phone,
      program,
      semester: parseInt(semester, 10) || 1,
      availability,
      cvFile,
    };
    setIsSaving(true);
    try {
      await onUpdateStudent(updatedStudent);
      setSaveMessage('Perfil actualizado correctamente.');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No fue posible guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadCv = async () => {
    setCvError(null);
    setCvSuccess(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.mimeType !== 'application/pdf') {
        setCvError('El archivo seleccionado no es un PDF.');
        return;
      }
      if (file.size !== undefined && file.size > 5 * 1024 * 1024) {
        setCvError('El archivo supera el tamaño máximo permitido de 5 MB.');
        return;
      }

      setIsUploadingCv(true);
      const updated = await onUploadCv({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        file: file.file,
      });
      setCvFile(updated.cvFile);
      setCvSuccess('Hoja de vida subida correctamente.');
      setTimeout(() => setCvSuccess(null), 3000);
    } catch (error) {
      setCvError(error instanceof Error ? error.message : 'No fue posible subir la hoja de vida.');
    } finally {
      setIsUploadingCv(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>CM</Text>
        </View>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentEmail}>{student.email}</Text>
        <View style={styles.googleVerifiedBadge}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleVerifiedText}>Cuenta institucional verificada</Text>
        </View>
      </View>

      {/* Formulario de Datos Personales */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>1. Información Académica y Contacto</Text>
        <Text style={styles.sectionSubtitle}>
          Datos complementarios para postulaciones laborales en Barrancabermeja
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Programa Académico UNIPAZ</Text>
          <TextInput
            style={styles.input}
            value={program}
            onChangeText={setProgram}
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Semestre Actual</Text>
            <TextInput
              style={styles.input}
              value={semester}
              onChangeText={setSemester}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1.5 }]}>
            <Text style={styles.fieldLabel}>Teléfono Móvil</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* Matriz Semanal de Disponibilidad Horaria (HU-09 Escenario 2) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>2. Disponibilidad Horaria Semanal</Text>
          <Text style={styles.tag}>HU-09</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Toca cada casilla para indicar los turnos en que puedes trabajar sin cruzar con tus clases
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.matrixContainer}>
            <View style={styles.matrixHeaderRow}>
              <Text style={[styles.matrixHeaderCell, { flex: 1.2 }]}>Día</Text>
              <Text style={styles.matrixHeaderCell}>Mañana{'\n'}(8-12)</Text>
              <Text style={styles.matrixHeaderCell}>Tarde{'\n'}(2-6)</Text>
              <Text style={styles.matrixHeaderCell}>Noche{'\n'}(6-10)</Text>
            </View>

            {daysOfWeek.map((day) => {
              const daySlots = availability[day] || [];
              return (
                <View key={day} style={styles.matrixRow}>
                  <Text style={[styles.matrixDayCell, { flex: 1.2 }]}>{day}</Text>
                  {timeSlots.map((slot) => {
                    const isSelected = daySlots.includes(slot);
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.matrixSlotBtn,
                          isSelected && styles.matrixSlotBtnActive,
                        ]}
                        onPress={() => toggleSlot(day, slot)}>
                        <Text
                          style={[
                            styles.matrixSlotText,
                            isSelected && styles.matrixSlotTextActive,
                          ]}>
                          {isSelected ? '✓' : '—'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Gestión de Hoja de Vida (HU-09 Escenarios 3, 4 y 5) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>3. Hoja de Vida en el Perfil</Text>
          <Text style={styles.tag}>PDF max 5MB</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Se reutilizará automáticamente al postularte a vacantes con un solo toque
        </Text>

        {cvFile ? (
          <View style={styles.cvInfoCard}>
            <Text style={styles.cvDocIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cvFileName}>{cvFile.name}</Text>
              <Text style={styles.cvFileSize}>
                Tamaño: {cvFile.sizeMb === undefined ? 'No disponible' : `${cvFile.sizeMb} MB`}
                {cvFile.uploadDate ? ` · Subido el ${cvFile.uploadDate}` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noCvNotice}>
            <Text style={styles.noCvText}>Aún no has subido tu hoja de vida.</Text>
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          disabled={isUploadingCv}
          style={[styles.cvActionBtn, isUploadingCv && styles.disabledButton]}
          onPress={() => void handleUploadCv()}>
          <Text style={styles.cvActionText}>
            {isUploadingCv ? 'Subiendo hoja de vida…' : 'Seleccionar y subir PDF'}
          </Text>
        </TouchableOpacity>

        {cvError && (
          <View style={styles.errorAlert}>
            <Text style={styles.errorAlertText}>❌ {cvError}</Text>
          </View>
        )}

        {cvSuccess && (
          <View style={styles.successAlert}>
            <Text style={styles.successAlertText}>✅ {cvSuccess}</Text>
          </View>
        )}
      </View>

      {saveMessage && (
        <View style={styles.saveAlert}>
          <Text style={styles.saveAlertText}>✅ {saveMessage}</Text>
        </View>
      )}
      {saveError && (
        <View style={styles.errorAlert}>
          <Text style={styles.errorAlertText}>{saveError}</Text>
        </View>
      )}

      {/* Botón Guardar Perfil */}
      <TouchableOpacity
        style={styles.saveProfileBtn}
        disabled={isSaving}
        activeOpacity={0.85}
        onPress={() => void handleSaveProfile()}>
        <Text style={styles.saveProfileBtnText}>
          {isSaving ? 'Guardando…' : 'Guardar perfil y disponibilidad'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

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
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00963F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1F36',
  },
  studentEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  googleVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  googleIcon: {
    color: '#00963F',
    fontWeight: '900',
    fontSize: 11,
  },
  googleVerifiedText: {
    fontSize: 11,
    color: '#007832',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F36',
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00963F',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1A1F36',
  },
  matrixContainer: {
    minWidth: 480,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F4F5F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  matrixHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7',
    alignItems: 'center',
    paddingVertical: 4,
  },
  matrixDayCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingLeft: 10,
  },
  matrixSlotBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  matrixSlotBtnActive: {
    backgroundColor: '#00963F',
  },
  matrixSlotText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  matrixSlotTextActive: {
    color: '#FFFFFF',
  },
  cvInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7ED',
    borderWidth: 1,
    borderColor: '#34D399',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  cvDocIcon: {
    fontSize: 24,
  },
  cvFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00963F',
  },
  cvFileSize: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  noCvNotice: {
    padding: 12,
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    marginBottom: 10,
  },
  noCvText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cvActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cvActionBtn: {
    flex: 1,
    backgroundColor: '#00963F',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  cvActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cvActionErrorBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cvActionErrorText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '600',
  },
  errorAlert: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
  },
  errorAlertText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '600',
  },
  successAlert: {
    marginTop: 8,
    backgroundColor: '#E6F7ED',
    padding: 8,
    borderRadius: 8,
  },
  successAlertText: {
    color: '#007832',
    fontSize: 11,
    fontWeight: '600',
  },
  saveAlert: {
    backgroundColor: '#E6F7ED',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34D399',
    alignItems: 'center',
  },
  saveAlertText: {
    color: '#007832',
    fontSize: 12,
    fontWeight: '700',
  },
  saveProfileBtn: {
    backgroundColor: '#00963F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
