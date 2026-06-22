import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { ProductStackParamList } from '../../types/navigation';
import { CreateProductPayload } from '../types/product.types';
import { productService } from '../services/product.service';

type Props = {
  navigation: NativeStackNavigationProp<ProductStackParamList, 'CreateProduct'>;
};

const CATEGORIES = ['Lanches', 'Bebidas', 'Sobremesas', 'Pratos Principais'];

const CATEGORY_COLORS: Record<string, string> = {
  Lanches: '#F97316',
  Bebidas: '#3B82F6',
  Sobremesas: '#EC4899',
  'Pratos Principais': '#8B5CF6',
};

const schema = Yup.object({
  name: Yup.string()
    .min(2, 'Mínimo 2 caracteres')
    .required('Nome é obrigatório'),
  description: Yup.string()
    .min(10, 'Mínimo 10 caracteres')
    .required('Descrição é obrigatória'),
  price: Yup.number()
    .typeError('Preço inválido')
    .min(0.01, 'Preço deve ser maior que 0')
    .required('Preço é obrigatório'),
  category: Yup.string().required('Selecione uma categoria'),
  imageUrl: Yup.string().url('URL inválida').optional(),
});

interface FormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
}

const initialValues: FormValues = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
};

export default function CreateProductScreen({ navigation }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>,
  ) => {
    setSubmitError(null);
    try {
      const payload: CreateProductPayload = {
        name: values.name.trim(),
        description: values.description.trim(),
        price: parseFloat(values.price),
        category: values.category,
        imageUrl: values.imageUrl.trim() || undefined,
      };
      await productService.create(payload);
      navigation.goBack();
    } catch {
      setSubmitError(
        'Não foi possível cadastrar o produto. Verifique os dados e tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Produto</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit: formikSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                {/* Nome */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Nome do produto *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.name && errors.name ? styles.inputError : undefined,
                    ]}
                    placeholder="Ex: X-Burguer Clássico"
                    placeholderTextColor="#9CA3AF"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    returnKeyType="next"
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Descrição */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Descrição *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      touched.description && errors.description
                        ? styles.inputError
                        : undefined,
                    ]}
                    placeholder="Descreva os ingredientes e diferenciais do produto"
                    placeholderTextColor="#9CA3AF"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>

                {/* Preço */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Preço (R$) *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.price && errors.price ? styles.inputError : undefined,
                    ]}
                    placeholder="Ex: 28.90"
                    placeholderTextColor="#9CA3AF"
                    value={values.price}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                  />
                  {touched.price && errors.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                {/* Categoria */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Categoria *</Text>
                  <View style={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => {
                      const isSelected = values.category === cat;
                      const color = CATEGORY_COLORS[cat];
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryButton,
                            isSelected && {
                              backgroundColor: color,
                              borderColor: color,
                            },
                          ]}
                          onPress={() => setFieldValue('category', cat)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.categoryButtonText,
                              isSelected && styles.categoryButtonTextSelected,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {touched.category && errors.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                  )}
                </View>

                {/* URL da imagem */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>URL da imagem (opcional)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.imageUrl && errors.imageUrl ? styles.inputError : undefined,
                    ]}
                    placeholder="https://exemplo.com/imagem.jpg"
                    placeholderTextColor="#9CA3AF"
                    value={values.imageUrl}
                    onChangeText={handleChange('imageUrl')}
                    onBlur={handleBlur('imageUrl')}
                    keyboardType="url"
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                  {touched.imageUrl && errors.imageUrl && (
                    <Text style={styles.errorText}>{errors.imageUrl}</Text>
                  )}
                </View>

                {/* Erro de envio */}
                {submitError && (
                  <View style={styles.submitErrorContainer}>
                    <Text style={styles.submitErrorText}>{submitError}</Text>
                  </View>
                )}

                {/* Botão de submit */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={() => formikSubmit()}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Cadastrar Produto</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 90,
    paddingTop: 13,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  submitErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 14,
  },
  submitErrorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 54,
  },
  submitButtonDisabled: {
    backgroundColor: '#FED7AA',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
