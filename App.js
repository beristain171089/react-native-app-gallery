import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { API_KEY } from './config';

const { width, height } = Dimensions.get('screen');
const IMAGE_SIZE = 80;
const SPACING = 10;

export default () => {

    const topRef = useRef();
    const thumbRef = useRef();

    const [showSearchTopic, setShowSearchTopic] = useState(true);
    const [topic, setTopic] = useState('');
    const [images, setImages] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const fetchImagesFromPexels = async () => {

        if (topic) {

            setActiveIndex(0);
            setImages(null);
            setTopic('');
            setShowSearchTopic(false);

            const API_URL = `https://api.pexels.com/v1/search?query=${topic}&orentation=portrait&size=small&pen_page=20`;

            const data = await fetch(API_URL, {
                headers: {
                    'Authorization': API_KEY
                }
            });

            const { photos } = await data.json();

            if (photos.length > 0) {
                setImages(photos);
            } else {
                Alert.alert('¡Atención!', 'Sin Resultados');
                setShowSearchTopic(true);
            };
        };
    };

    const scrollToActiveIndex = (index) => {

        setActiveIndex(index);

        topRef?.current?.scrollToOffset({
            offset: index * width,
            animated: true
        });

        if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {

            thumbRef?.current.scrollToOffset({
                offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
                animated: true
            });

        } else {
            thumbRef?.current.scrollToOffset({
                offset: 0,
                animated: true
            });
        };

    };

    if (!showSearchTopic && !images) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#121212' }}>
            {showSearchTopic ?
                <View style={styles.container}>
                    <TextInput
                        style={styles.input}
                        placeholder='Buscar...'
                        placeholderTextColor='#969696'
                        onChange={(e) => setTopic(e.nativeEvent.text)}
                    />
                    <TouchableOpacity onPress={() => fetchImagesFromPexels()}>
                        <Text style={styles.button}>MOSTRAR</Text>
                    </TouchableOpacity>
                </View>
                :
                <>
                    <TouchableOpacity
                        onPress={() => setShowSearchTopic(true)}
                        style={{ position: 'absolute', top: 10, right: 10, elevation: 2, zIndex: 2, backgroundColor: '#000000AA', width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 20, textAlign: 'center', textAlignVertical: 'center' }}>&times;</Text>
                    </TouchableOpacity>
                    <FlatList
                        ref={topRef}
                        data={images}
                        keyExtractor={item => item.id.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={ev => {
                            scrollToActiveIndex(Math.round(ev.nativeEvent.contentOffset.x / width));
                        }}
                        renderItem={({ item }) => {
                            return (
                                <View style={{ width, height }}>
                                    <Image
                                        source={{ uri: item.src.portrait }}
                                        style={[StyleSheet.absoluteFillObject]}
                                    />
                                </View>
                            )
                        }}
                    />
                    <FlatList
                        ref={thumbRef}
                        data={images}
                        keyExtractor={item => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ position: 'absolute', bottom: IMAGE_SIZE }}
                        contentContainerStyle={{ paddingHorizontal: SPACING }}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
                                    <Image
                                        source={{ uri: item.src.portrait }}
                                        style={{
                                            width: IMAGE_SIZE,
                                            height: IMAGE_SIZE,
                                            borderRadius: 12,
                                            marginRight: SPACING,
                                            borderWidth: 2,
                                            borderColor: activeIndex === index ? '#fff' : 'transparent'
                                        }}
                                    />
                                </TouchableOpacity>
                            )
                        }}
                    />
                </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        height: 50,
        color: '#000',
        width: '80%',
        marginBottom: 25,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        borderRadius: 50,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#1e3040'
    },
    button: {
        fontSize: 18,
        color: '#FFF'
    }
});