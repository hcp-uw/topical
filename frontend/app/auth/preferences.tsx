import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { styles } from "@/styles";

export default function Index() {
  const router = useRouter(); 
  const fields = ['🧪 Chemistry', '🧬 Biology', '🚀 Physics', '💻 Computer Science', '🧠 Artificial Intelligence'];

  const onConfirm = () => {
    setTimeout(() => {
      router.replace('/');
    }, 0);
  };

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={['#0C1740', '#0B2520']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <View style={{ marginTop: 100, marginBottom: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 700, margin: 'auto' }}>Select your interests:</Text>
      </View>
      <View style={{ flex: 1, height: 20, gap: 15, paddingHorizontal: 30 }}>
        {
          fields.map((field, index) => (
             <View style={styles.articleField} key={index}>
              <Text style={{color: '#A4A4A5', fontSize: 22, fontWeight: 700 }}>{field}</Text>
             </View>
          ))
        }
      </View>
      <View style={{ width: "100%", position: 'absolute', bottom: 50, padding: 15 }}>
        <Pressable onPress={onConfirm} style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 30 }}>
          <Text style={{ fontWeight: 700, textAlign: 'center', fontSize: 22 }}>🔭 Start exploring</Text>
        </Pressable>
      </View>
    </View>
  );
}