import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  HelperText,
  Card,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ProductContext } from '../providers/ProductProvider';
import { AuthContext } from '../providers/AuthProvider.jsx';
import { FontAwesome5 } from '@expo/vector-icons';

const AddProductScreen = () => {
  const navigation = useNavigation();
  const { createProduct } = useContext(ProductContext);
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    packSize: '',
    unit: '',
  });

  const [errors, setErrors] = useState({});
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const units = [
    { label: 'Piece (pcs)', value: 'pcs' },
    { label: 'Kilogram (kg)', value: 'kg' },
    { label: 'Gram (g)', value: 'g' },
    { label: 'Liter (L)', value: 'L' },
    { label: 'Milliliter (ml)', value: 'ml' },
    { label: 'Box', value: 'box' },
    { label: 'Pack', value: 'pack' },
    { label: 'Bag', value: 'bag' },
    { label: 'Bottle', value: 'bottle' },
    { label: 'Can', value: 'can' },
    { label: 'Dozen', value: 'dozen' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(formData.price)) newErrors.price = 'Price must be a number';
    if (!formData.stock) newErrors.stock = 'Stock is required';
    else if (isNaN(formData.stock)) newErrors.stock = 'Stock must be a number';
    if (!formData.packSize.trim()) newErrors.packSize = 'Pack size is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await createProduct({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          packSize: formData.packSize,
          unit: formData.unit,
          createdBy: user._id
        });
        navigation.navigate('products');
      } catch (error) {
        // Error handling is done in the ProductProvider
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleUnitSelect = (unitValue) => {
    handleChange('unit', unitValue);
    setUnitMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Product" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Product Information</Text>
              
              <TextInput
                label="Product Name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="tag" />}
              />
              <HelperText type="error" visible={!!errors.name}>
                {errors.name}
              </HelperText>

              <TextInput
                label="Price (৳)"
                value={formData.price}
                onChangeText={(text) => handleChange('price', text.replace(/[^0-9.]/g, ''))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.price}
                left={<TextInput.Icon icon="currency-bdt" />}
              />
              <HelperText type="error" visible={!!errors.price}>
                {errors.price}
              </HelperText>

              <TextInput
                label="Initial Stock"
                value={formData.stock}
                onChangeText={(text) => handleChange('stock', text.replace(/[^0-9]/g, ''))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.stock}
                left={<TextInput.Icon icon="package-variant" />}
              />
              <HelperText type="error" visible={!!errors.stock}>
                {errors.stock}
              </HelperText>

              <Text style={styles.sectionTitle}>Packaging Details</Text>

              <TextInput
                label="Pack Size"
                value={formData.packSize}
                onChangeText={(text) => handleChange('packSize', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.packSize}
              />
              <HelperText type="error" visible={!!errors.packSize}>
                {errors.packSize}
              </HelperText>

              {/* Unit Selection Dropdown - Matching HomeScreen style */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Unit</Text>
                <Menu
                  visible={unitMenuVisible}
                  onDismiss={() => setUnitMenuVisible(false)}
                  anchor={
                    <TouchableOpacity 
                      style={[styles.dropdownButton, errors.unit ? styles.dropdownError : null]}
                      onPress={() => setUnitMenuVisible(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        {formData.unit ? units.find(u => u.value === formData.unit).label : 'Select Unit'}
                      </Text>
                      <FontAwesome5 name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>
                  }
                >
                  <ScrollView style={{ maxHeight: 200 }}>
                    {units.map((unit, index) => (
                      <View key={unit.value}>
                        <Menu.Item
                          title={unit.label}
                          onPress={() => handleUnitSelect(unit.value)}
                        />
                        {index < units.length - 1 && <Divider />}
                      </View>
                    ))}
                  </ScrollView>
                </Menu>
                <HelperText type="error" visible={!!errors.unit}>
                  {errors.unit}
                </HelperText>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator animating={true} color="#fff" />
                ) : (
                  'Add Product'
                )}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    minHeight: 56,
  },
  dropdownError: {
    borderColor: '#f44336',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4a90e2',
    borderRadius: 4,
  },
  buttonContent: {
    height: 48,
  },
});

export default AddProductScreen;