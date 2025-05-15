import { useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { Appbar, Card, Text, Avatar } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from '../../providers/AuthProvider';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();
  const { user, authChecked, loading, logout } = useContext(AuthContext);

  const profileActions = [
    { label: "Edit Profile", icon: "user-edit", onPress: () => router.push('/editProfile') },
    { label: "Change Password", icon: "key", onPress: () => router.push('/changePassword') },
    { 
      label: "Log Out", 
      icon: "sign-out-alt", 
      onPress: () => logout().then(() => router.replace('/loginScreen')),
      loading: loading
    },
  ];

  if (!authChecked) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7D33" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content 
            title="Profile" 
            titleStyle={styles.appbarTitle}
          />
        </Appbar.Header>
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>Please log in to view your profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/loginScreen')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content 
          title="My Profile" 
          titleStyle={styles.appbarTitle}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Image 
              size={80} 
              source={{ uri: user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.proprietor)}&background=random`
              }} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.proprietor}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Account Actions</Text>
        <Card style={styles.actionsCard}>
          {profileActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionRow}
              onPress={action.onPress}
              disabled={action.loading}
            >
              <View style={styles.actionLeft}>
                <FontAwesome5
                  name={action.icon}
                  size={18}
                  color={action.loading ? "#ccc" : "#666"}
                  style={{ width: 24 }}
                />
                <Text style={[styles.actionLabel, action.loading && styles.disabledText]}>
                  {action.label}
                </Text>
              </View>
              {action.loading ? (
                <ActivityIndicator size="small" color="#FF7D33" />
              ) : (
                <FontAwesome5 name="chevron-right" size={16} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#FF7D33',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  appbar: {
    backgroundColor: "#FFF",
    elevation: 1,
  },
  appbarTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    padding: 16,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userStore: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
  },
  actionsCard: {
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    marginLeft: 12,
  },
  disabledText: {
    color: '#ccc',
  },
});

export default ProfileScreen;