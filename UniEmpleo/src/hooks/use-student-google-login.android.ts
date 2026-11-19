import { useState } from 'react';
import { authenticateWithGoogle, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

async function loadGoogleSignIn(): Promise<GoogleSignInModule> {
  try {
    return await import('@react-native-google-signin/google-signin');
  } catch (error) {
    if (error instanceof Error && error.message.includes("'RNGoogleSignin' could not be found")) {
      throw new Error(
        'Google Sign-In requiere una build de desarrollo; Expo Go no incluye el módulo nativo RNGoogleSignin.',
      );
    }
    throw error;
  }
}

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

    const googleSignIn = await loadGoogleSignIn();
    setIsLoading(true);
    try {
      await googleSignIn.GoogleSignin.hasPlayServices();
      googleSignIn.GoogleSignin.configure({
        webClientId,
        offlineAccess: false,
      });

      // Avoid silently reusing the last app-selected account.
      await googleSignIn.GoogleSignin.signOut();
      const result = await googleSignIn.GoogleSignin.signIn();
      if (!googleSignIn.isSuccessResponse(result)) {
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
      if (googleSignIn.isErrorWithCode(error)) {
        if (error.code === googleSignIn.statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('Se canceló el inicio de sesión con Google.');
        }
        if (error.code === googleSignIn.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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
