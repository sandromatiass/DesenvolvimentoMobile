import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductStackParamList } from '../types/navigation';
import ProductListScreen from '../products/screens/ProductListScreen';
import ProductDetailScreen from '../products/screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<ProductStackParamList>();

export default function ProductStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
