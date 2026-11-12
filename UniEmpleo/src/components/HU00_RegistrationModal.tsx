import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { CompanyRegistrationInput } from '@/services/api';

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
  const wide = width >= 600;
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ir a la página principal de UniEmpleo"
            onPress={onGoHome}
            style={styles.homeLink}>
            <Text style={styles.homeLinkText}>UniEmpleo · Inicio</Text>
          </TouchableOpacity>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text style={styles.eyebrow}>ÚNETE A UNIEMPLEO</Text>
              <Text style={styles.title}>Registrarse</Text>
              <Text style={styles.subtitle}>Estudiantes inician sesión con Google; empresas registran sus datos institucionales.</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.studentPanel}>
              <View style={styles.studentCopy}>
                <Text style={styles.panelTitle}>🎓 Soy estudiante UNIPAZ</Text>
                <Text style={styles.panelBody}>Accede directamente con tu cuenta institucional de Google.</Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={googleLoginLoading}
                onPress={() => void handleStudentGoogleLogin()}
                style={[styles.studentButton, googleLoginLoading && styles.disabledButton]}>
                {googleLoginLoading ? (
                  <ActivityIndicator size="small" color="#007832" />
                ) : (
                  <Text style={styles.studentButtonText}>Iniciar sesión con Google</Text>
                )}
              </TouchableOpacity>
              {googleErrorMessage && (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {googleErrorMessage}
                </Text>
              )}
            </View>

            <View style={styles.formHeading}>
              <Text style={styles.sectionTitle}>🏢 Registrar empresa</Text>
              <Text style={styles.sectionBody}>Las solicitudes quedan pendientes de validación institucional.</Text>
            </View>

            {registered ? (
              <View style={styles.successPanel}>
                <Text style={styles.successTitle}>Solicitud enviada</Text>
                <Text style={styles.successBody}>La empresa quedó registrada para revisión. Ya puedes iniciar sesión cuando tu cuenta esté habilitada.</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={onLoginCompany}
                  style={styles.submitButton}>
                  <Text style={styles.submitText}>Ir a iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={[styles.fieldsGrid, wide && styles.fieldsGridWide]}>
                  <Field label="Razón social *" value={companyName} onChangeText={setCompanyName} placeholder="Nombre legal de la empresa" maxLength={255} />
                  <Field label="NIT (opcional)" value={nit} onChangeText={setNit} placeholder="900.123.456-7" maxLength={20} />
                  <Field label="Nombre del responsable *" value={name} onChangeText={setName} placeholder="Persona responsable" maxLength={255} />
                  <Field label="Persona de contacto *" value={contactPerson} onChangeText={setContactPerson} placeholder="Contacto de recursos humanos" maxLength={255} />
                  <Field label="Correo corporativo *" value={email} onChangeText={setEmail} placeholder="nombre@empresa.com" keyboardType="email-address" autoCapitalize="none" maxLength={255} />
                  <Field label="Sector *" value={sector} onChangeText={setSector} placeholder="Tecnología, energía, servicios..." maxLength={100} />
                  <Field label="Teléfono *" value={phone} onChangeText={setPhone} placeholder="+57 300 000 0000" keyboardType="phone-pad" maxLength={20} />
                  <Field label="Dirección *" value={address} onChangeText={setAddress} placeholder="Dirección de la empresa" maxLength={255} />
                  <Field label="Contraseña *" value={password} onChangeText={setPassword} placeholder="Crea una contraseña" secureTextEntry />
                  <Field label="Confirmar contraseña *" value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="Repite la contraseña" secureTextEntry />
                  <Field label="Descripción *" value={description} onChangeText={setDescription} placeholder="Describe brevemente la actividad de la empresa" multiline maxLength={1000} />
                </View>
                {errorMessage && <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>}
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={handleRegisterCompany}
                  style={[styles.submitButton, loading && styles.disabledButton]}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Enviar solicitud de registro</Text>}
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={onLoginCompany} style={styles.loginLink}>
                  <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'email-address' | 'phone-pad';
  autoCapitalize?: 'none';
  secureTextEntry?: boolean;
  multiline?: boolean;
  maxLength?: number;
}

function Field({ label, multiline, ...inputProps }: FieldProps) {
  const wide = useWindowDimensions().width >= 600;

  return (
    <View     style={[styles.field, wide && styles.fieldWide, multiline && styles.fullField]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        autoCapitalize={inputProps.autoCapitalize}
        multiline={multiline}
        maxLength={inputProps.maxLength}
        style={[styles.input, multiline && styles.multilineInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(17, 34, 31, 0.58)', justifyContent: 'center', padding: 14 },
  sheet: { width: '100%', maxWidth: 620, maxHeight: '94%', alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  homeLink: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingTop: 14 },
  homeLinkText: { color: '#31554F', fontSize: 12, fontWeight: '800' },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E8EEEB' },
  headingCopy: { flex: 1, gap: 4, paddingRight: 12 },
  eyebrow: { color: '#00963F', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#1A1F36', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6B7280', fontSize: 11, lineHeight: 16 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F3', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#6B7280', fontSize: 22, lineHeight: 25 },
  content: { padding: 18, gap: 18 },
  studentPanel: { padding: 14, backgroundColor: '#E6F7ED', borderRadius: 8, gap: 12 },
  studentCopy: { gap: 4 },
  panelTitle: { color: '#1A1F36', fontSize: 13, fontWeight: '800' },
  panelBody: { color: '#6B7280', fontSize: 11, lineHeight: 16 },
  studentButton: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBDAD5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 9 },
  studentButtonText: { color: '#007832', fontSize: 11, fontWeight: '800' },
  formHeading: { gap: 3 },
  sectionTitle: { color: '#1A1F36', fontSize: 15, fontWeight: '800' },
  sectionBody: { color: '#6B7280', fontSize: 10, lineHeight: 15 },
  fieldsGrid: { gap: 10 },
  fieldsGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '100%', gap: 5 },
  fieldWide: { width: '48%', flexGrow: 1 },
  fullField: { width: '100%' },
  fieldLabel: { color: '#3F5751', fontSize: 10, fontWeight: '700' },
  input: { minHeight: 40, borderWidth: 1, borderColor: '#D9E2DE', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, color: '#1A1F36', fontSize: 12 },
  multilineInput: { minHeight: 72, textAlignVertical: 'top' },
  submitButton: { minHeight: 42, borderRadius: 6, backgroundColor: '#00963F', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  submitText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
  errorText: { color: '#A93636', fontSize: 11, lineHeight: 16 },
  loginLink: { alignSelf: 'center', paddingVertical: 5 },
  loginLinkText: { color: '#00963F', fontSize: 10, fontWeight: '700' },
  successPanel: { padding: 14, backgroundColor: '#E6F7ED', borderRadius: 8, gap: 9 },
  successTitle: { color: '#1C5C3B', fontSize: 14, fontWeight: '800' },
  successBody: { color: '#527164', fontSize: 11, lineHeight: 16 },
});
