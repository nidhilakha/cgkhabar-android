import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { styles } from "@/styles/home/banner.style"; // Ensure styles are imported
import { router } from "expo-router";

// Define the interface for Banner Data
export interface BannerDataTypes {
  featured_image: string;
  title: string;
  _id: string;
  content: string;
  yt_url: string;
}



interface HomeBannerSliderProps {
  data: BannerDataTypes[]; // Ensure that data is always an array
}

const HomeBannerSlider: React.FC<HomeBannerSliderProps> = ({ data }) => {
  // If data is undefined or not an array, return early
  // console.log("Props in HomeBannerSlider:", data); // Add this log

  // Check if data is not an array or is empty
  // if (!Array.isArray(data) || data.length === 0) {
  //   return <Text>No banner data available</Text>;
  // }

  const handlePress = (item: BannerDataTypes) => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image || "", // Handle missing image
      yt_url: item.yt_url,
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

 

  return (
    <View style={styles.container}>
      <Swiper
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        autoplay={true}
        autoplayTimeout={5}
      >
      {data.map((item:any) => (
     <View key={item._id} style={styles.slide}>
     <TouchableOpacity onPress={() => handlePress(item)}>
       <Text
         style={styles.title}
         numberOfLines={2} // Limits the text to 2 lines
         ellipsizeMode="tail" // Adds '...' at the end of the truncated text
       >
         {item.title}
       </Text>
       <View style={styles.imageContainer}>
        {/* <Text> {item.featured_image}</Text> */}
        <Image
  key={item._id} // Ensures a new image load on data change
  source={{ uri: item.featured_image }}
  style={styles.image}
  // onError={(error) => console.log("Image load error: ", error.nativeEvent)}
/>


       </View>
     </TouchableOpacity>
   </View>
))}

      </Swiper>
    </View>
  );
};

export default HomeBannerSlider;
