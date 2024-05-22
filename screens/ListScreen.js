import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, TouchableHighlight } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUsers, deleteUser } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ListScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { token } = route.params;

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const data = await getUsers(token);
            setUsers(data);
        } catch (error) {
            alert('Erro', 'Falha ao buscar');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [])
    );

    const handleDelete = async (id) => {
        try {
            await deleteUser(id, token);
            fetchUsers();
            setSelectedUser(null); 
        } catch (error) {
            alert('Erro', 'Falaha ao deletar');
        }
    };

    const handleLogout = async () => {
        try {
            console.log('Logout button pressed');
            alert('Logout', 'Logging out...');

            await AsyncStorage.removeItem('token');

            navigation.navigate('LoginScreen');
        } catch (error) {
            alert('Error', 'Failed to logout');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableHighlight
            underlayColor="#ddd"
            onPress={() => setSelectedUser(item)}
            style={[
                styles.item,
                selectedUser?.id === item.id ? styles.selectedItem : null,
            ]}
        >
            <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUsername}>{item.username}</Text>
            </View>
        </TouchableHighlight>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('UserForm', { token })}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
            <FlatList
                contentContainerStyle={{ paddingTop: 80 }}
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
            {selectedUser && (
                <View style={styles.actionsContainer}>
                    <Button
                        title="Edit"
                        onPress={() => navigation.navigate('UserForm', { user: selectedUser, token })}
                    />
                    <Button
                        title="Delete"
                        onPress={() => handleDelete(selectedUser.id)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedItem: {
        backgroundColor: '#e0e0e0',
    },
    addButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#007bff',
        borderRadius: 50,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    logoutButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#ff6347',
        borderRadius: 50,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemUsername: {
        fontSize: 14,
        color: '#555',
    },
});
