import React, { useState, useRef, useContext, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  TextInput as RNTextInput, 
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from "react-native";
import { 
  Appbar, 
  Card, 
  Text, 
  TextInput, 
  Button, 
  Menu, 
  Divider, 
  useTheme 
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { ProductContext } from '../providers/ProductProvider';

const { width } = Dimensions.get('window');

const ProductsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    products,
    loading,
    fetchProducts,
    handlePurchase,
    handleSale,
    handleUpdateProduct,
    deleteProduct
  } = useContext(ProductContext);
console.log(loading);
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("name");
  const [longPressedItem, setLongPressedItem] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuAnchorRef = useRef(null);

  // Modal states
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form states
  const [buyQuantity, setBuyQuantity] = useState("1");
  const [saleQuantity, setSaleQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("0");
  const [updatedProduct, setUpdatedProduct] = useState({
    name: '',
    price: '0',
    stock: '0',
    packSize: '',
    unit: ''
  });

  const sortOptions = [
    { label: "Name (A-Z)", value: "name" },
    { label: "Price (Low-High)", value: "priceAsc" },
    { label: "Price (High-Low)", value: "priceDesc" },
    { label: "Stock (Low-High)", value: "stockAsc" },
    { label: "Stock (High-Low)", value: "stockDesc" }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortOption) {
        case 'name': return a.name.localeCompare(b.name);
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'stockAsc': return a.stock - b.stock;
        case 'stockDesc': return b.stock - a.stock;
        default: return 0;
      }
    });

  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const calculateSaleTotal = () => {
    return (parseInt(saleQuantity) * parseInt(salePrice)) || 0;
  };

  const calculateBuyTotal = () => {
    return (parseInt(buyQuantity) * (selectedProduct?.price || 0)) || 0;
  };

  const openBuyModal = (product) => {
    setSelectedProduct(product);
    setBuyQuantity("1");
    setBuyModalVisible(true);
    setLongPressedItem(null);
  };

  const openSaleModal = (product) => {
    setSelectedProduct(product);
    setSaleQuantity("1");
    setSalePrice(product.price.toString());
    setSaleModalVisible(true);
    setLongPressedItem(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setUpdatedProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      packSize: product.packSize,
      unit: product.unit
    });
    setEditModalVisible(true);
    setLongPressedItem(null);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(productToDelete);
      setShowDeleteConfirm(false);
      setLongPressedItem(null);
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', error.message || 'Failed to delete product');
    }
  };

  const submitPurchase = async () => {
    try {
      const quantity = parseInt(buyQuantity);
      const unitCost = selectedProduct.price;

      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Invalid quantity');
      }

      await handlePurchase(selectedProduct._id, quantity, unitCost);
      setBuyModalVisible(false);
      Keyboard.dismiss();
      Alert.alert('Success', 'Purchase recorded successfully!');
      await fetchProducts();
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Failed to record purchase');
    }
  };

  const submitSale = async () => {
    try {
      await handleSale(
        selectedProduct._id, 
        parseInt(saleQuantity),
        parseInt(salePrice),
        parseInt(selectedProduct.price)
      );
      setSaleModalVisible(false);
      Keyboard.dismiss();
      await fetchProducts();
    } catch (error) {
      console.error("Sale error:", error);
      Alert.alert('Error', error.message || 'Failed to record sale');
    }
  };

  const submitEdit = async () => {
    try {
      await handleUpdateProduct(selectedProduct._id, {
        name: updatedProduct.name,
        price: parseInt(updatedProduct.price),
        stock: parseInt(updatedProduct.stock),
        packSize: updatedProduct.packSize,
        unit: updatedProduct.unit
      });
      setEditModalVisible(false);
      Keyboard.dismiss();
      await fetchProducts();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert('Error', error.message || 'Failed to update product');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (longPressedItem === item._id) {
          setLongPressedItem(null);
        }
      }}
      onLongPress={() => setLongPressedItem(item._id)}
      activeOpacity={0.9}
      delayLongPress={300}
    >
      <Card style={styles.productCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
              {item.name} {item.packSize}{item.unit}
            </Text>
            <View style={styles.productDetails}>
              <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.productStock}>stock : {item.stock}</Text>
            </View>
          </View>
          
          {longPressedItem === item._id ? (
            <View style={styles.editDeleteActions}>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={[styles.actionButton, styles.editButton]}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setProductToDelete(item._id);
                  setShowDeleteConfirm(true);
                }}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productActions}>
              <TouchableOpacity
                onPress={() => openBuyModal(item)}
                style={[styles.actionButton, styles.buyButton]}
              >
                <Text style={styles.actionButtonText}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openSaleModal(item)}
                style={[styles.actionButton, styles.sellButton]}
              >
                <Text style={styles.actionButtonText}>SELL</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.safeContainer}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content 
            title="All Products" 
            titleStyle={styles.appbarTitle}
          />
          <Appbar.Action 
            icon="plus" 
            onPress={() => navigation.navigate('AddProduct')} 
          />
        </Appbar.Header>

        <View style={styles.searchSortContainer}>
          <TextInput
            mode="outlined"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { flex: 3 }]}
            left={<TextInput.Icon icon="magnify" />}
            right={searchQuery && <TextInput.Icon icon="close" onPress={() => setSearchQuery("")} />}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />

          <Menu
            visible={sortVisible}
            onDismiss={() => setSortVisible(false)}
            anchor={
              <Button
                ref={menuAnchorRef}
                onPress={() => setSortVisible(true)}
                mode="outlined"
                style={[styles.sortButton, { flex: 1 }]}
                icon="sort"
                contentStyle={{ flexDirection: "row-reverse" }}
                textColor={theme.colors.primary}
              >
                Sort
              </Button>
            }
          >
            {sortOptions.map((option, index) => (
              <View key={option.value}>
                <Menu.Item
                  leadingIcon={sortOption === option.value ? "check" : null}
                  onPress={() => {
                    setSortOption(option.value);
                    setSortVisible(false);
                  }}
                  title={option.label}
                />
                {index < sortOptions.length - 1 && <Divider />}
              </View>
            ))}
          </Menu>
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshing={loading}
          onRefresh={fetchProducts}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="package-variant-remove" size={60} color="#888" />
              <Text style={styles.emptyText}>
                {searchQuery ? "No matching products found" : "No products available"}
              </Text>
            </View>
          }
        />

        {/* Buy Modal */}
        <Modal visible={buyModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.modalTitle}>Purchase Product</Text>
                <Text style={styles.modalSubtitle}>{selectedProduct?.name}</Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Quantity</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => setBuyQuantity(Math.max(1, parseInt(buyQuantity || '1') - 1).toString())}
                      style={styles.quantityButton}
                    >
                      <MaterialCommunityIcons name="minus" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <RNTextInput
                      style={styles.quantityInput}
                      value={buyQuantity}
                      onChangeText={(text) => setBuyQuantity(text.replace(/[^0-9]/g, '') || "1")}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      onPress={() => setBuyQuantity((parseInt(buyQuantity || '1') + 1).toString())}
                      style={styles.quantityButton}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Unit Cost</Text>
                  <TextInput
                    mode="outlined"
                    value={selectedProduct?.price?.toString()}
                    onChangeText={(text) => {
                      const newPrice = text.replace(/[^0-9]/g, '') || "0";
                      setSelectedProduct(prev => ({
                        ...prev,
                        price: parseInt(newPrice)
                      }));
                    }}
                    keyboardType="numeric"
                    left={<TextInput.Affix text="৳" />}
                    style={styles.priceInput}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Total Purchase Value</Text>
                  <Text style={[styles.totalValue, { color: '#FF9800' }]}>{formatCurrency(calculateBuyTotal())}</Text>
                </View>

                <View style={styles.modalButtons}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setBuyModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={loading}
                    mode="contained" 
                    onPress={submitPurchase}
                    style={styles.submitButton}
                    buttonColor="#FF9800"
                    loading={loading}
                  >
                    Confirm Purchase
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Sale Modal */}
        <Modal visible={saleModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.modalTitle}>Sell Product</Text>
                <Text style={styles.modalSubtitle}>{selectedProduct?.name}</Text>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Quantity</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => setSaleQuantity(Math.max(1, parseInt(saleQuantity) - 1).toString())}
                      style={styles.quantityButton}
                    >
                      <MaterialCommunityIcons name="minus" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <RNTextInput
                      style={styles.quantityInput}
                      value={saleQuantity}
                      onChangeText={(text) => setSaleQuantity(text.replace(/[^0-9]/g, '') || "1")}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      onPress={() => setSaleQuantity((parseInt(saleQuantity) + 1).toString())}
                      style={styles.quantityButton}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Sale Price (per unit)</Text>
                  <TextInput
                    mode="outlined"
                    value={salePrice}
                    onChangeText={(text) => setSalePrice(text.replace(/[^0-9]/g, '') || "0")}
                    keyboardType="numeric"
                    left={<TextInput.Affix text="৳" />}
                    style={styles.priceInput}
                  />
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Total Sale Value</Text>
                  <Text style={[styles.totalValue, { color: '#4CAF50' }]}>{formatCurrency(calculateSaleTotal())}</Text>
                </View>

                <View style={styles.modalButtons}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setSaleModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={loading}
                    mode="contained" 
                    onPress={submitSale}
                    style={styles.submitButton}
                    buttonColor="#4CAF50"
                    loading={loading}
                  >
                    Confirm Sale
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={editModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.modalTitle}>Edit Product</Text>
                
                <TextInput
                  label="Product Name"
                  value={updatedProduct.name}
                  onChangeText={(text) => setUpdatedProduct({...updatedProduct, name: text})}
                  mode="outlined"
                  style={styles.editInput}
                />
                
                <TextInput
                  label="Price"
                  value={updatedProduct.price}
                  onChangeText={(text) => setUpdatedProduct({...updatedProduct, price: text.replace(/[^0-9]/g, '') || "0"})}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Affix text="৳" />}
                  style={styles.editInput}
                />
                
                <TextInput
                  label="Stock Quantity"
                  value={updatedProduct.stock}
                  onChangeText={(text) => setUpdatedProduct({...updatedProduct, stock: text.replace(/[^0-9]/g, '') || "0"})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.editInput}
                />
                
                <View style={styles.rowInputs}>
                  <TextInput
                    label="Pack Size"
                    value={updatedProduct.packSize}
                    onChangeText={(text) => setUpdatedProduct({...updatedProduct, packSize: text})}
                    mode="outlined"
                    style={[styles.editInput, { flex: 1, marginRight: 8 }]}
                  />
                  <TextInput
                    label="Unit"
                    value={updatedProduct.unit}
                    onChangeText={(text) => setUpdatedProduct({...updatedProduct, unit: text})}
                    mode="outlined"
                    style={[styles.editInput, { flex: 1 }]}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setEditModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={submitEdit}
                    style={styles.submitButton}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <Modal visible={showDeleteConfirm} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
              <Text style={styles.modalTitle}>Delete Product</Text>
              <Text style={styles.modalText}>Are you sure you want to delete this product? This action cannot be undone.</Text>
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setLongPressedItem(null);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleDelete}
                  style={styles.submitButton}
                  buttonColor="#F44336"
                  loading={loading}
                >
                  Delete
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  appbar: {
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 0,
  },
  searchSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    zIndex: 1,
    gap: 5
  },
  searchInput: {
    height: 48,
    borderRadius: 8,
  },
  sortButton: {
    height: 48,
    justifyContent: "center",
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    maxWidth: '90%',
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  productPack: {
    fontSize: 14,
    color: '#888',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editDeleteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: "#fff", 
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#FF9800',
  },
  sellButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 500,
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    height: 40,
    padding: 0,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceInput: {
    marginTop: 8,
  },
  editInput: {
    marginBottom: 16,
    borderRadius: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    borderColor: '#999',
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
  },
});

export default ProductsScreen;