import React, { useState } from "react";
import { Text, View, Modal, Pressable, StyleSheet, ScrollView } from "react-native";
import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Index() {
  interface articleData {
    title: string,
    field: string,
    summary: string,
    date: string,
    authors: string,
    source: string,
    sourceLink: string,
  }
  
  // NOTE: this is just dummy data for now, will be replaced with actual API calls
  const [articles, setArticles] = useState([
    {
      title: "Gene networks regulating adaptive cellular responses",
      field: "🧬 Biology",
      summary: "This study explores how gene regulatory networks control cellular responses to environmental changes.",
      date: "11/7/2025",
      authors: "John Doe",
      source: "ArViX",
      sourceLink: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "AlphaFold 2 Protein Folding Algorithm Developed at Baker Lab",
      field: "🧪 Chemistry",
      summary: "This study presents a breakthrough in protein structure prediction using deep learning.",
      date: "11/7/2025",
      authors: "John Doe 2",
      source: "ArViX",
      sourceLink: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Quantum coherence effects in superconductors",    
      field: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      date: "11/7/2025",
      authors: "John Doe 3, John Doe 4",
      source: "ArViX",
      sourceLink: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      field: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      date: "11/7/2025",
      authors: "Gru",
      source: "ArViX",
      sourceLink: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      field: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      date: "11/7/2025",
      authors: "John Doe 5, John Doe 6, John Doe 7, John Doe 8, John Doe 9",
      source: "ArViX",
      sourceLink: "https://arxiv.org/abs/1234.56789"
    }
  ]);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [modalArticle, setModalArticle] = useState<articleData | null>(null);

  const onArticleClick = (article: articleData) => {
    setModalArticle(article);
    setArticleModalVisible(true);
  }

  return (
    <View style={styles.container} >
      <LinearGradient colors={['#00156b', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <Text style={{ color: '#FFFFFF80', fontSize: 22, fontWeight: 700 }}>Top articles for you</Text>
      <ScrollView style={styles.mainBody} contentContainerStyle={{ alignItems: 'center', gap: 10 }} showsVerticalScrollIndicator={false}>
        { articles.map((article, index) => (
          <Pressable key={index} onPress={() => onArticleClick(article)}>
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
          <LinearGradient colors={['#00104f', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: 145, height: 800, borderRadius: 30 }} />
          <ArticleModal 
            title={modalArticle?.title || "Title not found."}
            summary={modalArticle?.summary || "Summary not found."}
            date={modalArticle?.date || "Date not found."}
            authors={modalArticle?.authors || "Authors not found."}
            source={modalArticle?.source || "Source not found."}
            sourceLink={modalArticle?.sourceLink || "Link not found."}
          />
          <Pressable onPress={() => setArticleModalVisible(false)} style={{ position: 'absolute', top: 160, right: 20 }}>
            <Ionicons name="close-outline" size={30} color="#FFFFFF80" /> 
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0000004D',
      alignItems: 'center',
      paddingTop: 20,
      borderRadius: 30
    },
    text: {
      color: '#FFFFFF80',
      fontSize: 22,
      fontWeight: 700,
    },
    mainBody: {
      marginTop: 20
    },
});
