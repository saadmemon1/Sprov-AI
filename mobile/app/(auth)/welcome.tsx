import { Button, Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Swiper from "react-native-swiper";
import { useRef, useState } from "react";
// import { onboarding } from "@/constants";


const Onboarding = () => {
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
        <Image source={require("@/assets/images/icon.png")}
                    style={{ width: 256, height: 256, resizeMode: "contain" }}
            />
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
    </SafeAreaView>
  );
};
export default Onboarding;
