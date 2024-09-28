import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const extractVideoId = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const NewsScreen = () => {
  const [newsItems, setNewsItems] = useState<NewsType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<NewsType>>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get(`${SERVER_URI}/news`)
      .then((res: any) => {
        setNewsItems(res.data.news);
      })
      .catch((error) => {
        console.error('Error fetching news:', error);
      });
  }, []);

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const videoId = item.reel_url ? extractVideoId(item.reel_url) : null;

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

    return (
      <View style={styles.container}>
        {videoId ? (
          <WebView
            style={{ width: width, height: height }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            source={{ uri: item.reel_url }}
          />
        ) : (
          <Text style={styles.errorText}>Invalid video URL</Text>
        )}

        {/* Overlay content (title and button) */}
        <View style={styles.overlay}>
          {/* "Read More" Button in Top-Right Corner */}
          <TouchableOpacity style={styles.readMoreButton} onPress={handlePress}>
            <Text style={styles.readMoreText}>Read More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

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
      viewabilityConfig={{ itemVisiblePercentThreshold: 100 }} // Ensure full visibility of the item
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
    paddingBottom:45,
    paddingTop:30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});

export default NewsScreen;
