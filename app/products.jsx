import { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Modal, FlatList, TextInput as RNTextInput, Keyboard,TouchableWithoutFeedback } from "react-native";
import { Appbar, Card, Text, TextInput, Button, Menu, Divider, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const ProductsScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("name");
  const menuAnchorRef = useRef(null);

  // Modals state
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

  // Static product data
  const [productsData, setProductsData] = useState([
    {
      id: 1,
      name: "Premium Coffee Beans",
      price: 1299,
      stock: 45,
      packSize: "500g",
      unit: "bag"
    },
    {
      id: 2,
      name: "Organic Green Tea",
      price: 850,
      stock: 32,
      packSize: "100g",
      unit: "box"
    },
    {
      id: 3,
      name: "Chocolate Cookies",
      price: 499,
      stock: 78,
      packSize: "250g",
      unit: "pack"
    },
    {
      id: 4,
      name: "Olive Oil",
      price: 1575,
      stock: 23,
      packSize: "1L",
      unit: "bottle"
    }
  ]);

  const sortOptions = [
    { label: "Name (A-Z)", value: "name" },
    { label: "Price (Low-High)", value: "priceAsc" },
    { label: "Price (High-Low)", value: "priceDesc" },
    { label: "Stock (Low-High)", value: "stockAsc" },
    { label: "Stock (High-Low)", value: "stockDesc" }
  ];

  // Filter and sort products
  const filteredProducts = productsData
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

  // Format currency
  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString('en-IN') || '0'}`;
  };

  // Calculate totals
  const calculateSaleTotal = () => {
    return (parseInt(saleQuantity) * parseInt(salePrice)) || 0;
  };

  const calculateBuyTotal = () => {
    return (parseInt(buyQuantity) * (selectedProduct?.price || 0)) || 0;
  };

  // Modal handlers
  const openBuyModal = (product) => {
    setSelectedProduct(product);
    setBuyQuantity("1");
    setBuyModalVisible(true);
  };

  const openSaleModal = (product) => {
    setSelectedProduct(product);
    setSaleQuantity("1");
    setSalePrice(product.price.toString());
    setSaleModalVisible(true);
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
  };

  // Submit handlers
  const handleBuySubmit = () => {
    // Update stock in productsData
    const updatedProducts = productsData.map(p => 
      p.id === selectedProduct.id 
        ? {...p, stock: p.stock + parseInt(buyQuantity)} 
        : p
    );
    setProductsData(updatedProducts);
    setBuyModalVisible(false);
    Keyboard.dismiss();
  };

  const handleSaleSubmit = () => {
    // Update stock in productsData
    const updatedProducts = productsData.map(p => 
      p.id === selectedProduct.id 
        ? {...p, stock: Math.max(0, p.stock - parseInt(saleQuantity))} 
        : p
    );
    setProductsData(updatedProducts);
    setSaleModalVisible(false);
    Keyboard.dismiss();
  };

  const handleEditSubmit = () => {
    // Update product in productsData
    const updatedProducts = productsData.map(p => 
      p.id === selectedProduct.id 
        ? {
            ...p, 
            name: updatedProduct.name,
            price: parseInt(updatedProduct.price) || 0,
            stock: parseInt(updatedProduct.stock) || 0,
            packSize: updatedProduct.packSize,
            unit: updatedProduct.unit
          } 
        : p
    );
    setProductsData(updatedProducts);
    setEditModalVisible(false);
    Keyboard.dismiss();
  };

  // Render item with long press
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {}}
      onLongPress={() => openEditModal(item)}
      activeOpacity={0.9}
    >
      <Card style={styles.productCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.productDetails}>
              <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.productStock}>{item.stock} pcs</Text>
              <Text style={styles.productPack}>{item.packSize} {item.unit}</Text>
            </View>
          </View>
          
          <View style={styles.productActions}>
            <TouchableOpacity
              onPress={() => openBuyModal(item)}
              style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            >
            <Text style={{color : "#fff", fontSize : 10}}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openSaleModal(item)}
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            >
             <Text style={{color : "#fff",fontSize : 10}}>SELL</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.safeContainer}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content 
            title="All Products" 
            titleStyle={styles.appbarTitle}
          />
        </Appbar.Header>

        {/* Fixed Search/Sort Header */}
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

        {/* Product List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
                      onPress={() => setBuyQuantity(Math.max(1, parseInt(buyQuantity) - 1).toString())}
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
                      onPress={() => setBuyQuantity((parseInt(buyQuantity) + 1).toString())}
                      style={styles.quantityButton}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Unit Price</Text>
                  <Text style={styles.priceText}>{formatCurrency(selectedProduct?.price)}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Total Purchase Value</Text>
                  <Text style={styles.totalValue}>{formatCurrency(calculateBuyTotal())}</Text>
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
                    mode="contained" 
                    onPress={handleBuySubmit}
                    style={styles.submitButton}
                    buttonColor="#FF9800"
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
                    mode="contained" 
                    onPress={handleSaleSubmit}
                    style={styles.submitButton}
                    buttonColor="#4CAF50"
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
                    onPress={handleEditSubmit}
                    style={styles.submitButton}
                  >
                    Save Changes
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  productPack: {
    fontSize: 14,
    color: '#888',
  },
  productActions: {
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