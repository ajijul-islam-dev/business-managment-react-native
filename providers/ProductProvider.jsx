import { createContext, useState, useCallback, useEffect } from 'react';
import useAxios from '../hooks/useAxios.js';

export const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    sales: { revenue: 0, count: 0, itemsSold: 0 },
    cost: 0,
    inventory: { total: 0, outOfStock: 0, lowStock: 0 },
    loading: true,
    lastUpdated: null
  });
  const { axiosSecure } = useAxios();

  const fetchDashboardMetrics = useCallback(async (period = 'today',range) => {
    setLoading(true);
    
    setDashboardMetrics(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await axiosSecure.get('/api/products/metrics', {
        params: { period,...range }
      });
      setDashboardMetrics({
        ...response.data.data,
        loading: false,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      setDashboardMetrics(prev => ({ ...prev, loading: false }));
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get('/api/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  const createProduct = async (productData) => {
    try {
      setLoading(true);
      const response = await axiosSecure.post('/api/products', productData);
      setProducts(prev => [...prev, response.data.data]);
      return response.data;
    } catch (error) {
      console.error('Create failed:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    try {
      setLoading(true);
      const response = await axiosSecure.patch(`/api/products/${productId}`, updatedData);
      setProducts(prev => 
        prev.map(p => p._id === productId ? { ...p, ...updatedData } : p)
      );
      return response.data;
    } catch (error) {
      console.error('Update failed:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      await axiosSecure.delete(`/api/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      return true;
    } catch (error) {
      console.error('Delete failed:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId, quantity, unitCost) => {
    try {
      setLoading(true);
      const response = await axiosSecure.post(`/api/products/${productId}/purchase`, {
        quantity,
        unitCost
      });
      setProducts(prev => 
        prev.map(p => 
          p._id === productId ? { ...p, stock: p.stock + quantity } : p
        )
      );
      return response.data;
    } catch (error) {
      console.error('Purchase failed:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSale = async (productId, quantity, saledUnitPrice,costUnitPrice) => {
    try {
      setLoading(true);
      await axiosSecure.post(`/api/products/${productId}/sale`, { 
        quantity, 
        saledUnitPrice,
        costUnitPrice
      });
      await fetchProducts();
    } catch (error) {
      console.error('Sale failed:', error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProductContext.Provider
      value={{
        products,
        dashboardMetrics,
        fetchProducts,
        createProduct,
        handlePurchase,
        handleSale,
        handleUpdateProduct,
        deleteProduct,
        fetchDashboardMetrics,
        loading
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;