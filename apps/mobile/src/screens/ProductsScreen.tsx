import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  RefreshControl,
  TextInput,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { promptGuestAuth } from '../utils/auth';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Users: undefined;
  Appointments: undefined;
  Pets: undefined;
};

type ProductsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>; // Note: Typically 'Products' but adapting to existing types

type Props = {
  navigation?: ProductsScreenNavigationProp;
};

// Define Types
type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  desc: string;
  stock: number;
  image?: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type ViewState = 'browse' | 'detail' | 'cart' | 'checkout' | 'active_order' | 'order_history';

type UserOrder = {
  id: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  deliveryAddress: string;
  items: Array<{
    id: string;
    quantity: number;
    subtotal: number;
    product?: {
      id: string;
      productName: string;
      price: number;
      productImage?: string;
    };
  }>;
  payments?: Array<{ referenceNumber?: string }>;
};

const AnimatedCheckmark = () => {
  const containerScale = useRef(new Animated.Value(0)).current;
  const maskTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    containerScale.setValue(0);
    maskTranslateX.setValue(0);

    Animated.sequence([
      Animated.spring(containerScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(maskTranslateX, {
        toValue: 60,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.successIconCircle,
        {
          transform: [{ scale: containerScale }],
        },
      ]}
    >
      <View style={{ width: 50, height: 50, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
        <FontAwesome5 name="check" size={42} color="#38a169" />
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 60,
            backgroundColor: '#EAF3DE',
            transform: [{ translateX: maskTranslateX }],
          }}
        />
      </View>
    </Animated.View>
  );
};

import GuestRestriction from '../components/GuestRestriction';

export default function ProductsScreen({ navigation }: Props) {
  const { theme, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = () => {
    const fetchCats = fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .catch(err => {
        console.log('Error fetching categories', err);
        return [];
      });

    const fetchProds = fetch(`${API_URL}/api/inventory`)
      .then(res => res.json())
      .catch(err => {
        console.log('Error fetching products', err);
        return [];
      });

    return Promise.all([fetchCats, fetchProds]).then(([catsData, prodsData]) => {
      const formatCategoryName = (cat: string) => {
        if (!cat) return 'Other';
        // First, try to resolve the slug from the categories list
        const found = Array.isArray(catsData)
          ? catsData.find((c: any) =>
              c.slug.toLowerCase() === cat.toLowerCase() ||
              c.name.toLowerCase() === cat.toLowerCase()
            )
          : null;
        // Use the slug for reliable mapping if found, otherwise use the raw value
        const slug = found ? found.slug.toLowerCase().trim() : cat.toLowerCase().trim();

        // Map slugs/names to canonical display labels (matches web categoryUtils.ts)
        if (slug === 'food' || slug === 'pet-food' || slug === 'pet food' ||
            slug === 'food supplies' || slug === 'food-supplies') return 'Pet Food';
        if (slug === 'dog' || slug === 'dog-supplies' || slug === 'dog supplies' ||
            slug === 'dog-food' || slug === 'dog food') return 'Dog Supplies';
        if (slug === 'cat' || slug === 'cat-supplies' || slug === 'cat supplies' ||
            slug === 'cat-food' || slug === 'cat food') return 'Cat Supplies';
        if (slug === 'medications' || slug === 'medicine' || slug === 'pharmacy') return 'Medications';
        if (slug === 'vaccine') return 'Vaccine';
        if (slug === 'grooming' || slug === 'grooming-supplies' || slug === 'grooming supplies') return 'Grooming';
        if (slug === 'accessories' || slug === 'accessory') return 'Accessories';

        // Fallback: title-case the raw category string
        const rawName = found ? found.name : cat;
        return rawName.split(/[ -]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      };

      const dynamicCategoriesList = Array.isArray(catsData)
        ? catsData.map((c: any) => formatCategoryName(c.name || c.slug))
        : [];

      const mappedProducts = (Array.isArray(prodsData) ? prodsData : [])
        .filter((item: any) => {
          const cat = (item.category || '').toLowerCase().trim();
          return cat !== 'equipment' && cat !== 'supplies';
        })
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          category: formatCategoryName(item.categoryLabel || item.category || 'Other'),
          icon: (item.icon || 'box').replace('fa-', ''),
          color: '#dd6b20',
          desc: item.description || 'No description available.',
          stock: item.stock || 0,
          image: item.image || null
        }));

      setProducts(mappedProducts);

      const productCategories = mappedProducts.map((p: any) => p.category);
      const combined = Array.from(new Set([
        ...dynamicCategoriesList,
        ...productCategories
      ])) as string[];

      const finalCats = combined.filter(c => {
        const lower = c.toLowerCase();
        return lower !== 'equipment' && lower !== 'supplies';
      });

      setCategories(['All', ...finalCats]);
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts().finally(() => setRefreshing(false));
  }, []);

  // View & App State
  const [viewState, setViewState] = useState<ViewState>('browse');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [quickAddQty, setQuickAddQty] = useState(1);

  // User Context & E-commerce payment states
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'gcash' | 'maya'>('gcash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [selectedCartItems, setSelectedCartItems] = useState<Set<string | number>>(new Set());

  // Order History State
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
  const [orderHistoryFilter, setOrderHistoryFilter] = useState('ALL');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<UserOrder | null>(null);
  const [pickupLoading, setPickupLoading] = useState(false);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [justCompletedOrderId, setJustCompletedOrderId] = useState<string | null>(null);

  // Derived Values
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth(navigation, language);
      return;
    }
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const totalNewQty = currentQtyInCart + quantityToAdd;
      
      if (totalNewQty > product.stock) {
        Alert.alert("Stock Limit Reached", `You already have ${currentQtyInCart} in your cart. Only ${product.stock} items are available in stock.`);
        return prevCart;
      }
      
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: totalNewQty } : item
        );
      }
      return [...prevCart, { product, quantity: quantityToAdd }];
    });
    // Auto-select newly added items
    setSelectedCartItems(prev => new Set(prev).add(product.id));
    Alert.alert("Added to Cart", `${quantityToAdd}x ${product.name} was added to your shopping cart.`);
  };

  const updateCartQuantity = (productId: string | number, delta: number) => {
    setCart(prevCart => {
      const updated = prevCart.map(item => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
          if (newQ > item.product.stock) {
             Alert.alert("Stock Limit", `Only ${item.product.stock} available in stock.`);
             return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: newQ > 0 ? newQ : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);

      // Clean up selection for removed items
      const remainingIds = new Set(updated.map(i => i.product.id));
      setSelectedCartItems(prev => {
        const next = new Set(prev);
        for (const id of prev) {
          if (!remainingIds.has(id)) next.delete(id);
        }
        return next;
      });

      return updated;
    });
  };

  const handleBuyNow = (product: Product, quantityToBuy: number = 1) => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth(navigation, language);
      return;
    }
    setCheckoutItems([{ product, quantity: quantityToBuy }]);
    setViewState('checkout');
  };

  const handleCheckoutCart = () => {
    const itemsToCheckout = cart.filter(item => selectedCartItems.has(item.product.id));
    if (itemsToCheckout.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to proceed to checkout.');
      return;
    }
    setCheckoutItems([...itemsToCheckout]);
    setViewState('checkout');
  };

  const toggleCartItemSelection = (productId: string | number) => {
    setSelectedCartItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAllCart = () => {
    if (selectedCartItems.size === cart.length) {
      setSelectedCartItems(new Set());
    } else {
      setSelectedCartItems(new Set(cart.map(item => item.product.id)));
    }
  };

  const handlePaymentSuccess = async (refNum?: string) => {
    try {
      const orderPayload = {
        userId: user?.id,
        totalAmount: checkoutItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
        paymentMethod: activeTab,
        referenceNumber: refNum || '',
        deliveryAddress: 'In-Clinic Pick Up',
        items: checkoutItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        }))
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

    } catch (e) {
      console.log('Error during checkout', e);
      Alert.alert('Checkout Error', 'There was an issue processing your order.');
    }

    // Remove only checked-out items from cart; keep un-selected items
    const checkedOutIds = new Set(checkoutItems.map(i => i.product.id));
    setCart(prev => prev.filter(item => !checkedOutIds.has(item.product.id)));
    setSelectedCartItems(prev => {
      const next = new Set(prev);
      for (const id of checkedOutIds) next.delete(id);
      return next;
    });
    setViewState('active_order');
  };

  const handleOrderReceived = () => {
    setCheckoutItems([]);
    setViewState('browse');
  };

  // Order History Functions
  const fetchUserOrders = async () => {
    if (!user?.id) return;
    setOrderHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setUserOrders(data.items || []);
      }
    } catch (e) {
      console.log('Error fetching user orders', e);
    } finally {
      setOrderHistoryLoading(false);
    }
  };

  const handleUserPickup = async (orderId: string) => {
    setPickupLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      const data = await res.json();
      if (data.success) {
        setJustCompletedOrderId(orderId);
        setShowFeedbackModal(true);
        setSelectedHistoryOrder(null);
        fetchUserOrders();
      } else {
        Alert.alert('Error', data.error || 'Failed to update order');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to confirm pickup');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user?.id) return;
    setFeedbackSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          rating: feedbackRating,
          category: 'Product Order',
          comments: feedbackComment || 'No additional comments.'
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');
      }
    } catch (e) {
      console.log('Feedback submission error', e);
    } finally {
      setFeedbackSubmitting(false);
      setShowFeedbackModal(false);
      setFeedbackRating(5);
      setFeedbackComment('');
      setJustCompletedOrderId(null);
    }
  };

  // ----- RENDERERS -----

  const renderBrowseView = () => (
    <>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15, padding: 5 }}>
              <FontAwesome5 name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSubtitle}>Order supplies for pick-up</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => {
            if (!user?.id || user.id.trim() === '') {
              promptGuestAuth(navigation, language);
            } else {
              setViewState('cart');
            }
          }}
        >
          <FontAwesome5 name="shopping-cart" size={16} color="white" />
          {cartTotalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartTotalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={!filterOpen}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a7d55']} />
        }
      >
        {filterOpen && (
          <TouchableOpacity 
            style={[StyleSheet.absoluteFillObject, { zIndex: 5, backgroundColor: 'transparent' }]} 
            activeOpacity={1} 
            onPress={() => setFilterOpen(false)} 
          />
        )}

        {/* Categories / Filter Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 10,
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Selected Category Dropdown Trigger */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: '#2D5016',
              borderRadius: 20,
              gap: 8,
            }}
            onPress={() => setFilterOpen(!filterOpen)}
          >
            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: 'white' }}>
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </Text>
            <FontAwesome5 name={filterOpen ? "chevron-up" : "chevron-down"} size={10} color="white" />
          </TouchableOpacity>

          {/* Order History Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: isDarkMode ? '#1c330e' : '#EAF3DE',
              borderRadius: 20,
              gap: 6,
            }}
            onPress={() => {
              if (!user?.id || user.id.trim() === '') {
                promptGuestAuth(navigation, language);
                return;
              }
              fetchUserOrders();
              setViewState('order_history');
            }}
          >
            <FontAwesome5 name="receipt" size={11} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />
            <Text style={{ fontSize: 12, fontFamily: 'Montserrat-SemiBold', color: isDarkMode ? '#EAF3DE' : '#2D5016' }}>
              My Orders
            </Text>
          </TouchableOpacity>

          {/* Empty spacer for user's future plans */}
          <View style={{ flex: 1 }} />
        </View>

        {/* Floating Category Dropdown */}
        {filterOpen && (
          <View style={{
            position: 'absolute',
            top: 55,
            left: 20,
            width: 200,
            backgroundColor: theme.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 10,
            zIndex: 100,
            overflow: 'hidden',
          }}>
            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled" style={{ maxHeight: 250 }}>
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: idx === categories.length - 1 ? 0 : 1,
                      borderBottomColor: theme.border,
                      backgroundColor: isSelected ? (isDarkMode ? '#1c330e' : '#EAF3DE') : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setFilterOpen(false);
                    }}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      fontFamily: isSelected ? 'Montserrat-Bold' : 'Montserrat-Medium', 
                      color: isSelected ? (isDarkMode ? '#EAF3DE' : '#2D5016') : theme.text 
                    }}>
                      {cat === 'All' ? 'All Products' : cat}
                    </Text>
                    {isSelected && <FontAwesome5 name="check" size={10} color={isDarkMode ? '#EAF3DE' : '#2D5016'} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Easy In-Clinic{'\n'}Pick Up</Text>
            <Text style={{ color: 'white', opacity: 0.8, fontSize: 13 }}>Order now, skip the line later.</Text>
          </View>
          <FontAwesome5 name="box-open" size={60} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', right: -10, bottom: -10 }} />
        </View>

        {/* Products Grid */}
        <View style={styles.productsHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{selectedCategory === 'All' ? 'Available Items' : selectedCategory}</Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }, product.stock <= 0 && { opacity: 0.6 }]}
              onPress={() => {
                setSelectedProduct(product);
                setDetailQuantity(1);
                setViewState('detail');
              }}
            >
              <View style={[styles.productImagePlaceholder, { backgroundColor: product.color + '15', overflow: 'hidden' }]}>
                {product.image ? (
                  <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                  <FontAwesome5 name={product.icon} size={35} color={product.color} />
                )}
                {product.stock <= 0 && (
                  <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>SOLD OUT</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.productCategory, { color: theme.subtext }]}>{product.category}</Text>
              <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{product.name}</Text>
              <Text style={[styles.productDescCard, { color: theme.subtext }]} numberOfLines={2}>
                {product.desc && product.desc !== 'No description available.' ? product.desc : 'No description provided'}
              </Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={[styles.addButton, product.stock <= 0 && { backgroundColor: '#a0aec0' }]}
                  onPress={() => {
                    if (!user?.id || user.id.trim() === '') {
                      promptGuestAuth(navigation, language);
                      return;
                    }
                    if (product.stock > 0) {
                      setQuickAddProduct(product);
                      setQuickAddQty(1);
                    }
                  }}
                  disabled={product.stock <= 0}
                >
                  <FontAwesome5 name="cart-plus" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <View style={[styles.fullScreenView, { backgroundColor: theme.background }]}>
        <View style={[styles.detailHeader, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => setViewState('browse')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Detail</Text>
          <TouchableOpacity style={styles.cartButtonDetail} onPress={() => setViewState('cart')}>
            <FontAwesome5 name="shopping-cart" size={18} color="white" />
            {cartTotalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartTotalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.detailHeroImage, { backgroundColor: selectedProduct.color + '15', overflow: 'hidden' }]}>
             {selectedProduct.image ? (
                  <Image source={{ uri: selectedProduct.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                  <FontAwesome5 name={selectedProduct.icon} size={80} color={selectedProduct.color} />
             )}
          </View>

          <View style={[styles.detailContentBox, { backgroundColor: theme.card }]}>
            <View style={styles.detailTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailCategory, { color: theme.subtext }]}>{selectedProduct.category}</Text>
                <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedProduct.name}</Text>
              </View>
              <Text style={styles.detailPriceHuge}>₱{selectedProduct.price.toFixed(2)}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.descLabel, { color: theme.text }]}>About this item</Text>
            <Text style={[styles.descText, { color: theme.subtext }]}>{selectedProduct.desc}</Text>

            <View style={[styles.stockBadge, selectedProduct.stock <= 0 && { backgroundColor: '#fed7d7' }]}>
              {selectedProduct.stock > 0 ? (
                 <>
                   <FontAwesome5 name="check-circle" size={14} color="#38a169" />
                   <Text style={styles.stockBadgeText}>In Stock at Clinic ({selectedProduct.stock})</Text>
                 </>
              ) : (
                 <>
                   <FontAwesome5 name="times-circle" size={14} color="#e53e3e" />
                   <Text style={[styles.stockBadgeText, { color: '#e53e3e' }]}>Sold Out</Text>
                 </>
              )}
            </View>

            {selectedProduct.stock > 0 && (
              <View style={styles.detailQtyPickerBox}>
                <Text style={styles.detailQtyPickerLabel}>Purchase Quantity</Text>
                <View style={styles.detailQtyControls}>
                  <TouchableOpacity 
                    style={styles.detailQtyBtn} 
                    onPress={() => setDetailQuantity(q => Math.max(1, q - 1))}
                  >
                    <FontAwesome5 name="minus" size={12} color="#2D5016" />
                  </TouchableOpacity>
                  <Text style={styles.detailQtyText}>{detailQuantity}</Text>
                  <TouchableOpacity 
                    style={styles.detailQtyBtn} 
                    onPress={() => setDetailQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                  >
                    <FontAwesome5 name="plus" size={12} color="#2D5016" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons (Sticky Bottom) */}
        <View style={styles.detailActionContainer}>
          <TouchableOpacity
            style={[styles.detailAddToCartBtn, selectedProduct.stock <= 0 && { borderColor: '#a0aec0', opacity: 0.5 }]}
            onPress={() => selectedProduct.stock > 0 && addToCart(selectedProduct, detailQuantity)}
            disabled={selectedProduct.stock <= 0}
          >
            <FontAwesome5 name="cart-plus" size={16} color={selectedProduct.stock <= 0 ? '#a0aec0' : '#2E5E3E'} style={{ marginRight: 8 }} />
            <Text style={[styles.detailAddToCartText, selectedProduct.stock <= 0 && { color: '#a0aec0' }]}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.detailBuyNowBtn, selectedProduct.stock <= 0 && { backgroundColor: '#a0aec0' }]}
            onPress={() => selectedProduct.stock > 0 && handleBuyNow(selectedProduct, detailQuantity)}
            disabled={selectedProduct.stock <= 0}
          >
            <Text style={styles.detailBuyNowText}>{selectedProduct.stock <= 0 ? 'Sold Out' : 'Buy Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCart = () => {
    const selectedItems = cart.filter(item => selectedCartItems.has(item.product.id));
    const selectedCost = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const allSelected = cart.length > 0 && selectedCartItems.size === cart.length;

    return (
      <View style={[styles.fullScreenView, { backgroundColor: theme.background }]}>
        <View style={[styles.detailHeader, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => setViewState('browse')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <FontAwesome5 name="shopping-basket" size={60} color="#cbd5e0" style={{ marginBottom: 20 }} />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSub}>Looks like you haven't added any pet supplies yet.</Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => setViewState('browse')}>
              <Text style={{ color: 'white', fontFamily: 'Montserrat-SemiBold' }}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Select All Row */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: isDarkMode ? theme.card : '#f7fafc',
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}>
              <TouchableOpacity
                onPress={toggleSelectAllCart}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: allSelected ? '#2D5016' : '#cbd5e0',
                  backgroundColor: allSelected ? '#2D5016' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {allSelected && <FontAwesome5 name="check" size={12} color="white" />}
              </TouchableOpacity>
              <Text style={{ flex: 1, fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: theme.text }}>
                Select All
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Medium', color: theme.subtext }}>
                {selectedItems.length} of {cart.length} selected
              </Text>
            </View>

            <ScrollView style={styles.cartScroll} showsVerticalScrollIndicator={false}>
              {cart.map((item, idx) => {
                const isSelected = selectedCartItems.has(item.product.id);
                return (
                  <View key={idx} style={[styles.cartItem, { backgroundColor: theme.card, borderColor: isSelected ? '#2D5016' : theme.border, borderWidth: isSelected ? 1.5 : 0.5 }]}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      onPress={() => toggleCartItemSelection(item.product.id)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: isSelected ? '#2D5016' : '#cbd5e0',
                        backgroundColor: isSelected ? '#2D5016' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}
                    >
                      {isSelected && <FontAwesome5 name="check" size={10} color="white" />}
                    </TouchableOpacity>
                    <View style={[styles.cartItemImage, { backgroundColor: item.product.color + '15', overflow: 'hidden' }]}>
                      {item.product.image ? (
                        <Image source={{ uri: item.product.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                      ) : (
                        <FontAwesome5 name={item.product.icon} size={24} color={item.product.color} />
                      )}
                    </View>
                    <View style={styles.cartItemDetails}>
                      <Text style={[styles.cartItemName, { color: theme.text }]} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={styles.cartItemPrice}>₱{(item.product.price * item.quantity).toFixed(2)}</Text>
                    </View>
                    <View style={styles.cartQtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQuantity(item.product.id, -1)}>
                        <FontAwesome5 name="minus" size={10} color="#4a5568" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateCartQuantity(item.product.id, 1)}>
                        <FontAwesome5 name="plus" size={10} color="#4a5568" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.cartBottomContainer}>
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</Text>
                <Text style={styles.cartSummaryValue}>₱{selectedCost.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.checkoutBtn, selectedItems.length === 0 && { backgroundColor: '#a0aec0' }]}
                onPress={handleCheckoutCart}
                disabled={selectedItems.length === 0}
              >
                <Text style={styles.checkoutBtnText}>
                  {selectedItems.length === 0 ? 'Select items to checkout' : `Proceed to Checkout (₱${selectedCost.toFixed(2)})`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderCheckout = () => {
    const totalCost = checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleConfirmPayment = () => {
      if (!referenceNumber.trim()) {
        Alert.alert("Reference Number Required", `Please enter the ${activeTab === 'gcash' ? 'GCash' : 'Maya'} transaction reference number to confirm your payment.`);
        return;
      }
      if (referenceNumber.trim().length < 8) {
        Alert.alert("Invalid Reference Number", "Please enter a valid reference number.");
        return;
      }
      setIsConfirmingPayment(true);
      const ref = referenceNumber.trim();
      setReferenceNumber('');
      handlePaymentSuccess(ref).finally(() => {
        setIsConfirmingPayment(false);
      });
    };

    return (
      <View style={[styles.fullScreenView, { backgroundColor: theme.background }]}>
        <View style={[styles.detailHeader, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => setViewState('cart')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Payment Processing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.checkoutScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.checkoutSubtitle}>Choose Payment Method & Scan QR Code</Text>

          <View style={styles.paymentTabsContainer}>
            <TouchableOpacity 
              style={[styles.paymentTab, activeTab === 'gcash' && styles.paymentTabActiveGCash]} 
              onPress={() => setActiveTab('gcash')}
            >
              <FontAwesome5 name="wallet" size={16} color={activeTab === 'gcash' ? 'white' : '#007dfe'} style={{ marginRight: 8 }} />
              <Text style={[styles.paymentTabText, activeTab === 'gcash' && styles.paymentTabTextActive]}>GCash</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.paymentTab, activeTab === 'maya' && styles.paymentTabActiveMaya]} 
              onPress={() => setActiveTab('maya')}
            >
              <FontAwesome5 name="wallet" size={16} color={activeTab === 'maya' ? 'white' : '#5ebc16'} style={{ marginRight: 8 }} />
              <Text style={[styles.paymentTabText, activeTab === 'maya' && styles.paymentTabTextActive]}>Maya</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qrCodeContainer}>
            <View style={{ padding: 15, alignItems: 'center', marginBottom: 15 }}>
              {activeTab === 'gcash' ? (
                <Image 
                  source={require('../../assets/gcash-qr.jpg')} 
                  style={{ width: 220, height: 220, borderRadius: 12 }} 
                  resizeMode="contain" 
                />
              ) : (
                <Image 
                  source={require('../../assets/maya-qr.jpg')} 
                  style={{ width: 220, height: 220, borderRadius: 12 }} 
                  resizeMode="contain" 
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <FontAwesome5 
                name="check-circle" 
                size={16} 
                color={activeTab === 'gcash' ? '#007dfe' : '#5ebc16'} 
                style={{ marginRight: 6 }} 
              />
              <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' }}>
                {activeTab === 'gcash' ? '✓ Real GCash Merchant QR Loaded' : '✓ Real Maya Merchant QR Loaded'}
              </Text>
            </View>
            <Text style={styles.qrAmountText}>Amount Due: <Text style={{ color: '#2E5E3E' }}>₱{totalCost.toFixed(2)}</Text></Text>
          </View>

          <View style={[styles.paymentInstructionsBox, { backgroundColor: activeTab === 'gcash' ? '#ebf8ff' : '#f0fff4', borderColor: activeTab === 'gcash' ? '#bef3fe' : '#c6f6d5', borderWidth: 1 }]}>
            <FontAwesome5 
              name="info-circle" 
              size={16} 
              color={activeTab === 'gcash' ? '#3182ce' : '#38a169'} 
              style={{ marginTop: 2 }} 
            />
            <Text style={[styles.paymentInstructionsText, { color: activeTab === 'gcash' ? '#2b6cb0' : '#276749' }]}>
              Please scan the QR code above or save it to your gallery, then pay exactly ₱{totalCost.toFixed(2)} using your mobile wallet app. Once completed, enter the reference number below to verify your payment.
            </Text>
          </View>

          <View style={styles.refInputGroup}>
            <Text style={styles.refInputLabel}>{activeTab === 'gcash' ? 'GCash' : 'Maya'} Reference Number</Text>
            <TextInput
              style={styles.refInput}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
              placeholder={activeTab === 'gcash' ? 'Enter 13-digit Reference Number' : 'Enter 13-digit Reference Number'}
              keyboardType="number-pad"
              maxLength={13}
            />
            <Text style={styles.refInputHint}>
              Ensure the reference number matches the receipt exactly to avoid payment delay.
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.confirmPaymentBtn, 
              { backgroundColor: activeTab === 'gcash' ? '#007dfe' : '#5ebc16' }
            ]} 
            onPress={handleConfirmPayment}
            disabled={isConfirmingPayment}
          >
            {isConfirmingPayment ? (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            ) : (
              <FontAwesome5 name="lock" size={16} color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.confirmPaymentBtnText}>
              {isConfirmingPayment ? 'Verifying Reference...' : 'Confirm Order Payment'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    );
  };

  const renderActiveOrder = () => {
    return (
      <View style={[styles.fullScreenView, { backgroundColor: '#f0fff4' }]}>
        <View style={styles.activeOrderCenter}>
          <AnimatedCheckmark />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>Payment successful. Please wait for the notification or email confirmation.</Text>

          <TouchableOpacity style={[styles.markReceivedBtn, { width: '80%', maxWidth: 260, marginTop: 20 }]} onPress={handleOrderReceived}>
            <Text style={styles.markReceivedText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderHistory = () => {
    const filteredOrders = userOrders.filter(order => {
      if (orderHistoryFilter === 'ALL') return true;
      if (orderHistoryFilter === 'PENDING') return order.status === 'PENDING';
      if (orderHistoryFilter === 'READY') return order.status === 'DELIVERED';
      if (orderHistoryFilter === 'COMPLETED') return order.status === 'COMPLETED';
      if (orderHistoryFilter === 'CANCELLED') return order.status === 'CANCELLED';
      return true;
    });

    const getStatusInfo = (status: string) => {
      switch (status) {
        case 'PENDING':
          return { label: 'Pending', color: '#b45309', bg: '#fef3c7' };
        case 'PROCESSING':
          return { label: 'Processing', color: '#3730a3', bg: '#e0e7ff' };
        case 'SHIPPED':
          return { label: 'Shipped', color: '#1e40af', bg: '#dbeafe' };
        case 'DELIVERED':
          return { label: 'Ready for Pick Up', color: '#166534', bg: '#dcfce7' };
        case 'COMPLETED':
          return { label: 'Completed', color: '#4b5563', bg: '#f3f4f6' };
        case 'CANCELLED':
          return { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' };
        default:
          return { label: status, color: '#4b5563', bg: '#f3f4f6' };
      }
    };

    return (
      <View style={styles.fullScreenView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => setViewState('browse')} style={styles.backIconButton}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>Manage your pick-up orders</Text>
          </View>
          <TouchableOpacity onPress={fetchUserOrders} style={{ padding: 10 }}>
            <FontAwesome5 name="sync" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: theme.card,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, gap: 8 }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'READY', label: 'Ready for Pick Up' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => {
              const active = orderHistoryFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setOrderHistoryFilter(tab.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 15,
                    backgroundColor: active ? '#2D5016' : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? '#2D5016' : theme.border,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: active ? 'Montserrat-Bold' : 'Montserrat-Medium',
                    color: active ? 'white' : theme.text,
                  }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Orders List */}
        {orderHistoryLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2D5016" />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <FontAwesome5 name="receipt" size={50} color={theme.border} style={{ marginBottom: 15 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Montserrat-SemiBold', color: theme.text }}>No orders found</Text>
            <Text style={{ fontSize: 13, color: theme.subtext, textAlign: 'center', marginTop: 5 }}>
              Orders you place in the clinic shop will show up here.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1, padding: 15 }} contentContainerStyle={{ paddingBottom: 30 }} refreshControl={
            <RefreshControl refreshing={orderHistoryLoading} onRefresh={fetchUserOrders} colors={['#2D5016']} />
          }>
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const dateStr = new Date(order.orderDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => setSelectedHistoryOrder(order)}
                  style={{
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 15,
                    borderWidth: 1,
                    borderColor: theme.border,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View>
                      <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: theme.text }}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>{dateStr}</Text>
                    </View>
                    <View style={{
                      backgroundColor: statusInfo.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Bold', color: statusInfo.color }}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* Summary of Items */}
                  <View style={{ marginBottom: 12 }}>
                    {order.items.slice(0, 2).map((item, idx) => (
                      <Text key={idx} style={{ fontSize: 13, color: theme.text, fontFamily: 'Montserrat-Medium', marginBottom: 4 }}>
                        • {item.product?.productName || 'Product'} x{item.quantity}
                      </Text>
                    ))}
                    {order.items.length > 2 && (
                      <Text style={{ fontSize: 12, color: theme.subtext, fontStyle: 'italic', marginLeft: 10 }}>
                        + {order.items.length - 2} more items
                      </Text>
                    )}
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    paddingTop: 12,
                  }}>
                    <View>
                      <Text style={{ fontSize: 11, color: theme.subtext }}>Total Amount</Text>
                      <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2D5016' }}>
                        ₱{order.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                    
                    {order.status === 'DELIVERED' && (
                      <TouchableOpacity
                        onPress={() => handleUserPickup(order.id)}
                        disabled={pickupLoading}
                        style={{
                          backgroundColor: '#2D5016',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 12,
                        }}
                      >
                        {pickupLoading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>
                            Mark as Picked Up
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', color: '#b45309', bg: '#fef3c7' };
      case 'PROCESSING':
        return { label: 'Processing', color: '#3730a3', bg: '#e0e7ff' };
      case 'SHIPPED':
        return { label: 'Shipped', color: '#1e40af', bg: '#dbeafe' };
      case 'DELIVERED':
        return { label: 'Ready for Pick Up', color: '#166534', bg: '#dcfce7' };
      case 'COMPLETED':
        return { label: 'Completed', color: '#4b5563', bg: '#f3f4f6' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' };
      default:
        return { label: status, color: '#4b5563', bg: '#f3f4f6' };
    }
  };


  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {viewState === 'browse' && renderBrowseView()}
      {viewState === 'detail' && renderProductDetail()}
      {viewState === 'cart' && renderCart()}
      {viewState === 'checkout' && renderCheckout()}
      {viewState === 'active_order' && renderActiveOrder()}
      {viewState === 'order_history' && renderOrderHistory()}

      {quickAddProduct && (
        <View style={styles.modalOverlay}>
          <View style={styles.quickAddModalContent}>
            <View style={styles.quickAddHeader}>
              <Text style={styles.quickAddTitle}>Add to Cart</Text>
              <TouchableOpacity onPress={() => setQuickAddProduct(null)} style={styles.quickAddCloseBtn}>
                <FontAwesome5 name="times" size={16} color="#718096" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickAddProductInfo}>
              <View style={[styles.quickAddProductImage, { backgroundColor: quickAddProduct.color + '15', overflow: 'hidden' }]}>
                {quickAddProduct.image ? (
                  <Image source={{ uri: quickAddProduct.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                  <FontAwesome5 name={quickAddProduct.icon} size={24} color={quickAddProduct.color} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickAddProductName} numberOfLines={1}>{quickAddProduct.name}</Text>
                <Text style={[styles.quickAddProductDesc, { color: theme.subtext }]} numberOfLines={2}>
                  {quickAddProduct.desc && quickAddProduct.desc !== 'No description available.' ? quickAddProduct.desc : 'No description provided'}
                </Text>
                <Text style={styles.quickAddProductPrice}>₱{quickAddProduct.price.toFixed(2)}</Text>
                <Text style={styles.quickAddProductStock}>Available stock: {quickAddProduct.stock}</Text>
              </View>
            </View>

            <View style={styles.quickAddQtyContainer}>
              <Text style={styles.quickAddQtyLabel}>Quantity to buy:</Text>
              <View style={styles.quickAddQtySelectorRow}>
                <TouchableOpacity 
                  style={styles.quickAddQtyBtn} 
                  onPress={() => setQuickAddQty(q => Math.max(1, q - 1))}
                >
                  <FontAwesome5 name="minus" size={12} color="#2D5016" />
                </TouchableOpacity>
                <Text style={styles.quickAddQtyValue}>{quickAddQty}</Text>
                <TouchableOpacity 
                  style={styles.quickAddQtyBtn} 
                  onPress={() => setQuickAddQty(q => Math.min(quickAddProduct.stock, q + 1))}
                >
                  <FontAwesome5 name="plus" size={12} color="#2D5016" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.quickAddConfirmBtn}
              onPress={() => {
                addToCart(quickAddProduct, quickAddQty);
                setQuickAddProduct(null);
              }}
            >
              <FontAwesome5 name="shopping-cart" size={14} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.quickAddConfirmBtnText}>
                Confirm Add (₱{(quickAddProduct.price * quickAddQty).toFixed(2)})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedHistoryOrder && (
        <View style={styles.modalOverlay}>
          <View style={styles.orderDetailModalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 10 }}>
              <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: theme.text }}>Order Details</Text>
              <TouchableOpacity onPress={() => setSelectedHistoryOrder(null)} style={{ padding: 5 }}>
                <FontAwesome5 name="times" size={16} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              <View style={{ backgroundColor: theme.background, padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border }}>
                <Text style={{ fontSize: 12, color: theme.subtext }}>Order ID: <Text style={{ fontFamily: 'monospace', color: theme.text, fontWeight: 'bold' }}>{selectedHistoryOrder.id}</Text></Text>
                <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Date: <Text style={{ color: theme.text }}>{new Date(selectedHistoryOrder.orderDate).toLocaleString()}</Text></Text>
                <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Payment Method: <Text style={{ color: theme.text, textTransform: 'uppercase' }}>{selectedHistoryOrder.paymentMethod}</Text></Text>
                {selectedHistoryOrder.payments && selectedHistoryOrder.payments.length > 0 && selectedHistoryOrder.payments[0].referenceNumber && (
                  <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Reference Number: <Text style={{ color: theme.text }}>{selectedHistoryOrder.payments[0].referenceNumber}</Text></Text>
                )}
                <Text style={{ fontSize: 12, color: theme.subtext, marginTop: 4 }}>Status: <Text style={{ color: getStatusInfo(selectedHistoryOrder.status).color, fontWeight: 'bold' }}>{getStatusInfo(selectedHistoryOrder.status).label}</Text></Text>
              </View>

              <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: theme.text, marginBottom: 8 }}>Items Ordered</Text>
              {selectedHistoryOrder.items.map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: theme.text }} numberOfLines={1}>{item.product?.productName || 'Product'}</Text>
                    <Text style={{ fontSize: 11, color: theme.subtext, marginTop: 2 }}>{item.quantity} x ₱{(item.product?.price || (item.subtotal / item.quantity)).toFixed(2)}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Bold', color: theme.text }}>₱{item.subtotal.toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 15, marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 11, color: theme.subtext }}>Total Amount</Text>
                <Text style={{ fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#2D5016' }}>₱{selectedHistoryOrder.totalAmount.toFixed(2)}</Text>
              </View>
              
              {selectedHistoryOrder.status === 'DELIVERED' ? (
                <TouchableOpacity
                  onPress={() => handleUserPickup(selectedHistoryOrder.id)}
                  disabled={pickupLoading}
                  style={{
                    backgroundColor: '#2D5016',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  {pickupLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>Mark as Picked Up</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setSelectedHistoryOrder(null)}
                  style={{
                    backgroundColor: '#718096',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {showFeedbackModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModalContent}>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#EAF3DE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <FontAwesome5 name="clinic-medical" size={24} color="#2D5016" />
              </View>
              <Text style={{ fontSize: 16, fontFamily: 'Montserrat-Bold', color: theme.text, textAlign: 'center' }}>Clinic Pick-Up Completed!</Text>
              <Text style={{ fontSize: 12, color: theme.subtext, textAlign: 'center', marginTop: 4 }}>Please rate your experience with our clinic.</Text>
            </View>

            {/* Stars Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(star => {
                const active = star <= feedbackRating;
                return (
                  <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                    <FontAwesome5 name="star" solid={active} size={28} color={active ? '#f59e0b' : '#cbd5e1'} />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 12,
                fontSize: 13,
                color: theme.text,
                backgroundColor: theme.card,
                height: 80,
                textAlignVertical: 'top',
                fontFamily: 'Montserrat-Regular',
                marginBottom: 20,
              }}
              placeholder="Leave a comment about the clinic service (optional)..."
              placeholderTextColor={theme.subtext}
              multiline={true}
              value={feedbackComment}
              onChangeText={setFeedbackComment}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowFeedbackModal(false);
                  setFeedbackRating(5);
                  setFeedbackComment('');
                  setJustCompletedOrderId(null);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: theme.subtext }}>Skip</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSubmitFeedback}
                disabled={feedbackSubmitting}
                style={{
                  flex: 1,
                  backgroundColor: '#2D5016',
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center',
                }}
              >
                {feedbackSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: 'white' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F1EC' },
  // Browse View Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#EAF3DE', marginTop: 2, fontFamily: 'Montserrat-Regular' },
  cartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#7CB342',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  cartBadgeText: { color: 'white', fontSize: 10, fontFamily: 'Montserrat-Bold' },
  mainScroll: { flex: 1 },
  categoryScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexGrow: 0,
    maxHeight: 70,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'center',
  },
  categoryChipActive: { backgroundColor: '#2D5016', borderColor: '#2D5016' },
  categoryChipText: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#4a5568' },
  categoryChipTextActive: { color: 'white' },
  promoBanner: {
    marginHorizontal: 15,
    backgroundColor: '#2D5016',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promoContent: { zIndex: 1 },
  promoTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white', marginBottom: 6, lineHeight: 24 },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Catcut', color: '#2d3748' },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  productImagePlaceholder: {
    height: 120,
    backgroundColor: '#edf2f7',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCategory: { fontSize: 11, color: '#718096', marginBottom: 3, fontFamily: 'Montserrat-Medium' },
  productName: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#2d3748', marginBottom: 3 },
  productDescCard: { fontSize: 11, color: '#718096', fontFamily: 'Montserrat-Regular', lineHeight: 14, marginBottom: 8, height: 28 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2D5016' },
  addButton: {
    backgroundColor: '#2D5016',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Full Screen Views Common
  fullScreenView: { flex: 1, backgroundColor: '#F4F1EC' },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2D5016',
    borderBottomWidth: 0,
  },
  backIconButton: {
    width: 40, height: 40,
    justifyContent: 'center',
  },
  screenHeading: { fontSize: 18, fontFamily: 'Catcut', color: '#2d3748' },
  cartButtonDetail: {
    width: 40, height: 40,
    alignItems: 'flex-end', justifyContent: 'center',
  },

  // Detail View
  detailScroll: { flex: 1 },
  detailHeroImage: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  detailContentBox: { paddingHorizontal: 20 },
  detailTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailCategory: { fontSize: 13, color: '#718096', fontFamily: 'Montserrat-SemiBold', marginBottom: 6, textTransform: 'uppercase' },
  detailTitle: { fontSize: 24, fontFamily: 'Catcut', color: '#2d3748', lineHeight: 30 },
  detailPriceHuge: { fontSize: 28, fontFamily: 'Montserrat-Bold', color: '#2D5016' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  descLabel: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 10 },
  descText: { fontSize: 15, color: '#4a5568', lineHeight: 22, opacity: 0.9, fontFamily: 'Montserrat-Regular' },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF3DE',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 20,
  },
  stockBadgeText: { fontSize: 13, color: '#2D5016', fontFamily: 'Montserrat-SemiBold', marginLeft: 6 },

  detailActionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    gap: 15,
  },
  detailAddToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#2D5016',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  detailAddToCartText: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#2D5016' },
  detailBuyNowBtn: {
    flex: 1,
    backgroundColor: '#2D5016',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  detailBuyNowText: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: 'white' },

  // Cart View
  emptyCartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyCartTitle: { fontSize: 20, fontFamily: 'Catcut', color: '#2d3748', marginBottom: 8 },
  emptyCartSub: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 24, lineHeight: 22, fontFamily: 'Montserrat-Regular' },
  shopNowBtn: { backgroundColor: '#2D5016', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },

  cartScroll: { flex: 1, paddingHorizontal: 20 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
  },
  cartItemImage: { width: 60, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cartItemDetails: { flex: 1 },
  cartItemName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#2d3748', marginBottom: 4 },
  cartItemPrice: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#2D5016' },
  cartQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#2d3748', width: 20, textAlign: 'center' },

  cartBottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  cartSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  cartSummaryLabel: { fontSize: 16, color: '#4a5568', fontFamily: 'Montserrat-SemiBold' },
  cartSummaryValue: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  checkoutBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' },

  // Checkout View
  checkoutScroll: { padding: 20, alignItems: 'center', width: '100%' },
  checkoutSubtitle: { fontSize: 14, color: '#718096', marginBottom: 20, fontFamily: 'Montserrat-Medium', textAlign: 'center' },
  paymentTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#edf2f7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    width: '100%',
  },
  paymentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  paymentTabActiveGCash: {
    backgroundColor: '#007dfe',
  },
  paymentTabActiveMaya: {
    backgroundColor: '#5ebc16',
  },
  paymentTabText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#4a5568',
  },
  paymentTabTextActive: {
    color: 'white',
  },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  qrAmountText: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  paymentInstructionsBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  paymentInstructionsText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontFamily: 'Montserrat-Medium' },
  refInputGroup: {
    width: '100%',
    marginTop: 25,
  },
  refInputLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
    marginBottom: 8,
  },
  refInput: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
  },
  refInputHint: {
    fontSize: 11.5,
    color: '#718096',
    marginTop: 6,
    fontFamily: 'Montserrat-Regular',
  },
  confirmPaymentBtn: {
    flexDirection: 'row',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmPaymentBtnText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' },

  // Active Order View
  activeOrderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIconCircle: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontFamily: 'Catcut', color: '#2D5016', marginBottom: 10, textAlign: 'center', alignSelf: 'center', paddingHorizontal: 20 },
  successDesc: { fontSize: 16, color: '#2D5016', textAlign: 'center', alignSelf: 'center', marginBottom: 40, fontFamily: 'Montserrat-Regular', paddingHorizontal: 24, lineHeight: 24 },
  pickupCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 40,
  },
  pickupCardTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#2d3748', marginBottom: 8 },
  pickupCardDesc: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22, fontFamily: 'Montserrat-Regular' },
  markReceivedBtn: {
    backgroundColor: '#2D5016',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  markReceivedText: { color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold' },

  // Purchase Quantity Selector Details Screen
  detailQtyPickerBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailQtyPickerLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
  },
  detailQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#edf2f7',
    paddingHorizontal: 5,
  },
  detailQtyBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailQtyText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
    width: 30,
    textAlign: 'center',
  },

  // Quick Add Overlay Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    zIndex: 9999,
  },
  quickAddModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  quickAddHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 10,
  },
  quickAddTitle: {
    fontSize: 18,
    fontFamily: 'Catcut',
    color: '#2D5016',
  },
  quickAddCloseBtn: {
    padding: 5,
  },
  quickAddProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
  },
  quickAddProductImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddProductName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#2d3748',
    marginBottom: 2,
  },
  quickAddProductDesc: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    lineHeight: 15,
    marginBottom: 6,
  },
  quickAddProductPrice: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
    marginBottom: 2,
  },
  quickAddProductStock: {
    fontSize: 11,
    color: '#718096',
    fontFamily: 'Montserrat-Regular',
  },
  quickAddQtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  quickAddQtyLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#4a5568',
  },
  quickAddQtySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#edf2f7',
    paddingHorizontal: 4,
  },
  quickAddQtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddQtyValue: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#2D5016',
    width: 26,
    textAlign: 'center',
  },
  quickAddConfirmBtn: {
    backgroundColor: '#2D5016',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2D5016',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  quickAddConfirmBtnText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  orderDetailModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  feedbackModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
});
