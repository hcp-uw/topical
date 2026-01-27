import { Text, View, StyleSheet, ScrollView } from "react-native";
import Article from "@/components/Article";

export default function Index() {
  return (
    <View style={styles.container} >
      <Text style={styles.text}>Top articles for you</Text>
      {/* <Link href="/explore" style={styles.button}>
        Go to Explore screen
      </Link> */}
      <ScrollView style={styles.mainBody}>
        <Article 
          title="Gene networks regulating adaptive cellular responses" 
          field="Biology" 
          date="11/7/2025" 
          source="ArViX" 
        />
        <Article 
          title="AlphaFold 2 Protein Folding Algorithm Developed at Baker Lab" 
          field="Chemistry" 
          date="11/7/2025" 
          source="ArViX" 
        />
        <Article 
          title="Quantum coherence effects in superconductors" 
          field="Physics" 
          date="11/7/2025" 
          source="ArViX" 
        />
        <Article 
          title="Plasma turbulence shaping fusion reactor behavior" 
          field="Physics" 
          date="11/7/2025" 
          source="ArViX" 
        />
        <Article 
          title="Plasma turbulence shaping fusion reactor behavior" 
          field="Physics" 
          date="11/7/2025" 
          source="ArViX" 
        />
      </ScrollView>
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
    text: {
      color: '#FFFFFF80',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 20,
      textAlign: 'left',
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
    mainBody: {
      gap: 10,
    },
});
