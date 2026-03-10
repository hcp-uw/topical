import Article from "@/components/Article";
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React from "react";
import { Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Profile() {
    const savedArticles = [
        {
            title: "AlphaFold 2 Protein Folding Algorithm Developed at Baker Lab",
            field: "🧪 Chemistry",
            summary: "This study presents a breakthrough in protein structure prediction using deep learning.",
            date: "11/7/2025",
            source: "ArViX",
        },
        {
            title: "Quantum coherence effects in superconductors",
            field: "🚀 Physics",
            summary: "This research investigates how quantum coherence affects superconducting properties.",
            date: "11/7/2025",
            source: "ArViX",
        },
        {
            title: "Plasma turbulence shaping fusion reactor behavior",
            field: "🚀 Physics",
            summary: "This research investigates how quantum coherence affects superconducting properties.",
            date: "11/7/2025",
            source: "ArViX",
        }
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#07133f', '#07133f', '#090a10']}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Top part */}
            <View style={styles.topSection}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#A4A4A5" />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>

                <View style={styles.profileHeader}>
                    <Image
                        source={require('../../assets/images/profile.png')}
                        style={styles.profileImage}
                    />
                    <Text style={styles.nameText}>Harry the Husky</Text>
                    <Text style={styles.joinText}>Joined 11/17/2025</Text>
                </View>
            </View>

            {/* bottom part   */}
            <View style={styles.bottomSection}>
                <View style={styles.listHeaderContainer}>
                    <Text style={styles.listHeaderTitle}>Saved articles</Text>
                    <Ionicons name="filter-outline" size={24} color="#A4A4A5" />
                </View>

                <ScrollView contentContainerStyle={styles.articlesList} showsVerticalScrollIndicator={false}>
                    {savedArticles.map((article, index) => (
                        <Article
                            key={index}
                            title={article.title}
                            field={article.field}
                            date={article.date}
                            source={article.source}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#090a10c1',
    },
    topSection: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 30,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    backText: {
        color: '#A4A4A5',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 4,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    nameText: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    joinText: {
        color: '#7b7b8b',
        fontSize: 18,
        fontWeight: '600',
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#0c0d11',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    listHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginBottom: 20,
    },
    listHeaderTitle: {
        color: '#FFFFFF80',
        fontSize: 22,
        fontWeight: 'bold',
    },
    articlesList: {
        alignItems: 'center',
        gap: 15,
        paddingBottom: 20,
    }
});
