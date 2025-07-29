import { Image, Platform, Text, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";

const Onboarding = () => {
  return (
    <SafeAreaView style={{
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      paddingHorizontal: Platform.OS === 'web' ? 20 : 0, // Add padding for web
      paddingTop: Platform.OS === 'web' ? 20 : 0, // Add top padding for web
    }}>
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          alignItems: 'center', 
          paddingBottom: 100,
          paddingHorizontal: Platform.OS === 'web' ? 20 : 0, // Additional padding for content
        }} 
                keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.replace("/(auth)/welcome")}>
          <Image source={require("@/assets/images/icon.webp")}
                      style={{ width: 256, height: 256, resizeMode: "contain" }}
              />
        </TouchableOpacity>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          width: '100%',
          maxWidth: Platform.OS === 'web' ? 600 : '100%', // Limit max width on web
        }}>
            
            <View style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              // marginTop: 10,
              paddingHorizontal: 24,
            }}>
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
                    paddingHorizontal: Platform.OS === 'web' ? 20 : 0, // Extra padding for web
                    lineHeight: 24, // Better line height for readability
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
          width: Platform.OS === 'web' ? '60%' : '60%',
          maxWidth: 300, // Maximum width for larger screens
          backgroundColor: "#0286FF",
          borderRadius: 9999,
          padding: 16,
          margin: Platform.OS === 'web' ? 20 : 25,
          alignItems: "center",
          marginHorizontal: Platform.OS === 'web' ? 20 : 'auto',
        }}
        onPress={() =>
          router.replace("/(tabs)/main")
        }
      >
        <Text style={{ color: "white", fontSize: 15, fontFamily: "Jakarta-SemiBold" }}>
          {"Let's Get Started!"}
        </Text>
      </TouchableOpacity>
      <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20, // Add left padding
          right: 20, // Add right padding
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
      </ScrollView>
    </SafeAreaView>
  );
};
export default Onboarding;
