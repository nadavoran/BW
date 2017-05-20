
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View
} from 'react-native';

import BeachWeatherComp from './index.js';

class BeachWeatherWrapper extends Component{
    constructor(props) {
        super(props);
    }
//headerStyle={styles.androidHeader}
    render() {
        return (
            <View style={styles.master}>
                <BeachWeatherComp/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    master: {
        flex: 1,
        position: 'relative',
        alignItems: 'center'
    },
    androidHeader: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:"#F5F5F5",

    }
});

AppRegistry.registerComponent('BeachWeather', () => BeachWeatherWrapper);
