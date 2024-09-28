import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
} from "react-native";
import { htmlToText } from "html-to-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useNavigation } from "expo-router";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type NewsCardProps = {
  item: NewsType;
};

export default function NewsCard({ item }: NewsCardProps) {
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const existingCartData = await AsyncStorage.getItem("cart");
        const cartData = existingCartData ? JSON.parse(existingCartData) : [];
        setIsSaved(cartData.some((savedItem: any) => savedItem._id === item._id));
      } catch (error) {
        console.error("Error checking saved items:", error);
      }
    };
    checkIfSaved();
  }, [item._id]);

  useEffect(() => {
    const extractVideoId = (url: string) => {
      const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const videoId = extractVideoId(item.yt_url || "");
    setThumbnailUrl(videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://via.placeholder.com/300x200?text=No+Video");
  }, [item.yt_url]);

  const contentPreview = useMemo(() => {
    return htmlToText(item.content).split(" ").slice(0, 10).join(" ") + "...";
  }, [item.content]);

  const displayDate = useMemo(() => {
    const createdAt = new Date(item.createdAt);
    const now = new Date();
    const timeDiff = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    const minutes = Math.floor(timeDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 5) {
      return createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } else if (days >= 1) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes >= 1) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  }, [item.createdAt]);

  const handleSave = async () => {
    try {
      const existingCartData = await AsyncStorage.getItem("cart");
      const cartData = existingCartData ? JSON.parse(existingCartData) : [];
      const itemExists = cartData.some((savedItem: any) => savedItem._id === item._id);

      if (!itemExists) {
        cartData.push(item);
        setIsSaved(true);
      } else {
        const updatedCartData = cartData.filter((savedItem: any) => savedItem._id !== item._id);
        setIsSaved(false);
        await AsyncStorage.setItem("cart", JSON.stringify(updatedCartData));
      }
      await AsyncStorage.setItem("cart", JSON.stringify(cartData));
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this news: ${item.title}\n\n${contentPreview}`,
      });
    } catch (error) {
      console.error("Error sharing the news:", error);
    }
  };

  const handlePress = () => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image,
      yt_url: item.yt_url,
      author: item.author,
      createdAt: item.createdAt,
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.contentWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <Image
          source={{ uri: item.yt_url ? thumbnailUrl : item.featured_image }}
          style={styles.videoThumbnail}
          key={thumbnailUrl || item.featured_image}
        />
      </View>
      <View style={styles.buttonsWrapper}>
        <Text style={styles.createdAt}>{displayDate}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <FontAwesome name="bookmark" size={16} color={isSaved ? "red" : "#333"} />
            <Text style={styles.buttonText}> Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <FontAwesome name="share" size={16} color="#333" />
            <Text style={styles.buttonText}> Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    borderRadius: 12,
    padding: 8,
    marginVertical: 5,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "Raleway_600SemiBold",
  },
  buttonsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  createdAt: {
    color: "#666",
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#333",
    fontSize: 14,
  },
  videoThumbnail: {
    width: wp(30),
    height: 90,
    resizeMode: "contain",
    marginLeft: 8,
    borderRadius: 10,
    marginTop: 10,
  },
});
