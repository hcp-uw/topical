import React, { useState, useEffect, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View, StyleSheet, TextInput, Pressable, ScrollView, Modal, RefreshControl, NativeScrollEvent } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { dbSearchN } from '../../database/db'
import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";
import { styles } from "@/styles";
import { User } from "@supabase/auth-js";
import { authCurSession } from "@/database/auth";

export default function Search() {
  const RESULTS_PER_PAGE = 10;
  
  
  interface articleData {
    title: string,
    authors: string,
    category: string,
    summary: string,
    source_date: string,
    source_link: string,
    topic_id: string
  }
  
  const [articles, setArticles] = useState<articleData[]>([]);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [modalArticle, setModalArticle] = useState<articleData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");  
  const [lastSearch, setLastSearch] = useState<string>("");  
  const [user, setUser] = useState<User | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTopics(0);
    setRefreshing(false);
  }, [articles, searchTerm]);

  useEffect(() => {
    checkAuth();
  }, [])

  const onArticleClick = (article: articleData) => {
    setModalArticle(article);
    setArticleModalVisible(true);
  }

  const checkAuth = async () => {
    const u = await authCurSession(); 
    setUser(u); 
  }

  const fetchTopics = async (off: number) => {
    const res = await dbSearchN(searchTerm, off, RESULTS_PER_PAGE);

    // set articles state from response data (handle null)
    if (res && res.data) {
      // map DB fields to articleData shape
      const formatted = res.data.map((t: any) => ({
        title: t.title,
        authors: t.authors,
        category: t.category,
        summary: t.summary,
        source_date: t.source_date,
        source_link: t.source_link,
        topic_id: t.id
      }));
      setArticles(off === 0 ? formatted : articles.concat(formatted));
      setOffset(off + RESULTS_PER_PAGE);
    }
  }

  const onSearchClick = async () => {
    try {
      setArticles([])
      
      if (searchTerm.length === 0) {
        return;
      } else if (searchTerm !== lastSearch) {
          fetchTopics(0);
          setLastSearch(searchTerm)
        } else {
          setArticles([]);
        }
    } catch(e) {
      console.error(e)
    }
  }

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = 250;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  return (
    <View style={styles.container} >
      <LinearGradient colors={['#00156b', '#0F0F0F', '#0F0F0F']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <TextInput style={styles.input} placeholder="Search for topics..." placeholderTextColor="#A4A4A5" value={searchTerm} onChangeText={setSearchTerm} onSubmitEditing={onSearchClick}/>
      <ScrollView style={styles.mainBody} contentContainerStyle={{ alignItems: 'center', gap: 10 }} showsVerticalScrollIndicator={false}
        onScroll={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            fetchTopics(offset);
          }
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }>
        { articles === null ?
          <View style={styles.splash}>
            {/* <Text style={{ color: '#FFFFFF4D', fontSize: 60, fontWeight: 700 }}>🧫</Text>
            <Text style={{ color: '#FFFFFF4D', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>Did you know: A teaspoon of soil contains more living organisms than there are people on Earth</Text> */}
          </View> : 
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
          <LinearGradient colors={['#00104f', '#0F0F0F', '#0F0F0F']} style={styles.modalGradient} />
          <ArticleModal 
            title={modalArticle?.title || "Title not found."}
            summary={modalArticle?.summary || "Summary not found."}
            date={modalArticle?.source_date || "Source date not found."}
            source={modalArticle?.authors || "Authors not found."}
            sourceLink={modalArticle?.source_link || "Link not found."}
            loggedIn={user != null}
            userId={user?.id || "Not logged in."}
            topicId={modalArticle?.topic_id || "ID not found."}
          />
          <Pressable onPress={() => setArticleModalVisible(false)} style={{ position: 'absolute', top: 160, right: 20 }}>
            <Ionicons name="close-outline" size={30} color="#FFFFFF80" /> 
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}