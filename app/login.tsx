import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://167.99.193.95:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        Alert.alert("Başarılı", "Giriş başarılı");
      } else {
        Alert.alert("Hata", data.error || "Kullanıcı adı veya şifre yanlış.");
      }
    } catch (error) {
      Alert.alert("Sunucu Hatası!", "Sunucuya erişilemedi.");
    }
  };

  return (
    <View style ={styles.container}>
      <Text style={styles.header}>Giriş Yap</Text>
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
      <Button title="Giriş Yap" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: { fontSize: 36, marginBottom: 30, color: "#000" },
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
