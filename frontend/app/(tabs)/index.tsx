import React, { useState, useEffect } from "react";
import { Text, View, Modal, Pressable, StyleSheet, ScrollView, NativeScrollEvent } from "react-native";
import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';
import { dbGetCategories, dbGetN } from '../../database/db'
import { styles } from "@/styles";

export default function Index() {
  interface articleData {
    title: string,
    authors: string,
    category: string,
    summary: string,
    source_date: string,
    source_link: string,
  }
  
  const [articles, setArticles] = useState<articleData[]>([])
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [modalArticle, setModalArticle] = useState<articleData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await dbGetCategories();

        if (categories && categories.data) {
          const categoriesArr = []
          for (const item of categories.data) {
            categoriesArr.push(item);
          }
          setCategories(categoriesArr)
        }
      } catch(e) {
        console.error(e)
      }
    }

    fetchTopics()
    fetchCategories()
  }, []);

  const fetchTopics = async () => {
    try {
      // dummy uid for now
      const res = await dbGetN("12345", 10, selectedCategories);

      // set articles state from response data (handle null)
      if (res && res.data) {
        // map DB fields to articleData shape
        const formatted = res.data.map((t: any) => ({
          title: t.title,
          authors: t.authors,
          category: t.category,
          summary: t.summary,
          source_date: t.source_date,
          source_link: t.source_link
        }));
        setArticles(articles.concat(formatted));
      } else {
        setArticles([]);
      }
    } catch(e) {
      console.error(e)
    }
  }

  const onArticleClick = (article: articleData) => {
    setModalArticle(article);
    setArticleModalVisible(true);
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const onFilterSave = () => {
    setArticles([])
    fetchTopics();
    setFilterModalVisible(false);
  }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = 50;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  return (
    <View style={styles.container} >
      <LinearGradient colors={['#00156b', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <View style={{ width: "100%" }}>
        <Text style={{ color: '#FFFFFF80', fontSize: 22, fontWeight: 700, marginLeft: "auto", marginRight: "auto" }}>Top articles for you</Text>
        <Pressable style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter-outline" size={24} color="#FFFFFF80" />
        </Pressable>
      </View>
      <ScrollView style={styles.mainBody} contentContainerStyle={{ alignItems: 'center', gap: 10 }} showsVerticalScrollIndicator={false} scrollEventThrottle={400}
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            fetchTopics();
          }
        }}>
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
          ))
        }
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
        <Modal visible={filterModalVisible} style={{ width: "100%" }} animationType="slide" transparent={true}>
          <LinearGradient colors={['#00104f', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: 145, height: 800, borderRadius: 30 }} />
          <ScrollView style={styles.modalContainer} contentContainerStyle={{flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap"}}>
            { categories === null ?
              <></> : 
              categories.map((category, index) => (
                <Pressable style={[styles.sourceButton, { width: "auto" }, selectedCategories.includes(category) ? { borderWidth: 1, borderColor: "white" } : {}]} onPress={() => toggleCategory(category)} key={index}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{category}</Text>
                </Pressable>
              ))
            }
          </ScrollView>
          <Pressable onPress={() => setFilterModalVisible(false)} style={{ position: 'absolute', top: 160, right: 20 }}>
            <Ionicons name="close-outline" size={30} color="#FFFFFF80" /> 
          </Pressable>
          <Pressable style={[styles.sourceButton, { width: "auto", position: "absolute", bottom: 30, left: "50%", transform: "translate(-50%)"}]} onPress={() => onFilterSave()}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Save</Text>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}