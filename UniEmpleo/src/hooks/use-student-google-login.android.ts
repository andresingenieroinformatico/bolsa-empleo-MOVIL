import { useState } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { authenticateWithGoogle, getAuthenticatedSession } from '@/services/api';
import { AuthSession as StoredSession, saveAuthSession } from '@/services/auth-session';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

function loadGoogleSignIn(): GoogleSignInModule {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      'Google Sign-In no está disponible en Expo Go. Para probar ahora, usa correo y contraseña; Google requiere una build de desarrollo.',
    );
  }

  try {
    // Load only when requested so Expo Go can still open the rest of the app.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk = require('@react-native-google-signin/google-signin') as GoogleSignInModule;
    const signIn = sdk.GoogleSignin;
    if (
      !signIn ||
      typeof signIn.hasPlayServices !== 'function' ||
      typeof signIn.configure !== 'function' ||
      typeof signIn.signOut !== 'function' ||
      typeof signIn.signIn !== 'function'
    ) {
      throw new Error('La versión instalada de Google Sign-In no expone las funciones requeridas.');
    }
    return sdk;
  } catch (error) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error);
    if (message.includes('RNGoogleSignin') && message.includes('could not be found')) {
      throw new Error(
        'La app instalada no incluye Google Sign-In. Expo Go no lo soporta; instala una build de desarrollo Android nueva.',
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

    const googleSignIn = loadGoogleSignIn();
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
      if (result.type !== 'success') {
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
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = error.code;
        if (code === googleSignIn.statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('Se canceló el inicio de sesión con Google.');
        }
        if (code === googleSignIn.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Google Play Services no está disponible o requiere una actualización.');
        }
        if (code === googleSignIn.statusCodes.IN_PROGRESS) {
          throw new Error('Google Sign-In ya está en proceso. Intenta nuevamente.');
        }
        if (String(code) === '10') {
          throw new Error(
            'Google rechazó esta instalación. Verifica que el paquete com.unipaz.uniempleo y la huella SHA-1 de la clave de producción estén registrados en el cliente Android de Google Cloud.',
          );
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
