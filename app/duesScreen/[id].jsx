import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,ScrollView
} from 'react-native';
import { 
  Appbar, 
  Text, 
  Card, 
  Button, 
  TextInput, 
  useTheme, 
  Badge,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomerContext } from '../../providers/CustomerProvider';

const DueDetailsScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const {
    customers,
    recordPayment,
    addDue,
    getCustomerTransactions,
    updateCustomer,
    loading
  } = useContext(CustomerContext);

  // UI states
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [addDueModal, setAddDueModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [dueLoading, setDueLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount) => `৳${amount?.toLocaleString('en-IN') || '0'}`;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
console.log(transactions);
  // Load customer and transactions
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const foundCustomer = customers.find(c => c._id === id);
        if (!foundCustomer) {
          throw new Error('Customer not found');
        }
        setCustomer(foundCustomer);
        setEditData({
          name: foundCustomer.name,
          phone: foundCustomer.phone,
          address: foundCustomer.address || '',
          notes: foundCustomer.notes || ''
        });
        
        const txns = await getCustomerTransactions(id);
        setTransactions(txns);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, customers]);

  const handleAddPayment = async () => {
    try {
      setPaymentLoading(true);
      if (!paymentAmount) {
        throw new Error('Please enter payment amount');
      }

      await recordPayment(id, {
        amount: parseInt(paymentAmount),
        note: note || 'Payment received'
      });

      // Refresh data
      const txns = await getCustomerTransactions(id);
      setTransactions(txns);
      
      setAddPaymentModal(false);
      setPaymentAmount('');
      setNote('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddDue = async () => {
    try {
      setDueLoading(true);
      if (!dueAmount) {
        throw new Error('Please enter due amount');
      }

      await addDue(id, {
        amount: parseInt(dueAmount),
        note: note || 'Due added'
      });

      // Refresh data
      const txns = await getCustomerTransactions(id);
      setTransactions(txns);
      
      setAddDueModal(false);
      setDueAmount('');
      setNote('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setDueLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      setUpdateLoading(true);
      await updateCustomer(id, editData);
      setEditModal(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCallCustomer = () => {
    Alert.alert('Call', `Would you like to call ${customer?.phone}?`);
  };

  const renderTransaction = ({ item }) => (
    <Card
      style={[
        styles.txnCard,
        {
          backgroundColor: theme.colors.surface,
          borderLeftWidth: 4,
          borderLeftColor: item.type === 'payment' ? '#4CAF50' : '#F44336',
          marginBottom: 8,
        },
      ]}
    >
      <Card.Content style={styles.txnContent}>
        <View style={styles.txnHeader}>
          <View>
            <Text style={{ 
              fontWeight: 'bold',
              color: item.type === 'payment' ? '#4CAF50' : '#F44336'
            }}>
              {item.type === 'payment' ? 'Payment Received' : 'Due Added'}
            </Text>
            <Text style={{ 
              fontSize: 12,
              color: theme.colors.onSurfaceVariant,
              marginTop: 4
            }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Text style={{ 
            fontWeight: 'bold',
            fontSize: 16,
            color: item.type === 'payment' ? '#4CAF50' : '#F44336'
          }}>
            {item.type === 'payment' ? '-' : '+'} {formatCurrency(item.amount)}
          </Text>
        </View>
        {item.note && (
          <View style={styles.txnNote}>
            <MaterialCommunityIcons 
              name="note-text" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={{ 
              marginLeft: 8,
              color: theme.colors.onSurfaceVariant,
              flex: 1
            }}>
              {item.note}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <>
      {/* Customer Info Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.customerHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              {customer.name}
            </Text>
            <Badge 
              size={24} 
              style={[
                styles.dueBadge, 
                { 
                  backgroundColor: customer.dueValue > 10000 ? '#F44336' : 
                                 customer.dueValue > 0 ? '#FF9800' : '#4CAF50' 
                }
              ]}
            >
              {formatCurrency(customer.dueValue)}
            </Badge>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
              {customer.phone}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
              {customer.address || 'No address provided'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Last Payment
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {customer.lastPayment.includes('days') ? customer.lastPayment : `${customer.lastPayment} days ago`}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Total Transactions
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {transactions.length}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Notes Section */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
            Notes
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {customer.notes || 'No notes available'}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Transaction History
      </Text>
    </>
  );

  const renderEmptyComponent = () => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          No transactions found
        </Text>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons 
          name="alert-circle" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={[styles.errorText, { color: theme.colors.onSurface }]}>
          Customer not found
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Due Details" />
        <Appbar.Action icon="phone" onPress={handleCallCustomer} />
        <Appbar.Action icon="pencil" onPress={() => setEditModal(true)} />
      </Appbar.Header>

      {/* Main Content - Using FlatList to avoid nested scrolling */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.content}
        style={styles.mainList}
      />

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={() => setAddPaymentModal(true)}
          style={[styles.actionButton, { marginRight: 8 }]}
          icon="cash"
          loading={paymentLoading}
        >
          {paymentLoading ? '' : 'Add Payment'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setAddDueModal(true)}
          style={styles.actionButton}
          icon="plus-circle"
          loading={dueLoading}
        >
          {dueLoading ? '' : 'Add Due'}
        </Button>
      </View>

      {/* Add Payment Modal */}
      <Modal
        visible={addPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={[styles.modalContainer, { 
              backgroundColor: theme.colors.surface,
              margin: 20,
              borderRadius: 8,
              maxHeight: Dimensions.get('window').height * 0.8,
            }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                  Add Payment
                </Text>
                <IconButton 
                  icon="close" 
                  onPress={() => setAddPaymentModal(false)}
                  style={styles.closeButton}
                />
              </View>

              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  label="Amount (৳)"
                  value={paymentAmount}
                  onChangeText={(text) => setPaymentAmount(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="৳" />}
                />

                <TextInput
                  label="Note (Optional)"
                  value={note}
                  onChangeText={setNote}
                  mode="outlined"
                  style={styles.modalInput}
                  multiline
                  numberOfLines={3}
                />

                <Button
                  mode="contained"
                  onPress={handleAddPayment}
                  style={styles.modalButton}
                  disabled={!paymentAmount || paymentLoading}
                  loading={paymentLoading}
                >
                  Confirm Payment
                </Button>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add Due Modal */}
      <Modal
        visible={addDueModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddDueModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={[styles.modalContainer, { 
              backgroundColor: theme.colors.surface,
              margin: 20,
              borderRadius: 8,
              maxHeight: Dimensions.get('window').height * 0.8,
            }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                  Add New Due
                </Text>
                <IconButton 
                  icon="close" 
                  onPress={() => setAddDueModal(false)}
                  style={styles.closeButton}
                />
              </View>

              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  label="Amount (৳)"
                  value={dueAmount}
                  onChangeText={(text) => setDueAmount(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.modalInput}
                  left={<TextInput.Affix text="৳" />}
                />

                <TextInput
                  label="Note (Optional)"
                  value={note}
                  onChangeText={setNote}
                  mode="outlined"
                  style={styles.modalInput}
                  multiline
                  numberOfLines={3}
                />

                <Button
                  mode="contained"
                  onPress={handleAddDue}
                  style={styles.modalButton}
                  disabled={!dueAmount || dueLoading}
                  loading={dueLoading}
                >
                  Add Due
                </Button>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        visible={editModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={[styles.modalContainer, { 
              backgroundColor: theme.colors.surface,
              margin: 20,
              borderRadius: 8,
              maxHeight: Dimensions.get('window').height * 0.8,
            }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                  Edit Customer
                </Text>
                <IconButton 
                  icon="close" 
                  onPress={() => setEditModal(false)}
                  style={styles.closeButton}
                />
              </View>

              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  label="Customer Name"
                  value={editData.name}
                  onChangeText={(text) => setEditData({...editData, name: text})}
                  mode="outlined"
                  style={styles.modalInput}
                />

                <TextInput
                  label="Phone Number"
                  value={editData.phone}
                  onChangeText={(text) => setEditData({...editData, phone: text})}
                  keyboardType="phone-pad"
                  mode="outlined"
                  style={styles.modalInput}
                />

                <TextInput
                  label="Address"
                  value={editData.address}
                  onChangeText={(text) => setEditData({...editData, address: text})}
                  mode="outlined"
                  style={styles.modalInput}
                />

                <TextInput
                  label="Notes"
                  value={editData.notes}
                  onChangeText={(text) => setEditData({...editData, notes: text})}
                  mode="outlined"
                  style={styles.modalInput}
                  multiline
                  numberOfLines={3}
                />

                <Button
                  mode="contained"
                  onPress={handleUpdateCustomer}
                  style={styles.modalButton}
                  loading={updateLoading}
                >
                  Save Changes
                </Button>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  mainList: {
    flex: 1,
    paddingBottom: 80,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  backButton: {
    width: '60%',
  },
  card: { 
    marginBottom: 16, 
    borderRadius: 8, 
    elevation: 1 
  },
  customerHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  dueBadge: { 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
  },
  detailRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  detailText: { 
    marginLeft: 8, 
    flex: 1 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12 
  },
  statItem: { 
    flex: 1 
  },
  sectionTitle: { 
    marginTop: 8, 
    marginBottom: 12 
  },
  txnCard: {
    borderRadius: 8,
  },
  txnContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtons: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 16, 
    flexDirection: 'row', 
    elevation: 4 
  },
  actionButton: { 
    flex: 1 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalKeyboardView: { 
    flex: 1, 
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    elevation: 5,
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
    width: '100%' 
  },
  modalButton: { 
    marginTop: 8,
    width: '100%'
  },
});

export default DueDetailsScreen;