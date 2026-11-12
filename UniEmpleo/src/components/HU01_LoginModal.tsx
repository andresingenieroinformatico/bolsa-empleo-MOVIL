import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (mode: 'first_time' | 'existing') => void;
}

export const HU01_LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSimulateGoogleLogin = (mode: 'first_time' | 'existing' | 'cancel') => {
    setLoading(true);
    setScenarioMessage(null);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'cancel') {
        // Criterio Escenario 3: Permisos cancelados
        setErrorMessage('La autenticación con Google fue cancelada por el usuario. Permanece en la pantalla.');
      } else if (mode === 'first_time') {
        // Criterio Escenario 1: Primera vez
        setScenarioMessage('¡Perfil creado exitosamente con cuenta institucional @unipaz.edu.co!');
        setTimeout(() => {
          onLoginSuccess('first_time');
          onClose();
        }, 1200);
      } else {
        // Criterio Escenario 2: Usuario recurrente
        setScenarioMessage('Bienvenido de nuevo, Carlos. Accediendo a tu panel sin duplicar perfil...');
        setTimeout(() => {
          onLoginSuccess('existing');
          onClose();
        }, 1000);
      }
    }, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.tag}>HU-01 · Autenticación Google</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Acceso Institucional</Text>
          <Text style={styles.subtitle}>
            Inicia sesión con tu correo universitario para buscar vacantes y postularte en segundos.
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0F766E" />
              <Text style={styles.loadingText}>Conectando con Google Identity Services...</Text>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.85}
                onPress={() => handleSimulateGoogleLogin('existing')}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Iniciar con Google (Estudiante registrado)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scenarioBtn, styles.scenarioNewBtn]}
                activeOpacity={0.85}
                onPress={() => handleSimulateGoogleLogin('first_time')}>
                <Text style={styles.scenarioBtnText}>
                  ✨ Simular primer inicio (Crea perfil automático)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scenarioBtn, styles.scenarioCancelBtn]}
                activeOpacity={0.85}
                onPress={() => handleSimulateGoogleLogin('cancel')}>
                <Text style={styles.scenarioCancelText}>
                  🚫 Simular cancelación / permisos denegados
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {scenarioMessage && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {scenarioMessage}</Text>
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
  scenarioBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  scenarioNewBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  scenarioBtnText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '600',
  },
  scenarioCancelBtn: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  scenarioCancelText: {
    color: '#BE123C',
    fontSize: 12,
    fontWeight: '600',
  },
  successBox: {
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
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
