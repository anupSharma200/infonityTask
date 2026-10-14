import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme/typography';

export type RootTabParamList = {
  HomeTab: undefined;
  CartTab: undefined;
};

export type HomeStackParamList = {
  HomeProducts: undefined;
  ProductDetails: { productId: number };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStackNavigator = createNativeStackNavigator<HomeStackParamList>();

function HomeStack() {
  return (
    <HomeStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNavigator.Screen
        name="HomeProducts"
        component={HomeScreen}
      />
      <HomeStackNavigator.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
      />
    </HomeStackNavigator.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.primary,
    color: '#ffffff',
    fontSize: 10,
    fontFamily: FONTS.semiBold,
  },
});

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const safeBottom = Math.max(insets.bottom, 10);
  const tabHeight = 58 + safeBottom;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: tabHeight,
            paddingBottom: safeBottom,
            paddingTop: 8,
          },
          tabBarLabelStyle: styles.tabLabel,
          tabBarBadgeStyle: styles.badge,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            title: 'Shop',
            tabBarLabel: 'Shop',
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../Images/home.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? COLORS.primary : COLORS.textMuted },
                ]}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tab.Screen
          name="CartTab"
          component={CartScreen}
          options={{
            title: 'Cart',
            tabBarLabel: 'Cart',
            tabBarBadge: totalItems > 0 ? totalItems : undefined,
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('../Images/basket.png')}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? COLORS.primary : COLORS.textMuted },
                ]}
                resizeMode="contain"
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}