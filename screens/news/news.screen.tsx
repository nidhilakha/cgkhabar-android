import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const extractVideoId = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const NewsScreen = () => {
  const [newsItems, setNewsItems] = useState<NewsType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewableItems, setViewableItems] = useState<number[]>([]);
  const flatListRef = useRef<FlatList<NewsType>>(null);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [theme, setTheme] = useState("light");
  const [largeFontSize, setLargeFontSize] = useState("default");

  useFocusEffect(
    useCallback(() => {
      const fetchFont = async () => {
        try {
          const storedFont = await AsyncStorage.getItem("largeFontSize");
          if (storedFont) setLargeFontSize(storedFont);
        } catch (error) {
          console.error("Error fetching font size:", error);
        }
      };
      fetchFont();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchTheme = async () => {
        const storedTheme = await AsyncStorage.getItem("theme");
        setTheme(storedTheme || "light");
      };
      fetchTheme();
    }, [])
  );

  useEffect(() => {
    axios
      .get(`${SERVER_URI}/shorts`)
      .then((res) => {
        setNewsItems(res.data.news);
        setLoadingStates(new Array(res.data.news.length).fill(false));
      })
      .catch((error) => {
        console.error("Error fetching news:", error);
      });
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const visibleIndices = viewableItems.map((item) => item.index);
      setCurrentIndex(visibleIndices[0]);
      setViewableItems(visibleIndices);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 20,
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const videoId = item.reel_url ? extractVideoId(item.reel_url) : null;
    const isItemVisible = viewableItems.includes(index);
    const videoUrlWithMute = item.reel_url
      ? `${item.reel_url}?autoplay=1&mute=0&playsinline=1&controls=0`
      : null;

    const handlePress = () => {
      const simplifiedItem = {
        id: item._id,
        title: item.title,
        content: item.content,
        featured_video: item.featured_video,
        yt_url: item.yt_url,
        reel_url: item.reel_url,
        slug:item.slug,
      };
      const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
      router.push(`/course-details?item=${serializedItem}`);
    };

    return (
      <View style={[styles.container, { backgroundColor: theme === "dark" ? "#0C0C0C" : "#e3e3e3" }]}>
        {videoId && isItemVisible ? (
          <WebView
            style={{ width, height, backgroundColor: "black" }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            source={{ uri: videoUrlWithMute || "" }}
            startInLoadingState={false}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <Text style={styles.noVideoText}>No Videos Available</Text>
          </View>
        )}

        <View style={styles.overlay}>
          <TouchableOpacity style={styles.readMoreButton} onPress={handlePress}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={newsItems}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={height}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme === "dark" ? "#0C0C0C" : "#e3e3e3",
      }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Videos Available</Text>
        </View>
      }
    />
  );
};


const styles = StyleSheet.create({
  container: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noVideoText: {
    color: "#999",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20, // Position it towards the bottom
    alignItems: 'flex-start', // Align items to the start
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  readMoreButton: {
    position: 'absolute',
    top: 24, // Position 20px from the top
    right: 16, // Position 20px from the right
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  readMoreText: {
    color: 'white',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});

export default NewsScreen;
