import React, { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CompanyRegistrationInput } from '@/services/api';
import { Brand, Radius, Space, Type } from '@/constants/theme';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';
import { Icon } from '@/components/ui/icon';

interface RegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onRegisterCompany: (input: CompanyRegistrationInput) => Promise<void>;
  onStudentGoogleLogin: () => Promise<void>;
  googleLoginLoading: boolean;
  onLoginCompany: () => void;
  onGoHome: () => void;
}

export function HU00_RegistrationModal({
  visible,
  onClose,
  onRegisterCompany,
  onStudentGoogleLogin,
  googleLoginLoading,
  onLoginCompany,
  onGoHome,
}: RegistrationModalProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 620;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nit, setNit] = useState('');
  const [sector, setSector] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleErrorMessage, setGoogleErrorMessage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const handleRegisterCompany = async () => {
    setErrorMessage(null);
    if (
      !name.trim() ||
      !email.trim() ||
      !companyName.trim() ||
      !sector.trim() ||
      !contactPerson.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !description.trim() ||
      !password
    ) {
      setErrorMessage('Completa los campos obligatorios para continuar.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await onRegisterCompany({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
        company_name: companyName.trim(),
        nit: nit.trim() || undefined,
        sector: sector.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
      });
      setRegistered(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible registrar la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentGoogleLogin = async () => {
    setGoogleErrorMessage(null);
    try {
      await onStudentGoogleLogin();
    } catch (error) {
      setGoogleErrorMessage(
        error instanceof Error ? error.message : 'No fue posible iniciar sesión con Google.',
      );
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Crear cuenta"
      subtitle="Estudiantes ingresan con Google; empresas registran sus datos institucionales."
      icon="person-add-outline"
      closeLabel="Cerrar registro">
      <View style={styles.studentPanel}>
        <View style={styles.studentTop}>
          <View style={styles.studentIcon}>
            <Icon name="school-outline" size={20} color={Brand.greenDark} />
          </View>
          <View style={styles.studentCopy}>
            <Text style={styles.panelTitle}>Soy estudiante UNIPAZ</Text>
            <Text style={styles.panelBody}>
              Accede directamente con tu cuenta institucional de Google.
            </Text>
          </View>
        </View>
        <Button
          label="Continuar con Google"
          onPress={() => void handleStudentGoogleLogin()}
          variant="secondary"
          size="sm"
          icon="logo-google"
          loading={googleLoginLoading}
          fullWidth
        />
        {googleErrorMessage ? <Notice tone="error" message={googleErrorMessage} /> : null}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>REGISTRO DE EMPRESAS</Text>
        <View style={styles.divider} />
      </View>

      {registered ? (
        <View style={styles.successWrap}>
          <Notice
            tone="success"
            title="Solicitud enviada"
            message="La empresa quedó registrada para revisión institucional. Podrás iniciar sesión cuando tu cuenta sea habilitada."
          />
          <Button
            label="Ir a iniciar sesión"
            onPress={onLoginCompany}
            iconRight="arrow-forward"
            fullWidth
          />
          <PressableLink label="Volver al inicio" onPress={onGoHome} />
        </View>
      ) : (
        <>
          <View style={styles.formHeading}>
            <Text style={styles.sectionTitle}>Datos de la empresa</Text>
            <Text style={styles.sectionBody}>
              Las solicitudes quedan pendientes de validación institucional.
            </Text>
          </View>

          <View style={[styles.grid, wide && styles.gridWide]}>
            <TextField
              label="Razón social"
              required
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Nombre legal de la empresa"
              maxLength={255}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="NIT"
              optionalLabel="Opcional"
              value={nit}
              onChangeText={setNit}
              placeholder="900.123.456-7"
              maxLength={20}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Nombre del responsable"
              required
              value={name}
              onChangeText={setName}
              placeholder="Persona responsable"
              maxLength={255}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Persona de contacto"
              required
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Contacto de recursos humanos"
              maxLength={255}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Correo corporativo"
              required
              value={email}
              onChangeText={setEmail}
              placeholder="nombre@empresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={255}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Sector"
              required
              value={sector}
              onChangeText={setSector}
              placeholder="Tecnología, energía, servicios…"
              maxLength={100}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Teléfono"
              required
              value={phone}
              onChangeText={setPhone}
              placeholder="+57 300 000 0000"
              keyboardType="phone-pad"
              maxLength={20}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Dirección"
              required
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección de la empresa"
              maxLength={255}
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Contraseña"
              required
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
              secureToggle
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Confirmar contraseña"
              required
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Repite la contraseña"
              secureTextEntry
              secureToggle
              containerStyle={wide ? styles.fieldWide : styles.field}
            />
            <TextField
              label="Descripción"
              required
              value={description}
              onChangeText={setDescription}
              placeholder="Describe brevemente la actividad de la empresa"
              multiline
              numberOfLines={3}
              maxLength={1000}
              containerStyle={[styles.field, styles.fullField]}
            />
          </View>

          {errorMessage ? (
            <Notice tone="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          ) : null}

          <Button
            label="Enviar solicitud de registro"
            onPress={() => void handleRegisterCompany()}
            loading={loading}
            size="lg"
            iconRight="arrow-forward"
            fullWidth
          />

          <PressableLink label="¿Ya tienes una cuenta? Inicia sesión" onPress={onLoginCompany} />
        </>
      )}
    </Sheet>
  );
}

function PressableLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.link}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  studentPanel: {
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.md,
  },
  studentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentCopy: {
    flex: 1,
    gap: 2,
  },
  panelTitle: {
    ...Type.bodyStrong,
    color: Brand.greenDeep,
  },
  panelBody: {
    ...Type.caption,
    color: '#39724E',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.line,
  },
  dividerText: {
    ...Type.overline,
    fontSize: 9,
    color: Brand.slateSoft,
  },
  formHeading: {
    gap: 2,
  },
  sectionTitle: {
    ...Type.heading,
    color: Brand.ink,
  },
  sectionBody: {
    ...Type.caption,
    color: Brand.slate,
  },
  grid: {
    gap: 12,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  field: {
    width: '100%',
  },
  fieldWide: {
    width: '48%',
    flexGrow: 1,
  },
  fullField: {
    width: '100%',
  },
  link: {
    ...Type.caption,
    color: Brand.greenDark,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
  },
  successWrap: {
    gap: Space.md,
  },
});
