import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Animated,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/api';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import GuestAuthModal from '../components/GuestAuthModal';
import { useGuestAuth } from '../utils/auth';
import ProductsHeader from '../components/products/ProductsHeader';
import SearchBar from '../components/products/SearchBar';
import CategoryChips from '../components/products/CategoryChips';
import PickupBanner from '../components/products/PickupBanner';
import ProductCard from '../components/products/ProductCard';
import CartSummaryBar from '../components/products/CartSummaryBar';
import ProductSkeleton from '../components/products/ProductSkeleton';
import EmptyState from '../components/products/EmptyState';
import CartToast from '../components/products/CartToast';
import ProductDetailHeader from '../components/products/ProductDetailHeader';
import ProductImageGallery from '../components/products/ProductImageGallery';
import ProductInfo from '../components/products/ProductInfo';
import StockChip from '../components/products/StockChip';
import DetailRow from '../components/products/DetailRow';
import StickyActionBar from '../components/products/StickyActionBar';
import CartHeader from '../components/products/CartHeader';
import SelectAllRow from '../components/products/SelectAllRow';
import CartItemRow from '../components/products/CartItemRow';
import CartSummaryPanel from '../components/products/CartSummaryPanel';
import EmptyCart from '../components/products/EmptyCart';
import PaymentHeader from '../components/products/PaymentHeader';
import WalletTabs from '../components/products/WalletTabs';
import AmountQrCard from '../components/products/AmountQrCard';
import HowToPay from '../components/products/HowToPay';
import OrderSummary from '../components/products/OrderSummary';
import ReferenceInput from '../components/products/ReferenceInput';
import ConfirmBar from '../components/products/ConfirmBar';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
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
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const { guestModalVisible, promptGuestAuth, closeGuestModal } = useGuestAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);

  // Search with 300ms debounce
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toast feedback state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('Added to cart');

  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = () => {
    setProductFetchError(null);
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
        throw err;
      });

    return Promise.all([fetchCats, fetchProds])
      .then(([catsData, prodsData]) => {
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
        setProductFetchError(null);

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
      })
      .catch(err => {
        console.log('Failed to load products', err);
        setProductFetchError('Failed to load products');
      })
      .finally(() => {
        setLoadingProducts(false);
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
  const [referenceError, setReferenceError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const checkoutScrollRef = useRef<ScrollView>(null);

  // Hide bottom tab bar while on checkout screen to prevent accidental exits
  useEffect(() => {
    if (viewState === 'checkout') {
      (navigation as any)?.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      (navigation as any)?.setOptions({ tabBarStyle: undefined });
    }
  }, [viewState, navigation]);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [selectedCartItems, setSelectedCartItems] = useState<Set<string | number>>(new Set());
  const [removedItemUndo, setRemovedItemUndo] = useState<{
    item: CartItem;
    wasSelected: boolean;
  } | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);

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

  // Derived Values: Filter products by category and debounced search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, debouncedSearch]);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const getCartQuantity = (productId: string | number) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product: Product, quantityToAdd: number = 1, showToast: boolean = false) => {
    if (!user?.id || user.id.trim() === '') {
      promptGuestAuth();
      return;
    }
    let success = false;
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      const currentQtyInCart = existing ? existing.quantity : 0;
      const totalNewQty = currentQtyInCart + quantityToAdd;
      
      if (totalNewQty > product.stock) {
        Alert.alert("Stock Limit Reached", `You already have ${currentQtyInCart} in your cart. Only ${product.stock} items are available in stock.`);
        return prevCart;
      }
      
      success = true;
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: totalNewQty } : item
        );
      }
      return [...prevCart, { product, quantity: quantityToAdd }];
    });
    // Auto-select newly added items
    setSelectedCartItems(prev => new Set(prev).add(product.id));
    if (showToast) {
      setToastMessage('Added to cart');
      setToastVisible(true);
    } else {
      Alert.alert("Added to Cart", `${quantityToAdd}x ${product.name} was added to your shopping cart.`);
    }
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
      promptGuestAuth();
      return;
    }
    setCheckoutItems([{ product, quantity: quantityToBuy }]);
    setViewState('checkout');
  };

  const handleCheckoutCart = () => {
    const itemsToCheckout = cart.filter(item => selectedCartItems.has(item.product.id));
    if (itemsToCheckout.length === 0) {
      setToastMessage('Select at least one item to check out');
      setToastVisible(true);
      return;
    }
    setCheckoutItems([...itemsToCheckout]);
    setViewState('checkout');
  };

  const handleRemoveFromCart = (productId: string | number) => {
    const itemToRemove = cart.find(item => item.product.id === productId);
    if (!itemToRemove) return;

    const wasSelected = selectedCartItems.has(productId);

    setRemovedItemUndo({
      item: itemToRemove,
      wasSelected,
    });
    setUndoToastVisible(true);

    setCart(prev => prev.filter(item => item.product.id !== productId));
    setSelectedCartItems(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const handleUndoRemove = () => {
    if (!removedItemUndo) return;
    const { item, wasSelected } = removedItemUndo;
    setCart(prev => [item, ...prev]);
    if (wasSelected) {
      setSelectedCartItems(prev => new Set(prev).add(item.product.id));
    }
    setRemovedItemUndo(null);
    setUndoToastVisible(false);
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
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || errorJson?.message || 'Failed to create order. Please try again.');
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
    } catch (e: any) {
      console.log('Error during checkout', e);
      throw e;
    }
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
    <View style={styles.browseContainer}>
      {/* 1. Header (Fixed top, single-line title/subtitle, cart button with 9+ count badge) */}
      <ProductsHeader
        canGoBack={navigation?.canGoBack() ?? false}
        onBack={() => navigation?.goBack()}
        cartCount={cartTotalItems}
        onCartPress={() => {
          if (!user?.id || user.id.trim() === '') {
            promptGuestAuth();
          } else {
            setViewState('cart');
          }
        }}
      />

      {/* 2. Products 2-Column Grid */}
      <FlatList
        data={loadingProducts || productFetchError ? [] : filteredProducts}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              Math.max(insets.bottom, 16) + (cartTotalItems > 0 ? 76 : 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#35501F']}
          />
        }
        ListHeaderComponent={
          <>
            {/* Search Bar with Debounce, Clear (x), and Compact Orders Button */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              onOrdersPress={() => {
                if (!user?.id || user.id.trim() === '') {
                  promptGuestAuth();
                  return;
                }
                fetchUserOrders();
                setViewState('order_history');
              }}
            />

            {/* Horizontal Category Chips */}
            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Slim 64px In-Clinic Pick-Up Banner */}
            <PickupBanner />

            {/* Section Title & Item Count */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'All' ? 'Available items' : selectedCategory}
              </Text>
              {!loadingProducts && !productFetchError && (
                <Text style={styles.itemCountText}>
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'item' : 'items'}
                </Text>
              )}
            </View>

            {/* Loading Skeleton */}
            {loadingProducts && <ProductSkeleton count={4} />}

            {/* Error State */}
            {productFetchError && (
              <EmptyState
                type="error"
                title="Unable to load products"
                message="Something went wrong while fetching products. Please try again."
                actionText="Try again"
                onAction={fetchProducts}
              />
            )}
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            cartQuantity={getCartQuantity(item.id)}
            onPress={() => {
              setSelectedProduct(item);
              setDetailQuantity(1);
              setViewState('detail');
            }}
            onAddToCart={() => {
              addToCart(item, 1, true);
            }}
            onIncrement={() => updateCartQuantity(item.id, 1)}
            onDecrement={() => updateCartQuantity(item.id, -1)}
          />
        )}
        ListEmptyComponent={
          !loadingProducts && !productFetchError ? (
            <EmptyState
              type="empty"
              title="No products found"
              message="Try a different search or category."
              actionText="Clear filters"
              onAction={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            />
          ) : null
        }
      />

      {/* 3. Sticky Cart Summary Bar */}
      <CartSummaryBar
        totalItems={cartTotalItems}
        totalPrice={cartTotalPrice}
        onViewCart={() => {
          if (!user?.id || user.id.trim() === '') {
            promptGuestAuth();
          } else {
            setViewState('cart');
          }
        }}
        bottomOffset={Math.max(insets.bottom, 12)}
      />

      {/* 4. Added to Cart Toast */}
      <CartToast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
        bottomOffset={
          cartTotalItems > 0
            ? Math.max(insets.bottom, 12) + 60
            : Math.max(insets.bottom, 12) + 12
        }
      />
    </View>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;
    return (
      <View style={styles.detailScreen}>
        {/* Fixed Header */}
        <ProductDetailHeader
          onBack={() => setViewState('browse')}
          cartCount={cartTotalItems}
          onCartPress={() => {
            if (!user?.id || user.id.trim() === '') {
              promptGuestAuth();
            } else {
              setViewState('cart');
            }
          }}
        />

        {/* Scrollable Content */}
        <ScrollView
          style={styles.detailScroll}
          contentContainerStyle={[
            styles.detailScrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 130 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 4:3 Image Gallery with contain mode */}
          <View style={styles.detailImageWrapper}>
            <ProductImageGallery
              image={selectedProduct.image}
            />
          </View>

          {/* White card: Info, Stock, Description */}
          <View style={styles.detailCard}>
            {/* Category chip → Name → Price — stacked, never overlapping */}
            <ProductInfo
              category={selectedProduct.category}
              name={selectedProduct.name}
              price={selectedProduct.price}
            />

            <View style={styles.detailDivider} />

            {/* Stock status chip + clinic pick-up row */}
            <StockChip stock={selectedProduct.stock} />

            <View style={styles.detailDivider} />

            {/* Expandable description + optional spec rows */}
            <DetailRow
              description={selectedProduct.desc && selectedProduct.desc !== 'No description available.' ? selectedProduct.desc : 'No description provided for this product.'}
            />
          </View>
        </ScrollView>

        {/* Sticky bottom bar: Quantity stepper + Add to Cart / Buy Now */}
        <StickyActionBar
          quantity={detailQuantity}
          maxStock={selectedProduct.stock}
          onQuantityChange={(qty) => setDetailQuantity(qty)}
          onAddToCart={() => {
            if (!user?.id || user.id.trim() === '') {
              promptGuestAuth();
              return;
            }
            if (selectedProduct.stock > 0) {
              addToCart(selectedProduct, detailQuantity, true);
            }
          }}
          onBuyNow={() => {
            if (!user?.id || user.id.trim() === '') {
              promptGuestAuth();
              return;
            }
            selectedProduct.stock > 0 && handleBuyNow(selectedProduct, detailQuantity);
          }}
          bottomPadding={Math.max(insets.bottom, 12)}
        />

        {/* Added-to-cart toast */}
        <CartToast
          visible={toastVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
          bottomOffset={Math.max(insets.bottom, 12) + 100}
        />
      </View>
    );
  };

  const renderCart = () => {
    const selectedItems = cart.filter(item => selectedCartItems.has(item.product.id));
    const selectedCost = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const allSelected = cart.length > 0 && selectedCartItems.size === cart.length;

    return (
      <View style={[styles.fullScreenView, { backgroundColor: '#FAF8F5' }]}>
        <CartHeader onBack={() => setViewState('browse')} />

        {cart.length === 0 ? (
          <EmptyCart onBrowse={() => setViewState('browse')} />
        ) : (
          <>
            <SelectAllRow
              allSelected={allSelected}
              selectedCount={selectedItems.length}
              totalCount={cart.length}
              onToggle={toggleSelectAllCart}
            />

            <FlatList
              data={cart}
              keyExtractor={(item) => String(item.product.id)}
              contentContainerStyle={styles.cartListContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#35501F']}
                  tintColor="#35501F"
                />
              }
              renderItem={({ item }) => (
                <CartItemRow
                  item={item}
                  isSelected={selectedCartItems.has(item.product.id)}
                  onToggle={() => toggleCartItemSelection(item.product.id)}
                  onRemove={() => handleRemoveFromCart(item.product.id)}
                  onQuantityChange={(delta) => updateCartQuantity(item.product.id, delta)}
                  onPress={() => {
                    setSelectedProduct(item.product);
                    setViewState('detail');
                  }}
                />
              )}
            />

            <CartSummaryPanel
              selectedCount={selectedItems.length}
              selectedTotal={selectedCost}
              onCheckout={handleCheckoutCart}
            />
          </>
        )}

        <CartToast
          visible={undoToastVisible}
          message="Item removed from cart"
          undoLabel="Undo"
          duration={4000}
          onUndo={handleUndoRemove}
          onHide={() => {
            setUndoToastVisible(false);
            setRemovedItemUndo(null);
          }}
          bottomOffset={cart.length > 0 ? 130 : 30}
        />
      </View>
    );
  };

  const renderCheckout = () => {
    const totalCost = checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const walletName = activeTab === 'gcash' ? 'GCash' : 'Maya';
    const qrSource =
      activeTab === 'gcash'
        ? require('../../assets/gcash-qr.jpg')
        : require('../../assets/maya-qr.jpg');

    const handleConfirmPayment = () => {
      const cleanRef = referenceNumber.trim();
      if (cleanRef.length !== 13) {
        setReferenceError('Enter all 13 digits');
        return;
      }
      setIsConfirmingPayment(true);
      setPaymentError(null);
      setReferenceError(null);

      handlePaymentSuccess(cleanRef)
        .catch((err: any) => {
          const msg = err?.message || 'There was an issue processing your order.';
          if (
            msg.toLowerCase().includes('reference') ||
            msg.toLowerCase().includes('digit') ||
            msg.toLowerCase().includes('used') ||
            msg.toLowerCase().includes('invalid')
          ) {
            setReferenceError(msg);
          } else {
            setPaymentError(msg);
          }
        })
        .finally(() => {
          setIsConfirmingPayment(false);
        });
    };

    return (
      <View style={[styles.fullScreenView, { backgroundColor: '#FAF8F5' }]}>
        <PaymentHeader onLeave={() => setViewState('cart')} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={checkoutScrollRef}
            contentContainerStyle={styles.checkoutScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <WalletTabs
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setReferenceNumber('');
                setReferenceError(null);
                setPaymentError(null);
              }}
            />

            <AmountQrCard
              amount={totalCost}
              qrSource={qrSource}
              merchantName="Balingasag Dog and Cat Clinic"
              onShowToast={(msg) => {
                setToastMessage(msg);
                setToastVisible(true);
              }}
            />

            <OrderSummary items={checkoutItems} totalAmount={totalCost} />

            <HowToPay amount={totalCost} />

            <ReferenceInput
              walletName={walletName}
              value={referenceNumber}
              onChangeText={(text) => {
                setReferenceNumber(text);
                if (referenceError) setReferenceError(null);
                if (paymentError) setPaymentError(null);
              }}
              error={referenceError}
              onClearError={() => setReferenceError(null)}
              onShowToast={(msg) => {
                setToastMessage(msg);
                setToastVisible(true);
              }}
              onFocus={() => {
                setTimeout(() => {
                  checkoutScrollRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />
          </ScrollView>

          <ConfirmBar
            onConfirm={handleConfirmPayment}
            isConfirming={isConfirmingPayment}
            disabled={referenceNumber.length !== 13}
            errorMessage={paymentError}
            onDismissError={() => setPaymentError(null)}
          />
        </KeyboardAvoidingView>

        <CartToast
          visible={toastVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
          bottomOffset={100}
        />
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
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#35501F"
      />
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: '#35501F' }]}
        edges={['top']}
      >
        <GuestAuthModal
          visible={guestModalVisible}
          onClose={closeGuestModal}
          onLogin={() => { closeGuestModal(); navigation?.navigate('Login'); }}
          onRegister={() => { closeGuestModal(); navigation?.navigate('Register'); }}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#35501F',
  },
  safeArea: { flex: 1, backgroundColor: '#F4F1EC' },
  browseContainer: {
    flex: 1,
    backgroundColor: '#F4F1EC',
    position: 'relative',
  },
  columnWrapper: {
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Catcut',
    fontSize: 16,
    color: '#1F2937',
  },
  itemCountText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#6B7280',
  },
  // Common Headers for Sub-Views
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#35501F',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Catcut', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#EAF3DE', marginTop: 2, fontFamily: 'PlusJakartaSans-Regular' },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  cartBadgeText: { color: 'white', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold' },

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

  // Detail View (redesigned)
  detailScreen: {
    flex: 1,
    backgroundColor: '#F4F1EC',
  },
  detailScroll: { flex: 1 },
  detailScrollContent: {
    paddingBottom: 20,
  },
  detailImageWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  detailCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  detailDivider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

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

  // Quantity picker (kept for detail view fallback)

  cartListContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Checkout View
  checkoutScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

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
