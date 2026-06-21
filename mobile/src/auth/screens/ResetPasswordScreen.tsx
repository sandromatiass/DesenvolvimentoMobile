import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../types/navigation';
import { authService } from '../../services/auth.service';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
  route: RouteProp<AuthStackParamList, 'ResetPassword'>;
};

const schema = Yup.object({
  password: Yup.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { resetToken } = route.params;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleReset = async (values: { password: string; confirmPassword: string }) => {
    setApiError('');
    try {
      await authService.resetPassword({
        resetToken,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      navigation.navigate('Login');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao redefinir senha');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.icon}>🔑</Text>
            <Text style={styles.title}>Nova Senha</Text>
            <Text style={styles.subtitle}>
              Crie uma nova senha segura para sua conta
            </Text>
          </View>

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={schema}
            onSubmit={handleReset}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Nova Senha</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        touched.password && errors.password ? styles.inputError : null,
                      ]}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      secureTextEntry={!showPassword}
                      placeholder="Mínimo 8 caracteres"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword((v) => !v)}
                    >
                      <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password ? (
                    <Text style={styles.fieldError}>{errors.password}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        touched.confirmPassword && errors.confirmPassword
                          ? styles.inputError
                          : null,
                      ]}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      secureTextEntry={!showConfirm}
                      placeholder="Repita a nova senha"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirm((v) => !v)}
                    >
                      <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword ? (
                    <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>

                {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Redefinir Senha</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 32 },
  header: { paddingTop: 48, paddingBottom: 32, alignItems: 'center' },
  icon: { fontSize: 56, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 23, textAlign: 'center' },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    paddingRight: 52,
  },
  inputError: { borderColor: '#EF4444' },
  eyeButton: { position: 'absolute', right: 14, paddingVertical: 14 },
  eyeIcon: { fontSize: 18 },
  fieldError: { fontSize: 12, color: '#EF4444', marginTop: 2 },
  apiError: {
    fontSize: 13,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
