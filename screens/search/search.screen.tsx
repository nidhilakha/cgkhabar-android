import { View, Text, SafeAreaView, TouchableOpacity,StyleSheet } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import SearchInput from "@/components/common/search.input";
import Header from "@/components/header/header";

export default function SearchScreen() {
  return (
    <LinearGradient  colors={["#F2F2F2", "#e3e3e3"]} style={{ flex: 1,paddingTop: 50 }}>
      <Header />
      <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
     
        
    </View>

        <SearchInput />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginBottom: 10,
      width: "90%",
    },
  
   
  });