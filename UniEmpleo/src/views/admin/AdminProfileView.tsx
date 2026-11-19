import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AdminProfile } from '@/data/mock-data';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { InfoRow } from '@/components/ui/info-row';
import { Notice } from '@/components/ui/notice';
import { SectionHeader } from '@/components/ui/section-header';
import { TextField } from '@/components/ui/text-field';

interface AdminProfileViewProps {
  profile: AdminProfile;
  onSave: (input: {
    name: string;
    email: string;
    password?: string;
    passwordConfirmation?: string;
  }) => Promise<void>;
}

export function AdminProfileView({ profile, onSave }: AdminProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Escribe el nombre del administrador.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Escribe un correo institucional válido.';
    }
    if (password && password.length < 8) {
      nextErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (password !== passwordConfirmation) {
      nextErrors.passwordConfirmation = 'Las contraseñas no coinciden.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setNotice(null);
    setError(null);
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        ...(password ? { password, passwordConfirmation } : {}),
      });
      setPassword('');
      setPasswordConfirmation('');
      setNotice('Los datos del administrador fueron actualizados.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible actualizar el perfil.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <SectionHeader
          overline="Cuenta institucional"
          title="Mi perfil"
          subtitle="Datos de acceso del administrador de la bolsa de empleo."
        />

        <View style={styles.identityCard}>
          <Avatar name={profile.name} size={64} tone="green" />
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email} numberOfLines={1}>
              {profile.email}
            </Text>
            <View style={styles.rolePill}>
              <Icon name="shield-checkmark-outline" size={12} color={Brand.greenDeep} />
              <Text style={styles.roleText}>Administrador UNIPAZ</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="person-outline" size={18} color={Brand.navy} />
            </View>
            <Text style={styles.cardTitle}>Datos de la cuenta</Text>
          </View>

          {notice ? <Notice tone="success" message={notice} onDismiss={() => setNotice(null)} /> : null}
          {error ? <Notice tone="error" message={error} onDismiss={() => setError(null)} /> : null}

          <TextField
            label="Nombre completo"
            value={name}
            onChangeText={setName}
            icon="person-outline"
            error={fieldErrors.name}
            required
            autoComplete="name"
          />
          <TextField
            label="Correo institucional"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={fieldErrors.email}
            required
          />

          <Button
            label="Guardar cambios"
            onPress={() => void handleSubmit()}
            loading={isSaving}
            icon="save-outline"
            fullWidth
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Icon name="lock-closed-outline" size={18} color={Brand.navy} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>Seguridad</Text>
              <Text style={styles.cardSubtitle}>Opcional: cambia la contraseña de acceso.</Text>
            </View>
          </View>

          <TextField
            label="Nueva contraseña"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
            secureToggle
            autoCapitalize="none"
            error={fieldErrors.password}
            hint="Mínimo 8 caracteres."
          />
          <TextField
            label="Confirmar contraseña"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            icon="lock-closed-outline"
            secureTextEntry
            secureToggle
            autoCapitalize="none"
            error={fieldErrors.passwordConfirmation}
          />

          <Button
            label="Actualizar contraseña"
            onPress={() => void handleSubmit()}
            loading={isSaving}
            variant="secondary"
            icon="shield-checkmark-outline"
            fullWidth
          />
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="business-outline" label="Institución" value="Universidad de la Paz — UNIPAZ" />
          <InfoRow icon="location-outline" label="Sede" value="Barrancabermeja, Santander" />
          <InfoRow
            icon="shield-checkmark-outline"
            label="Rol"
            value="Administrador de la plataforma"
            last
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Brand.canvas,
  },
  content: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    padding: Space.lg,
    paddingBottom: Space.huge,
    gap: Space.lg,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
    backgroundColor: Brand.navy,
    borderRadius: Radius.xxl,
    padding: Space.xl,
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  name: {
    ...Type.titleSmall,
    color: Brand.surface,
  },
  email: {
    ...Type.caption,
    color: 'rgba(255, 255, 255, 0.68)',
  },
  rolePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Brand.greenTint,
  },
  roleText: {
    ...Type.label,
    fontSize: 10.5,
    color: Brand.greenDeep,
  },
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.lg,
    gap: Space.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 1,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Brand.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  cardSubtitle: {
    ...Type.caption,
    fontSize: 11,
    color: Brand.slateSoft,
  },
  infoCard: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: Brand.line,
    paddingHorizontal: Space.lg,
  },
});
