import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  RefreshControl
} from "react-native";
import { 
  Appbar, 
  Card, 
  Text, 
  useTheme, 
  Menu, 
  Divider, 
  Button,
  Portal,
  ActivityIndicator
} from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DatePickerModal,enGB, registerTranslation } from 'react-native-paper-dates';
import { ProductContext } from '../../providers/ProductProvider.jsx';

const { width } = Dimensions.get('window');
registerTranslation('en-GB', enGB);
const HomeScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { dashboardMetrics, fetchDashboardMetrics } = useContext(ProductContext);
  
  // State variables
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState("Today");
  const [range, setRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  // Time period options
  const timePeriods = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
    { label: "Custom", value: "custom" },
    { label: "All Time", value: "all" },
  ];

  // Fetch data on initial load
  useEffect(() => {
    fetchDashboardMetrics(selectedPeriod,range);
    
  }, []);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardMetrics(selectedPeriod,range).finally(() => setRefreshing(false));
    
  }, [fetchDashboardMetrics]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period.value);
    setSelectedPeriodLabel(period.label);
    
    if (period.value === 'custom') {
      setDatePickerVisible(true);
    } else {
      fetchDashboardMetrics(period.value,range);
    }
    
    setVisible(false);
  };

  // Handle date picker dismiss
  const onDismiss = useCallback(() => {
    setDatePickerVisible(false);
  }, []);

  // Handle date confirmation
  const onConfirm = useCallback(({ startDate, endDate }) => {
    
  setDatePickerVisible(false);
  setRange({ startDate, endDate });
  
  // Ensure dates are valid before sending
  if (startDate && endDate) {
    fetchDashboardMetrics('custom', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  } else {
    console.error('Invalid dates selected');
  }
}, [fetchDashboardMetrics]);

  // Format metric values with loading state
  const formatMetricValue = (value) => {
    if (dashboardMetrics.loading) return '--';
    if (typeof value === 'number') return value.toLocaleString();
    return value || '--';
  };

  // Quick action metrics
  const clickableMetrics = [
    { 
      title: "All Products", 
      value: formatMetricValue(dashboardMetrics.inventory?.total), 
      icon: "boxes", 
      color: "#4CAF50",
      href: "/products" 
    },
    { 
      title: "Add Product", 
      value: "+", 
      icon: "plus-circle", 
      color: "#2196F3",
      href: "/addProduct" 
    },
    { 
      title: "Low Stock", 
      value: formatMetricValue(dashboardMetrics.inventory?.lowStock), 
      icon: "exclamation-triangle", 
      color: "#FF9800",
      href: "/lowerStock" 
    },
    { 
      title: "Out of Stock", 
      value: formatMetricValue(dashboardMetrics.inventory?.outOfStock), 
      icon: "times-circle", 
      color: "#F44336",
      href: "/outOfStock" 
    },
    { 
      title: "Current Dues", 
      value: "3500", 
      icon: "exclamation-triangle", 
      color: "#F44336",
      href: "/duesScreen" 
    },
    { 
      title: "Current Stock Value", 
      value:formatMetricValue(dashboardMetrics.inventory?.stockValue), 
      icon: "boxes", 
      color: "#2196F3",
      href: "" 
    },
  ];

  return (
    <View style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content 
          title="Store Management" 
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Header */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of your store performance</Text>
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.metricsContainer}>
          {clickableMetrics.map((metric, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.metricWrapper}
              onPress={() => router.push(metric.href)}
            >
              <View style={[styles.metricCard, { backgroundColor: metric.color }]}>
                <FontAwesome5 
                  name={metric.icon} 
                  size={24} 
                  color="#FFF" 
                  style={styles.metricIcon} 
                />
                <Text style={styles.metricValue}>
                  {metric.title === 'Current Dues' || metric.title === 'Current Stock Value' ? `৳${metric.value}` : metric.value}
                </Text>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sales Performance Section */}
        <Text style={styles.sectionTitle}>Sales Performance</Text>
       
        {/* Period Selection Dropdown */}
        <View style={styles.dropdownContainer}>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>{selectedPeriodLabel}</Text>
                <FontAwesome5 name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            }
          >
            {timePeriods.map((period, index) => (
              <View key={period.value}>
                <Menu.Item
                  title={period.label}
                  onPress={() => handlePeriodChange(period)}
                />
                {index < timePeriods.length - 1 && <Divider />}
              </View>
            ))}
          </Menu>
        </View>

        {/* Selected Date Range Display */}
        {selectedPeriod === 'Custom' && (
          <Text style={styles.dateRangeText}>
            {range.startDate.toLocaleDateString()} - {range.endDate.toLocaleDateString()}
          </Text>
        )}

        {/* Sales Metrics Card */}
        <Card style={styles.salesCard}>
          <Card.Content>
            <View style={styles.salesHeader}>
              <Text style={[styles.salesHeaderText, { flex: 0 }]}>Metric</Text>
              <Text style={styles.salesHeaderText}>Value</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Revenue</Text>
              <Text style={styles.timeMetricValue}>
                ৳{formatMetricValue(dashboardMetrics.sales?.revenue)}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Purchased Amount</Text>
              <Text style={styles.timeMetricValue}>
                ৳{formatMetricValue(dashboardMetrics?.purchased)}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Cost</Text>
              <Text style={styles.timeMetricValue}>
                ৳{formatMetricValue(dashboardMetrics.cost)}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Profit</Text>
              <Text style={styles.timeMetricValue}>
                ৳{formatMetricValue(dashboardMetrics.sales?.revenue - dashboardMetrics.cost)}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={[styles.timeMetricRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.timePeriod}>Items Sold</Text>
              <Text style={styles.timeMetricValue}>
                {formatMetricValue(dashboardMetrics.sales?.itemsSold)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Date Picker Portal */}
        <Portal>
          <DatePickerModal
            locale="en-GB"
            mode="range"
            visible={datePickerVisible}
            onDismiss={onDismiss}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
            label="Select date range"
            startLabel="From"
            endLabel="To"
            animationType="slide"
            theme={theme}
          />
        </Portal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  appbar: {
    backgroundColor: "#FFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: -8,
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  metricCard: {
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 14,
    color: "#FFF",
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  salesCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFF',
    elevation: 1,
  },
  timeMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  timePeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 2,
  },
  timeMetricValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  salesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  salesHeaderText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: '#EEE',
    marginVertical: 0,
  },
});

export default HomeScreen;