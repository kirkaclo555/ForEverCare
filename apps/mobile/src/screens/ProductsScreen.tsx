import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert
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
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  color: string;
  desc: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type ViewState = 'browse' | 'detail' | 'cart' | 'checkout' | 'active_order';

export default function ProductsScreen({ navigation }: Props) {
  // Mock Database
  const products: Product[] = [
    { id: 1, name: 'Premium Dog Food, 5kg', price: 35.00, category: 'Food', icon: 'bone', color: '#dd6b20', desc: 'High quality protein-rich kibble designed for adult dogs. Supports digestion and a shiny coat.' },
    { id: 2, name: 'Joint Care Supplements', price: 28.00, category: 'Supplements', icon: 'capsules', color: '#3182ce', desc: 'Glucosamine and Chondroitin blend. Highly recommended for senior pets to support mobility.' },
    { id: 3, name: 'Worming Medicine', price: 15.00, category: 'Medicine', icon: 'prescription-bottle-alt', color: '#e53e3e', desc: 'Broad-spectrum deworming tablets. Please administer strictly as directed by your vet.' },
    { id: 4, name: 'Cozy Dog Sweater', price: 22.00, category: 'Clothes', icon: 'tshirt', color: '#805ad5', desc: 'Soft fleece sweater perfect for chilly morning walks. Available in multiple sizes.' },
    { id: 5, name: 'Interactive Cat Wand', price: 12.50, category: 'Toys', icon: 'cat', color: '#38a169', desc: 'Feather wand with a sturdy handle to keep your feline active and engaged.' },
    { id: 6, name: 'Oatmeal Pet Shampoo', price: 18.00, category: 'Grooming', icon: 'pump-medical', color: '#2b6cb0', desc: 'Gentle, soothing oatmeal formula for pets with sensitive skin.' },
  ];

  const categories = ['All', 'Supplements', 'Medicine', 'Clothes', 'Food', 'Toys', 'Grooming'];

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

  const updateCartQuantity = (productId: number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQ = item.quantity + delta;
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

  const handlePaymentSuccess = () => {
    // If the items being checked out were from the cart, clear the cart.
    // For simplicity, we just clear the whole cart assuming checkout processes everything.
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

      <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
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
              style={styles.productCard}
              onPress={() => {
                setSelectedProduct(product);
                setViewState('detail');
              }}
            >
              <View style={[styles.productImagePlaceholder, { backgroundColor: product.color + '15' }]}>
                <FontAwesome5 name={product.icon} size={35} color={product.color} />
              </View>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>₱{product.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addToCart(product)}
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
          <View style={[styles.detailHeroImage, { backgroundColor: selectedProduct.color + '15' }]}>
            <FontAwesome5 name={selectedProduct.icon} size={80} color={selectedProduct.color} />
          </View>

          <View style={styles.detailContentBox}>
            <View style={styles.detailTitleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
                <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
              </View>
              <Text style={styles.detailPriceHuge}>${selectedProduct.price.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.descLabel}>About this item</Text>
            <Text style={styles.descText}>{selectedProduct.desc}</Text>

            <View style={styles.stockBadge}>
              <FontAwesome5 name="check-circle" size={14} color="#38a169" />
              <Text style={styles.stockBadgeText}>In Stock at Clinic</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons (Sticky Bottom) */}
        <View style={styles.detailActionContainer}>
          <TouchableOpacity
            style={styles.detailAddToCartBtn}
            onPress={() => addToCart(selectedProduct)}
          >
            <FontAwesome5 name="cart-plus" size={16} color="#2E5E3E" style={{ marginRight: 8 }} />
            <Text style={styles.detailAddToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailBuyNowBtn}
            onPress={() => handleBuyNow(selectedProduct)}
          >
            <Text style={styles.detailBuyNowText}>Buy Now</Text>
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
              <Text style={{ color: 'white', fontWeight: '600' }}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartScroll} showsVerticalScrollIndicator={false}>
              {cart.map((item, idx) => (
                <View key={idx} style={styles.cartItem}>
                  <View style={[styles.cartItemImage, { backgroundColor: item.product.color + '15' }]}>
                    <FontAwesome5 name={item.product.icon} size={24} color={item.product.color} />
                  </View>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>{item.product.name}</Text>
                    <Text style={styles.cartItemPrice}>${item.product.price.toFixed(2)}</Text>
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
                <Text style={styles.cartSummaryValue}>${totalCost.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckoutCart}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout (${totalCost.toFixed(2)})</Text>
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
            <Text style={styles.qrAmountText}>Amount Due: <Text style={{ color: '#2E5E3E' }}>${totalCost.toFixed(2)}</Text></Text>
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
  safeArea: { flex: 1, backgroundColor: '#f7fafc' },
  // Browse View Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
  headerSubtitle: { fontSize: 13, color: '#c6f6d5', marginTop: 2 },
  cartButton: {
    backgroundColor: '#cbd5e0',
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
    backgroundColor: '#e53e3e',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  cartBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  categoryChipActive: { backgroundColor: '#2d3748', borderColor: '#2d3748' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: '#4a5568' },
  categoryChipTextActive: { color: 'white' },
  promoBanner: {
    marginHorizontal: 15,
    backgroundColor: '#2E5E3E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promoContent: { zIndex: 1 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 6, lineHeight: 24 },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  productImagePlaceholder: {
    height: 120,
    backgroundColor: '#edf2f7',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCategory: { fontSize: 11, color: '#718096', marginBottom: 4, fontWeight: '500' },
  productName: { fontSize: 14, fontWeight: '600', color: '#2d3748', marginBottom: 8, height: 40 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#2E5E3E' },
  addButton: {
    backgroundColor: '#2d3748',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Full Screen Views Common
  fullScreenView: { flex: 1, backgroundColor: '#f7fafc' },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E5E3E',
    borderBottomWidth: 0,
  },
  backIconButton: {
    width: 40, height: 40,
    justifyContent: 'center',
  },
  screenHeading: { fontSize: 18, fontWeight: '700', color: '#2d3748' },
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
  detailCategory: { fontSize: 13, color: '#718096', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  detailTitle: { fontSize: 24, fontWeight: '700', color: '#2d3748', lineHeight: 30 },
  detailPriceHuge: { fontSize: 28, fontWeight: '700', color: '#2E5E3E' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  descLabel: { fontSize: 16, fontWeight: '700', color: '#2d3748', marginBottom: 10 },
  descText: { fontSize: 15, color: '#4a5568', lineHeight: 22, opacity: 0.9 },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 20,
  },
  stockBadgeText: { fontSize: 13, color: '#2f855a', fontWeight: '600', marginLeft: 6 },

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
    borderColor: '#2E5E3E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  detailAddToCartText: { fontSize: 15, fontWeight: '700', color: '#2E5E3E' },
  detailBuyNowBtn: {
    flex: 1,
    backgroundColor: '#2E5E3E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  detailBuyNowText: { fontSize: 15, fontWeight: '700', color: 'white' },

  // Cart View
  emptyCartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyCartTitle: { fontSize: 20, fontWeight: '700', color: '#2d3748', marginBottom: 8 },
  emptyCartSub: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  shopNowBtn: { backgroundColor: '#2E5E3E', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },

  cartScroll: { flex: 1, paddingHorizontal: 20 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  cartItemImage: { width: 60, height: 60, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cartItemDetails: { flex: 1 },
  cartItemName: { fontSize: 14, fontWeight: '600', color: '#2d3748', marginBottom: 4 },
  cartItemPrice: { fontSize: 15, fontWeight: '700', color: '#2E5E3E' },
  cartQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: '#2d3748', width: 20, textAlign: 'center' },

  cartBottomContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  cartSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  cartSummaryLabel: { fontSize: 16, color: '#4a5568', fontWeight: '600' },
  cartSummaryValue: { fontSize: 20, fontWeight: '700', color: '#2d3748' },
  checkoutBtn: {
    backgroundColor: '#2d3748',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // Checkout View
  checkoutScroll: { padding: 20, alignItems: 'center' },
  checkoutSubtitle: { fontSize: 16, color: '#4a5568', marginBottom: 30 },
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
  qrAmountText: { fontSize: 18, fontWeight: '700', color: '#2d3748' },
  paymentInstructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#ebf8ff',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    gap: 12,
  },
  paymentInstructionsText: { flex: 1, fontSize: 13, color: '#2b6cb0', lineHeight: 20 },
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
  demoPaymentBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },

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
    backgroundColor: '#c6f6d5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#22543d', marginBottom: 10 },
  successDesc: { fontSize: 15, color: '#2f855a', textAlign: 'center', marginBottom: 40 },
  pickupCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 40,
  },
  pickupCardTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748', marginBottom: 8 },
  pickupCardDesc: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22 },
  markReceivedBtn: {
    backgroundColor: '#2E5E3E',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  markReceivedText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
