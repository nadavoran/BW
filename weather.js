/**
 * Created by nadavoran on 22/04/2017.
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    TouchableHighlight,
    Text,
    Linking,
    View,
    Dimensions,
    Image,
    AppState
} from 'react-native';

var {
    beachUtils
    } = require('./beachUtils.js');

//export default
class BeachWeather extends Component {
    constructor(props) {
        super(props);
        beachUtils.fetchForecast((data, days, hoursIndexes)=>{
            if (!data || !data.length) return;
            this.hoursIndexes = hoursIndexes;
            this._loadWeather(days[0].weather);
            //this._loadHours(days[0].day);
            this.setState({selectedIndex: 0, selectedDateIndex: 0, day: days[0].toString(), optionsDate:data, optionsDay:days, valueDate: data[0].toString(), buttonText: days[0].toString(), prevState: true, prevDayState: true});
            //this.refs.daysDrop.select(0);
        }, (errorMessage, ex)=>{
            this.setState({result:`data didn't loaded because - ${errorMessage}`});
        });
        this.state = {
            day: '',
            temperature: '',
            speed: '',
            cloud: '',
            score: '',
            direction: '',
            result: '',
            goodDay: false,
            prevDayState: false,
            nextDayState: false,
            selectedDateIndex: 0,
            prevState: false,
            nextState: false,
            selectedIndex: 0,
            chartValue: [5,5,5,5,5,5],
            chartColor: ['rgb(0,255,0)','red','red','red','red','red','red'],
            chartTime: ['10:00','11:00','12:00','13:00','14:00','15:00','16:00'],
            chartDay: [0,0,0,0,0,0,0],
            chartTemperature: [0,0,0,0,0,0,0],
            chartSpeed: [0,0,0,0,0,0,0],
            chartDirection: [0,0,0,0,0,0,0],
            chartCloud: [0,0,0,0,0,0,0,0],
            chartScore: [0,0,0,0,0,0,0,0],
            chartResultString: [0,0,0,0,0,0,0],
            valueDate: 'טוען תאריכים...',
            buttonText: 'טוען ימים...',
            displayGraph: false
        };
        this.state.optionsDay = [{time:'Day 1',id:1, toString: ()=>"Date 1"},{time:'Date 2',id:2, toString: ()=>"Date 2"},{time:'Date 3',id:3, toString: ()=>"Date 3"},{time:'Date 4',id:4, toString: ()=>"Date 4"}];
        this.state.optionsDate = [{time:'Date 1',id:1, toString: ()=>"Date 1"},{time:'Date 2',id:2, toString: ()=>"Date 2"},{time:'Date 3',id:3, toString: ()=>"Date 3"},{time:'Date 4',id:4, toString: ()=>"Date 4"}];

    }

    _loadWeather(value){
        let temp = beachUtils.getTemperature(value.weather),
            speed = beachUtils.getWindSpeed(value.weather),
            direction = beachUtils.calcWindDirection(value.weather),
            cloud = beachUtils.getCloud(value.weather),
            score = beachUtils.getWeatherScore(value.weather),
            goodDay = score > 4;
        //if (value.time.day() == )
        let result = this.getResultString(goodDay, 'היום', 'יום' ) // ? `יום טוב ללכת לים`: `לא יום טוב ללכת לים` ;
        this.setState({result:result, temperature: temp, speed: `${speed.knots} קשר ` , direction: direction, cloud: `${cloud}${(typeof cloud == 'string' ? "" : "%")}`, score: score, goodDay: goodDay});
    }

    getResultString(score, forDay, time){
        return `${forDay}${score ? '' :'לא' } ${time} טוב ללכת לים`;
    }
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!')
            beachUtils.fetchForecast((data, days, hoursIndexes)=>{
                if (!data || !data.length) return;
                this.hoursIndexes = hoursIndexes;
                //this._loadHours(days[0].day);
                this.setState({selectedIndex: 0, selectedDateIndex: 0, day: days[0].toString(), optionsDate:data, optionsDay:days, valueDate: data[0].toString(), buttonText: days[0].toString(), prevState: true, prevDayState: true});
                //this.refs.daysDrop.select(0);
            }, (errorMessage, ex)=>{
                this.setState({result:`data didn't loaded beacuse - ${errorMessage}`});
            });
        }
        this.setState({appState: nextAppState});
    };

    render() {
        let {width, height} = Dimensions.get("window");
        return (
            <View style={styles.container}>
                <View style={styles.bgImageWrapper}>
                    <Image source={require('./Charming_sun.png')} style={[styles.backgroundImage, {width:width, height: (height + 30) }]} />
                </View>
                <Text style={styles.location_title}>
                    חוף הצוק
                </Text>
                <Text style={styles.location_title}>
                    היום . יום שבת ה1ץ3
                </Text>
                <Text style={[styles.data_text, styles.data_result, this.state.goodDay ? styles.data_goodResult : styles.data_badResult]}>
                    {this.state.result}
                </Text>
                <Text style={styles.dark_sky}
                      onPress={() => Linking.openURL('https://darksky.net/poweredby/')}>
                    Powered by Dark Sky
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        paddingTop: 30
    },
    bgImageWrapper: {
        flex: 1,
        position: 'absolute',
        left: 0, right: 0,
        marginTop:-30,
        alignItems: 'center'
    },
    backgroundImage: {
        height: 600,
        resizeMode: "cover"
    },
    location_title: {
        alignSelf: 'flex-end',
        marginRight: 20,
        fontSize: 16,
        backgroundColor: 'transparent'
    },
    data_text: {
        backgroundColor: 'transparent'
    },
    data_result: {
        marginVertical: 40,
        fontSize: 28
    },
    data_goodResult: {
        color: 'green'
    },
    data_badResult: {
        color: 'red'
    },
    dark_sky:{
        color: 'blue',
        position: 'absolute',
        backgroundColor: 'transparent',
        left: 0,
        right: 0,
        bottom: 0
    }
});

AppRegistry.registerComponent('BeachWeather', () => BeachWeather);
