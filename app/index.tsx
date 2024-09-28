// import useUser from "@/hooks/auth/useUser";
// import { Redirect } from "expo-router";
// import Loader from "@/components/loader/loader";

// export default function TabsIndex() {
//   const { loading, user } = useUser();
//   return (
//     <>
//       {loading ? (
//         <Loader />
//       ) : (
//         <Redirect href={!user ? "/(routes)/onboarding" : "/(tabs)"} />
//       )}
//     </>
//   );
// }

import useUser from "@/hooks/auth/useUser";
import { Redirect } from "expo-router";
import Loader from "@/components/loader/loader";

export default function TabsIndex() {
  const { loading, user,isFirstVisit  } = useUser();
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        
        <Redirect href={isFirstVisit ? "/(routes)/onboarding" : "/(tabs)"} />
      )}
    </>
  );
}