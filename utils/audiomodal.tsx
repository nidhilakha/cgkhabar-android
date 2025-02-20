import React, { useRef, useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type ScrollingTextModalProps = {
  isVisible: boolean;
  text: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
};

const ScrollingTextModal: React.FC<ScrollingTextModalProps> = ({
  isVisible,
  text,
  isPlaying,
  onPlay,
  onPause,
  onStop,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollSpeed = 3; // Control the speed of the scrolling

  useEffect(() => {
    if (isPlaying) {
      // Scroll the text when playing
      const scrollInterval = setInterval(() => {
        setScrollPosition((prev) => prev + scrollSpeed); // Increment scroll position
      }, 50); // Update every 50ms

      return () => clearInterval(scrollInterval); // Cleanup interval when component unmounts or isPaused
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setScrollPosition(0); // Reset scroll position when paused or stopped
    }
  }, [isPlaying]);
  

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      style={styles.modal}
    >
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={[styles.scrollContent, { transform: [{ translateX: -scrollPosition }] }]}
        >
          <Text style={styles.text}>{text}</Text>
        </ScrollView>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={isPlaying ? onPause : onPlay}>
            <FontAwesome name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={onStop}>
            <FontAwesome name="stop" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end", // Align modal to the bottom of the screen
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    height: 50, // One-line height
    paddingHorizontal: 10,
    width: "100%", // Ensures modal covers the full width
    position: "absolute", // Position the modal absolutely at the bottom
    bottom: 0, // Align it at the bottom of the screen
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 5,
  },
});

export default ScrollingTextModal;
