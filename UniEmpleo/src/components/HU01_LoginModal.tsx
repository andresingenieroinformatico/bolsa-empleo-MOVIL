import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authenticateWithPassword, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';
import { UserRole } from '@/data/mock-data';

interface LoginModalProps {
  visible: boolean;
  role: UserRole;
  onClose: () => void;
  onLoginSuccess: (session: StoredSession) => Promise<void>;
  onRoleChange: (role: 'student' | 'company') => void;
  onGoogleLogin: () => Promise<void>;
  googleLoginLoading: boolean;
  googleLoginReady: boolean;
  googleClientConfigured: boolean;
  onCreateAccount: () => void;
  onGoHome: () => void;
}

export const HU01_LoginModal: React.FC<LoginModalProps> = ({
  visible,
  role,
  onClose,
  onLoginSuccess,
  onRoleChange,
  onGoogleLogin,
  googleLoginLoading,
  googleLoginReady,
  googleClientConfigured,
  onCreateAccount,
  onGoHome,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isStudent = role === 'student';

  const finishLogin = async (response: Awaited<ReturnType<typeof authenticateWithPassword>>) => {
    const session = getAuthenticatedSession(response, 'password');
    await saveAuthSession(session);
    await onLoginSuccess(session);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    try {
      await onGoogleLogin();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible abrir Google.');
    }
  };

  const handlePasswordLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Ingresa el correo y la contraseña.');
      return;
    }

    setLoading(true);
    try {
      await finishLogin(await authenticateWithPassword(email.trim().toLowerCase(), password));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (nextRole: 'student' | 'company') => {
    onRoleChange(nextRole);
    setErrorMessage(null);
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ir a la página principal de UniEmpleo"
          onPress={onGoHome}
          style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>💼</Text>
          </View>
          <Text style={styles.brandTitle}>
            UNI<Text style={styles.brandAccent}>Empleo</Text>
          </Text>
          <Text style={styles.brandSubtitle}>UNIPAZ · BOLSA DE EMPLEO</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.roleTabs}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: isStudent }}
              style={[styles.roleTab, isStudent && styles.roleTabActive]}
              onPress={() => selectRole('student')}>
              <Text style={[styles.roleTabText, isStudent && styles.roleTabTextActive]}>
                🎓  Estudiante
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: !isStudent }}
              style={[styles.roleTab, !isStudent && styles.roleTabActive]}
              onPress={() => selectRole('company')}>
              <Text style={[styles.roleTabText, !isStudent && styles.roleTabTextActive]}>
                🏢  Empresa
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}>
            <Text style={styles.title}>
              {isStudent ? 'Bienvenido, Estudiante' : 'Acceso Empresarial'}
            </Text>
            <Text style={styles.subtitle}>
              {isStudent
                ? 'Usa tu cuenta Google institucional de UNIPAZ para acceder.'
                : 'Ingresa las credenciales de tu empresa para publicar ofertas.'}
            </Text>

            {loading || googleLoginLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#1552A0" />
                <Text style={styles.loadingText}>Validando la sesión con UniEmpleo…</Text>
              </View>
            ) : isStudent ? (
              <>
                <View style={styles.securePanel}>
                  <View style={styles.secureIcon}>
                    <Text style={styles.secureIconText}>🎓</Text>
                  </View>
                  <View style={styles.secureCopy}>
                    <Text style={styles.secureTitle}>Acceso seguro con Google</Text>
                    <Text style={styles.secureDescription}>
                      Usa tu correo @unipaz.edu.co para ingresar de forma segura.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.googleButton, (!googleLoginReady || googleLoginLoading) && styles.buttonDisabled]}
                  disabled={!googleLoginReady || googleLoginLoading}
                  onPress={() => void handleGoogleLogin()}>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Iniciar sesión con Google</Text>
                </TouchableOpacity>
                {!googleClientConfigured && (
                  <Text style={styles.configurationText}>
                    Falta configurar el acceso de Google para {Platform.OS}.
                  </Text>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.accountLink}
                  onPress={onCreateAccount}>
                  <Text style={styles.accountLinkText}>¿No tienes cuenta? </Text>
                  <Text style={styles.accountLinkEmphasis}>Registrarse</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Correo</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="contacto@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  accessibilityLabel="Correo de empresa"
                  returnKeyType="next"
                />
                <Text style={styles.inputLabel}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  secureTextEntry
                  autoComplete="current-password"
                  accessibilityLabel="Contraseña"
                  returnKeyType="done"
                  onSubmitEditing={() => void handlePasswordLogin()}
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  style={[styles.loginButton, (!email.trim() || !password) && styles.buttonDisabled]}
                  disabled={!email.trim() || !password}
                  onPress={() => void handlePasswordLogin()}>
                  <Text style={styles.loginButtonText}>Ingresar  ›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.accountLink}
                  onPress={onCreateAccount}>
                  <Text style={styles.accountLinkText}>¿Tu empresa aún no está registrada? </Text>
                  <Text style={styles.accountLinkEmphasis}>Registrarse</Text>
                </TouchableOpacity>
              </>
            )}

            {errorMessage && (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>
          <Text style={styles.footer}>Universidad de La Paz — UNIPAZ © 2024</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cerrar inicio de sesión"
            onPress={onClose}
            style={styles.closeButton}>
            <Text style={styles.closeText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#154E9B',
    alignItems: 'center',
  },
  brand: {
    width: '100%',
    maxWidth: 440,
    minHeight: 205,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 7,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#31A052',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandMarkText: { color: '#FFFFFF', fontSize: 30, fontWeight: '700' },
  brandTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  brandAccent: { color: '#63D983' },
  brandSubtitle: { color: '#D5E4F9', fontSize: 11, letterSpacing: 1.1 },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 440,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#EDF2FB',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  roleTabActive: {
    backgroundColor: '#104B9B',
    shadowColor: '#12366D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  roleTabText: { color: '#526781', fontSize: 13, fontWeight: '600' },
  roleTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  formContent: { flexGrow: 1 },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#122846',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#607492',
    lineHeight: 18,
    marginBottom: 24,
  },
  securePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    marginBottom: 20,
    backgroundColor: '#EAF6EE',
    borderWidth: 1,
    borderColor: '#C8E8D2',
    borderRadius: 15,
  },
  secureIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#329D51',
  },
  secureIconText: { color: '#FFFFFF', fontSize: 21, fontWeight: '700' },
  secureCopy: { flex: 1, gap: 3 },
  secureTitle: { color: '#17603A', fontSize: 12, fontWeight: '700' },
  secureDescription: { color: '#39724E', fontSize: 10, lineHeight: 15 },
  googleButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#C9D8F0',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#183B70',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  googleIcon: { color: '#4285F4', fontSize: 17, fontWeight: '900' },
  googleButtonText: { color: '#172A45', fontSize: 13, fontWeight: '700' },
  configurationText: { color: '#92400E', fontSize: 11, lineHeight: 16, marginTop: 10 },
  accountLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingTop: 22,
  },
  accountLinkText: { color: '#657995', fontSize: 12 },
  accountLinkEmphasis: { color: '#168345', fontSize: 12, fontWeight: '700' },
  inputLabel: {
    color: '#172A45',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    minHeight: 48,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: '#D4E0F4',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: '#172A45',
    marginBottom: 15,
  },
  loginButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1554A6',
    borderRadius: 14,
    marginTop: 3,
    shadowColor: '#12467F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  buttonDisabled: { opacity: 0.55 },
  loadingBox: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 13, color: '#607492', fontWeight: '500' },
  errorBox: {
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: '#991B1B', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  footer: { color: '#9BAFCF', textAlign: 'center', fontSize: 10, paddingTop: 18 },
  closeButton: { alignSelf: 'center', paddingTop: 8, paddingHorizontal: 12 },
  closeText: { color: '#607492', fontSize: 11, fontWeight: '600' },
});
