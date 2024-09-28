import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
// import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

type RootStackParamList = {
  "full-screen-video": {
    videoUri: string;
  };
};

type FullScreenVideoRouteProp = RouteProp<RootStackParamList, "full-screen-video">;

export default function FullScreenVideo() {
  const route = useRoute<FullScreenVideoRouteProp>();
  const { videoUri } = route.params;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoPosition, setVideoPosition] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // const videoRef = React.useRef<Video>(null);

  // const handleStatusUpdate = (status: AVPlaybackStatus) => {
  //   if (status.isLoaded) {
  //     setVideoPosition(status.positionMillis || 0);
  //     setVideoDuration(status.durationMillis || 0);
  //     setIsPlaying(status.isPlaying);
  //   }
  // };

  // const togglePlayPause = () => {
  //   if (videoRef.current) {
  //     videoRef.current.getStatusAsync().then((status) => {
  //       if (status.isLoaded) {
  //         if (status.isPlaying) {
  //           videoRef.current?.pauseAsync();
  //           setIsPlaying(false);
  //         } else {
  //           videoRef.current?.playAsync();
  //           setIsPlaying(true);
  //         }
  //       }
  //     });
  //   }
  // };

  // const toggleMute = () => {
  //   if (videoRef.current) {
  //     videoRef.current.setIsMutedAsync(!isMuted);
  //     setIsMuted(!isMuted);
  //   }
  // };

  // const seekBackward = () => {
  //   if (videoRef.current) {
  //     videoRef.current.getStatusAsync().then((status) => {
  //       if (status.isLoaded) {
  //         const newPosition = Math.max(status.positionMillis - 5000, 0);
  //         videoRef.current?.setPositionAsync(newPosition);
  //       }
  //     });
  //   }
  // };

  // const seekForward = () => {
  //   if (videoRef.current) {
  //     videoRef.current.getStatusAsync().then((status) => {
  //       if (status.isLoaded && status.durationMillis) {
  //         const newPosition = Math.min(status.positionMillis + 5000, status.durationMillis);
  //         videoRef.current?.setPositionAsync(newPosition);
  //       }
  //     });
  //   }
  // };

  // const changePlaybackSpeed = () => {
  //   const newSpeed = playbackSpeed === 1.0 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : 1.0;
  //   if (videoRef.current) {
  //     videoRef.current.setRateAsync(newSpeed, true);
  //     setPlaybackSpeed(newSpeed);
  //   }
  // };

  // const onSliderValueChange = (value: number) => {
  //   if (videoRef.current) {
  //     videoRef.current.setPositionAsync(value);
  //   }
  // };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      {/* <Video
        ref={videoRef}
        source={{ uri: videoUri || "" }}
        style={styles.video}
        useNativeControls={false} // Disable native controls for custom controls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={handleStatusUpdate}
      /> */}

      {/* Custom controls */}
      <View style={styles.controls}>
        {/* Progress Bar */}
        {/* <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={videoDuration}
          value={videoPosition}
          onValueChange={(value: number) => onSliderValueChange(value)}
        /> */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(videoPosition)}</Text>
          <Text style={styles.timeText}>  {formatTime(videoDuration)}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Playback Speed */}
          {/* <TouchableOpacity onPress={changePlaybackSpeed}>
            <Ionicons name="speedometer-outline" size={32} color="white" />
          </TouchableOpacity> */}

          {/* 5-second Rewind */}
          {/* <TouchableOpacity onPress={seekBackward}>
            <Ionicons name="play-back-outline" size={32} color="white" />
          </TouchableOpacity> */}

          {/* Play/Pause */}
          {/* <TouchableOpacity onPress={togglePlayPause}>
            <Ionicons name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} size={48} color="white" />
          </TouchableOpacity> */}

          {/* 5-second Forward */}
          {/* <TouchableOpacity onPress={seekForward}>
            <Ionicons name="play-forward-outline" size={32} color="white" />
          </TouchableOpacity> */}

          {/* Mute/Unmute */}
          {/* <TouchableOpacity onPress={toggleMute}>
            <Ionicons name={isMuted ? "volume-mute-outline" : "volume-high-outline"} size={32} color="white" />
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controls: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Slight transparency for control background

  },
  progressBar: {
    width: "100%",
    height: 40,
    color:"white",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  timeText: {
    color: "white",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
});

