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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyCode'>;
  route: RouteProp<AuthStackParamList, 'VerifyCode'>;
};

const schema = Yup.object({
  code: Yup.string()
    .matches(/^\d{6}$/, 'O código deve ter exatamente 6 dígitos numéricos')
    .required('Código é obrigatório'),
});

export default function VerifyCodeScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [apiError, setApiError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleVerify = async (values: { code: string }) => {
    setApiError('');
    try {
      const response = await authService.verifyCode({ email, code: values.code });
      navigation.navigate('ResetPassword', { resetToken: response.resetToken });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Código inválido ou expirado');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess('');
    setApiError('');
    try {
      await authService.forgotPassword({ email });
      setResendSuccess('Novo código enviado para ' + email);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao reenviar código');
    } finally {
      setResendLoading(false);
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
            <Text style={styles.icon}>📩</Text>
            <Text style={styles.title}>Verificar Código</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para:
            </Text>
            <Text style={styles.emailHighlight}>{email}</Text>
          </View>

          <Formik
            initialValues={{ code: '' }}
            validationSchema={schema}
            onSubmit={handleVerify}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Código de Verificação</Text>
                  <TextInput
                    style={[
                      styles.codeInput,
                      touched.code && errors.code ? styles.inputError : null,
                    ]}
                    value={values.code}
                    onChangeText={handleChange('code')}
                    onBlur={handleBlur('code')}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="000000"
                    placeholderTextColor="#9CA3AF"
                    textAlign="center"
                  />
                  {touched.code && errors.code ? (
                    <Text style={styles.fieldError}>{errors.code}</Text>
                  ) : null}
                </View>

                {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}
                {resendSuccess ? <Text style={styles.successMessage}>{resendSuccess}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verificar Código</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resendButton, resendLoading ? styles.buttonDisabled : null]}
                  onPress={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <Text style={styles.resendText}>Reenviar código</Text>
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
  emailHighlight: {
    fontSize: 15,
    color: '#F97316',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    letterSpacing: 10,
  },
  inputError: { borderColor: '#EF4444' },
  fieldError: { fontSize: 12, color: '#EF4444', marginTop: 2 },
  apiError: {
    fontSize: 13,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: '#16A34A',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    textAlign: 'center',
    fontWeight: '600',
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
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F97316',
  },
  resendText: { color: '#F97316', fontSize: 15, fontWeight: '600' },
});
