import { LinearGradient } from "expo-linear-gradient";
import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Search() {
  return (
    <View style={styles.container} >
      <LinearGradient colors={['#00156b', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <TextInput style={styles.input} placeholder="University of Washington..." />
      <Pressable style={styles.filterButton}>
        <Ionicons name="filter-outline" size={24} color="#FFFFFF80" />
      </Pressable>
      <View style={styles.splash}>
        <Text style={{ color: '#FFFFFF4D', fontSize: 60, fontWeight: 700 }}>🧫</Text>
        <Text style={{ color: '#FFFFFF4D', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Did you know: A teaspoon of soil contains more living organisms than there are people on Earth</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0000004D',
      alignItems: 'center',
      paddingTop: 30,
      borderRadius: 30
    },
    input: {
      backgroundColor: '#FFFFFF05',
      borderWidth: 1,
      borderColor: '#FFFFFF1A',
      borderRadius: 18,
      width: 340,
      height: 60,
      padding: 18,
      fontSize: 18,
      color: '#FFFFFF',
    },
    filterButton: {
      position: 'absolute',
      top: 48,
      right: 40,
    },
    splash: {
      marginTop: 120,
      width: '70%',
      alignItems: 'center',
      gap: 15,
    },
});
