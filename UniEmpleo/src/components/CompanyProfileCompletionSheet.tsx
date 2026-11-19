import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CompanyProfile } from '@/data/mock-data';
import {
  CompanyProfileFieldKey,
  describeMissingCompanyFields,
  getMissingCompanyProfileFields,
} from '@/lib/company-profile';
import { Space } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';

interface CompanyProfileCompletionSheetProps {
  visible: boolean;
  company: CompanyProfile;
  onClose: () => void;
  onSave: (updated: CompanyProfile) => Promise<void>;
  /** Runs after a successful save, before closing (e.g. open the vacancy form). */
  onSaved?: () => void;
  context?: 'dashboard' | 'publish';
}

type Draft = Record<CompanyProfileFieldKey, string>;

function emptyPlaceholder(value?: string): string {
  const normalized = value?.trim();
  if (!normalized || normalized.toLowerCase() === 'no especificado') return '';
  return normalized;
}

function buildDraft(company: CompanyProfile): Draft {
  return {
    nit: emptyPlaceholder(company.nit),
    sector: emptyPlaceholder(company.sector),
    contactPerson: emptyPlaceholder(company.contactPerson),
    phone: emptyPlaceholder(company.phone),
    address: emptyPlaceholder(company.address),
  };
}

/**
 * Focused dialog for the data missing after sign-up. It only asks for the
 * fields that are still empty, so the company can finish in a few seconds.
 */
export function CompanyProfileCompletionSheet({
  visible,
  company,
  onClose,
  onSave,
  onSaved,
  context = 'dashboard',
}: CompanyProfileCompletionSheetProps) {
  const [draft, setDraft] = useState<Draft>(() => buildDraft(company));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const missingFields = getMissingCompanyProfileFields(company);

  const setField = (key: CompanyProfileFieldKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const incomplete = missingFields.some((field) => !draft[field.key].trim());
    if (incomplete) {
      setError('Completa los campos marcados para continuar.');
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await onSave({
        ...company,
        nit: draft.nit.trim() || 'No especificado',
        sector: draft.sector.trim() || 'No especificado',
        contactPerson: draft.contactPerson.trim(),
        phone: draft.phone.trim(),
        address: draft.address.trim(),
      });
      onSaved?.();
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No fue posible guardar los datos de la empresa.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      title="Completa el registro"
      subtitle="Datos institucionales que faltan en tu cuenta."
      icon="business-outline"
      closeLabel="Cerrar registro de empresa"
      footer={
        <Button
          label={isSaving ? 'Guardando…' : 'Guardar y continuar'}
          onPress={() => void handleSave()}
          loading={isSaving}
          size="lg"
          icon="save-outline"
          fullWidth
        />
      }>
      <Notice
        tone="warning"
        title="Faltan datos por completar"
        message={
          missingFields.length === 0
            ? 'Tu registro ya está completo.'
            : context === 'publish'
              ? `Tu empresa está aprobada. Antes de publicar una vacante necesitamos ${describeMissingCompanyFields(missingFields)}.`
              : `Completa ${describeMissingCompanyFields(missingFields)} para terminar el registro de tu empresa.`
        }
      />

      {missingFields.some((field) => field.key === 'nit') ? (
        <TextField
          label="NIT"
          required
          value={draft.nit}
          onChangeText={(value) => setField('nit', value)}
          placeholder="900.123.456-7"
          keyboardType="numbers-and-punctuation"
          maxLength={20}
          icon="card-outline"
        />
      ) : null}

      {missingFields.some((field) => field.key === 'sector') ? (
        <TextField
          label="Sector económico"
          required
          value={draft.sector}
          onChangeText={(value) => setField('sector', value)}
          placeholder="Tecnología, agroindustria, logística…"
          maxLength={100}
          icon="layers-outline"
        />
      ) : null}

      {missingFields.some((field) => field.key === 'contactPerson') ? (
        <TextField
          label="Nombre del responsable"
          required
          value={draft.contactPerson}
          onChangeText={(value) => setField('contactPerson', value)}
          placeholder="Persona responsable ante UNIPAZ"
          autoCapitalize="words"
          maxLength={255}
          icon="person-outline"
        />
      ) : null}

      {missingFields.some((field) => field.key === 'phone') ? (
        <TextField
          label="Teléfono de contacto"
          required
          value={draft.phone}
          onChangeText={(value) => setField('phone', value)}
          placeholder="+57 300 000 0000"
          keyboardType="phone-pad"
          maxLength={20}
          icon="call-outline"
        />
      ) : null}

      {missingFields.some((field) => field.key === 'address') ? (
        <TextField
          label="Dirección"
          required
          value={draft.address}
          onChangeText={(value) => setField('address', value)}
          placeholder="Dirección de la empresa"
          maxLength={255}
          icon="location-outline"
        />
      ) : null}

      {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

      <View style={styles.spacer} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: Space.xs,
  },
});
