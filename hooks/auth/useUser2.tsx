import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";

interface User {
  id: string;
  name: string;
  avatar?: {
    url: string;
  };
  profile_picture: string;
}

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [refetch, setRefetch] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Retrieve tokens and first visit status
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        const firstVisit = await AsyncStorage.getItem("first_visit");

        if (firstVisit === null) {
          setIsFirstVisit(true); // It's the user's first visit
          await AsyncStorage.setItem("first_visit", "false");
        } else {
          setIsFirstVisit(false); // Not the first visit
        }

        if (!accessToken || !refreshToken) {
          throw new Error("No access or refresh token found");
        }

        // Fetch user data
        const res = await axios.get(`${SERVER_URI}/me`, {
          headers: {
            "access-token": accessToken,
            "refresh-token": refreshToken,
          },
        });

        if (res?.data?.user) {
          setUser(res.data.user);
        } else {
          throw new Error("User data is not available");
        }

      } catch (error: any) {
        console.error("Error fetching user:", error);
        setError(error?.message || "An error occurred while fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refetch]);

  return { loading, user, error, setUser, setRefetch, refetch, isFirstVisit };
}
