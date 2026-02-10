import React, { useState } from "react";
import { Text, View, Modal, Pressable, StyleSheet, ScrollView } from "react-native";
import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";

export default function Index() {
  // NOTE: this is just dummy data for now, will be replaced with actual API calls
  const [articles, setArticles] = useState([
    {
      title: "Gene networks regulating adaptive cellular responses",
      field: "Biology",
      date: "11/7/2025",
      source: "ArViX",
    },
    {
      title: "AlphaFold 2 Protein Folding Algorithm Developed at Baker Lab",
      field: "Chemistry",
      date: "11/7/2025",
      source: "ArViX",
    },
    {
      title: "Quantum coherence effects in superconductors",    
      field: "Physics",
      date: "11/7/2025",
      source: "ArViX",
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      field: "Physics",
      date: "11/7/2025",
      source: "ArViX",
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      field: "Physics",
      date: "11/7/2025",
      source: "ArViX",
    }
  ]);
  const [articleModalVisible, setArticleModalVisible] = useState(false);

  return (
    <View style={styles.container} >
      <Text style={styles.text}>Top articles for you</Text>
      {/* <Link href="/explore" style={styles.button}>
        Go to Explore screen
      </Link> */}
      <ScrollView style={styles.mainBody}>
        { articles.map((article, index) => (
          <Pressable key={index} onPress={() => setArticleModalVisible(true)}>
            <Article 
              key={index}
              title={article.title}
              field={article.field}
              date={article.date}
              source={article.source}
            />
          </Pressable>
          
        ))}
        <Modal visible={articleModalVisible} animationType="slide" transparent={true}>
          <ArticleModal 
            title="Gene networks regulating adaptive cellular responses"
            summary="Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor."
            date="11/7/2025"
            source="ArViX"
            sourceLink="https://arxiv.org/abs/1234.56789"
          />
          <Pressable onPress={() => setArticleModalVisible(false)}>
            <Text>Close Modal</Text>
          </Pressable>
        </Modal>
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
