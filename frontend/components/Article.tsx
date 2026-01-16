import { StyleSheet, View, Pressable, Text } from 'react-native';

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
        {/* chevron here */}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.articleField}>{field}</Text>
        <Text style={styles.articleInfo}>{date} • {source}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  articleContainer: {
    width: 360,
    height: 120,
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
    gap: 36,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleTitle: {
    width: 280,
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
  },
  articleField: {
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 40,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: 700,
    color: '#A4A4A5',
  },
  articleInfo: {
    fontSize: 13,
    fontWeight: 700,
    color: '#A4A4A5',
  },
});