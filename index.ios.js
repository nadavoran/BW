
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
        alignItems: 'center',
        paddingTop: 24
    }
});

AppRegistry.registerComponent('BeachWeather', () => BeachWeatherWrapper);
