import { Product } from '../products/types/product.types';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { resetToken: string };
};

export type AppStackParamList = {
  Home: undefined;
  Register: undefined;
};

export type AppDrawerParamList = {
  Home: undefined;
  Cardapio: undefined;
  Perfil: undefined;
};

export type ProductStackParamList = {
  ProductList: undefined;
  ProductDetail: { product: Product };
  CreateProduct: undefined;
};
