import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

type ViewState = 'browse' | 'detail' | 'cart' | 'checkout' | 'active_order';

export default function ProductsScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);

  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = () => {
    return fetch('http://192.168.100.16:3000/api/inventory')
      .then(res => res.json())
      .then(data => {
        const mappedProducts = data
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price) || 0,
            category: item.categoryLabel || item.category || 'Other',
            icon: (item.icon || 'box').replace('fa-', ''),
            color: '#dd6b20',
            desc: item.description || 'No description available.',
            stock: item.stock || 0,
            image: item.image || null
          }));
        
        setProducts(mappedProducts);
        
        // Extract unique categories
        const uniqueCats = Array.from(new Set(mappedProducts.map((p: any) => p.category))) as string[];
        setCategories(['All', ...uniqueCats]);
      })
      .catch(e => console.log('Error fetching products', e));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts()?.finally(() => setRefreshing(false));
  }, []);

  // View & App State
  const [viewState, setViewState] = useState<ViewState>('browse');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  // Derived Values
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Actions
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    Alert.alert("Added to Cart", `${product.name} was added to your shopping cart.`);
  };

  const updateCartQuantity = (productId: string | number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
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
    });
  };

  const handleBuyNow = (product: Product) => {
    setCheckoutItems([{ product, quantity: 1 }]);
    setViewState('checkout');
  };

  const handleCheckoutCart = () => {
    if (cart.length === 0) return;
    setCheckoutItems([...cart]);
    setViewState('checkout');
  };

  const handlePaymentSuccess = async () => {
    // Generate Invoice Data
    const newInvoice = {
      id: `INV-${1000 + Math.floor(Math.random() * 9000)}`,
      clientName: 'Mobile User', // Default for now
      date: new Date().toISOString().split('T')[0],
      items: checkoutItems.map(item => ({
        id: item.product.id.toString(),
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: checkoutItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
      status: 'paid',
      source: 'product'
    };

    try {
      const orderPayload = {
        totalAmount: checkoutItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
        paymentMethod: 'cash',
        deliveryAddress: 'In-Clinic Pick Up',
        items: checkoutItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity
        }))
      };

      const res = await fetch('http://192.168.100.16:3000/api/orders', {
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

    setCart([]);
    setViewState('active_order');
  };

  const handleOrderReceived = () => {
    setCheckoutItems([]);
    setViewState('browse');
  };

  // ----- RENDERERS -----

  const renderBrowseView = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
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
        <TouchableOpacity style={styles.cartButton} onPress={() => setViewState('cart')}>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3a7d55']} />
        }
      >
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
          <Text style={styles.sectionTitle}>{selectedCategory === 'All' ? 'Available Items' : selectedCategory}</Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map(product => (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, product.stock <= 0 && { opacity: 0.6 }]}
              onPress={() => {
                setSelectedProduct(product);
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
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={[styles.addButton, product.stock <= 0 && { backgroundColor: '#a0aec0' }]}
                  onPress={() => product.stock > 0 && addToCart(product)}
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
      <View style={styles.fullScreenView}>
        <View style={styles.detailHeader}>
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

          <View style={styles.detailContentBox}>
            <View style={styles.detailTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
                <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
              </View>
              <Text style={styles.detailPriceHuge}>₱{selectedProduct.price.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.descLabel}>About this item</Text>
            <Text style={styles.descText}>{selectedProduct.desc}</Text>

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
          </View>
        </ScrollView>

        {/* Action Buttons (Sticky Bottom) */}
        <View style={styles.detailActionContainer}>
          <TouchableOpacity
            style={[styles.detailAddToCartBtn, selectedProduct.stock <= 0 && { borderColor: '#a0aec0', opacity: 0.5 }]}
            onPress={() => selectedProduct.stock > 0 && addToCart(selectedProduct)}
            disabled={selectedProduct.stock <= 0}
          >
            <FontAwesome5 name="cart-plus" size={16} color={selectedProduct.stock <= 0 ? '#a0aec0' : '#2E5E3E'} style={{ marginRight: 8 }} />
            <Text style={[styles.detailAddToCartText, selectedProduct.stock <= 0 && { color: '#a0aec0' }]}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.detailBuyNowBtn, selectedProduct.stock <= 0 && { backgroundColor: '#a0aec0' }]}
            onPress={() => selectedProduct.stock > 0 && handleBuyNow(selectedProduct)}
            disabled={selectedProduct.stock <= 0}
          >
            <Text style={styles.detailBuyNowText}>{selectedProduct.stock <= 0 ? 'Sold Out' : 'Buy Now'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCart = () => {
    const totalCost = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
      <View style={styles.fullScreenView}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewState('browse')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
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
            <ScrollView style={styles.cartScroll} showsVerticalScrollIndicator={false}>
              {cart.map((item, idx) => (
                <View key={idx} style={styles.cartItem}>
                  <View style={[styles.cartItemImage, { backgroundColor: item.product.color + '15', overflow: 'hidden' }]}>
                    {item.product.image ? (
                      <Image source={{ uri: item.product.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    ) : (
                      <FontAwesome5 name={item.product.icon} size={24} color={item.product.color} />
                    )}
                  </View>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>{item.product.name}</Text>
                    <Text style={styles.cartItemPrice}>₱{item.product.price.toFixed(2)}</Text>
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
              ))}
              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.cartBottomContainer}>
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Subtotal</Text>
                <Text style={styles.cartSummaryValue}>₱{totalCost.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckoutCart}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout (₱{totalCost.toFixed(2)})</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderCheckout = () => {
    const totalCost = checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
      <View style={styles.fullScreenView}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setViewState('cart')} style={{ marginRight: 15, padding: 5 }}>
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Processing</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.checkoutScroll}>
          <Text style={styles.checkoutSubtitle}>Scan the QR Code to pay</Text>

          <View style={styles.qrCodeContainer}>
            <View style={styles.qrMockOuter}>
              <FontAwesome5 name="qrcode" size={160} color="#2d3748" />
            </View>
            <Text style={styles.qrAmountText}>Amount Due: <Text style={{ color: '#2E5E3E' }}>₱{totalCost.toFixed(2)}</Text></Text>
          </View>

          <View style={styles.paymentInstructionsBox}>
            <FontAwesome5 name="info-circle" size={16} color="#3182ce" style={{ marginTop: 2 }} />
            <Text style={styles.paymentInstructionsText}>
              Please present this QR code to the front desk via your mobile wallet app or scan it using a compatible kiosk to finalize the purchase.
            </Text>
          </View>

          {/* Demo Button to simulate successful transaction */}
          <TouchableOpacity style={styles.demoPaymentBtn} onPress={handlePaymentSuccess}>
            <FontAwesome5 name="check" size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.demoPaymentBtnText}>[Demo] Simulate Payment Success</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    );
  };

  const renderActiveOrder = () => {
    return (
      <View style={[styles.fullScreenView, { backgroundColor: '#f0fff4' }]}>
        <View style={styles.activeOrderCenter}>
          <View style={styles.successIconCircle}>
            <FontAwesome5 name="check" size={50} color="#38a169" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>Your order is confirmed and is now being prepared.</Text>

          <View style={styles.pickupCard}>
            <FontAwesome5 name="store" size={24} color="#4a5568" style={{ marginBottom: 10 }} />
            <Text style={styles.pickupCardTitle}>Ready for Pick-up</Text>
            <Text style={styles.pickupCardDesc}>Please proceed to the FurEver pick-up counter. Show your name to the staff to receive your items.</Text>
          </View>

          <TouchableOpacity style={styles.markReceivedBtn} onPress={handleOrderReceived}>
            <Text style={styles.markReceivedText}>I've Picked Up My Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {viewState === 'browse' && renderBrowseView()}
      {viewState === 'detail' && renderProductDetail()}
      {viewState === 'cart' && renderCart()}
      {viewState === 'checkout' && renderCheckout()}
      {viewState === 'active_order' && renderActiveOrder()}
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
  productCategory: { fontSize: 11, color: '#718096', marginBottom: 4, fontFamily: 'Montserrat-Medium' },
  productName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', color: '#2d3748', marginBottom: 8, height: 40 },
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
  checkoutScroll: { padding: 20, alignItems: 'center' },
  checkoutSubtitle: { fontSize: 16, color: '#4a5568', marginBottom: 30, fontFamily: 'Montserrat-Regular' },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    width: '100%',
  },
  qrMockOuter: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  qrAmountText: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#2d3748' },
  paymentInstructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#ebf8ff',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    gap: 12,
  },
  paymentInstructionsText: { flex: 1, fontSize: 13, color: '#2b6cb0', lineHeight: 20, fontFamily: 'Montserrat-Regular' },
  demoPaymentBtn: {
    flexDirection: 'row',
    backgroundColor: '#38a169',
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  demoPaymentBtnText: { color: 'white', fontSize: 15, fontFamily: 'Montserrat-Bold' },

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
  successTitle: { fontSize: 24, fontFamily: 'Catcut', color: '#2D5016', marginBottom: 10 },
  successDesc: { fontSize: 15, color: '#2D5016', textAlign: 'center', marginBottom: 40, fontFamily: 'Montserrat-Regular' },
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
});
