import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from '@/styles';
import { dbGetLiked, dbSetLiked } from '@/database/db';

type Props = {
  title: string,
  summary: string,
  date: string,
  source: string,
  sourceLink: string,
  loggedIn: boolean,
  userId: string,
  topicId: string
};

export default function ArticleModal({ title, summary, date, source, sourceLink, loggedIn, userId, topicId }: Props) {
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        async function getLike() {
            if (loggedIn) {
                setLiked(await dbGetLiked(userId, topicId) || false);
            }
        }

        getLike()
    }, []);
    
    const onLike = async () => {
        dbSetLiked(userId, topicId, !liked);
        setLiked(!liked);
    }

    return (
        <ScrollView style={styles.modalContainer} contentContainerStyle={{ alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{title}</Text>
            <Text style={{ color: '#FFFFFF50', fontSize: 16, fontWeight: 700 }}>{summary}</Text>
            <View style={styles.infoContainer}>
                { loggedIn ? 
                <Pressable onPress={() => onLike()} style={[styles.saveButton, {borderColor: (liked ? '#1eff29c7' : '#FFFFFF10')}]}>
                    <Ionicons name={liked ? "heart" : "heart-outline"} size={16} color="#FFFFFF80" /> 
                    <Text style={{ color: '#A4A4A5' }}>{liked ? "Liked" : "Like"}</Text>
                </Pressable>
                : 
                <></>
                }
                <Text style={{ color: '#A4A4A5', fontSize: 13, fontWeight: 700, width: '70%' }}>{date} • {source}</Text>
            </View>
            <Pressable onPress={() => console.log(`Open ${sourceLink} in browser`)} style={styles.sourceButton}>
                <View style={styles.sourceContainer}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Visit source</Text>
                    <Ionicons name="chevron-forward-outline" size={12} color="#FFFFFF80" /> 
                </View>
                <Text style={{ color: '#FFFFFF60', fontSize: 12, fontWeight: 700 }}>{sourceLink}</Text>
            </Pressable>
        </ScrollView>
    );
};
