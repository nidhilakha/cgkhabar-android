import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { htmlToText } from "html-to-text";

interface AudioState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentSound: Audio.Sound | null;
  currentNewsItem: any | null;
  setAudioState: (state: Partial<AudioState>) => void;
  playAudio: (newsItem: any) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  resumeAudio: () => void; // New function to resume paused audio
  cleanText: (html: string) => string;
}

const AudioContext = createContext<AudioState | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [currentNewsItem, setCurrentNewsItem] = useState<any | null>(null);

  const setAudioState = (state: Partial<AudioState>) => {
    if ("isSpeaking" in state) setIsSpeaking(state.isSpeaking!);
    if ("isPaused" in state) setIsPaused(state.isPaused!);
    if ("currentSound" in state) setCurrentSound(state.currentSound!);
    if ("currentNewsItem" in state) setCurrentNewsItem(state.currentNewsItem!);
  };

  const playAudio = async (newsItem: any) => {
    // Only create a new sound if there’s no current sound or it’s a different item
    if (!currentSound || currentNewsItem?._id !== newsItem._id) {
      await stopAudio(); // Stop and unload any existing audio
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: newsItem.featured_audio },
          { shouldPlay: true }
        );
        setCurrentSound(sound);
        setIsSpeaking(true);
        setIsPaused(false);
        setCurrentNewsItem(newsItem);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && "didJustFinish" in status && status.didJustFinish) {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentSound(null);
            setCurrentNewsItem(null);
          }
        });
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsSpeaking(false);
      }
    } else if (isPaused) {
      // If the same item is already loaded and paused, resume it
      await resumeAudio();
    }
  };

  const resumeAudio = async () => {
    if (currentSound && isPaused) {
      await currentSound.playAsync(); // Resume from the current position
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const pauseAudio = async () => {
    if (currentSound && isSpeaking) {
      await currentSound.pauseAsync();
      setIsPaused(true);
      // Keep isSpeaking true to maintain AudioBar visibility
    }
  };

  const stopAudio = async () => {
    try {
      await Speech.stop();
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentNewsItem(null);
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };

  const cleanText = (html: string): string => {
    let cleaned = htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: "a", format: "skip" },
        { selector: "img", format: "skip" },
        { selector: "p", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
      ],
      preserveNewlines: true,
    });
    return cleaned.replace(/\s+/g, " ").trim();
  };

  return (
    <AudioContext.Provider
      value={{
        isSpeaking,
        isPaused,
        currentSound,
        currentNewsItem,
        setAudioState,
        playAudio,
        pauseAudio,
        stopAudio,
        resumeAudio, // Add resumeAudio to context
        cleanText,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
};