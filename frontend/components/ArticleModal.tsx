import React, { useState } from 'react';
import { View, Text, Button, Pressable, StyleSheet, ScrollView } from 'react-native';

type Props = {
  title: string,
  summary: string,
  date: string,
  source: string,
  sourceLink: string,
};

export default function ArticleModal({ title, summary, date, source, sourceLink }: Props) {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{title}</Text>
            <Text style={{ color: '#FFFFFF50', fontSize: 16, fontWeight: 700 }}>{summary}</Text>
            <View style={styles.infoContainer}>
                <Pressable onPress={() => console.log("Save the article")} style={styles.saveButton}>
                    <Text style={{ color: '#A4A4A5' }}>Save</Text>
                </Pressable>
                <Text style={{ color: '#A4A4A5', fontSize: 13, fontWeight: 700 }}>{date} • {source}</Text>
            </View>
            <Pressable onPress={() => console.log(`Open ${sourceLink} in browser`)} style={styles.sourceButton}>
                <View>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>Visit source</Text>
                    {/* chevron here */}
                </View>
                <Text style={{ color: '#FFFFFF60', fontSize: 12, fontWeight: 700 }}>{sourceLink}</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        top: 160,
        backgroundColor: '#0c172c',
        paddingTop: 30,
        paddingHorizontal: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    infoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saveButton: {
        width: 80,
        alignItems: 'center',
        backgroundColor: '#FFFFFF05',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderRadius: 40,
        borderColor: '#FFFFFF10',
    },
    sourceButton: {
        backgroundColor: '#45FF671A',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#79FF050D',
        gap: 6,
        width: 300,
    },
});
