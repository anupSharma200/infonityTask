import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProducts } from '../api/products';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme/typography';
import { Product } from '../types';

const PAGE_SIZE = 10;
const HORIZONTAL_PADDING = 12;
const GRID_GAP = 12;

function HomeScreen({ navigation }: { navigation: any }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Guards against duplicate API requests
  const isFetchingRef = useRef(false);
  const onEndReachedCalledDuringMomentum = useRef(true);

  const { addToCart, isInCart, getItemQuantity, totalItems } = useCart();
  const { width } = useWindowDimensions();

  // Exactly two items in one row on mobile (width < 800)
  const numColumns = width >= 800 ? 3 : 2;
  const itemWidth =
    (width - HORIZONTAL_PADDING * 2 - GRID_GAP * (numColumns - 1)) / numColumns;

  const loadProducts = useCallback(
    async (nextPage = 0, append = false, isRefresh = false) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      if (isRefresh) {
        setRefreshing(true);
      } else if (nextPage === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const data = await fetchProducts({
          limit: PAGE_SIZE,
          skip: nextPage * PAGE_SIZE,
        });
        const nextProducts = data.products ?? [];

        setProducts(current => (append ? [...current, ...nextProducts] : nextProducts));
        setHasMore(nextProducts.length === PAGE_SIZE);
        setPage(nextPage);
      } catch {
        setError('Unable to load products. Please check your connection.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    loadProducts(0, false);
  }, [loadProducts]);

  const handleRefresh = useCallback(() => {
    loadProducts(0, false, true);
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (
      !onEndReachedCalledDuringMomentum.current &&
      !loadingMore &&
      !loading &&
      hasMore &&
      !isFetchingRef.current
    ) {
      onEndReachedCalledDuringMomentum.current = true;
      loadProducts(page + 1, true);
    }
  }, [hasMore, loading, loadingMore, loadProducts, page]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => {
      const inCart = isInCart(item.id);
      const qty = getItemQuantity(item.id);

      return (
        <Pressable
          style={[styles.card, { width: itemWidth }]}
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
          android_ripple={{ color: '#e2e8f0' }}
        >
          {/* Thumbnail */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.image}
              resizeMode="contain"
            />
            {item.category ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Body */}
          <View style={styles.cardBody}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Rating */}
            <View style={styles.ratingRow}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{item.rating?.toFixed(1) ?? '4.5'}</Text>
              <Text style={styles.stockText}>
                {item.stock > 0 ? `• In Stock (${item.stock})` : '• Out of Stock'}
              </Text>
            </View>

            {/* Price & Add to Cart */}
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              </View>

              <Pressable
                style={[styles.addBtn, inCart && styles.addedBtn]}
                onPress={() => addToCart(item, 1)}
                hitSlop={6}
              >
                <Text style={[styles.addBtnText, inCart && styles.addedBtnText]}>
                  {inCart ? `In Cart (${qty})` : '+ Add'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      );
    },
    [addToCart, getItemQuantity, isInCart, itemWidth, navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MiniCart</Text>
          <Text style={styles.headerSubtitle}>Explore top trending products</Text>
        </View>

        <Pressable
          style={styles.cartIconBtn}
          onPress={() => navigation.navigate('CartTab')}
          hitSlop={8}
        >
          <Image
            source={require('../Images/basket.png')}
            style={styles.cartIcon}
            resizeMode="contain"
          />
          {totalItems > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    ),
    [navigation, totalItems],
  );

  const footerComponent = useMemo(() => {
    if (!loadingMore) {
      return undefined;
    }
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerLoadingText}>Loading more products...</Text>
      </View>
    );
  }, [loadingMore]);

  const emptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching products...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => loadProducts(0, false)}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return undefined;
  }, [error, loadProducts, loading]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => String(item.id)}
        renderItem={renderProduct}
        numColumns={numColumns}
        key={String(numColumns)}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={listHeader}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  cartIconBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cartIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.textPrimary,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f1f5f9',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  categoryPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: FONTS.medium,
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    minHeight: 36,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  starIcon: {
    fontSize: 12,
    color: COLORS.star,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  stockText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
  },
  addBtn: {
    backgroundColor: COLORS.textPrimary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  addedBtn: {
    backgroundColor: COLORS.success,
  },
  addedBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
  },
  centeredContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  footerLoading: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerLoadingText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
});

export default HomeScreen;
