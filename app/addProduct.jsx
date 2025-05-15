import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  Card,
  Checkbox,
  List,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ProductContext } from '../providers/ProductProvider';

const AddProductScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { createProduct } = useContext(ProductContext);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    packSize: '',
    unit: '',
  });

  const [errors, setErrors] = useState({});
  const [showUnitOptions, setShowUnitOptions] = useState(false);

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
      try {
        await createProduct({
          name: formData.name,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          packSize: formData.packSize,
          unit: formData.unit
        });
        navigation.navigate('products')
      } catch (error) {
        // Error handling is done in the ProductProvider
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
    setShowUnitOptions(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Appbar.Header style={{ backgroundColor: '#fff' }} elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add New Product" titleStyle={{ fontWeight: 'bold' }} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card mode="elevated" style={[styles.card, { backgroundColor: '#fff' }]}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Product Information
              </Text>
              
              <TextInput
                label="Product Name"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="rename-box" />}
                outlineColor="#ddd"
                activeOutlineColor="#4a90e2"
              />
              <HelperText type="error" visible={!!errors.name} style={styles.helperText}>
                {errors.name}
              </HelperText>

              <TextInput
                label="Price (৳)"
                value={formData.price}
                onChangeText={(text) =>
                  handleChange('price', text.replace(/[^0-9.]/g, ''))
                }
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.price}
                left={<TextInput.Icon icon="currency-bdt" />}
                outlineColor="#ddd"
                activeOutlineColor="#4a90e2"
              />
              <HelperText type="error" visible={!!errors.price} style={styles.helperText}>
                {errors.price}
              </HelperText>

              <TextInput
                label="Initial Stock"
                value={formData.stock}
                onChangeText={(text) =>
                  handleChange('stock', text.replace(/[^0-9]/g, ''))
                }
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.stock}
                left={<TextInput.Icon icon="package-variant" />}
                outlineColor="#ddd"
                activeOutlineColor="#4a90e2"
              />
              <HelperText type="error" visible={!!errors.stock} style={styles.helperText}>
                {errors.stock}
              </HelperText>

              <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 12 }]}>
                Packaging Details
              </Text>

              <TextInput
                label="Pack Size"
                value={formData.packSize}
                onChangeText={(text) => handleChange('packSize', text)}
                mode="outlined"
                style={styles.input}
                error={!!errors.packSize}
                outlineColor="#ddd"
                activeOutlineColor="#4a90e2"
              />
              <HelperText type="error" visible={!!errors.packSize} style={styles.helperText}>
                {errors.packSize}
              </HelperText>

              <TouchableWithoutFeedback onPress={() => setShowUnitOptions(!showUnitOptions)}>
                <View style={[styles.input, styles.unitSelector, errors.unit ? { borderColor: theme.colors.error } : null]}>
                  <Text style={{ color: formData.unit ? '#000' : '#757575' }}>
                    {formData.unit ? units.find(u => u.value === formData.unit).label : 'Select Unit'}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <HelperText type="error" visible={!!errors.unit} style={styles.helperText}>
                {errors.unit}
              </HelperText>

              {showUnitOptions && (
                <Card style={styles.unitOptionsCard}>
                  <Card.Content>
                    {units.map((unit) => (
                      <List.Item
                        key={unit.value}
                        title={unit.label}
                        left={() => (
                          <Checkbox
                            status={formData.unit === unit.value ? 'checked' : 'unchecked'}
                            onPress={() => handleUnitSelect(unit.value)}
                          />
                        )}
                        onPress={() => handleUnitSelect(unit.value)}
                        style={styles.unitOption}
                      />
                    ))}
                  </Card.Content>
                </Card>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.submitButton, { backgroundColor: '#4a90e2' }]}
                icon="check"
                contentStyle={styles.buttonContent}
                labelStyle={{ color: '#fff' }}
              >
                Add Product
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 56,
  },
  unitSelector: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unitOptionsCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  unitOption: {
    paddingVertical: 8,
    height: 48,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    height: 48,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#555',
    fontWeight: '600',
  },
  helperText: {
    marginBottom: 4,
  },
});

export default AddProductScreen;