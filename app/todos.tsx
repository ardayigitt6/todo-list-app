import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Switch,
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
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTodos, setTotalTodos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hideComplete, setHideComplete] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "#fff" : "#000";
  const backgroundColor = isDark ? "#121212" : "#fff";
  const borderColor = isDark ? "#333" : "#aaa";

  const fetchTodos = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const params = `?page=${page}&limit=${limit}&search=${encodeURIComponent(
        searchText
      )}&shouldHideCompleted=${hideComplete}`;
      const response = await fetch("http://167.99.193.95:5000/todos" + params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTodos(data.todos || []);
      setTotalTodos(data.totalTodos || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      await AsyncStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [page, limit, searchText, hideComplete]);

  useEffect(() => {
    setPage(1);
  }, [searchText, limit, hideComplete]);

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
      if (response.ok) {
        setNewTodo("");
        fetchTodos();
      } else {
        Alert.alert("Hata.!", response.statusText);
      }
    } catch (error) {
      Alert.alert("Hata.!", "Sunucuya bağlanmadı.");
    } finally {
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
    } finally {
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
      }
    } catch (error) {
      Alert.alert("Hata.!", "Sunucuya bağlanamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        "http://167.99.193.95:5000/todos/" + id + "/complete",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: !currentStatus }),
        }
      );
      fetchTodos();
    } catch (error) {
      Alert.alert("Hata.!", "Todo tamamlama durumu güncellenemedi. ");
    } finally {
      setLoading(false);
    }
  };

  const start = totalTodos === 0 ? 0 : (page - 1) * limit + 1;
  const end = totalTodos === 0 ? 0 : start + todos.length - 1;

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

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <TextInput
          placeholder="Ara..."
          placeholderTextColor={isDark ? "#aaa" : "#888"}
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: borderColor,
            borderRadius: 6,
            padding: 8,
            marginBottom: 12,
            backgroundColor: isDark ? "#222" : "#fff",
            color: textColor,
          }}
          clearButtonMode="while-editing"
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Switch
          value={hideComplete}
          onValueChange={setHideComplete}
          thumbColor={hideComplete ? "#4caf50" : "#ccc"}
          trackColor={{ false: "#aaa", true: "#4caf50" }}
        />
        <Text
          style={{
            color: textColor,
            marginLeft: 8,
            fontWeight: "bold",
          }}
        >
          Tamamlananları Gizle 🙈
        </Text>
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
          marginBottom: 80,
        }}
      >
        <Text style={{ color: textColor }}>Sayfa başına satır:</Text>
        <Picker
          selectedValue={limit}
          onValueChange={setLimit}
          style={{
            height: 30,
            width: 90,
            color: textColor,
            marginLeft: 6,
            marginRight: 16,
          }}
          dropdownIconColor={textColor}
        >
          <Picker.Item label="5" value={5} />
          <Picker.Item label="10" value={10} />
          <Picker.Item label="50" value={50} />
          <Picker.Item label="100" value={100} />
          <Picker.Item label="1000" value={1000} />
        </Picker>
        <TouchableOpacity
          onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          style={{ padding: 6, opacity: page === 1 ? 0.4 : 1 }}
        >
          <Text style={{ fontSize: 18, color: textColor }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={{ marginHorizontal: 12, color: textColor }}>
          {start}-{end} / {totalTodos}
        </Text>
        <TouchableOpacity
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages || totalTodos === 0}
          style={{
            padding: 6,
            opacity: page === totalPages || totalTodos === 0 ? 0.4 : 1,
          }}
        >
          <Text style={{ fontSize: 18, color: textColor }}>{">"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
