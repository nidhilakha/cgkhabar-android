import Ratings from "@/utils/ratings";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, Image } from "react-native";

export default function ReviewCard({ item }: { item: ReviewType }) {
  // console.log(item); // Add this line to check the user object

  const userName = item.user?.name || "Anonymous";
  return (
    <View style={{ flexDirection: "row" }}>
      <Image
        style={{ width: 50, height: 50, borderRadius: 100 }}
        source={{
          uri:
            item.user?.avatar?.url ||
            "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
        }}
      />
      <View style={{ marginHorizontal: 8, flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "space-around" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontFamily: "Raleway_700Bold" }}>
                {userName}
              </Text>
              <View>
                {/* <Text>{item.rating} </Text> */}
                <Ratings rating={item.rating} />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  paddingVertical: 5,
                  paddingHorizontal: 3,
                }}
              >
                {item.comment}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}




// {
//   "_id": {
//     "$oid": "66aa2ae6404feee2c3f8e5a1"
//   },
//   "name": "test",
//   "email": "test@gmail.com",
//   "password": "$2a$10$5vTrZdCdyqD3TIw3YwfWA.hTdfI4skkap.ip2M7IORQd4OjbrU7hi",
//   "role": "user",
//   "isVerified": false,
//   "courses": [],
//   "createdAt": {
//     "$date": "2024-07-31T12:15:34.156Z"
//   },
//   "updatedAt": {
//     "$date": "2024-07-31T12:15:34.156Z"
//   },
//   "__v": 0
// }