import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useNavigation } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { htmlToText } from "html-to-text";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Define the type for the navigation parameters
type NewsCardNavigationParams = {
  videoUri?: string;
};

type NewsCardProps = {
  item: NewsType;
};

export default function NewsCard({ item }: NewsCardProps) {
  const navigation = useNavigation<any>(); // Adjust the type if you have a specific type for navigation
  const generateThumbnailUrl = (videoUrl: string) => {
    return videoUrl.replace("video/upload", "video/upload/w_500,h_300,c_pad");
  };
  const thumbnailUrl = item.featured_video
    ? generateThumbnailUrl(item.featured_video)
    : undefined;

  // Truncate content to 10 words
  const contentPreview =
    htmlToText(item.content).split(" ").slice(0, 10).join(" ") + "...";

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const timeDiff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

    const minutes = Math.floor(timeDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 5) {
      return date.toLocaleDateString("en-US", {
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
    } else {
      return "Just now";
    }
  };

  // Convert item.createdAt to Date and calculate display date
  const createdAt = new Date(item.createdAt);
  const displayDate = getRelativeTime(createdAt);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/(routes)/course-details",
          params: { item: JSON.stringify(item) },
        })
      }
    >
      <View style={styles.contentWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.content}>{contentPreview}</Text>
        </View>

        {item.featured_video && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("(routes)/full-screen-video/index", {
                videoUri: item.featured_video,
              } as NewsCardNavigationParams)
            }
          >
            <Image
              style={styles.image}
              source={{ uri: item.featured_image }} // Correctly access the featured_image property
              onError={(error) => console.error("Image load error:", error)} // Handle load errors
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonsWrapper}>
        <Text style={styles.createdAt}>{displayDate}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.likesWrapper}>
            <FontAwesome name="heart" size={16} color="#333" />
            <Text style={styles.likesText}>{item.likes || "N/A"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <FontAwesome name="bookmark" size={16} color="#333" />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <FontAwesome name="share" size={16} color="#333" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 8,
    marginVertical: 15,
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
  content: {
    fontSize: 14,
    textAlign: "left",
    marginTop: 10,
    fontFamily: "Nunito_400Regular",
    color: "#666",
  },
  image: {
    width: wp(30),
    height: 120,
    borderRadius: 5,
    resizeMode: "cover",
    marginLeft: 10,
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
    gap: 4,
    padding: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#333",
    fontSize: 14,
  },
  likesWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 5,
    gap: 4,
    paddingHorizontal: 10,
  },
  likesText: {
    color: "#333",
    fontSize: 14,
  },
  imagePlaceholder: {
    width: wp(30),
    height: 120,
    borderRadius: 5,
    backgroundColor: "red",
    marginLeft: 10,
  },
});
