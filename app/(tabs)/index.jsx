import { useState,useContext } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Appbar, Card, Text, useTheme, Menu, Divider } from "react-native-paper";
import { Link,useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import {AuthContext} from '../../providers/AuthProvider.jsx';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const router = useRouter()
  // Static metrics data
  const metricsData = {
    today: {
      revenue: '৳25,420',
      cost: '৳18,760',
      sales: 142
    },
    thisWeek: {
      revenue: '৳1,78,540',
      cost: '৳1,31,320',
      sales: 892
    },
    lastWeek: {
      revenue: '৳1,52,310',
      cost: '৳1,12,540',
      sales: 762
    },
    thisMonth: {
      revenue: '৳6,42,850',
      cost: '৳4,85,210',
      sales: 3214
    },
    last3Month: {
      revenue: '৳18,52,640',
      cost: '৳13,85,420',
      sales: 9248
    },
    last6Month: {
      revenue: '৳36,42,150',
      cost: '৳27,85,320',
      sales: 18462
    },
    thisYear: {
      revenue: '৳78,42,150',
      cost: '৳58,14,320',
      sales: 39842
    },
    allTime: {
      revenue: '৳2,45,78,420',
      cost: '৳1,82,45,760',
      sales: 128642
    }
  };

  const {user} = useContext(AuthContext)
  const timePeriods = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "Last Week", value: "lastWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last 3 Month", value: "last3Month" },
    { label: "Last 6 Month", value: "last6Month" },
    { label: "This Year", value: "thisYear" },
    { label: "All Time", value: "allTime" }
  ];

  const products = {
    total: 1248,
    lowStock: 42,
    outOfStock: 12,
    dues : 3500
  };

  // Clickable metrics
  const clickableMetrics = [
    { 
      title: "All Products", 
      value: products.total, 
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
      value: products.lowStock, 
      icon: "exclamation-triangle", 
      color: "#FF9800",
      href: "/lowerStock" 
    },
    { 
      title: "Out of Stock", 
      value: products.outOfStock, 
      icon: "times-circle", 
      color: "#F44336",
      href: "/outOfStock" 
    },
    { 
      title: "Current Dues", 
      value: products.dues, 
      icon: "exclamation-triangle", 
      color: "#F44336",
      href: "/duesScreen" 
    }
  ];
  return (
    <View  style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content 
          title="Store Management" 
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>{user?.storeName}'s Dashboard</Text>
          <Text style={styles.subtitle}>Overview of your store performance</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.metricsContainer}>
          {clickableMetrics.map((metric, index) => (
               <TouchableOpacity key={index +1}
                      style={styles.metricWrapper}
                      onPress={() => router.push(metric.href)}
                    >
                      <View style={[styles.metricCard, { backgroundColor: metric.color }]}>
                        {metric.icon && (
                          <FontAwesome5 
                            name={metric.icon} 
                            size={24} 
                            color="#FFF" 
                            style={styles.metricIcon} 
                          />
                        )}
                        <Text style={styles.metricValue}>
                          {metric.title === 'Current Dues' ? `৳ ${metric.value}` : metric.value}
                        </Text>
                        <Text style={styles.metricTitle}>{metric.title}</Text>
                      </View>
              </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sales Performance</Text>
       
        <View style={styles.dropdownContainer}>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>{selectedPeriod}</Text>
                <FontAwesome5 name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            }
          >
            {timePeriods.map((period, index) => (
              <View key={period.value}>
                <Menu.Item
                  title={period.label}
                  onPress={() => {
                    setSelectedPeriod(period.label);
                    setVisible(false);
                  }}
                />
                {index < timePeriods.length - 1 && <Divider />}
              </View>
            ))}
          </Menu>
        </View>

        <Card style={styles.salesCard}>
          <Card.Content>
            <View style={styles.salesHeader}>
              <Text style={[styles.salesHeaderText, { flex: 2 }]}>Metric</Text>
              <Text style={styles.salesHeaderText}>Value</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Revenue</Text>
              <Text style={styles.timeMetricValue}>
                {metricsData[timePeriods.find(p => p.label === selectedPeriod)?.value]?.revenue || '--'}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.timeMetricRow}>
              <Text style={styles.timePeriod}>Cost</Text>
              <Text style={styles.timeMetricValue}>
                {metricsData[timePeriods.find(p => p.label === selectedPeriod)?.value]?.cost || '--'}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={[styles.timeMetricRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.timePeriod}>Sales</Text>
              <Text style={styles.timeMetricValue}>
                {metricsData[timePeriods.find(p => p.label === selectedPeriod)?.value]?.sales?.toLocaleString() || '--'}
              </Text>
            </View>
          </Card.Content>
        </Card>
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricWrapper: {
    width: '48%',
    marginBottom: 12,
    zIndex: 100,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
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
    fontSize: 12,
    fontWeight: '600',
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
