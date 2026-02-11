import { StyleSheet, View, Pressable, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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
        <Pressable onPress={() => console.log(`Filter by ${field}`)} style={styles.articleField}>
          <Text style={{color: '#A4A4A5', fontSize: 13, fontWeight: 700}}>{field}</Text>
        </Pressable>
        <Text style={{color: '#A4A4A5', fontSize: 13, fontWeight: 700}}>{date} • {source}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  articleContainer: {
    width: "98%",
    borderWidth: 1,
    borderColor: '#FFFFFF08',
    borderRadius: 25,
    backgroundColor: '#FFFFFF05',
    flexDirection: 'column',
    gap: 20,
    padding: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleTitle: {
    width: "85%",
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
  },
  articleField: {
    backgroundColor: '#FFFFFF0D',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },
});