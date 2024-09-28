// hooks/auth/useUser.ts
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URI } from "@/utils/uri";

interface User {
  // Define the User interface based on your user data structure
  id: string;
  name: string;
  avatar?: {
    url: string;
  };
}

export default function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [refetch, setRefetch] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      try {
        const res = await axios.get(`${SERVER_URI}/me`, {
          headers: {
            "access-token": accessToken || "",
            "refresh-token": refreshToken || "",
          },
        });
        setUser(res.data.user);
       
         // Check if it's the user's first visit
         const firstVisit = await AsyncStorage.getItem("first_visit");
         if (firstVisit === null) {
           // First visit
           setIsFirstVisit(true);
           await AsyncStorage.setItem("first_visit", "false");
         } else {
           // Not the first visit
           setIsFirstVisit(false);
         }
      } catch (error:any) {
        setError(error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refetch]);

  return { loading, user, error, setUser, setRefetch, refetch,isFirstVisit };
}
