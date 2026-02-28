import React, { useState, useEffect } from "react";
import { Text, View, Modal, Pressable, StyleSheet, ScrollView } from "react-native";
import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import { dbGetN } from '../../database/db'

export default function Index() {
  interface articleData {
    title: string,
    authors: string,
    category: string,
    summary: string,
    source_date: string,
    source_link: string,
  }
  
  const [articles, setArticles] = useState<articleData[] | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // dummy uid for now
        const res = await dbGetN("12345", 10);

        console.log(res)
        // set articles state from response data (handle null)
        if (res && res.data) {
          // map DB fields to your articleData shape if needed
          const formatted = res.data.map((t: any) => ({
            title: t.title,
            authors: t.authors,
            category: t.category,
            summary: t.summary,
            source_date: t.source_date,
            source_link: t.source_link
          }));
          setArticles(formatted);
        } else {
          setArticles([]);
        }
      } catch(e) {
        console.error(e)
      }
    }

    fetchData()
  }, []);

  const [dummyArticles, setDummyArticles] = useState([
    {
      title: "Gene networks regulating adaptive cellular responses",
      category: "🧬 Biology",
      summary: "This study explores how gene regulatory networks control cellular responses to environmental changes.",
      source_date: "11/7/2025",
      source: "ArViX",
      source_link: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "AlphaFold 2 Protein Folding Algorithm Developed at Baker Lab",
      category: "🧪 Chemistry",
      summary: "This study presents a breakthrough in protein structure prediction using deep learning.",
      source_date: "11/7/2025",
      source: "ArViX",
      source_link: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Quantum coherence effects in superconductors",    
      category: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      source_date: "11/7/2025",
      source: "ArViX",
      source_link: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      category: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      source_date: "11/7/2025",
      source: "ArViX",
      source_link: "https://arxiv.org/abs/1234.56789"
    },
    {
      title: "Plasma turbulence shaping fusion reactor behavior",
      category: "🚀 Physics",
      summary: "This research investigates how quantum coherence affects superconducting properties.",
      source_date: "11/7/2025",
      source: "ArViX",
      source_link: "https://arxiv.org/abs/1234.56789"
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
        { articles === null ?
          <></> : 
          articles.map((article, index) => (
          <Pressable style={{ width: "100%" }} key={index} onPress={() => onArticleClick(article)}>
            <Article 
              key={index}
              title={article.title}
              field={article.category}
              date={article.source_date}
              source={article.authors}
            />
          </Pressable>
        ))}
        <Modal visible={articleModalVisible} animationType="slide" transparent={true}>
          <LinearGradient colors={['#00104f', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: 145, height: 800, borderRadius: 30 }} />
          <ArticleModal 
            title={modalArticle?.title || "Title not found."}
            summary={modalArticle?.summary || "Summary not found."}
            date={modalArticle?.source_date || "Source date not found."}
            source={modalArticle?.authors || "Authors not found."}
            sourceLink={modalArticle?.source_link || "Link not found."}
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
