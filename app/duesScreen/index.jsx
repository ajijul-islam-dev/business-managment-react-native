import React, { useState, useRef, useContext, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { 
  Appbar, 
  Text, 
  TextInput, 
  Button, 
  Menu, 
  Divider, 
  Card, 
  useTheme, 
  Badge,
  ActivityIndicator,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CustomerContext } from '../../providers/CustomerProvider';

const DuesScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const {
    customers,
    loading,
    error,
    createCustomer,
    refreshCustomers,
    addDue
  } = useContext(CustomerContext);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("name");
  const [addDueModalVisible, setAddDueModalVisible] = useState(false);
  const [newDue, setNewDue] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    initialAmount: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const menuAnchorRef = useRef(null);

  // Calculate totals
  const { totalCustomers, totalDue, totalPaid } = useMemo(() => {
    return {
      totalCustomers: customers.length,
      totalDue: customers.reduce((sum, c) => sum + (c.dueValue || 0), 0),
      totalPaid: customers.reduce((sum, c) => sum + (c.totalPaid || 0), 0)
    };
  }, [customers]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      )
      .sort((a, b) => {
        switch(sortOption) {
          case 'name': return a.name.localeCompare(b.name);
          case 'amountAsc': return a.dueValue - b.dueValue;
          case 'amountDesc': return b.dueValue - a.dueValue;
          case 'recent': 
            const aDays = parseInt(a.lastPayment?.split(' ')[0]) || Infinity;
            const bDays = parseInt(b.lastPayment?.split(' ')[0]) || Infinity;
            return aDays - bDays;
          default: return 0;
        }
      });
  }, [customers, searchQuery, sortOption]);

  const sortOptions = useMemo(() => [
    { label: "Name (A-Z)", value: "name" },
    { label: "Due Amount (Low-High)", value: "amountAsc" },
    { label: "Due Amount (High-Low)", value: "amountDesc" },
    { label: "Recent Payment", value: "recent" }
  ], []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return `৳${amount?.toLocaleString('en-IN') || '0'}`;
  }, []);

  const handleAddDue = async () => {
    try {
      setCreateLoading(true);
      if (!newDue.name || !newDue.phone || !newDue.initialAmount) {
        throw new Error('Please fill all required fields');
      }

      const customerData = {
        name: newDue.name,
        phone: newDue.phone,
        address: newDue.address,
        initialAmount: newDue.initialAmount,
        notes: newDue.notes
      };

      const createdCustomer = await createCustomer(customerData);
      
      if (parseInt(newDue.initialAmount) > 0) {
        await addDue(createdCustomer._id, {
          amount: parseInt(newDue.initialAmount),
          note: 'Initial due amount'
        });
      }

      setAddDueModalVisible(false);
      setNewDue({
        name: "",
        phone: "",
        address: "",
        notes: "",
        initialAmount: ""
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCallCustomer = useCallback((phone) => {
    Alert.alert('Call', `Would you like to call ${phone}?`);
  }, []);

  const handleMessageCustomer = useCallback((phone) => {
    Alert.alert('Message', `Would you like to message ${phone}?`);
  }, []);

  const renderItem = ({ item }) => {
    return (
      <Card style={[styles.dueCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.dueHeader}>
            <Text style={[styles.dueName, { color: theme.colors.onSurface }]}>{item.name}</Text>
            <Badge 
              style={[styles.dueBadge, { 
                backgroundColor: item.dueValue > 10000 ? '#F44336' : 
                               item.dueValue > 0 ? '#FF9800' : '#4CAF50' 
              }]}
              textStyle={styles.dueBadgeText}
            >
              {formatCurrency(item.dueValue)}
            </Badge>
          </View>
          
          <View style={styles.dueDetails}>
            <View style={styles.dueDetailRow}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={theme.colors.onSurfaceVariant} 
                style={styles.detailIcon}
              />
              <Text style={[styles.dueText, { color: theme.colors.onSurfaceVariant }]}>
                {item.address || 'No address provided'}
              </Text>
            </View>
            
            <View style={styles.dueDetailRow}>
              <MaterialCommunityIcons 
                name="phone" 
                size={16} 
                color={theme.colors.onSurfaceVariant} 
                style={styles.detailIcon}
              />
              <Text style={[styles.dueText, { color: theme.colors.onSurfaceVariant }]}>
                {item.phone}
              </Text>
            </View>
            
            {item.lastPayment && (
              <View style={styles.dueDetailRow}>
                <MaterialCommunityIcons 
                  name="clock" 
                  size={16} 
                  color={theme.colors.onSurfaceVariant} 
                  style={styles.detailIcon}
                />
                <Text style={[styles.dueText, { color: theme.colors.onSurfaceVariant }]}>
                  Last payment: {item.lastPayment}
                </Text>
              </View>
            )}
            
            <View style={styles.dueDetailRow}>
              <MaterialCommunityIcons 
                name="cash" 
                size={16} 
                color={theme.colors.onSurfaceVariant} 
                style={styles.detailIcon}
              />
              <Text style={[styles.dueText, { color: theme.colors.onSurfaceVariant }]}>
                Total paid: {formatCurrency(item.totalPaid || 0)}
              </Text>
            </View>
          </View>
          
          <View style={styles.dueActions}>
            <TouchableOpacity
              onPress={() => handleCallCustomer(item.phone)}
              style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="phone" 
                size={20} 
                color={theme.colors.onPrimaryContainer} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                router.push(`/duesScreen/${item._id}`);
              }}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="arrow-right" 
                size={20} 
                color={theme.colors.onPrimary} 
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && customers.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={[styles.errorText, { color: theme.colors.onSurface }]}>
          {error}
        </Text>
        <Button 
          mode="contained" 
          onPress={refreshCustomers}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header style={[styles.appbar, { backgroundColor: theme.colors.surface }]}>
            <Appbar.Content 
              title="Dues Collection" 
              titleStyle={[styles.appbarTitle, { color: theme.colors.onSurface }]}
            />
            <Appbar.Action 
              icon="plus" 
              onPress={() => setAddDueModalVisible(true)} 
            />
          </Appbar.Header>

          {/* Search and Sort Header */}
          <View style={[styles.searchSortContainer, { backgroundColor: theme.colors.background }]}>
            <TextInput
              mode="outlined"
              autoFocus={false}
              placeholder="Search by name or phone..."
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

          {/* Summary Bar */}
          <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Customers
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {totalCustomers}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Due
              </Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                {formatCurrency(totalDue)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                Total Paid
              </Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
          </View>

          {/* Dues List */}
          <FlatList
            data={filteredCustomers}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={refreshCustomers}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="credit-card-off" 
                  size={60} 
                  color={theme.colors.onSurfaceVariant} 
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  {searchQuery ? "No matching customers found" : "No customers with dues available"}
                </Text>
                {!searchQuery && (
                  <Button 
                    mode="contained" 
                    onPress={() => setAddDueModalVisible(true)}
                    style={styles.addFirstButton}
                  >
                    Add First Customer
                  </Button>
                )}
              </View>
            }
          />

          {/* Add Due Modal */}
          <Modal
            visible={addDueModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setAddDueModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalKeyboardView}
                >
                  <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.modalHeader}>
                      <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                        Add New Customer
                      </Text>
                      <IconButton 
                        icon="close" 
                        onPress={() => setAddDueModalVisible(false)}
                        style={styles.closeButton}
                      />
                    </View>

                    <ScrollView 
                      contentContainerStyle={styles.modalScrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      <TextInput
                        label="Customer Name *"
                        value={newDue.name}
                        onChangeText={(text) => setNewDue({...newDue, name: text})}
                        mode="outlined"
                        style={styles.modalInput}
                        autoFocus
                        theme={{ colors: { primary: theme.colors.primary } }}
                      />

                      <TextInput
                        label="Phone Number *"
                        value={newDue.phone}
                        onChangeText={(text) => setNewDue({...newDue, phone: text})}
                        keyboardType="phone-pad"
                        mode="outlined"
                        style={styles.modalInput}
                        theme={{ colors: { primary: theme.colors.primary } }}
                      />

                      <TextInput
                        label="Address"
                        value={newDue.address}
                        onChangeText={(text) => setNewDue({...newDue, address: text})}
                        mode="outlined"
                        style={styles.modalInput}
                        theme={{ colors: { primary: theme.colors.primary } }}
                      />

                      <TextInput
                        label="Notes"
                        value={newDue.notes}
                        onChangeText={(text) => setNewDue({...newDue, notes: text})}
                        mode="outlined"
                        style={styles.modalInput}
                        multiline
                        numberOfLines={3}
                        theme={{ colors: { primary: theme.colors.primary } }}
                      />

                      <TextInput
                        label="Initial Due Amount *"
                        value={newDue.initialAmount}
                        onChangeText={(text) => setNewDue({...newDue, initialAmount: text.replace(/[^0-9]/g, '')})}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.modalInput}
                        left={<TextInput.Affix text="৳" />}
                        theme={{ colors: { primary: theme.colors.primary } }}
                      />

                      <Button 
                        mode="contained" 
                        onPress={handleAddDue}
                        style={[styles.modalButton, { marginTop: 16 }]}
                        disabled={!newDue.name || !newDue.phone || !newDue.initialAmount}
                        loading={createLoading}
                        contentStyle={{ height: 48 }}
                      >
                        {createLoading ? '' : 'Add Customer'}
                      </Button>
                    </ScrollView>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    width: '60%',
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  dueCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  dueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dueBadge: {
    marginLeft: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
  },
  dueBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dueDetails: {
    marginBottom: 12,
  },
  dueDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 8,
  },
  dueText: {
    fontSize: 14,
    flex: 1,
  },
  dueActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
  addFirstButton: {
    marginTop: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalKeyboardView: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    margin: 0,
  },
  modalScrollContent: {
    padding: 16,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  modalButton: {
    width: '100%',
  },
});

export default DuesScreen;