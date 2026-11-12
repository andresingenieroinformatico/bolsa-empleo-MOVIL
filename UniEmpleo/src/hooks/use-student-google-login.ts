import { useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authenticateWithGoogle, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';

WebBrowser.maybeCompleteAuthSession();

interface StudentGoogleLoginProps {
  onAuthenticated: (session: StoredSession) => Promise<void>;
}

export function useStudentGoogleLogin({ onAuthenticated }: StudentGoogleLoginProps) {
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
  const [isLoading, setIsLoading] = useState(false);

  const startLogin = async () => {
    if (!clientId) {
      throw new Error(`Falta configurar el Client ID de Google para ${Platform.OS}.`);
    }
    if (!request) {
      throw new Error('La solicitud de Google aún se está preparando.');
    }

    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Se canceló el inicio de sesión con Google.');
      }
      if (result.type !== 'success') {
        throw new Error(
          result.type === 'error'
            ? result.error?.description || result.params.error_description || 'Google no pudo autenticar la cuenta.'
            : 'No fue posible completar el inicio de sesión con Google.',
        );
      }

      const code = result.params.code;
      const verifier = request.codeVerifier;
      if (!code || !verifier || !discovery) {
        throw new Error('Google no devolvió el código necesario para completar el acceso.');
      }

      const googleTokens = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri: request.redirectUri,
          extraParams: { code_verifier: verifier },
        },
        discovery,
      );
      if (!googleTokens.idToken) {
        throw new Error('Google no devolvió un ID token.');
      }

      const session = getAuthenticatedSession(
        await authenticateWithGoogle(googleTokens.idToken),
        'google',
      );
      await saveAuthSession(session);
      await onAuthenticated(session);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startLogin,
    isLoading,
    isConfigured: Boolean(clientId),
    isReady: Boolean(clientId && request),
  };
}
