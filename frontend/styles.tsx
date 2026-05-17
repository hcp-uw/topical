import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    modalContainer: {
        top: 95,
        backgroundColor: '#0000004D',
        paddingTop: 30,
        paddingHorizontal: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    infoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    saveButton: {
        // width: 80,
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        backgroundColor: '#FFFFFF05',
        paddingVertical: 8,
        paddingHorizontal: 15,
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
    articleTitle: {
        // width: "85%",
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
    container: {
        flex: 1,
        backgroundColor: '#0000004D',
        alignItems: 'center',
        paddingTop: 20,
        borderRadius: 30
    },
    text: {
        color: '#FFFFFF80',
        fontSize: 22,
        fontWeight: 700,
    },
    filterButton: {
        position: "absolute",
        right: 20,
        top: 5
    },
    mainBody: {
        marginTop: 20
    },
    input: {
      backgroundColor: '#FFFFFF05',
      borderWidth: 1,
      borderColor: '#FFFFFF1A',
      borderRadius: 18,
      width: 340,
      height: 60,
      padding: 18,
      fontSize: 18,
      color: '#FFFFFF',
    },
    splash: {
      marginTop: 120,
      width: '70%',
      alignItems: 'center',
      gap: 15,
    },
    modalGradient: { 
        position: 'absolute', 
        left: 0, 
        right: 0, 
        top: 95, 
        height: 800, 
        borderRadius: 30 
    },
    topSection: {
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 30,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
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
        backgroundColor: '#0000004D',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 15,
        paddingTop: 20,
        width: "100%"
    },
    listHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
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

export { styles };