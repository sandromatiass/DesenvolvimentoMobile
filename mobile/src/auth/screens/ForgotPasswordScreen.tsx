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
import { AuthStackParamList } from '../../types/navigation';
import { authService } from '../../services/auth.service';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

const schema = Yup.object({
  email: Yup.string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
});

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleForgotPassword = async (values: { email: string }) => {
    setApiError('');
    setSuccessMessage('');
    try {
      await authService.forgotPassword(values);
      setSuccessMessage('Código enviado! Verifique seu e-mail.');
      setTimeout(() => {
        navigation.navigate('VerifyCode', { email: values.email });
      }, 1200);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao enviar código');
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
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              Informe seu e-mail e enviaremos um código de verificação de 6 dígitos
            </Text>
          </View>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={schema}
            onSubmit={handleForgotPassword}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={[styles.input, touched.email && errors.email ? styles.inputError : null]}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9CA3AF"
                  />
                  {touched.email && errors.email ? (
                    <Text style={styles.fieldError}>{errors.email}</Text>
                  ) : null}
                </View>

                {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}
                {successMessage ? (
                  <Text style={styles.successMessage}>{successMessage}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.button, isSubmitting ? styles.buttonDisabled : null]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar Código</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.linkText}>
                    {'← '}
                    <Text style={styles.linkHighlight}>Voltar para Login</Text>
                  </Text>
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
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 23, textAlign: 'center', paddingHorizontal: 8 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
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
  linkRow: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkHighlight: { color: '#F97316', fontWeight: '700' },
});
