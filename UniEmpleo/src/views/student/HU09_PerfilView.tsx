import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StudentProfile } from '@/data/mock-data';

interface PerfilViewProps {
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => void;
}

export const HU09_PerfilView: React.FC<PerfilViewProps> = ({
  student,
  onUpdateStudent,
}) => {
  const [phone, setPhone] = useState(student.phone);
  const [semester, setSemester] = useState(String(student.semester));
  const [program, setProgram] = useState(student.program);
  const [availability, setAvailability] = useState(student.availability);
  const [cvFile, setCvFile] = useState(student.cvFile);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvSuccess, setCvSuccess] = useState<string | null>(null);

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

  const handleSaveProfile = () => {
    const updatedStudent: StudentProfile = {
      ...student,
      phone,
      program,
      semester: parseInt(semester, 10) || 1,
      availability,
      cvFile,
    };
    onUpdateStudent(updatedStudent);
    setSaveMessage('¡Datos de perfil y disponibilidad actualizados con éxito!');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  // Criterios HU-09 Escenario 3 y 4: Subida/Reemplazo de CV
  const handleUploadValidCv = () => {
    setCvError(null);
    const newCv = {
      name: 'CV_Actualizado_UNIPAZ_2026.pdf',
      sizeMb: 2.3,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setCvFile(newCv);
    setCvSuccess('Hoja de vida actualizada exitosamente (2.3 MB). Se usará en futuras postulaciones.');
    setTimeout(() => setCvSuccess(null), 3000);
  };

  // Criterio HU-09 Escenario 5: Excede límite de tamaño (> 5MB)
  const handleUploadExceedsLimit = () => {
    setCvSuccess(null);
    setCvError('Error: El archivo seleccionado (7.4 MB) excede el tamaño máximo permitido de 5.0 MB. Por favor comprímelo o selecciona otro archivo.');
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
                Tamaño: {cvFile.sizeMb} MB · Subido el {cvFile.uploadDate}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noCvNotice}>
            <Text style={styles.noCvText}>Aún no has subido tu hoja de vida.</Text>
          </View>
        )}

        {/* Acciones de prueba para CV */}
        <View style={styles.cvActionsRow}>
          <TouchableOpacity
            style={styles.cvActionBtn}
            onPress={handleUploadValidCv}>
            <Text style={styles.cvActionText}>📎 Subir / Actualizar CV (2.3 MB)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cvActionBtn, styles.cvActionErrorBtn]}
            onPress={handleUploadExceedsLimit}>
            <Text style={styles.cvActionErrorText}>⚠️ Simular archivo &gt; 5MB</Text>
          </TouchableOpacity>
        </View>

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

      {/* Botón Guardar Perfil */}
      <TouchableOpacity
        style={styles.saveProfileBtn}
        activeOpacity={0.85}
        onPress={handleSaveProfile}>
        <Text style={styles.saveProfileBtnText}>Guardar Perfil y Disponibilidad</Text>
      </TouchableOpacity>
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
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F766E',
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
    color: '#111827',
  },
  studentEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  googleVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  googleIcon: {
    color: '#059669',
    fontWeight: '900',
    fontSize: 11,
  },
  googleVerifiedText: {
    fontSize: 11,
    color: '#065F46',
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
  matrixContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  matrixHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    paddingVertical: 4,
  },
  matrixDayCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    paddingLeft: 10,
  },
  matrixSlotBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  matrixSlotBtnActive: {
    backgroundColor: '#0F766E',
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
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
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
    color: '#0F766E',
  },
  cvFileSize: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  noCvNotice: {
    padding: 12,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#0F766E',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  cvActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
  },
  successAlertText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '600',
  },
  saveAlert: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  saveAlertText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  saveProfileBtn: {
    backgroundColor: '#0F766E',
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
