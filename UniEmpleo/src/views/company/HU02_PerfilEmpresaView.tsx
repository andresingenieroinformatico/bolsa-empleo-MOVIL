import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { CompanyProfile } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { InfoRow } from '@/components/ui/info-row';
import { SectionHeader } from '@/components/ui/section-header';

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

  const openEditor = () => {
    setError(null);
    setName(company.name);
    setNit(company.nit === 'No especificado' ? '' : company.nit);
    setSector(company.sector === 'No especificado' ? '' : company.sector);
    setDescription(company.description);
    setIsEditing(true);
  };

  const closeEditor = () => {
    if (isSaving) return;
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const updated: CompanyProfile = {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Avatar name={company.name} size={64} tone="navy" />
          <View style={styles.headerCopy}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companySector}>{company.sector || 'Sector sin registrar'}</Text>
            <View style={styles.statusRow}>
              <StatusBadge status={company.status} size="small" />
            </View>
          </View>
        </View>

        {company.status === 'pending' ? (
          <Notice
            tone="warning"
            title="Solicitud en revisión"
            message="UNIPAZ está verificando la información de tu empresa. Podrás publicar vacantes cuando la solicitud sea aprobada."
          />
        ) : null}

        {company.status === 'rejected' ? (
          <Notice
            tone="error"
            title="Solicitud rechazada"
            message={`Motivo: ${company.rejectionReason || 'Consulta con la administración de UNIPAZ.'}`}
          />
        ) : null}
      </View>

      <View style={styles.section}>
        <SectionHeader
          overline="Perfil institucional"
          title="Datos de la empresa"
          subtitle="Esta información es visible para los estudiantes."
          action={
            <Button label="Editar" variant="tonal" size="sm" icon="create-outline" onPress={openEditor} />
          }
        />

        <View style={styles.infoCard}>
          <InfoRow icon="business-outline" label="Razón social" value={company.name} />
          <InfoRow icon="card-outline" label="NIT" value={company.nit} />
          <InfoRow icon="layers-outline" label="Sector" value={company.sector} />
          <InfoRow icon="mail-outline" label="Correo" value={company.email} />
          <InfoRow icon="document-text-outline" label="Descripción" value={company.description} last muted />
        </View>
      </View>

      <Sheet
        visible={isEditing}
        onClose={closeEditor}
        title="Editar perfil de empresa"
        subtitle="Mantén los datos actualizados para generar confianza."
        icon="business-outline"
        closeLabel="Cerrar edición de empresa"
        scrollable
        footer={
          <Button
            label={isSaving ? 'Guardando…' : 'Guardar cambios'}
            onPress={() => void handleSave()}
            loading={isSaving}
            size="lg"
            icon="save-outline"
            fullWidth
          />
        }>
        <TextField
          label="Razón social o nombre comercial"
          required
          value={name}
          onChangeText={setName}
          maxLength={255}
          icon="business-outline"
        />
        <TextField
          label="NIT"
          optionalLabel="Opcional"
          value={nit}
          onChangeText={setNit}
          maxLength={20}
          icon="card-outline"
        />
        <TextField
          label="Sector económico"
          required
          value={sector}
          onChangeText={setSector}
          maxLength={100}
          placeholder="Tecnología, agroindustria, logística…"
          icon="layers-outline"
        />
        <TextField
          label="Descripción"
          required
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={3000}
          hint="Describe la actividad de la empresa para los estudiantes."
        />

        {error ? (
          <Notice tone="error" message={error} onDismiss={() => setError(null)} />
        ) : null}
      </Sheet>
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
  headerCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.xl,
    gap: Space.lg,
    ...Shadows.card,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  companyName: {
    ...Type.titleSmall,
    color: Brand.ink,
  },
  companySector: {
    ...Type.caption,
    color: Brand.slate,
  },
  statusRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  section: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.xl,
    ...Shadows.card,
  },
  infoCard: {
    backgroundColor: Brand.surfaceMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.lineSoft,
    paddingHorizontal: Space.md,
  },
});
