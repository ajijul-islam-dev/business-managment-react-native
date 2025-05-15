import React, { useState, useRef } from 'react';
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
  Dimensions
} from 'react-native';
import { Appbar, Text, TextInput, Button, Menu, Divider, Card, useTheme, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DuesScreen = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortVisible, setSortVisible] = useState(false);
  const [sortOption, setSortOption] = useState("name");
  const [addDueModalVisible, setAddDueModalVisible] = useState(false);
  const [newDue, setNewDue] = useState({
    name: "",
    phone: "",
    address: "",
    initialAmount: ""
  });
  const menuAnchorRef = useRef(null);
  const router = useRouter();

  // Static dues data
  const [duesData, setDuesData] = useState([
    {
      id: 1,
      name: "Mohammad Ali",
      address: "123 Market Street, Dhaka",
      dueValue: 12500,
      phone: "01712345678",
      lastPayment: "15 days ago"
    },
    {
      id: 2,
      name: "Abdul Rahman",
      address: "456 Business Road, Chittagong",
      dueValue: 8500,
      phone: "01898765432",
      lastPayment: "7 days ago"
    },
    {
      id: 3,
      name: "Fatima Begum",
      address: "789 Trade Center, Sylhet",
      dueValue: 15600,
      phone: "01911223344",
      lastPayment: "30 days ago"
    },
    {
      id: 4,
      name: "Kamal Hossain",
      address: "321 Shopnagar, Khulna",
      dueValue: 6200,
      phone: "01655667788",
      lastPayment: "3 days ago"
    },
    {
      id: 5,
      name: "Ayesha Akter",
      address: "654 Commerce Lane, Rajshahi",
      dueValue: 13400,
      phone: "01599887766",
      lastPayment: "21 days ago"
    }
  ]);

  const sortOptions = [
    { label: "Name (A-Z)", value: "name" },
    { label: "Due Amount (Low-High)", value: "amountAsc" },
    { label: "Due Amount (High-Low)", value: "amountDesc" },
    { label: "Recent Payment", value: "recent" }
  ];

  // Filter and sort dues - CORRECTED VERSION
  const filteredDues = duesData
    .filter(due => 
      due.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      due.phone.includes(searchQuery)
    )
    .sort((a, b) => {
      switch(sortOption) {
        case 'name': return a.name.localeCompare(b.name);
        case 'amountAsc': return a.dueValue - b.dueValue;
        case 'amountDesc': return b.dueValue - a.dueValue;
        case 'recent': return a.lastPayment.localeCompare(b.lastPayment);
        default: return 0;
      }
    });

  // Format currency
  const formatCurrency = (amount) => {
    return `৳${amount?.toLocaleString('en-IN') || '0'}`;
  };

  const handleAddDue = () => {
    if (!newDue.name || !newDue.phone || !newDue.initialAmount) return;

    const newDueEntry = {
      id: duesData.length + 1,
      name: newDue.name,
      phone: newDue.phone,
      address: newDue.address,
      dueValue: parseInt(newDue.initialAmount),
      lastPayment: "Not paid yet"
    };

    setDuesData([...duesData, newDueEntry]);
    setAddDueModalVisible(false);
    setNewDue({
      name: "",
      phone: "",
      address: "",
      initialAmount: ""
    });
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.dueCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.dueHeader}>
          <Text style={[styles.dueName, { color: theme.colors.onSurface }]}>{item.name}</Text>
          <Badge 
            style={[styles.dueBadge, { backgroundColor: item.dueValue > 10000 ? '#F44336' : '#FF9800' }]}
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
              {item.address}
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
        </View>
        
        <View style={styles.dueActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialCommunityIcons 
              name="phone" 
              size={20} 
              color={theme.colors.onPrimaryContainer} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.tertiaryContainer }]}
          >
            <MaterialCommunityIcons 
              name="message" 
              size={20} 
              color={theme.colors.onTertiaryContainer} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              Keyboard.dismiss();
              router.push(`duesScreen/${item.id}`);
            }}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

        {/* Dues List */}
        <FlatList
          data={filteredDues}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="credit-card-off" 
                size={60} 
                color={theme.colors.onSurfaceVariant} 
              />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {searchQuery ? "No matching dues found" : "No dues records available"}
              </Text>
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
                <ScrollView 
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                      Add New Due
                    </Text>

                    <TextInput
                      label="Customer Name *"
                      value={newDue.name}
                      onChangeText={(text) => setNewDue({...newDue, name: text})}
                      mode="outlined"
                      style={styles.modalInput}
                      theme={{
                        colors: {
                          primary: theme.colors.primary,
                          background: theme.colors.surface,
                        }
                      }}
                      autoFocus
                    />

                    <TextInput
                      label="Phone Number *"
                      value={newDue.phone}
                      onChangeText={(text) => setNewDue({...newDue, phone: text})}
                      keyboardType="phone-pad"
                      mode="outlined"
                      style={styles.modalInput}
                      theme={{
                        colors: {
                          primary: theme.colors.primary,
                          background: theme.colors.surface,
                        }
                      }}
                    />

                    <TextInput
                      label="Address"
                      value={newDue.address}
                      onChangeText={(text) => setNewDue({...newDue, address: text})}
                      mode="outlined"
                      style={styles.modalInput}
                      theme={{
                        colors: {
                          primary: theme.colors.primary,
                          background: theme.colors.surface,
                        }
                      }}
                    />

                    <TextInput
                      label="Initial Due Amount *"
                      value={newDue.initialAmount}
                      onChangeText={(text) => setNewDue({...newDue, initialAmount: text.replace(/[^0-9]/g, '')})}
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.modalInput}
                      left={<TextInput.Affix text="৳" />}
                      theme={{
                        colors: {
                          primary: theme.colors.primary,
                          background: theme.colors.surface,
                        }
                      }}
                    />

                    <View style={styles.modalFooter}>
                      <Button 
                        mode="outlined" 
                        onPress={() => setAddDueModalVisible(false)}
                        style={styles.modalButton}
                        labelStyle={{ color: theme.colors.onSurface }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        mode="contained" 
                        onPress={handleAddDue}
                        style={[styles.modalButton, { marginLeft: 16 }]}
                        disabled={!newDue.name || !newDue.phone || !newDue.initialAmount}
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
    </TouchableWithoutFeedback>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 5
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
  dueCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
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
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    width: '100%',
  },
  modalButton: {
    minWidth: 120,
  },
});

export default DuesScreen;