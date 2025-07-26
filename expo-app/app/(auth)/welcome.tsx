import { Button, Image, Platform, Text, Touchable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

const Onboarding = () => {
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <TouchableOpacity onPress={() => router.replace("/(auth)/welcome")}>
        <Image source={require("@/assets/images/icon.png")}
                    style={{ width: 256, height: 256, resizeMode: "contain" }}
            />
      </TouchableOpacity>
        <View className="flex items-center justify-center p-1">
            
            <View className="flex flex-col items-center justify-center w-full mt-10 px-6">
              {/* Remove px-6 flag from the view's className for desc to be broader */}
              <Text
                style={{
                  color: "black",
                  fontSize: 28,
                  fontFamily: "Jakarta-Bold",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Welcome! 👋🏼
              </Text>
                <Text
                  style={{
                    color: "#4B5563", // Tailwind's gray-600
                    fontSize: 16, // base
                    fontFamily: "Jakarta-Regular",
                    marginBottom: 20, // mb-5
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  {Platform.OS === 'web' ? (
                    "Sprov AI is your speech coaching app that provides detailed analysis and feedback on your speech, helping you improve your communication skills."
                  ) : (
                    "Sprov AI helps you master communication with instant speech analysis and feedback. 🎤"
                  )}
                </Text>
            </View>
        </View>
      <TouchableOpacity
        style={{
          width: "50%",
          backgroundColor: "#0286FF",
          borderRadius: 9999,
          padding: 16,
          margin: 250,
          alignItems: "center",
        }}
        onPress={() =>
          router.replace("/(tabs)/main")
        }
      >
        <Text style={{ color: "white", fontSize: 16, fontFamily: "Jakarta-SemiBold" }}>
          {"Let's Get Started!"}
        </Text>
      </TouchableOpacity>
      <View style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          alignItems: 'center',
      }}>
          <Text style={{ 
              color: '#a0aec0', 
              fontSize: 12, 
              fontFamily: 'Jakarta-Light' 
          }}>
              Powered by Google's Gemini 2.0 Flash AI Model.
          </Text>
          <Link href="https://github.com/saadmemon1/Sprov-AI" target="_blank">
                  <Text style={{ 
                      color: '#a0aec0', 
                      fontSize: 12, 
                      fontFamily: 'Jakarta-Light' ,
                      marginTop: 4,
                      textDecorationLine: 'underline',
                      fontWeight: 'bold'
                  }}>
                      © 2025 Sprov AI. All rights reserved.
                  </Text>
          </Link>
      </View>
    </SafeAreaView>
  );
};
export default Onboarding;
