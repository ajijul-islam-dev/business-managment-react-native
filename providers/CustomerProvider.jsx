import { createContext, useState, useEffect } from 'react';
import useAxios from '../hooks/useAxios';

export const CustomerContext = createContext(null);

const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { axiosSecure } = useAxios();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axiosSecure.get('/api/customers');
      setCustomers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData) => {
    console.log(customerData);
    try {
      const response = await axiosSecure.post('/api/customers', customerData);
      setCustomers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to create customer';
    }
  };

  const updateCustomer = async (customerId, updateData) => {
    try {
      const response = await axiosSecure.patch(
        `/api/customers/${customerId}`,
        updateData
      );
      setCustomers(prev => prev.map(c => 
        c._id === customerId ? { ...c, ...response.data } : c
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update customer';
    }
  };

  const recordPayment = async (customerId, paymentData) => {
    try {
      const response = await axiosSecure.post(
        `/api/customers/${customerId}/payments`,
        paymentData
      );
      // Update customer's due amount in local state
      setCustomers(prev => prev.map(c => 
        c._id === customerId ? 
        { ...c, dueValue: c.dueValue - paymentData.amount } : c
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to record payment';
    }
  };

  const addDue = async (customerId, dueData) => {
    try {
      const response = await axiosSecure.post(
        `/api/customers/${customerId}/dues`,
        dueData
      );
      // Update customer's due amount in local state
      setCustomers(prev => prev.map(c => 
        c._id === customerId ? 
        { ...c, dueValue: c.dueValue + dueData.amount } : c
      ));
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to add due';
    }
  };

  const getCustomerTransactions = async (customerId) => {
    try {
      const response = await axiosSecure.get(
        `/api/customers/${customerId}/transactions`
      );
      return response.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to fetch transactions';
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        error,
        createCustomer,
        updateCustomer,
        recordPayment,
        addDue,
        getCustomerTransactions,
        refreshCustomers: fetchCustomers
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;