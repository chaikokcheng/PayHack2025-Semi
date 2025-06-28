import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ScreenSafeArea } from '../utils/SafeAreaHelper';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen({ navigation, route }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  // Mock product data (in real app, this would come from route.params)
  const product = route?.params?.product || {
    id: 1,
    name: 'Fresh Milk 1L',
    price: 8.50,
    originalPrice: 9.50,
    store: 'Jaya Grocer',
    category: 'Beverages',
    image: '🥛',
    rating: 4.5,
    reviews: 128,
    discount: '11% OFF',
    description: 'Fresh, pure milk sourced from local farms. Rich in calcium and protein, perfect for your daily nutrition needs.',
    features: [
      'Farm fresh quality',
      'Rich in calcium & protein',
      'No artificial preservatives',
      'Pasteurized for safety'
    ],
    variants: [
      { name: 'Regular 1L', price: 8.50 },
      { name: 'Low Fat 1L', price: 9.20 },
      { name: 'Organic 1L', price: 12.90 }
    ],
    nutritionFacts: {
      calories: '150 per 250ml',
      protein: '8g',
      calcium: '300mg',
      fat: '8g'
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Added to Cart',
      `${quantity}x ${product.name} (${product.variants[selectedVariant].name}) has been added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'default' },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart')
        }
      ]
    );
  };

  const handleBuyNow = () => {
    navigation.navigate('Cart', {
      directPurchase: true,
      product: {
        ...product,
        variant: product.variants[selectedVariant],
        quantity
      }
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#DDD" />);
    }

    return stars;
  };

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{product.image}</Text>
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.storeName}>{product.store}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(product.rating)}
            </View>
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews} reviews)</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>RM {product.variants[selectedVariant].price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>RM {product.originalPrice.toFixed(2)}</Text>
            )}
          </View>
        </View>

        {/* Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Variant</Text>
          {product.variants.map((variant, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.variantOption,
                selectedVariant === index && styles.selectedVariant
              ]}
              onPress={() => setSelectedVariant(index)}
            >
              <Text style={[
                styles.variantName,
                selectedVariant === index && styles.selectedVariantText
              ]}>
                {variant.name}
              </Text>
              <Text style={[
                styles.variantPrice,
                selectedVariant === index && styles.selectedVariantText
              ]}>
                RM {variant.price.toFixed(2)}
              </Text>
              {selectedVariant === index && (
                <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {product.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <View style={styles.nutritionGrid}>
            {Object.entries(product.nutritionFacts).map(([key, value]) => (
              <View key={key} style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text style={styles.nutritionValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            RM {(product.variants[selectedVariant].price * quantity).toFixed(2)}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="basket" size={20} color="#007AFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handleBuyNow}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  imageContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  productImage: {
    fontSize: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  variantOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  selectedVariant: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  variantName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  selectedVariantText: {
    color: '#007AFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bottomActions: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addToCartText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 