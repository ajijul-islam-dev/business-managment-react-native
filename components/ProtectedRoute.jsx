import { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../providers/AuthProvider';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function ProtectedRoute({ children }) {
  const { user, authChecked } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authChecked && !user) {
      router.replace('/loginScreen');
    }
  }, [user, authChecked]);

  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return null; // Redirect will happen automatically
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});