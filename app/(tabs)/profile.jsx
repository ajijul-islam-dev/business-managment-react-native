import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Appbar, Card, Text, Avatar } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import { Link } from "expo-router";

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Store Manager",
    avatar: "https://i.pravatar.cc/150?img=12",
    totalOrders: 248,
    totalSales: "৳6,42,850",
  };

  const profileActions = [
    { label: "Edit Profile", icon: "user-edit", onPress: () => {} },
    { label: "Change Password", icon: "key", onPress: () => {} },
    { label: "Log Out", icon: "sign-out-alt", onPress: () => {} },
  ];

  return (
    <View style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content 
          title="My Profile" 
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Image size={80} source={{ uri: user.avatar }} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{user.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{user.totalSales}</Text>
            <Text style={styles.metricLabel}>Total Sales</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <Card style={styles.actionsCard}>
          {profileActions.map((action, index) => (
            <TouchableOpacity 
              key={action.label} 
              style={styles.actionRow}
              onPress={action.onPress}
            >
              <View style={styles.actionLeft}>
                <FontAwesome5 name={action.icon} size={18} color="#666" style={{ width: 24 }} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          ))}

          {/* Links added here inside the card */}
          <View style={styles.linkRow}>
            <Link href="/loginScreen" style={styles.linkText}>Go to Login</Link>
            <Link href="/registerScreen" style={styles.linkText}>Go to Register</Link>
          </View>
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
    paddingBottom: 32,
  },
  profileCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFF",
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userRole: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricBox: {
    width: '48%',
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  actionsCard: {
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 1,
    paddingBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#007BFF",
  },
});

export default ProfileScreen;
