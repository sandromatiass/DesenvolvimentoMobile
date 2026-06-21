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
