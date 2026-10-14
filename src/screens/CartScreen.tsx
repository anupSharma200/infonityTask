import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme/typography';
import { CartItem } from '../types';

function CartScreen({ navigation }: { navigation: any }) {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const itemTotal = item.product.price * item.quantity;
    const isAtMinimum = item.quantity <= 1;

    return (
      <View style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.product.thumbnail }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {item.product.title}
            </Text>
            <Pressable
              style={styles.removeBtn}
              onPress={() => removeFromCart(item.product.id)}
              hitSlop={8}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.unitPrice}>
            ${item.product.price.toFixed(2)} each
          </Text>

          {/* Stepper & Total */}
          <View style={styles.bottomRow}>
            {/* Quantity Stepper (Quantity cannot go below 1) */}
            <View style={styles.stepper}>
              <Pressable
                style={[
                  styles.stepperBtn,
                  isAtMinimum && styles.stepperBtnDisabled,
                ]}
                disabled={isAtMinimum}
                onPress={() => decreaseQuantity(item.product.id)}
                hitSlop={4}
              >
                <Text
                  style={[
                    styles.stepperBtnText,
                    isAtMinimum && styles.stepperBtnTextDisabled,
                  ]}
                >
                  -
                </Text>
              </Pressable>

              <Text style={styles.stepperValue}>{item.quantity}</Text>

              <Pressable
                style={styles.stepperBtn}
                onPress={() => increaseQuantity(item.product.id)}
                hitSlop={4}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.itemTotal}>${itemTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView edges={['top']} style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Image
            source={require('../Images/basket.png')}
            style={styles.emptyIcon}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptyText}>
            Looks like you haven't added anything to your cart yet.
          </Text>
          <Pressable
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.shopNowBtnText}>Browse Products</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </Text>
        </View>

        <Pressable onPress={clearCart} hitSlop={8}>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={item => String(item.product.id)}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Summary & Checkout */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Delivery</Text>
          <Text style={styles.freeShipping}>FREE</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
        </View>

        <Pressable
          style={styles.checkoutBtn}
          onPress={() => {
            // Placeholder checkout confirmation
          }}
        >
          <Text style={styles.checkoutBtnText}>
            Checkout • ${totalPrice.toFixed(2)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  clearText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.danger,
  },
  listContent: {
    padding: 14,
    paddingBottom: 220,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  body: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginRight: 8,
  },
  removeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
  },
  unitPrice: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
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
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  stepperBtnTextDisabled: {
    color: '#94a3b8',
  },
  stepperValue: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    minWidth: 26,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  freeShipping: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: COLORS.primaryDark,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 28,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    tintColor: '#cbd5e1',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  shopNowBtnText: {
    color: '#ffffff',
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
});

export default CartScreen;
