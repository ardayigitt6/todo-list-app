import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";

export default function TodosScreen() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const router = useRouter();

  const fetchTodos = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const response = await fetch("http://167.99.193.95:5000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTodos(data.todos || []);
    } catch (error) {
      await AsyncStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  const handleAddTodo = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!newTodo.trim()) return;
    try {
      const response = await fetch("http://167.99.193.95:5000/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodo }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewTodo("");
        fetchTodos();
      } else {
        Alert.alert("Hata.!", response.statusText);
      }
    } catch (error) {
      Alert.alert("Hata.!", "Sunucuya bağlanmadı.");
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Button title="Çıkış Yap" onPress={handleLogout} />
      <View style={{ flexDirection: "row", marginVertical: 12 }}>
        <TextInput
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Yeni Todo ekle..."
          style={{
            flex: 1,
            borderColor: "#aaa",
            borderWidth: 1,
            borderRadius: 6,
            padding: 8,
            marginRight: 8,
            backgroundColor: "#fff",
            color: "#000",
          }}
        />
        <Button title="Ekle" onPress={handleAddTodo} />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </View>
  );
}
