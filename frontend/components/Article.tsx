import { StyleSheet, View, Pressable, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { styles } from '@/styles';

type Props = {
  title: string,
  field: string,
  date: string,
  source: string;
};

export default function Article({ title, field, date, source }: Props) {
  return (
    <View style={styles.articleContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.articleTitle}>{title}</Text>
        <Ionicons name="chevron-forward-outline" size={12} color="#FFFFFF80" /> 
      </View>
      <View style={styles.infoContainer}>
        <Pressable style={styles.articleField}>
          <Text style={{color: '#A4A4A5', fontSize: 13, fontWeight: 700}}>{field}</Text>
        </Pressable>
        <Text style={{color: '#A4A4A5', fontSize: 13, fontWeight: 700}}>{date} • {source}</Text>
      </View>
    </View>
  );
}