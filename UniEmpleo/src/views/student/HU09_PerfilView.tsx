import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StudentProfile } from '@/data/mock-data';
import { ApiDocument } from '@/services/api';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { Avatar } from '@/components/ui/avatar';
import { SectionHeader } from '@/components/ui/section-header';

interface PerfilViewProps {
  student: StudentProfile;
  onUpdateStudent: (updated: StudentProfile) => Promise<void>;
  onUploadCv: (file: ApiDocument) => Promise<StudentProfile>;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SLOTS = [
  { key: 'Mañana', hint: '8–12' },
  { key: 'Tarde', hint: '2–6' },
  { key: 'Noche', hint: '6–10' },
];

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

  const toggleSlot = (day: string, slot: string) => {
    const currentSlots = availability[day] || [];
    const updated = currentSlots.includes(slot)
      ? currentSlots.filter((entry) => entry !== slot)
      : [...currentSlots, slot];
    setAvailability({ ...availability, [day]: updated });
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
      setSaveMessage('Tu perfil quedó actualizado.');
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <Avatar name={student.name} size={68} tone="green" />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.email} numberOfLines={1}>
              {student.email}
            </Text>
            <View style={styles.verifiedPill}>
              <Icon name="shield-checkmark" size={12} color={Brand.greenDark} />
              <Text style={styles.verifiedText}>Cuenta institucional verificada</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Programa</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {program || 'Sin registrar'}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Semestre</Text>
            <Text style={styles.metaValue}>{semester || '—'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          overline="Datos académicos"
          title="Información de contacto"
          subtitle="La empresa verá estos datos cuando revises tu postulación."
        />

        <TextField
          label="Programa académico"
          value={program}
          onChangeText={setProgram}
          placeholder="Ej. Ingeniería de Sistemas"
          icon="school-outline"
          maxLength={120}
        />

        <View style={styles.row}>
          <TextField
            label="Semestre"
            value={semester}
            onChangeText={setSemester}
            keyboardType="number-pad"
            placeholder="6"
            maxLength={2}
            containerStyle={styles.rowItemNarrow}
          />
          <TextField
            label="Teléfono móvil"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+57 300 000 0000"
            maxLength={20}
            containerStyle={styles.rowItemWide}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          overline="Disponibilidad"
          title="Horarios en los que puedes trabajar"
          subtitle="Marca los turnos que no se cruzan con tus clases."
        />

        <View style={styles.matrix}>
          <View style={styles.matrixHeader}>
            <Text style={[styles.matrixHeaderCell, styles.matrixDayColumn]}>Día</Text>
            {SLOTS.map((slot) => (
              <View key={slot.key} style={styles.matrixSlotHeader}>
                <Text style={styles.matrixHeaderCell}>{slot.key}</Text>
                <Text style={styles.matrixHeaderHint}>{slot.hint}</Text>
              </View>
            ))}
          </View>

          {DAYS.map((day, index) => {
            const daySlots = availability[day] || [];
            return (
              <View
                key={day}
                style={[styles.matrixRow, index === DAYS.length - 1 && styles.matrixRowLast]}>
                <Text style={[styles.matrixDay, styles.matrixDayColumn]}>{day}</Text>
                {SLOTS.map((slot) => {
                  const selected = daySlots.includes(slot.key);
                  return (
                    <Pressable
                      key={slot.key}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${day} ${slot.key}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleSlot(day, slot.key)}
                      style={({ pressed }) => [
                        styles.matrixCell,
                        selected && styles.matrixCellSelected,
                        pressed && styles.matrixCellPressed,
                      ]}>
                      <Icon
                        name={selected ? 'checkmark' : 'remove'}
                        size={selected ? 15 : 12}
                        color={selected ? Brand.surface : Brand.slateFaint}
                      />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotActive]} />
            <Text style={styles.legendText}>Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>No disponible</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          overline="Hoja de vida"
          title="Tu CV en el perfil"
          subtitle="Se reutiliza al postularte y te ahorra adjuntarlo en cada oferta."
          action={<Text style={styles.formatHint}>PDF · máx. 5 MB</Text>}
        />

        {cvFile ? (
          <View style={styles.cvCard}>
            <View style={styles.cvIconWrap}>
              <Icon name="document-text" size={22} color={Brand.greenDark} />
            </View>
            <View style={styles.cvCopy}>
              <Text style={styles.cvName} numberOfLines={1}>
                {cvFile.name}
              </Text>
              <Text style={styles.cvMeta}>
                {cvFile.sizeMb === undefined ? 'PDF' : `${cvFile.sizeMb} MB`}
                {cvFile.uploadDate ? ` · Actualizado el ${cvFile.uploadDate}` : ''}
              </Text>
            </View>
            <View style={styles.cvStatus}>
              <Icon name="checkmark-circle" size={18} color={Brand.green} />
            </View>
          </View>
        ) : (
          <View style={styles.cvEmpty}>
            <View style={styles.cvEmptyIcon}>
              <Icon name="cloud-upload-outline" size={22} color={Brand.slateSoft} />
            </View>
            <View style={styles.cvCopy}>
              <Text style={styles.cvName}>Aún no has subido tu hoja de vida</Text>
              <Text style={styles.cvMeta}>Sube un PDF para postularte en un solo toque.</Text>
            </View>
          </View>
        )}

        <Button
          label={isUploadingCv ? 'Subiendo…' : cvFile ? 'Reemplazar hoja de vida' : 'Subir hoja de vida'}
          onPress={() => void handleUploadCv()}
          loading={isUploadingCv}
          variant={cvFile ? 'secondary' : 'tonal'}
          size="sm"
          icon="cloud-upload-outline"
          fullWidth
        />

        {cvError ? (
          <Notice tone="error" message={cvError} onDismiss={() => setCvError(null)} />
        ) : null}
        {cvSuccess ? <Notice tone="success" message={cvSuccess} /> : null}
      </View>

      {saveError ? (
        <Notice tone="error" title="No se pudo guardar" message={saveError} onDismiss={() => setSaveError(null)} />
      ) : null}
      {saveMessage ? <Notice tone="success" message={saveMessage} /> : null}

      <Button
        label={isSaving ? 'Guardando…' : 'Guardar cambios'}
        onPress={() => void handleSaveProfile()}
        loading={isSaving}
        size="lg"
        icon="save-outline"
        fullWidth
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.lg,
  },
  profileCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.xl,
    gap: Space.lg,
    ...Shadows.card,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
  },
  profileCopy: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  email: {
    ...Type.caption,
    color: Brand.slate,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  verifiedText: {
    ...Type.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: Brand.greenDeep,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: Brand.lineSoft,
    paddingTop: Space.md,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaDivider: {
    width: 1,
    backgroundColor: Brand.lineSoft,
    marginHorizontal: Space.md,
  },
  metaLabel: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.slateSoft,
  },
  metaValue: {
    ...Type.bodyStrong,
    color: Brand.ink,
  },
  section: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.xl,
    gap: Space.md,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    gap: Space.md,
  },
  rowItemNarrow: {
    flex: 0.6,
  },
  rowItemWide: {
    flex: 1.4,
  },
  matrix: {
    borderWidth: 1,
    borderColor: Brand.line,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: Brand.line,
    paddingVertical: 8,
  },
  matrixHeaderCell: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.slateSoft,
    textAlign: 'center',
  },
  matrixHeaderHint: {
    ...Type.caption,
    fontSize: 9,
    color: Brand.slateFaint,
    textAlign: 'center',
  },
  matrixDayColumn: {
    width: 88,
  },
  matrixSlotHeader: {
    flex: 1,
    gap: 1,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Brand.lineSoft,
  },
  matrixRowLast: {
    borderBottomWidth: 0,
  },
  matrixDay: {
    ...Type.label,
    color: Brand.inkSoft,
    paddingLeft: 4,
  },
  matrixCell: {
    flex: 1,
    height: 34,
    marginHorizontal: 4,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surfaceMuted,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
  },
  matrixCellSelected: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  matrixCellPressed: {
    opacity: 0.8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: Brand.surfaceMuted,
    borderWidth: 1,
    borderColor: Brand.lineStrong,
  },
  legendDotActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  legendText: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  formatHint: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.greenDark,
  },
  cvCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
  },
  cvIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Brand.surfaceMuted,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    borderStyle: 'dashed',
  },
  cvEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvCopy: {
    flex: 1,
    gap: 2,
  },
  cvName: {
    ...Type.bodyStrong,
    color: Brand.ink,
  },
  cvMeta: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slate,
  },
  cvStatus: {
    paddingLeft: 4,
  },
});
