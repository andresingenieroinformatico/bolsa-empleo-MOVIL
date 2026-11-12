import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  ApiUser,
  authenticateWithGoogle,
  authenticateWithPassword,
} from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';
import { UserRole } from '@/data/mock-data';

WebBrowser.maybeCompleteAuthSession();

interface LoginModalProps {
  visible: boolean;
  role: UserRole;
  onClose: () => void;
  onLoginSuccess: (session: StoredSession) => Promise<void>;
}

export const HU01_LoginModal: React.FC<LoginModalProps> = ({
  visible,
  role,
  onClose,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const clientId =
    Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
      : Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || 'google-client-id-not-configured',
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'email', 'profile'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'uniempleo' }),
      usePKCE: true,
    },
    discovery,
  );

  const finishLogin = async (result: {
    success: boolean;
    message?: string;
    data?: { token: string; user: ApiUser };
  }) => {
    if (!result.success || !result.data?.token || !result.data.user) {
      throw new Error(result.message || 'El servidor no devolvió una sesión válida.');
    }
    if (result.data.user.role !== role) {
      throw new Error('El rol de esta cuenta no coincide con la opción seleccionada.');
    }
    const session = { token: result.data.token, user: result.data.user };
    await saveAuthSession(session);
    await onLoginSuccess(session);
    onClose();
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const configuredClientId = clientId;
    if (!configuredClientId) {
      setErrorMessage(`Falta configurar el Client ID de Google para ${Platform.OS}.`);
      return;
    }
    if (!request) {
      setErrorMessage('La solicitud de Google aún se está preparando.');
      return;
    }

    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setErrorMessage('Se canceló el inicio de sesión con Google.');
        return;
      }
      if (result.type !== 'success') {
        setErrorMessage(
          result.type === 'error'
            ? result.error?.description || result.params.error_description || 'Google no pudo autenticar la cuenta.'
            : 'No fue posible completar el inicio de sesión con Google.',
        );
        return;
      }

      const code = result.params.code;
      const verifier = request.codeVerifier;
      const discoveryDocument = discovery;
      if (!code || !verifier || !discoveryDocument) {
        throw new Error('Google no devolvió el código necesario para completar el acceso.');
      }

      const googleTokens = await AuthSession.exchangeCodeAsync(
        {
          clientId: configuredClientId,
          code,
          redirectUri: request.redirectUri,
          extraParams: { code_verifier: verifier },
        },
        discoveryDocument,
      );
      if (!googleTokens.idToken) {
        throw new Error('Google no devolvió un ID token.');
      }
      await finishLogin(await authenticateWithGoogle(googleTokens.idToken));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible abrir Google.');
    } finally {
      setLoading(false);
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
      await finishLogin(
        await authenticateWithPassword(email.trim().toLowerCase(), password),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.tag}>Acceso · {role === 'student' ? 'Estudiante' : role === 'company' ? 'Empresa' : 'Administrador'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Acceso Institucional</Text>
          <Text style={styles.subtitle}>
            {role === 'student'
              ? 'Continúa con tu cuenta institucional de Google.'
              : 'Ingresa con la cuenta autorizada para este rol.'}
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0F766E" />
              <Text style={styles.loadingText}>Validando la sesión con el servidor…</Text>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              {role === 'student' ? (
                <>
                  <TouchableOpacity
                    style={[styles.googleBtn, (!clientId || !request) && styles.buttonDisabled]}
                    activeOpacity={0.85}
                    disabled={!clientId || !request}
                    onPress={handleGoogleLogin}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleBtnText}>Continuar con Google</Text>
                  </TouchableOpacity>
                  {!clientId && (
                    <Text style={styles.configurationText}>
                      Configura EXPO_PUBLIC_GOOGLE_{Platform.OS.toUpperCase()}_CLIENT_ID para habilitar Google.
                    </Text>
                  )}
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Correo"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Correo de acceso"
                  />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña"
                    secureTextEntry
                    autoComplete="password"
                    accessibilityLabel="Contraseña"
                  />
                  <TouchableOpacity style={styles.googleBtn} onPress={handlePasswordLogin}>
                    <Text style={styles.googleBtnText}>Iniciar sesión</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 10,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  googleIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    backgroundColor: '#EA4335',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    borderRadius: 12,
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  configurationText: {
    color: '#92400E',
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  errorBox: {
    marginTop: 14,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
});
