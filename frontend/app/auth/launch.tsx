import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { setAuthenticated } from "@/app/auth/auth";

export default function Index() {
  const router = useRouter(); 
  const [firstSignIn, setFirstSignIn] = useState(true);

  const onSignIn = () => {
    setAuthenticated(true);
    if (firstSignIn) {
      setTimeout(() => {
        router.replace('/auth/preferences');
      }, 0);
    }
    else {
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  };

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={['#0C1740', '#0B2520']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <View style={{ height: '75%' }}>
        <Text style={{ color: '#FFFFFF80', fontSize: 66, fontWeight: 400, textAlign: 'center', margin: 'auto' }}>Topical</Text>
      </View>
      <View style={{ width: "100%", flex: 1, gap: 10, backgroundColor: '#0000004D', paddingTop: 20, borderRadius: 30, padding: 15 }}>
        <Pressable onPress={onSignIn} style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 30 }}>
          <Text style={{ fontWeight: 700, textAlign: 'center', fontSize: 22 }}>Sign in with Google</Text>
        </Pressable>
        <Text style={{ color: '#FFFFFF80', fontSize: 14, marginTop: 10 }}>By continuing, you agree to the Privacy Policy and Terms of Service.</Text>
      </View>
    </View>
  );
}