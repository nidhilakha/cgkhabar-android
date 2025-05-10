import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const { item } = useLocalSearchParams();
  let videoData: any = null;

  try {
    videoData = JSON.parse(decodeURIComponent(item as string));
  } catch (error) {
    console.error('Error parsing video data:', error);
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (!videoData || !videoData.reel_url) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Video Available</Text>
      </View>
    );
  }

  const videoId = extractVideoId(videoData.reel_url);
  const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&controls=1&fullscreen=1`;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        source={{ uri: videoUrl }}
        startInLoadingState={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
   
  },
  webview: {
    flex: 1,
    width,
     marginTop:50,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default VideoPlayerScreen;