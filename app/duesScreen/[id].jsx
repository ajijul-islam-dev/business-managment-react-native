import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native';
import { Appbar, Text, Card, Button, TextInput, useTheme, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DueDetailsScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [addDueModal, setAddDueModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [note, setNote] = useState('');

  const due = {
    id: 'DUE001',
    customerName: 'Mohammad Ali',
    phone: '01712345678',
    address: '123 Market Street, Dhaka',
    totalDue: 12500,
    lastPaymentDate: '2023-05-15',
    dueSince: '30 days',
    notes: 'Regular customer, pays every 15th of month',
  };

  const transactions = [
    { id: 1, type: 'payment', amount: 5000, date: '2023-05-15', note: 'Partial payment' },
    { id: 2, type: 'due', amount: 7500, date: '2023-04-30', note: 'New purchase - Electronics' },
    { id: 3, type: 'payment', amount: 3000, date: '2023-04-15', note: 'Regular payment' },
    { id: 4, type: 'due', amount: 5000, date: '2023-03-20', note: 'Additional items purchased' },
  ];

  const formatCurrency = (amount) => `৳${amount?.toLocaleString('en-IN') || '0'}`;

  const handleAddPayment = () => {
    console.log('Adding payment:', { amount: paymentAmount, note });
    setAddPaymentModal(false);
    setPaymentAmount('');
    setNote('');
  };

  const handleAddDue = () => {
    console.log('Adding due:', { amount: dueAmount, note });
    setAddDueModal(false);
    setDueAmount('');
    setNote('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Due Details" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.customerHeader}>
              <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
                {due.customerName}
              </Text>
              <Badge size={24} style={styles.dueBadge}>
                {formatCurrency(due.totalDue)}
              </Badge>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="phone" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {due.phone}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                {due.address}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Last Payment
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {due.lastPaymentDate}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Due Since
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {due.dueSince}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              Notes
            </Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {due.notes || 'No notes available'}
            </Text>
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Transaction History
        </Text>

        {transactions.map((txn) => (
          <Card
            key={txn.id}
            style={[
              styles.txnCard,
              {
                backgroundColor: theme.colors.surface,
                borderLeftWidth: 4,
                borderLeftColor: txn.type === 'payment' ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            <Card.Content>
              <View style={styles.txnHeader}>
                <Text style={{ color: txn.type === 'payment' ? '#4CAF50' : '#F44336', fontWeight: 'bold' }}>
                  {txn.type === 'payment' ? 'Payment' : 'Due Added'}
                </Text>
                <Text style={{ color: theme.colors.onSurface }}>{formatCurrency(txn.amount)}</Text>
              </View>

              <View style={styles.txnDetails}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>{txn.date}</Text>
                {txn.note && (
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    Note: {txn.note}
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={() => setAddPaymentModal(true)}
          style={[styles.actionButton, { marginRight: 8 }]}
          icon="cash"
        >
          Add Payment
        </Button>
        <Button
          mode="outlined"
          onPress={() => setAddDueModal(true)}
          style={styles.actionButton}
          icon="plus-circle"
        >
          Add Due
        </Button>
      </View>

      {/* Add Payment Modal */}
      <Modal
        visible={addPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddPaymentModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 20 }}>
                    Add Payment
                  </Text>

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

                  <View style={styles.modalFooter}>
                    <Button mode="outlined" onPress={() => setAddPaymentModal(false)} style={styles.modalButton}>
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleAddPayment}
                      style={[styles.modalButton, { marginLeft: 16 }]}
                      disabled={!paymentAmount}
                    >
                      Confirm
                    </Button>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Due Modal */}
      <Modal
        visible={addDueModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddDueModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                  <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 20 }}>
                    Add New Due
                  </Text>

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

                  <View style={styles.modalFooter}>
                    <Button mode="outlined" onPress={() => setAddDueModal(false)} style={styles.modalButton}>
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleAddDue}
                      style={[styles.modalButton, { marginLeft: 16 }]}
                      disabled={!dueAmount}
                    >
                      Add Due
                    </Button>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 16, borderRadius: 8, elevation: 1 },
  customerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dueBadge: { backgroundColor: '#F44336', alignSelf: 'flex-start' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { marginLeft: 8, flex: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statItem: { flex: 1 },
  sectionTitle: { marginTop: 8, marginBottom: 12 },
  txnCard: { marginBottom: 8, borderRadius: 8, elevation: 1 },
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  txnDetails: { marginTop: 4 },
  actionButtons: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', elevation: 4 },
  actionButton: { flex: 1 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalKeyboardView: { flex: 1, width: '100%' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '90%', maxWidth: 400, borderRadius: 12, padding: 20, elevation: 5 },
  modalInput: { marginBottom: 16, width: '100%' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalButton: { minWidth: 120 },
});

export default DueDetailsScreen;