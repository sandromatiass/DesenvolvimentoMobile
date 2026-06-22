import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProductStackParamList } from '../../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<ProductStackParamList, 'ProductDetail'>;
  route: RouteProp<ProductStackParamList, 'ProductDetail'>;
};

const CATEGORY_COLORS: Record<string, string> = {
  Lanches: '#F97316',
  Bebidas: '#3B82F6',
  'Pratos Principais': '#8B5CF6',
  Sobremesas: '#EC4899',
};

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { product } = route.params;
  const [sharing, setSharing] = useState(false);

  const badgeColor = CATEGORY_COLORS[product.category] ?? '#6B7280';

  const handleShare = async () => {
    if (sharing) {
      return;
    }
    try {
      setSharing(true);
      await Share.share({
        message: `Confira ${product.name} no Cardápio Digital! ${product.description} - R$ ${Number(product.price).toFixed(2)}`,
        title: product.name,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar este produto.');
    } finally {
      setSharing(false);
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detalhes
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderIcon}>🍽️</Text>
          </View>
        )}

        <View style={styles.content}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: badgeColor + '20',
                borderColor: badgeColor + '40',
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {product.category}
            </Text>
          </View>

          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.price}>
            R$ {Number(product.price).toFixed(2)}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.descriptionLabel}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          <TouchableOpacity
            style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            activeOpacity={0.85}
            disabled={sharing}
          >
            <Text style={styles.shareIcon}>↗</Text>
            <Text style={styles.shareButtonText}>
              {sharing ? 'Compartilhando...' : 'Compartilhar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    flex: 1,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 72,
  },
  content: {
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 10,
    lineHeight: 32,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F97316',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 32,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    elevation: 3,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#FED7AA',
    elevation: 0,
    shadowOpacity: 0,
  },
  shareIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
