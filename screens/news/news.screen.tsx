import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { WebView } from 'react-native-webview';

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
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]); // Track loading states for each video
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state

  useEffect(() => {
    // Fetch only when the component is mounted
    axios
      .get(`${SERVER_URI}/news`)
      .then((res: any) => {
        setNewsItems(res.data.news);
        setLoadingStates(new Array(res.data.news.length).fill(false)); // Initialize loading states
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
      });
  }, []);

  // Viewable items changed callback
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const visibleIndices = viewableItems.map((item) => item.index);
      setCurrentIndex(visibleIndices[0]);
      setViewableItems(visibleIndices); // Track which items are visible
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 20, // Video starts loading/playing when at least 20% visible
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const videoId = item.reel_url ? extractVideoId(item.reel_url) : null;
    const isItemVisible = viewableItems.includes(index); // Check if the item is visible

    const handlePress = () => {
      const simplifiedItem = {
        id: item._id,
        title: item.title,
        content: item.content,
        featured_video: item.featured_video,
        yt_url: item.yt_url,
        reel_url: item.reel_url,
      };
      const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
      router.push(`/course-details?item=${serializedItem}`);
    };
    const videoUrlWithMute = item.reel_url ? `${item.reel_url}?autoplay=1&mute=1` : null;

    // Change background color based on loading state
    const backgroundColor = loadingStates[index] ? 'black' : 'black';

    return (
      <View style={[styles.container, { backgroundColor }]}>
        {videoId && isItemVisible ? (
         <WebView
         style={{ width: width, height: height, backgroundColor: 'black' }} // Set background color to black
         javaScriptEnabled={true}
         domStorageEnabled={true}
         source={{ uri: videoUrlWithMute || "" }} // Load the video only if visible
         startInLoadingState={false} // Disable the default loader
         onLoadStart={() => setLoading(true)} // Set loading to true when loading starts
         onLoadEnd={() => setLoading(false)} // Set loading to false when loading ends
         // Optionally handle onError
       />
        ) : (
          <Text></Text> // Show placeholder when not visible
        )}

        {/* Overlay content (title and button) */}
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
      snapToInterval={height} // Snap to the height of the screen
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
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
