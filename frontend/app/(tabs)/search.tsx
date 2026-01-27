import { Text, View, StyleSheet, TextInput } from "react-native";

export default function Search() {
  return (
    <View style={styles.container} >
      <TextInput style={styles.input} placeholder="University of Washington..." />
      {/* Search text box */}

      <View style={styles.splash}>
        <Text style={styles.text}>Did you know: A teaspoon of soil contains more living organisms than there are people on Earth</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0c172c',
      alignItems: 'center',
      paddingTop: 30
    },
    input: {
      borderWidth: 1,
      borderColor: '#FFFFFF1A',
      borderRadius: 18,
      width: 340,
      height: 60,
      padding: 16,
      fontSize: 18,
      color: '#FFFFFF',
    },
    text: {
      color: '#FFFFFF80',
      fontSize: 16,
      fontWeight: 700,
      marginBottom: 20,
      textAlign: 'left',
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
    splash: {
      width: 270,
      margin: 'auto',
    },
});
