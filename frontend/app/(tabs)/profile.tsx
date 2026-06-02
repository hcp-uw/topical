import Article from "@/components/Article";
import ArticleModal from "@/components/ArticleModal";
import { authCurSession, authSignOut } from "@/database/auth";
import { dbGetUserLikes } from "@/database/db";
import Ionicons from '@expo/vector-icons/Ionicons';
import { User } from "@supabase/auth-js";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {styles} from "@/styles"
import { Image, Modal, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Profile() {
    interface articleData {
        title: string,
        authors: string,
        category: string,
        summary: string,
        source_date: string,
        source_link: string,
        topic_id: string
    }
    
    const [user, setUser] = useState<User | null>(null); // Current user.
    const [liked, setLiked] = useState<articleData[]>([]); // List of liked articles. 
    const [modalArticle, setModalArticle] = useState<articleData | null>(null); // 
    const [articleModalVisible, setArticleModalVisible] = useState(false); // Toggles individual article modal.
    const [refreshing, setRefreshing] = React.useState(false); // Toggles refresh graphic.

    // Re-fetches topics
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchLiked(user);
        setRefreshing(false);
    }, [liked]);

    // Runs on page load, checks user auth and fetches liked articles.
    useEffect(() => {
        checkAuthAndFetchLiked();
    }, [])

    // Checks user auth and fetches liked articles.
    const checkAuthAndFetchLiked = async () => {
        const u = await authCurSession();
        setUser(u);
        fetchLiked(u);
    }

    // Fetches liked articles for the given user u.
    const fetchLiked = async (u: User | null) => {
        if (u) {
            const data = await dbGetUserLikes(u.id);
            if (data) {
                // map DB fields to articleData shape
                const formatted = data.map((t: any) => ({
                    title: t.title,
                    authors: t.authors,
                    category: t.category,
                    summary: t.summary,
                    source_date: t.source_date,
                    source_link: t.source_link,
                    topic_id: t.id
                }));
                setLiked(formatted);
            }
        }
    }

    // Triggers when the user presses the logout button. Signs them out and redirects to the login page.
    const onLogout = async () => {
        const authRes = await authSignOut();
        if (authRes !== null) {
            alert("Error signing out: " + authRes);
        } else {
            setTimeout(() => {
                router.replace('/auth/login');
            }, 0);
        }
    }

    // Triggers when an article is clicked. Shows the modal with that article. 
    const onArticleClick = (article: articleData) => {
        setModalArticle(article);
        setArticleModalVisible(true);
    }

    return (
    <>
        { user != null ? 
        <View style={styles.container}>
            <LinearGradient
                colors={['#00156b', '#0F0F0F', '#0F0F0F']}
                style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }}
            />

            {/* Top part */}
            <View style={styles.topSection}>
                <View style={styles.profileHeader}>
                    <Image
                        source={require('../../assets/images/profile.png')}
                        style={styles.profileImage}
                    />
                    <Text style={styles.nameText}>{user?.user_metadata?.name}</Text>
                    <Text style={styles.joinText}>Joined {new Date(user?.created_at).toLocaleDateString()}</Text>
                </View>
            </View>

            <Pressable onPress={onLogout} style={{ padding: 10, borderRadius: 20, position: 'absolute', top: 20, right: 20 }}>
                <Ionicons name="exit-outline" size={30} color="#ff0000cd" /> 
            </Pressable>

            {/* bottom part   */}
            <View style={styles.bottomSection}>
                <View style={styles.listHeaderContainer}>
                    <Text style={styles.listHeaderTitle}>Saved topics</Text>
                </View>

                <ScrollView contentContainerStyle={styles.articlesList} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
                    }>
                    {liked.map((article, index) => (
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
                </ScrollView>
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
            </View>
        </View>
        :
        <View style={styles.container}>
            <LinearGradient
                colors={['#00104f', '#0F0F0F', '#0F0F0F']}
                style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }}
            />
            <View style={[styles.topSection, {alignItems: "center", justifyContent: "center", width: "100%", height: "100%"}]}>
                <Text style={styles.nameText}>Please sign in</Text>
            </View>
        </View>
        }
    </>
    );
}
