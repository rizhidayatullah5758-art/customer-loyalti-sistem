import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function RootLayout(){return <><StatusBar style="light"/><Stack screenOptions={{headerShown:false}}/></>;}
