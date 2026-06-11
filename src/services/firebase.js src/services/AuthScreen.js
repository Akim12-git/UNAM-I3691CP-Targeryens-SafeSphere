import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Make text larger */}
      <Text style={styles.largeText}>Hello, this text is now bigger!</Text>
      
      {/* Make buttons larger using padding */}
      <TouchableOpacity style={styles.largeButton}>
        <Text style={styles.buttonText}>Large Button</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  largeText: {
    fontSize: 24,         // Increased from default 14-16
    fontWeight: 'bold',
    marginBottom: 20,
  },
  largeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,   // Higher vertical padding makes it taller
    paddingHorizontal: 30, // Higher horizontal padding makes it wider
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,         // Larger button text
    fontWeight: '600',
  },
});
