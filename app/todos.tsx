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
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function TodosScreen() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "#fff" : "#000";
  const backgroundColor = isDark ? "#121212" : "#fff";
  const borderColor = isDark ? "#333" : "#aaa";

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
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Hata.!", "Sunucuya bağlanmadı.");
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (id) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch("http://167.99.193.95:5000/todos/" + id, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTodos();
    } catch (error) {
      Alert.alert("Hata.!", "Todo silinemdi.");
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const token = await AsyncStorage.getItem("token");
    if (!editTitle.trim()) {
      Alert.alert("Hata.!", "Başlık boş  bırakılamaz.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://167.99.193.95:5000/todos/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle }),
      });
      if (response.ok) {
        setEditId(null);
        setEditTitle("");
        fetchTodos();
      } else {
        Alert.alert("Hata.!", "Todo güncellenemedi.");
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Hata.!", "Sunucuya bağlanamadı.");
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch("http://167.99.193.95:5000/todos/" + id + "/complete", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      fetchTodos();
    } catch (error) {
      Alert.alert("Hata.!", "Todo tamamlama durumu güncellenemedi. ");
      setLoading(false);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color={isDark ? "#fff" : "#333"} />;

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor }}>
      <Button title="Çıkış Yap" onPress={handleLogout} />
      <View style={{ flexDirection: "row", marginVertical: 12 }}>
        <TextInput
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Yeni Todo ekle..."
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          style={{
            flex: 1,
            borderColor: borderColor,
            borderWidth: 1,
            borderRadius: 6,
            padding: 8,
            marginRight: 8,
            backgroundColor: isDark ? "#222" : "#fff",
            color: textColor,
          }}
        />
        <Button title="Ekle ➕" onPress={handleAddTodo} />
      </View>
      <FlatList
        data={todos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <TouchableOpacity
              onPress={() => handleToggleComplete(item._id, item.completed)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: item.completed ? "#4caf50" : "#aaa",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                backgroundColor: isDark ? "#222" : "#fff",
              }}
            >
              {item.completed && (
                <Text
                  style={{ fontSize: 18, color: "#4caf50", fontWeight: "bold" }}
                >
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {editId === item._id ? (
              <>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={{
                    flex: 1,
                    borderColor: borderColor,
                    borderWidth: 1,
                    borderRadius: 6,
                    padding: 4,
                    marginRight: 8,
                    backgroundColor: isDark ? "#222" : "#fff",
                    color: textColor,
                  }}
                />
                <Button title="Kaydet" onPress={() => handleUpdate(item._id)} />
                <Button
                  title="İptal"
                  color="grey"
                  onPress={() => {
                    setEditId(null);
                    setEditTitle("");
                  }}
                />
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: textColor,
                    flex: 1,
                    textDecorationLine: item.completed
                      ? "line-through"
                      : "none",
                    opacity: item.completed ? 0.5 : 1,
                  }}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTodo(item._id)}>
                  <Text
                    style={{ color: "red", fontWeight: "bold", marginLeft: 12 }}
                  >
                    Sil 🗑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditId(item._id);
                    setEditTitle(item.title);
                  }}
                >
                  <Text
                    style={{
                      color: "orange",
                      fontWeight: "bold",
                      marginLeft: 12,
                    }}
                  >
                    Düzenle ✏️
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}
