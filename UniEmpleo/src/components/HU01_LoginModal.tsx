import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authenticateWithPassword, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';
import { UserRole } from '@/data/mock-data';
import { Brand, Radius, Shadows, Space, Type } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Notice } from '@/components/ui/notice';

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

  const isBusy = loading || googleLoginLoading;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ir a la página principal de UniEmpleo"
            onPress={onGoHome}
            style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
            <View style={styles.brandMark}>
              <Icon name="briefcase" size={17} color={Brand.surface} />
            </View>
            <View>
              <Text style={styles.brandTitle}>UniEmpleo</Text>
              <Text style={styles.brandSubtitle}>UNIPAZ · BOLSA DE EMPLEO</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar inicio de sesión"
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Icon name="close" size={20} color={Brand.inkSoft} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.roleTabs}>
              <RoleTab
                label="Estudiante"
                icon="school-outline"
                active={isStudent}
                onPress={() => selectRole('student')}
              />
              <RoleTab
                label="Empresa"
                icon="business-outline"
                active={!isStudent}
                onPress={() => selectRole('company')}
              />
            </View>

            <View style={styles.heading}>
              <Text style={styles.title}>
                {isStudent ? 'Hola de nuevo' : 'Acceso a tu cuenta'}
              </Text>
              <Text style={styles.subtitle}>
                {isStudent
                  ? 'Ingresa con tu cuenta institucional para ver vacantes y seguir tus postulaciones.'
                  : 'Empresas, estudiantes y administradores ingresan con su correo y contraseña. La plataforma reconoce tu rol automáticamente.'}
              </Text>
            </View>

            {isBusy ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={Brand.green} />
                <Text style={styles.loadingText}>Validando la sesión con UniEmpleo…</Text>
              </View>
            ) : isStudent ? (
              <>
                <View style={styles.securePanel}>
                  <View style={styles.secureIcon}>
                    <Icon name="shield-checkmark" size={20} color={Brand.greenDark} />
                  </View>
                  <View style={styles.secureCopy}>
                    <Text style={styles.secureTitle}>Acceso seguro con Google</Text>
                    <Text style={styles.secureDescription}>
                      Usa tu correo @unipaz.edu.co para ingresar de forma segura.
                    </Text>
                  </View>
                </View>

                <Button
                  label="Continuar con Google"
                  onPress={() => void handleGoogleLogin()}
                  variant="secondary"
                  size="lg"
                  icon="logo-google"
                  disabled={!googleLoginReady}
                  fullWidth
                />

                {!googleClientConfigured && (
                  <Notice
                    tone="warning"
                    message={`Falta configurar el acceso de Google para ${Platform.OS}.`}
                  />
                )}

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>¿Aún no tienes cuenta? </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Crear una cuenta"
                    onPress={onCreateAccount}
                    hitSlop={8}>
                    <Text style={styles.switchAction}>Registrarse</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <TextField
                  label="Correo corporativo o institucional"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="contacto@empresa.com o correo institucional"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  icon="mail-outline"
                  clearable
                  clearLabel="Borrar correo"
                  accessibilityLabel="Correo de la cuenta"
                  returnKeyType="next"
                />

                <TextField
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  icon="lock-closed-outline"
                  secureTextEntry
                  secureToggle
                  clearable
                  autoComplete="current-password"
                  accessibilityLabel="Contraseña"
                  returnKeyType="done"
                  onSubmitEditing={() => void handlePasswordLogin()}
                />

                <Button
                  label="Ingresar"
                  onPress={() => void handlePasswordLogin()}
                  size="lg"
                  iconRight="arrow-forward"
                  disabled={!email.trim() || !password}
                  fullWidth
                  style={styles.submit}
                />

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>¿Tu empresa aún no está registrada? </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Registrar mi empresa"
                    onPress={onCreateAccount}
                    hitSlop={8}>
                    <Text style={styles.switchAction}>Registrarse</Text>
                  </Pressable>
                </View>
              </>
            )}

            {errorMessage ? (
              <Notice
                tone="error"
                message={errorMessage}
                onDismiss={() => setErrorMessage(null)}
              />
            ) : null}
          </View>

          <Text style={styles.footer}>Universidad de La Paz · UNIPAZ</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

interface RoleTabProps {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
}

function RoleTab({ label, icon, active, onPress }: RoleTabProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleTab,
        active && styles.roleTabActive,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} size={17} color={active ? Brand.greenDark : Brand.slateSoft} />
      <Text style={[styles.roleTabText, active && styles.roleTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
    paddingVertical: Space.md,
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    ...Type.heading,
    color: Brand.ink,
    fontSize: 17,
    letterSpacing: -0.35,
  },
  brandSubtitle: {
    ...Type.overline,
    fontSize: 8,
    color: Brand.slateSoft,
    marginTop: 1,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
    paddingBottom: Space.xxl,
    gap: Space.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Brand.surface,
    borderRadius: Radius.sheet,
    borderWidth: 1,
    borderColor: Brand.line,
    padding: Space.xl,
    gap: Space.lg,
    ...Shadows.card,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: Brand.surfaceSunken,
    borderRadius: Radius.lg,
    padding: 4,
    gap: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: Radius.md,
  },
  roleTabActive: {
    backgroundColor: Brand.surface,
    ...Shadows.card,
  },
  roleTabText: {
    ...Type.label,
    color: Brand.slate,
  },
  roleTabTextActive: {
    color: Brand.ink,
    fontWeight: '800',
  },
  heading: {
    gap: 5,
  },
  title: {
    ...Type.title,
    color: Brand.ink,
  },
  subtitle: {
    ...Type.body,
    color: Brand.slate,
  },
  securePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Space.md,
    backgroundColor: Brand.greenTint,
    borderWidth: 1,
    borderColor: Brand.greenLine,
    borderRadius: Radius.lg,
  },
  secureIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
  },
  secureCopy: {
    flex: 1,
    gap: 2,
  },
  secureTitle: {
    ...Type.bodyStrong,
    color: Brand.greenDeep,
  },
  secureDescription: {
    ...Type.caption,
    color: '#39724E',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    ...Type.caption,
    color: Brand.slate,
  },
  switchAction: {
    ...Type.caption,
    color: Brand.greenDark,
    fontWeight: '800',
  },
  loadingBox: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...Type.body,
    color: Brand.slate,
    fontWeight: '500',
  },
  submit: {
    marginTop: 2,
  },
  footer: {
    ...Type.caption,
    color: Brand.slateSoft,
    textAlign: 'center',
  },
});
