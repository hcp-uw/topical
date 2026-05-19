import React, { useState } from "react";
import { Text, View, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { styles } from "@/styles";
import { authLogIn } from "@/database/auth";

export default function Index() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const onLogin = async () => {
    const authRes = await authLogIn(email, password);
    if (authRes === null) {
      alert("Email or password is incorrect");
      return;
    } else {
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  };

  const onSignUp = () => {
    setTimeout(() => {
      router.replace('/auth/signup');
    }, 0);
  };

  return (
    <View style={{flex: 1}}>
      <LinearGradient colors={['#0C1740', '#0B2520']} style={{ position: 'absolute', left: 0, right: 0, top: -100, height: 1000, zIndex: -10 }} />
      <View style={{margin: 40}}>
        <Text style={{ color: '#FFFFFF80', fontSize: 50, fontWeight: 700, textAlign: 'center', margin: 'auto', marginTop: 40 }}>Topical</Text>
      </View>
      <View style={{ width: "100%", flex: 1, gap: 20, backgroundColor: '#0000004D', paddingTop: 20, borderRadius: 30, padding: 20 }}>
        <TextInput value={email} onChangeText={setEmail} style={[styles.input, {width: "100%"}]} placeholder={"Email..."} autoCapitalize="none" placeholderTextColor="#A4A4A5"/>
        <TextInput value={password} secureTextEntry onChangeText={setPassword} style={[styles.input, {width: "100%"}]} placeholder={"Password..."} autoCapitalize="none" placeholderTextColor="#A4A4A5"/>
        <Pressable onPress={onLogin} style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 30 }}>
          <Text style={{ fontWeight: 700, textAlign: 'center', fontSize: 22 }}>Log In</Text>
        </Pressable>
        <Text style={{ color: '#FFFFFF80', fontSize: 14, marginTop: 10 }}>By continuing, you agree to the Privacy Policy and Terms of Service.</Text>
        <Pressable onPress={onSignUp}>
          <Text style={{ fontWeight: 400, fontSize: 16, color: '#FFFFFF80' }}>Don't have an account yet? <Text style={{ fontWeight: 400, color: '#FFFFFF' }}>Sign up here</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}