import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
// Import your initialized Firebase app instance
import { db } from './firebaseConfig'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [message, setMessage] = useState('Loading data...');
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, 'welcome', 'messageId');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMessage(docSnap.data().text);
        } else {
          setMessage('No document found in Firestore!');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update data in Firestore when button is pressed
  async function handlePress() {
    try {
      const docRef = doc(db, 'welcome', 'messageId');
      await setDoc(docRef, { text: 'Hello from React Native!' }, { merge: true });
      setMessage('Hello from React Native!');
      alert('Firestore Updated!');
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          {/* Large text displaying Firestore data */}
          <Text style={styles.largeText}>{message}</Text>
          
          {/* Large interactive button */}
          <TouchableOpacity style={styles.largeButton} onPress={handlePress}>
            <Text style={styles.buttonText}>Update Firestore</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 24,         
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  largeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,   
    paddingHorizontal: 30, 
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,         
    fontWeight: '600',
  },
});
