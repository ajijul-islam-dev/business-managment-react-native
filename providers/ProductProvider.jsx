import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import useAxios from '../hooks/useAxios';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const { axiosSecure } = useAxios();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productMessage, setProductMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Show animated message
  const showMessage = (message, type = 'success') => {
    setProductMessage(message);
    setMessageType(type);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide message with animation
  const hideMessage = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setProductMessage(null);
    });
  };

  // Auto-hide message after delay
  useEffect(() => {
    let timer;
    if (productMessage) {
      timer = setTimeout(() => {
        hideMessage();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [productMessage]);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosSecure.get('/api/products');
      setProducts(response.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch products';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  // Create a new product
  const createProduct = async (productData) => {
    setLoading(true);
    try {
      const response = await axiosSecure.post('/api/products', productData);
      setProducts(prev => [...prev, response.data.data]);
      showMessage('Product created successfully!');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create product';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a product
  const updateProduct = async (id, productData) => {
    setLoading(true);
    try {
      const response = await axiosSecure.put(`/api/products/${id}`, productData);
      setProducts(prev => 
        prev.map(product => 
          product._id === id ? response.data.data : product
        )
      );
      showMessage('Product updated successfully!');
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update product';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await axiosSecure.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(product => product._id !== id));
      showMessage('Product deleted successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to delete product';
      showMessage(errorMsg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single product
  const getProductById = (id) => {
    return products.find(product => product._id === id);
  };

  // Message component
  const MessageOverlay = () => (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          backgroundColor: messageType === 'success' ? '#4BB543' : '#FF4D4D',
          opacity: fadeAnim,
          pointerEvents: 'none',
        }
      ]}
    >
      <Ionicons 
        name={messageType === 'success' ? 'checkmark-circle' : 'close-circle'} 
        size={24} 
        color="#fff" 
      />
      <Text style={styles.messageText}>{productMessage}</Text>
      <TouchableOpacity onPress={hideMessage}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ProductContext.Provider 
      value={{
        products,
        loading,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        hideMessage
      }}
    >
      <View style={{ flex: 1 }}>
        {children}
      </View>
      
      {productMessage && !loading && <MessageOverlay />}
    </ProductContext.Provider>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 3,
  },
  messageText: {
    color: '#fff',
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    flex: 1,
  },
});

export default ProductProvider;