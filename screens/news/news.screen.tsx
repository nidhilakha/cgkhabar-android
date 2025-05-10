import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableOpacity, Image, ActivityIndicator, ImageStyle } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width } = Dimensions.get('window');

// YouTube API constants
const PLAYLIST_ID = 'PLQbbImiJ-joM13yseXUokWwPwa0MdWQ_b';
const YOUTUBE_API_KEY = 'AIzaSyCik17R9boBQygpq4JJLjVcjFbKsfYSvwQ';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

// Type for YouTube video data
interface NewsType {
  _id: string; // Use videoId as _id for compatibility
  title: string;
  reel_url: string; // YouTube video URL
  content?: string; // Optional: description or other metadata
  slug?: string; // Optional: for routing
  thumbnail?: string; // Thumbnail URL
}

const NewsScreen = () => {
  const [newsItems, setNewsItems] = useState<NewsType[]>([]);
  const [theme, setTheme] = useState('light');
  const [largeFontSize, setLargeFontSize] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchFont = async () => {
        try {
          const storedFont = await AsyncStorage.getItem('largeFontSize');
          if (storedFont) setLargeFontSize(storedFont);
        } catch (error) {
          console.error('Error fetching font size:', error);
        }
      };
      fetchFont();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchTheme = async () => {
        const storedTheme = await AsyncStorage.getItem('theme');
        setTheme(storedTheme || 'light');
      };
      fetchTheme();
    }, [])
  );

  // Fetch YouTube playlist videos
// Fetch YouTube playlist videos
  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(YOUTUBE_API_URL, {
          params: {
            part: 'snippet',
            playlistId: PLAYLIST_ID,
            key: YOUTUBE_API_KEY,
            maxResults: 50,
          },
        });


        // Map and filter YouTube API response to include only public videos
        const videos: NewsType[] = response.data.items
          .filter((item: any) => {
            const title = item.snippet.title.toLowerCase();
            return !title.includes('private video') && !title.includes('deleted video');
          })
          .map((item: any) => ({
            _id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            reel_url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            content: item.snippet.description || '',
            slug: item.snippet.resourceId.videoId,
            thumbnail: item.snippet.thumbnails?.medium?.url || 'https://via.placeholder.com/120x80',
          }));

        setNewsItems(videos);

        if (videos.length === 0) {
          setError('No public videos found in the playlist.');
        }
      } catch (error: any) {
        console.error('Error fetching YouTube videos:', error);
        if (error.response) {
          if (error.response.status === 403) {
            setError('API quota exceeded or invalid API key.');
          } else if (error.response.status === 400) {
            setError('Invalid playlist ID or request parameters.');
          } else {
            setError('Failed to fetch videos: ' + error.response.data.error.message);
          }
        } else {
          setError('Network error or no internet connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeVideos();
  }, []);

  const renderItem = ({ item }: { item: NewsType }) => {
    const handlePress = () => {
      const simplifiedItem = {
        id: item._id,
        title: item.title,
        content: item.content,
        reel_url: item.reel_url,
        slug: item.slug,
        thumbnail: item.thumbnail,
      };
      const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
      router.push(`/(routes)/video-player?item=${serializedItem}` as any);
      // Type-safe alternative:
      // router.push({
      //   pathname: '/(routes)/video-player',
      //   params: { item: serializedItem },
      // });
    };

    return (
      <TouchableOpacity
        style={[styles.itemContainer, { backgroundColor: theme === 'dark' ? '#1C1C1C' : '#FFFFFF' }]}
        onPress={handlePress}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail as ImageStyle}
            resizeMode="cover"
          />
          <FontAwesome
            name="youtube-play"
            size={25}
            color="red"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -15 }, { translateY: -15 }],
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 50,
              padding: 8,
            }}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: theme === 'dark' ? '#FFFFFF' : '#000000' },
              largeFontSize === 'large' ? styles.largeFont : styles.defaultFont,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#0C0C0C' : '#e3e3e3' }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.loadingText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>
            Loading videos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={newsItems}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Videos Available</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  listContent: {
    padding: 10,
            paddingTop:50,
            paddingBottom:50,

  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  defaultFont: {
    fontSize: 16,
  },
  largeFont: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
  },
});

export default NewsScreen;