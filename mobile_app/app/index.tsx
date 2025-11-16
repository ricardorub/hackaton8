import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleLogin = () => {
    router.push("/mapa");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Centros de Votación</Text>
        <Text style={styles.subtitle}>Encuentra tu centro de votación</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity>
          <Text style={styles.signupLink}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2c3e50",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  signupLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
