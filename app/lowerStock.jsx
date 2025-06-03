import React, { useState, useRef, useContext,useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput as RNTextInput, Alert } from "react-native";
import { Appbar, Card, Text, TextInput, Button, Menu, Divider, useTheme, Badge } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ProductContext } from '../providers/ProductProvider';

const LowStockScreen = () => {
  const theme = useTheme();
  const {
    products,
    loading,
    fetchProducts,
    handlePurchase
  } = useContext(ProductContext);

  useEffect(() => {
    fetchProducts();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("stockAsc");
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState("1");
  const menuAnchorRef = useRef(null);

  const sortOptions = [
    { label: "Stock (Low-High)", value: "stockAsc" },
    { label: "Stock (High-Low)", value: "stockDesc" },
    { label: "Price (Low-High)", value: "priceAsc" },
    { label: "Price (High-Low)", value: "priceDesc" },
    { label: "Name (A-Z)", value: "nameAsc" },
    { label: "Name (Z-A)", value: "nameDesc" }
  ];

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);

  const filteredProducts = lowStockProducts
    .filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch(sortOption) {
        case 'stockAsc': return a.stock - b.stock;
        case 'stockDesc': return b.stock - a.stock;
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'nameAsc': return a.name.localeCompare(b.name);
        case 'nameDesc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  const formatCurrency = (amount) => `৳${amount?.toLocaleString('en-IN') || '0'}`;

  const calculateBuyTotal = () => (parseInt(buyQuantity) * (selectedProduct?.price || 0)) || 0;

  const openBuyModal = (product) => {
    setSelectedProduct(product);
    setBuyQuantity("1");
    setBuyModalVisible(true);
  };

  const handleBuySubmit = async () => {
    try {
      await handlePurchase(
        selectedProduct._id,
        parseInt(buyQuantity),
        selectedProduct.price
      );
      setBuyModalVisible(false);
      await fetchProducts();
      Alert.alert('Success', 'Purchase recorded successfully!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to record purchase');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.productCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.onSurface }]}>{item.name}</Text>
          <View style={styles.productDetails}>
            <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
              {formatCurrency(item.price)}
            </Text>
            <Badge style={[styles.stockBadge, { backgroundColor: '#FF9800' }]}>
              {item.stock} left
            </Badge>
            <Text style={[styles.productPack, { color: theme.colors.onSurfaceVariant }]}>
              {item.packSize} {item.unit}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => openBuyModal(item)}
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
        >
          <MaterialCommunityIcons name="cart-arrow-down" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={[styles.appbar, { backgroundColor: theme.colors.surface }]}>
        <Appbar.Content 
          title="Low Stock (≤5)" 
          titleStyle={[styles.appbarTitle, { color: theme.colors.onSurface }]}
        />
      </Appbar.Header>

      <View style={[styles.searchSortContainer, { backgroundColor: theme.colors.background }]}>
        <TextInput
          mode="outlined"
          placeholder="Search low stock..."
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
          {sortOptions.map((option) => (
            <Menu.Item
              key={option.value}
              leadingIcon={sortOption === option.value ? "check" : null}
              onPress={() => {
                setSortOption(option.value);
                setSortVisible(false);
              }}
              title={option.label}
            />
          ))}
        </Menu>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchProducts}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="package-variant" 
              size={60} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery ? "No matching low stock items" : "No low stock products"}
            </Text>
          </View>
        }
      />

      <Modal visible={buyModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Purchase Product</Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {selectedProduct?.name} (Only {selectedProduct?.stock} left)
            </Text>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => setBuyQuantity(Math.max(1, parseInt(buyQuantity || '1')) - 1)}
                  style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
                >
                  <MaterialCommunityIcons name="minus" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <RNTextInput
                  style={[styles.quantityInput, { 
                    borderColor: theme.colors.outline,
                    color: theme.colors.onSurface 
                  }]}
                  value={buyQuantity}
                  onChangeText={(text) => setBuyQuantity(text.replace(/[^0-9]/g, '') || "1")}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={() => setBuyQuantity((parseInt(buyQuantity || '1') + 1).toString())}
                  style={[styles.quantityButton, { borderColor: theme.colors.outline }]}
                >
                  <MaterialCommunityIcons name="plus" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>Unit Cost</Text>
              <TextInput
                mode="outlined"
                value={selectedProduct?.price?.toString()}
                disabled
                style={styles.priceInput}
                left={<TextInput.Affix text="৳" />}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.modalLabel, { color: theme.colors.onSurfaceVariant }]}>Total Purchase Value</Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                {formatCurrency(calculateBuyTotal())}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setBuyModalVisible(false)}
                style={styles.cancelButton}
                textColor={theme.colors.onSurface}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleBuySubmit}
                style={styles.submitButton}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                loading={loading}
              >
                Confirm Purchase
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    elevation: 2,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    height: 48,
    borderRadius: 8,
  },
  sortButton: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  productCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  stockBadge: {
    marginRight: 12,
  },
  productPack: {
    fontSize: 14,
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
    borderRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
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
    borderRadius: 8,
  },
  quantityInput: {
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    padding: 0,
  },
  priceInput: {
    marginTop: 8,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
  },
});

export default LowStockScreen;