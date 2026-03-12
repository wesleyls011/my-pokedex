<<<<<<< HEAD
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../pages/Login";
import PokemonListScreen from "../pages/PokemonList";

export type RootStackParamList = {
  Login: undefined;
  PokemonList: undefined;
};
=======
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../pages/Login';
import PokemonListScreen from '../pages/PokemonList';
import PokemonDetailScreen from '../pages/PokemonDetail';

export type RootStackParamList = {
    Login: undefined;
    PokemonList: undefined;
    PokemonDetail: {id: number};
}
>>>>>>> 72c6512edce922adcacd452c98d451f1d5a53b6b

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
<<<<<<< HEAD
  return (
    <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="PokemonList" component={PokemonListScreen}/>
    </Stack.Navigator>
  );
=======
    return (
        <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{ headerShown: false}}>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="PokemonList" component={PokemonListScreen}/>
            <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen}/>
        </Stack.Navigator>
    )
>>>>>>> 72c6512edce922adcacd452c98d451f1d5a53b6b
}