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
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

const schema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Nome é obrigatório'),
  email: Yup.string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: Yup.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface NavigationLike {
  navigate: (screen: string) => void;
  canGoBack: () => boolean;
  goBack: () => void;
}

interface Props {
  navigation: NavigationLike;
}

export default function RegisterScreen({ navigation }: Props) {
  const { isAuthenticated, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRegister = async (values: RegisterFormValues) => {
    setApiError('');
    try {
      const response = await authService.register(values);

      if (isAuthenticated) {
        Alert.alert('Sucesso', 'Usuário criado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await login(response.accessToken, response.user);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
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
            <Text style={styles.title}>
              {isAuthenticated ? 'Cadastrar Usuário' : 'Criar Conta 🎉'}
            </Text>
            <Text style={styles.subtitle}>
              {isAuthenticated
                ? 'Preencha os dados para criar um novo usuário'
                : 'Preencha os dados para começar'}
            </Text>
          </View>

          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={schema}
            onSubmit={handleRegister}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={[styles.input, touched.name && errors.name ? styles.inputError : null]}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    autoCapitalize="words"
                    placeholder="Seu nome completo"
                    placeholderTextColor="#9CA3AF"
                  />
                  {touched.name && errors.name ? (
                    <Text style={styles.fieldError}>{errors.name}</Text>
                  ) : null}
                </View>

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

                <View style={styles.field}>
                  <Text style={styles.label}>Senha</Text>
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
                  <Text style={styles.label}>Confirmar Senha</Text>
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
                      placeholder="Repita a senha"
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
                    <Text style={styles.buttonText}>
                      {isAuthenticated ? 'Criar Usuário' : 'Criar Conta'}
                    </Text>
                  )}
                </TouchableOpacity>

                {!isAuthenticated && (
                  <TouchableOpacity style={styles.linkRow} onPress={handleBack}>
                    <Text style={styles.linkText}>
                      Já tem conta?{' '}
                      <Text style={styles.linkHighlight}>Entrar</Text>
                    </Text>
                  </TouchableOpacity>
                )}
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
  header: { paddingTop: 48, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
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
  linkRow: { alignItems: 'center', marginTop: 8 },
  linkText: { fontSize: 14, color: '#6B7280' },
  linkHighlight: { color: '#F97316', fontWeight: '700' },
});
