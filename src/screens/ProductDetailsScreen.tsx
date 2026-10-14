import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme/typography';
import { Product } from '../types';

const { width } = Dimensions.get('window');

function ProductDetailsScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart, isInCart, getItemQuantity, totalItems } = useCart();

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(productId);
        if (isMounted) {
          setProduct(data);
        }
      } catch {
        if (isMounted) {
          setError('Unable to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    addToCart(product, selectedQuantity);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error ?? 'Product not found.'}</Text>
        <Pressable style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  const inCart = isInCart(product.id);
  const currentCartQty = getItemQuantity(product.id);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <Pressable
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('CartTab')}
          hitSlop={10}
        >
          <Image
            source={require('../Images/basket.png')}
            style={styles.cartIcon}
            resizeMode="contain"
          />
          {totalItems > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <View style={styles.carouselWrapper}>
          <FlatList
            data={galleryImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => String(index)}
            onMomentumScrollEnd={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setActiveImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dots Indicator */}
          {galleryImages.length > 1 ? (
            <View style={styles.dotsRow}>
              {galleryImages.map((_, index) => (
                <View
                  key={String(index)}
                  style={[
                    styles.dot,
                    activeImageIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        {/* Info Container */}
        <View style={styles.detailsCard}>
          {/* Category & Rating */}
          <View style={styles.metaRow}>
            {product.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {product.category.toUpperCase()}
                </Text>
              </View>
            ) : <View />}

            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>★</Text>
              <Text style={styles.ratingNumber}>
                {product.rating.toFixed(1)} / 5.0
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Price & Stock Row */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceHeading}>Price</Text>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            </View>

            <View
              style={[
                styles.stockPill,
                product.stock > 0 ? styles.stockIn : styles.stockOut,
              ]}
            >
              <Text
                style={[
                  styles.stockPillText,
                  product.stock > 0
                    ? styles.stockInText
                    : styles.stockOutText,
                ]}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Quantity Selection */}
          <View style={styles.sectionDivider} />
          <View style={styles.qtySection}>
            <View>
              <Text style={styles.qtyLabel}>Quantity</Text>
              {inCart ? (
                <Text style={styles.inCartSubtext}>
                  (Currently in cart: {currentCartQty})
                </Text>
              ) : null}
            </View>

            <View style={styles.stepper}>
              <Pressable
                style={[
                  styles.stepperBtn,
                  selectedQuantity <= 1 && styles.stepperBtnDisabled,
                ]}
                disabled={selectedQuantity <= 1}
                onPress={() => setSelectedQuantity(q => Math.max(1, q - 1))}
              >
                <Text
                  style={[
                    styles.stepperBtnText,
                    selectedQuantity <= 1 && styles.stepperBtnTextDisabled,
                  ]}
                >
                  -
                </Text>
              </Pressable>
              <Text style={styles.stepperValue}>{selectedQuantity}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setSelectedQuantity(q => q + 1)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Add-to-Cart Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>
            ${(product.price * selectedQuantity).toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.addToCartBtn,
            product.stock <= 0 && styles.addToCartBtnDisabled,
          ]}
          disabled={product.stock <= 0}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartBtnText}>
            {inCart ? '+ Add More to Cart' : 'Add to Cart'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  backBtnText: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginHorizontal: 12,
  },
  cartIconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  cartIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.textPrimary,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 9,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  carouselWrapper: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  imageSlide: {
    width: width,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '90%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    marginTop: 10,
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  starText: {
    color: COLORS.star,
    fontSize: 12,
    marginRight: 4,
  },
  ratingNumber: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: '#92400e',
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceHeading: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
  },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stockIn: {
    backgroundColor: '#dcfce7',
  },
  stockOut: {
    backgroundColor: COLORS.dangerLight,
  },
  stockPillText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  stockInText: {
    color: '#15803d',
  },
  stockOutText: {
    color: COLORS.danger,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  qtySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  inCartSubtext: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  stepperBtnDisabled: {
    backgroundColor: '#e2e8f0',
    elevation: 0,
  },
  stepperBtnText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  stepperBtnTextDisabled: {
    color: '#94a3b8',
  },
  stepperValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
  },
  addToCartBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  addToCartBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
});

export default ProductDetailsScreen;
