import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Hata.!", "Lütfen kullanıcı adı ve şifre girin.");
      return;
    }
    try {
      const response = await fetch("http://167.99.193.95:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Başarılı :)", "Kayıt başaralı, giriş yapabilirisiniz.");
        router.replace("/login");
      } else {
        Alert.alert("Hata.!", data.error || "Kayıt olunamadı.");
      }
    } catch (error) {
      Alert.alert("Suncu hatası.!", "Sunucuuya bağlanmadı.");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Kayıt Ol" onPress={handleRegister} />
      <Button
        title="Giriş Ekranına Dön"
        onPress={() => router.replace("/login")}
        color="#adff2f"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: { fontSize: 32, marginBottom: 30, color: "#000" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: "#000",
    backgroundColor: "#fff",
  },
});
