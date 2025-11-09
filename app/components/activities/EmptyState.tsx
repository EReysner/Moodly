import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = ({ setSearchQuery }) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIllustration}>
        <Ionicons name="search" size={40} color="#6B8BFF" />
      </View>
      <Text style={styles.emptyStateText}>
        No se encontraron resultados
      </Text>
      <TouchableOpacity 
        style={styles.resetSearchButton}
        onPress={() => setSearchQuery("")}
      >
        <Text style={styles.resetSearchText}>Limpiar búsqueda</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateIllustration: {
    width: 200,
    height: 200,
    backgroundColor: "#F0F4FF",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 16,
    color: "#8F9BB3",
    fontWeight: "500",
    textAlign: "center",
  },
  resetSearchButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F0F4FF",
    borderRadius: 8,
  },
  resetSearchText: {
    color: "#6B8BFF",
    fontWeight: "500",
  },
});

export default EmptyState;