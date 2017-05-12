
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
        //marginVertical: -2,
    }
});

AppRegistry.registerComponent('BeachWeather', () => BeachWeatherWrapper);
//
//import React, { Component } from 'react';
//import {
//  AppRegistry,
//  StyleSheet,
//  Text,
//  View
//} from 'react-native';
//
//export default class BeachWeather extends Component {
//  render() {
//    return (
//      <View style={styles.container}>
//        <Text style={styles.welcome}>
//          Welcome to React Native!
//        </Text>
//        <Text style={styles.instructions}>
//          To get started, edit index.android.js
//        </Text>
//        <Text style={styles.instructions}>
//          Double tap R on your keyboard to reload,{'\n'}
//          Shake or press menu button for dev menu
//        </Text>
//      </View>
//    );
//  }
//}
//
//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    backgroundColor: '#F5FCFF',
//  },
//  welcome: {
//    fontSize: 20,
//    textAlign: 'center',
//    margin: 10,
//  },
//  instructions: {
//    textAlign: 'center',
//    color: '#333333',
//    marginBottom: 5,
//  },
//});
//
//AppRegistry.registerComponent('BeachWeather', () => BeachWeather);