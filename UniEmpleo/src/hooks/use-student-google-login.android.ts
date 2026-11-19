import { useState } from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { authenticateWithGoogle, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';

interface StudentGoogleLoginProps {
  onAuthenticated: (session: StoredSession) => Promise<void>;
}

export function useStudentGoogleLogin({ onAuthenticated }: StudentGoogleLoginProps) {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const [isLoading, setIsLoading] = useState(false);

  const startLogin = async () => {
    if (!webClientId) {
      throw new Error('Falta configurar EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID para Google Sign-In.');
    }

    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });

      // Avoid silently reusing the last app-selected account.
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) {
        throw new Error('Se canceló el inicio de sesión con Google.');
      }

      const idToken = result.data.idToken;
      if (!idToken) {
        throw new Error('Google no devolvió un ID token.');
      }

      const session = getAuthenticatedSession(
        await authenticateWithGoogle(idToken),
        'google',
      );
      await saveAuthSession(session);
      await onAuthenticated(session);
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('Se canceló el inicio de sesión con Google.');
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Google Play Services no está disponible o requiere una actualización.');
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startLogin,
    isLoading,
    isConfigured: Boolean(webClientId),
    isReady: Boolean(webClientId),
  };
}
