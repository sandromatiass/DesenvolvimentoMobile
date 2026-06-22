import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { AppDrawerParamList } from '../types/navigation';
import HomeScreen from '../home/screens/HomeScreen';
import ProductStackNavigator from './ProductStackNavigator';
import ProfileScreen from '../profile/screens/ProfileScreen';
import { useAuth } from '../hooks/useAuth';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

const MENU_ITEMS: Array<{
  name: keyof AppDrawerParamList;
  label: string;
  icon: string;
}> = [
  { name: 'Home', label: 'Início', icon: '🏠' },
  { name: 'Cardapio', label: 'Cardápio', icon: '🍽️' },
  { name: 'Perfil', label: 'Perfil', icon: '👤' },
];

function CustomDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const { user, logout } = useAuth();

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  const activeIndex = state.index;

  const handleLogout = async () => {
    navigation.closeDrawer();
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.drawerHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.userName} numberOfLines={1}>
          {user?.name ?? 'Usuário'}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user?.email ?? ''}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuList}>
        {MENU_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(item.name as never)}
            >
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={[styles.menuItemLabel, isActive && styles.menuItemLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.menuItemIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Cardapio" component={ProductStackNavigator} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'flex-start',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F97316',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  menuList: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: '#FFF7ED',
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F97316',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  menuItemLabelActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
