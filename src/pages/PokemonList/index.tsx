import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../global/themes';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../routes';
import {
  fetchPokemonListPage,
  getLastViewedPokemons,
  type PokemonListItemUI,
} from '../../services/pokeapi';
import { getFavoriteIds, getFavoritePokemons } from '../../services/favoritesStorage';

const PAGE_SIZE = 10;

const TYPE_COLORS: Record<string, string> = {
 normal: '#A8A77A',
 fire: '#EE8130',
 water: '#6390F0',
 electric: '#F7D02C',
 grass: '#7AC74C',
 ice: '#96D9D6',
 fighting: '#C22E28',
 poison: '#A33EA1',
 ground: '#E2BF65',
 flying: '#A98FF3',
 psychic: '#F95587',
 bug: '#A6B91A',
 rock: '#B6A136',
 ghost: '#735797',
 dragon: '#6F35FC',
 dark: '#705746',
 steel: '#B7B7CE',
 fairy: '#D685AD',
};

function getTypeColor(type: string) {
 return TYPE_COLORS[type] ?? '#A8A8A8';
}

export default function PokemonListScreen() {
 const theme = useTheme();
 const styles = createStyles(theme);
 const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PokemonList'>>();

 const [items, setItems] = useState<PokemonListItemUI[]>([]);
 const [offset, setOffset] = useState(0);
 const [hasNextPage, setHasNextPage] = useState(true);

 const [isInitialLoading, setIsInitialLoading] = useState(true);
 const [isLoadingMore, setIsLoadingMore] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);

 const [error, setError] = useState<string | null>(null);

 const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
 const [favoriteItems, setFavoriteItems] = useState<PokemonListItemUI[]>([]);
 const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
 const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);

 const [lastViewedItems, setLastViewedItems] = useState<PokemonListItemUI[]>([]);
 const [showOnlyLastViewed, setShowOnlyLastViewed] = useState(false);
 const [isLastViewedLoading, setIsLastViewedLoading] = useState(false);

 async function loadInitial() {
   try {
     setError(null);
     setIsInitialLoading(true);
     const page = await fetchPokemonListPage(PAGE_SIZE, 0);
     setItems(page.items);
     setOffset(PAGE_SIZE);
     setHasNextPage(Boolean(page.next));
   } catch {
     setError('Falha ao carregar a lista de Pokémon.');
   } finally {
     setIsInitialLoading(false);
   }
 }

 async function loadMore() {
   if (showOnlyFavorites || showOnlyLastViewed || isLoadingMore || isInitialLoading || isRefreshing || !hasNextPage) {
     return;
   }

   try {
     setIsLoadingMore(true);
     const page = await fetchPokemonListPage(PAGE_SIZE, offset);
     setItems((prev) => [...prev, ...page.items]);
     setOffset((prev) => prev + PAGE_SIZE);
     setHasNextPage(Boolean(page.next));
   } catch {
     setError('Falha ao carregar mais Pokémon.');
   } finally {
     setIsLoadingMore(false);
   }
 }

 async function refreshList() {
   try {
     setError(null);
     setIsRefreshing(true);

     if (showOnlyFavorites) {
       await loadFavoritesFromStorage();
       return;
     }

     if (showOnlyLastViewed) {
       await loadLastViewedFromStorage();
       return;
     }

     const page = await fetchPokemonListPage(PAGE_SIZE, 0);
     setItems(page.items);
     setOffset(PAGE_SIZE);
     setHasNextPage(Boolean(page.next));
   } catch {
     setError('Falha ao atualizar a lista.');
   } finally {
     setIsRefreshing(false);
   }
 }

 async function loadFavoritesFromStorage() {
   try {
     setIsFavoritesLoading(true);
     const [ids, favorites] = await Promise.all([
       getFavoriteIds(),
       getFavoritePokemons(),
     ]);

     setFavoriteIds(ids);
     setFavoriteItems(favorites.map((pokemon) => ({
       id: pokemon.id,
       name: pokemon.name,
       imageUrl: pokemon.imageUrl,
       types: pokemon.types,
     })));
   } finally {
     setIsFavoritesLoading(false);
   }
 }

 async function loadLastViewedFromStorage() {
   try {
     setIsLastViewedLoading(true);
     const viewed = await getLastViewedPokemons();
     setLastViewedItems(viewed);
   } finally {
     setIsLastViewedLoading(false);
   }
 }

 async function handleToggleLastViewed() {
   const nextValue = !showOnlyLastViewed;
   setShowOnlyLastViewed(nextValue);
   setShowOnlyFavorites(false);

   if (nextValue) {
     await loadLastViewedFromStorage();
   }
 }

 function handleToggleFavorites() {
   setShowOnlyFavorites((prev) => {
     const nextValue = !prev;

     if (nextValue) {
       setShowOnlyLastViewed(false);
     }

     return nextValue;
   });
 }

 useEffect(() => {
   loadInitial();
 }, []);

 useFocusEffect(
   React.useCallback(() => {
     loadFavoritesFromStorage();
     loadLastViewedFromStorage();
   }, [])
 );

 useEffect(() => {
   if (showOnlyFavorites) {
     loadFavoritesFromStorage();
   }
 }, [showOnlyFavorites]);

 useEffect(() => {
   if (showOnlyLastViewed) {
     loadLastViewedFromStorage();
   }
 }, [showOnlyLastViewed]);

 const visibleItems = showOnlyFavorites
   ? favoriteItems
   : showOnlyLastViewed
     ? lastViewedItems
     : items;

 function handleLogout() {
   navigation.reset({
     index: 0,
     routes: [{ name: 'Login' }],
   });
 }

 const renderItem = ({ item }: { item: PokemonListItemUI }) => (
   <TouchableOpacity
     style={styles.card}
     activeOpacity={0.8}
     onPress={() => navigation.navigate('PokemonDetail', { pokemonId: item.id })}
   >
     <View style={styles.cardLeft}>
       <Text style={styles.cardName}>{item.name} {favoriteIds.includes(item.id) ? '★' : '☆'}</Text>
       <View style={styles.typeContainer}>
         {item.types.map((type) => (
           <View
             key={`${item.id}-${type}`}
             style={[styles.typeBadge, { backgroundColor: getTypeColor(type) }]}
           >
             <Text style={styles.typeText}>{type}</Text>
           </View>
         ))}
       </View>
     </View>
     <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
   </TouchableOpacity>
 );

 if (isInitialLoading) {
   return (
     <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
       <ActivityIndicator size="large" color={theme.colors.primary} />
       <Text style={{ marginTop: 16, color: theme.colors.text }}>Carregando lista...</Text>
     </View>
   );
 }

 if (error && !showOnlyFavorites && !showOnlyLastViewed && items.length === 0) {
   return (
     <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
       <Text style={{ color: theme.colors.text, marginBottom: 16 }}>{error}</Text>
     </View>
   );
 }

 if (showOnlyFavorites && isFavoritesLoading) {
   return (
     <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
       <ActivityIndicator size="large" color={theme.colors.primary} />
       <Text style={{ marginTop: 16, color: theme.colors.text }}>Carregando favoritos...</Text>
     </View>
   );
 }

 if (showOnlyLastViewed && isLastViewedLoading) {
   return (
     <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
       <ActivityIndicator size="large" color={theme.colors.primary} />
       <Text style={{ marginTop: 16, color: theme.colors.text }}>Carregando últimos visualizados...</Text>
     </View>
   );
 }

 return (
   <View style={styles.container}>
     <Text style={styles.headerTitle}>Pokédex</Text>
     <TouchableOpacity
       style={styles.buttonLogout}
       onPress={handleLogout}
     >
       <Text style={styles.buttonLogoutText}>Sair</Text>
     </TouchableOpacity>

     <View style={styles.actionsRow}>
       <TouchableOpacity
         style={[styles.actionButton, styles.favoritesButton]}
         onPress={handleToggleLastViewed}
       >
         <Text style={styles.actionButtonText}>
           {showOnlyLastViewed ? 'Mostrar Todos' : 'Últimos Visualizados'}
         </Text>
       </TouchableOpacity>
       <TouchableOpacity
         style={[styles.actionButton, styles.favoritesButton]}
         onPress={handleToggleFavorites}
       >
         <Text style={styles.actionButtonText}>
           {showOnlyFavorites ? 'Mostrar Todos' : 'Mostrar Favoritos'}
         </Text>
       </TouchableOpacity>
     </View>

     <FlatList
       data={visibleItems}
       keyExtractor={(item) => String(item.id)}
       renderItem={renderItem}
       contentContainerStyle={styles.listContent}
       onEndReached={showOnlyFavorites || showOnlyLastViewed ? undefined : loadMore}
       onEndReachedThreshold={0.5}
       onRefresh={refreshList}
       refreshing={isRefreshing}
       ListEmptyComponent={
         showOnlyFavorites ? (
           <View style={{ paddingVertical: 24, alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textSecondary }}>
               Você ainda não favoritou nenhum Pokémon.
             </Text>
           </View>
         ) : showOnlyLastViewed ? (
           <View style={{ paddingVertical: 24, alignItems: 'center' }}>
             <Text style={{ color: theme.colors.textSecondary }}>
               Você ainda não visualizou nenhum Pokémon.
             </Text>
           </View>
         ) : null
       }
       ListFooterComponent={
         !showOnlyFavorites && !showOnlyLastViewed && hasNextPage && isLoadingMore ? (
           <View style={{ paddingVertical: 16 }}>
             <ActivityIndicator color={theme.colors.primary} />
           </View>
         ) : null
       }
     />
   </View>
 );
}
