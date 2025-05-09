import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Text, Card } from "react-native-paper";
import { Link } from "expo-router";
import { useState } from "react";

const RegisterScreen = () => {
  const [storeName, setStoreName] = useState("");
  const [proprietor, setProprietor] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    console.log("Registering:", { storeName, proprietor, email, phone, address, password });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={styles.title}>Register</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Store Name"
                  value={storeName}
                  onChangeText={setStoreName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Proprietor Name"
                  value={proprietor}
                  onChangeText={setProprietor}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <View style={styles.linkRow}>
                  <Text>Already have an account?</Text>
                  <Link href="/loginScreen" style={styles.linkText}>
                    Login
                  </Link>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F8F9FA" },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  formCard: {
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 2,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#28A745",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  linkText: { color: "#007BFF", marginLeft: 6 },
});

export default RegisterScreen;
