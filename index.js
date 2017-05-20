/**
 * Created by nadavoran on 16/04/2017.
 */


/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
//
import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    Text,
    Linking,
    View,
    Dimensions,
    Image,
    Picker,
    AppState,
    AsyncStorage
} from 'react-native';
import Button from 'react-native-button';
import * as Animatable from 'react-native-animatable';
import Collapsible from 'react-native-collapsible';
//
var {
    beachUtils
    } = require('./beachUtils.js');
import PlayerTrendBarItem from './chart.js';

import ModalDropdown from 'react-native-modal-dropdown';
import moment from 'moment';
const barTop = 15;
const unitHeight = 4;
const high = 42;
const low = 0;
const daysOfWeek = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];

var today = new Date();
var beachLocation = `32.146284,34.791701`;
var beachName = `חוף הצוק`;
var lastSavedDay;
var currentWeather;
const beachKey = "@BeachWeather:beach";
const weatherKey = "@BeachWeather:weather";
export default class BeachWeather extends Component {
    constructor(props) {
        super(props);
        var availableBeachLoaded, beachExists, dataBeachName, selectedBeachIndex = null;
        var setDayAndBeach = ()=>{
            this.refs.daysDrop && this.refs.daysDrop.select(0);
            if (selectedBeachIndex != null && this.refs && this.refs.beachSelection) {
                this.refs.beachSelection.select(selectedBeachIndex);
            }
        };
        var loadWeatherForBeach = ()=>{
            if (!availableBeachLoaded || !beachExists) return;
            selectedBeachIndex = 0;
            this.state.availableBeach.some((beach, index)=>{
                if (beach.name == beachName){
                    selectedBeachIndex = index;
                    return true;
                }
            });
            console.log(`data: ${dataBeachName}, beachName: ${beachName}, index: ${selectedBeachIndex}, length: ${this.state.availableBeach.length}`);
            if (dataBeachName && dataBeachName == beachName) {
                setDayAndBeach();
                return;
            }
            loadStartForecast();
        };
        this.fetchAvailableBeach((available)=>{
            console.log(`available ${available}`);
            if (available && available.length){
                this.setState({availableBeach: available});
                availableBeachLoaded = true;
                loadWeatherForBeach();
            }
        });
        var retrievedData = (data, days, hoursIndexes, current)=>{
            currentWeather = current;
            this.hoursIndexes = hoursIndexes;
            this._loadWeather(days[0]);
            this._loadHours(days[0].day);
            this.setState({selectedIndex: 0, selectedDateIndex: 0, day: days[0].toString(), optionsDate:data, optionsDay:days,
                valueDate: data[0].toString(), buttonText: days[0].toString(), prevState: true, prevDayState: true});
            dataBeachName = beachName;
            setDayAndBeach();
        };

        let loadStartForecast = ()=>{
            beachUtils.fetchForecast(beachLocation, beachName, today, (data, days, hoursIndexes, current)=>{
                if (!data || !data.length) return;
                today = new Date();
                retrievedData(data, days, hoursIndexes, current, selectedBeachIndex);
                AsyncStorage.setItem(weatherKey, JSON.stringify({today: today.getTime(), beachName: beachName, data: data, days: days, hoursIndexes: hoursIndexes, current: current, selectedBeachIndex: selectedBeachIndex}));
            }, (errorMessage, ex)=>{
                debugger;
                this.setState({result:` ex: ${ex}`, showSplash: false});
            });
        };

        try {
            //var locationKey, nameKey;
            AsyncStorage.getItem(beachKey).then((beachData) => {
                if (beachData){
                    beachData = JSON.parse(beachData);
                    beachLocation = beachData.location;
                    beachName = beachData.name;
                    beachExists = true;
                    loadWeatherForBeach();
                } else {
                    //load with default
                    AsyncStorage.setItem(beachKey, JSON.stringify({location: beachLocation, name: beachName}));
                    beachExists = true;
                    loadWeatherForBeach();
                }
            });
            AsyncStorage.getItem(weatherKey).then((weatherData) => {
                if (weatherData){
                    weatherData = JSON.parse(weatherData);
                    if (!weatherData) return;
                    if (Date.now() - weatherData.today < 5*60*1000 ){
                        dataBeachName = weatherData.beachName;
                    }
                    weatherData.days = weatherData.days.map(day=>{
                        day.toString = ()=>{
                            return day.displayText;
                        };
                        return day;
                    });
                    retrievedData(weatherData.data, weatherData.days, weatherData.hoursIndexes, weatherData.today, weatherData.selectedBeachIndex);
                    this.setState({beachText: dataBeachName});
                    setTimeout(()=>{
                        this.setState({showSplash: false});
                    }, 700);
                    //loadWeatherForBeach();
                }
            });
        } catch (error) {
            beachLocationExists = true;
            beachNameExists = true;
            // Error retrieving data
            loadWeatherForBeach();
        }
        setTimeout(()=>{
            this.setState({showSplash: false});
            setDayAndBeach();
        }, 1500);
        this.state = {
            day: '',
            temperature: '',
            speed: '',
            cloud: '',
            score: '',
            scoreResult: '',
            direction: '',
            result: 'טוען תחזית',
            goodDay: false,
            prevDayState: false,
            nextDayState: false,
            selectedDateIndex: 0,
            prevState: false,
            nextState: false,
            selectedIndex: 0,
            chartValue: [5,5,5,5,5,5,5,5],
            chartColor: ['rgb(0,255,0)','red','red','red','red','red','red','red','red'],
            chartTime: ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
            chartDay: [0,0,0,0,0,0,0,0,0],
            chartTemperature: [0,0,0,0,0,0,0,0,0],
            chartSpeed: [0,0,0,0,0,0,0,0,0],
            chartDirection: [0,0,0,0,0,0,0,0,0],
            chartCloud: [0,0,0,0,0,0,0,0,0,0],
            chartScore: [0,0,0,0,0,0,0,0,0,0],
            chartScoreResult: ['','','','','','','','','',''],
            chartResultString: [0,0,0,0,0,0,0,0,0],
            activeTime: [false,false,false,false,false,false,false,false,false,false],
            valueDate: 'טוען תאריכים...',
            buttonText: 'טוען ימים...',
            displayGraph: false,
            collapsed: true,
            isActive: true,
            showSplash: true,
            activeHour: false,
            visibleHour: -1,
            language:"data",
            beachText:"חוף הצוק",
            availableBeach: null,
            appState: 'active'
        };
        this.state.optionsDay = [{time:'Day 1',id:1, toString: ()=>"Date 1"},{time:'Date 2',id:2, toString: ()=>"Date 2"},{time:'Date 3',id:3, toString: ()=>"Date 3"},{time:'Date 4',id:4, toString: ()=>"Date 4"}];
        this.state.optionsDate = [{time:'Date 1',id:1, toString: ()=>"Date 1"},{time:'Date 2',id:2, toString: ()=>"Date 2"},{time:'Date 3',id:3, toString: ()=>"Date 3"},{time:'Date 4',id:4, toString: ()=>"Date 4"}];

    }

    fetchAvailableBeach(successCallback, failureCallback){
        fetch(`https://salty-waters-82263.herokuapp.com/beachlist`)
            .then((response) => {
                return response.json();})
            .then((responseJson) => {
                console.log(`length: ${responseJson.length}`);
                if (responseJson && responseJson.length > 1) {
                    successCallback && successCallback(responseJson.map((beach)=>{
                        console.log(`q: ${beach.q}, name: ${beach.name}`);
                        return {q: beach.q, name: beach.name, toString: ()=>beach.name};
                    }));
                }
            }).catch((ex)=>{
                console.log(`failed to load resource ${ex}`);
                failureCallback && failureCallback("failed to load resource", ex);
            });
    }

    getResultString(score, forDay, time){
        return `${forDay}${score ? '' :' לא' } ${time} טוב ללכת לים`;
    }

    _loadWeather(value){
        lastSavedDay = value.day;
        let temp = beachUtils.getTemperature(value.weather),
            speed = beachUtils.getWindSpeed(value.weather),
            direction = beachUtils.calcWindDirection(value.weather),
            cloud = beachUtils.getCloud(value.weather),
            score = beachUtils.getWeatherScore(value.weather),
            scoreResult = beachUtils.getWeatherScoreResult(value.weather),
            goodDay = score > 4, //this.goodBeachWeather(weather),
            result = this.getResultString(goodDay, value.format, 'יום' ); // ? `יום טוב ללכת לים`: `לא יום טוב ללכת לים` ;
        this.setState({result:result, temperature: temp, speed: `${speed.kph} קמ״ש` , direction: direction, cloud: `${cloud}${(typeof cloud == 'string' ? "" : "%")}`, score: score, scoreResult: scoreResult, goodDay: goodDay});
    }
    _loadHours(day){
        if (day < 0 || !this.hoursIndexes) return;
        let hoursDay = this.hoursIndexes[day];
        if (!hoursDay) {
            this.setState({displayGraph: false});
            return;
        }
        var tempChartColor =[],
            tempChartValue = [],
            chartTime = [],
            chartTemperature = [],
            chartSpeed = [],
            chartDirection = [],
            chartCloud = [],
            chartScore = [],
            chartScoreResult = [],
            chartResultString = [];
        hoursDay.forEach((element, index)=>{
            let score = beachUtils.getWeatherScore(element.weather);
            chartTemperature[index] = beachUtils.getTemperature(element.weather);
            chartSpeed[index] = `${beachUtils.getWindSpeed(element.weather).kph} קמ״ש`;
            chartDirection[index] = beachUtils.calcWindDirection(element.weather);
            chartCloud[index] = beachUtils.getCloud(element.weather);
            chartResultString[index] = this.getResultString(score > 4, '', 'זמן' );
            chartScore[index] = score;
            chartScoreResult[index] = beachUtils.getWeatherScoreResult(element.weather);
            chartTime[index] = element.time,
            tempChartValue[index] = (score - 5)* unitHeight;
            let r = (191 * (10 - score)) / 10;
            let g= (191 * score) / 10;
            tempChartColor[index] = `rgb(${r},${g},0)`;
        });
        this.setState({
            chartTime: chartTime,
            chartValue: tempChartValue,
            chartColor: tempChartColor,
            chartTemperature: chartTemperature,
            chartSpeed: chartSpeed,
            chartDirection: chartDirection,
            chartCloud: chartCloud,
            chartScore: chartScore,
            chartScoreResult: chartScoreResult,
            chartResultString: chartResultString,
            displayGraph: true
        });
    }

    _render_dropdown(rowData, rowID, highlighted) {
        let evenRow = rowID % 2;
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
                <View style={[styles.dropdown_2_row, {backgroundColor: evenRow ? '#f0f5fd' : 'white'}]}>
                    <Text style={[styles.dropdown_2_row_text, highlighted && {color: 'mediumaquamarine'}]}>
                        {`${rowData}`}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }
    _render_dropdown_beach(rowData, rowID, highlighted) {
        let evenRow = rowID % 2;
        return (
            <TouchableHighlight underlayColor='cornflowerblue'>
            <View style={[styles.dropdown_2_row, {backgroundColor: 'rgba(255,255,255,0.7)'}]}>
                <Text style={[styles.beach_text_dd, highlighted && {color: 'mediumaquamarine'}]}>
                    {`${rowData}`}
                </Text>
        </View>
        </TouchableHighlight>
    );
    }
    _dropdown_onSelectDay(idx, value){
        this._loadWeather(value);
        this._loadHours(value.day);
        let currentActive = [false,false,false,false,false,false,false,false,false,false];
        this.setState({day: value.toString(), prevDayState: idx < 1, nextDayState: (idx > this.state.optionsDay.length - 2 ),
            selectedIndex: parseInt(idx), activeTime: currentActive, activeHour: false});

    }
    _dropdown_onSelect(idx, value){
        this._loadWeather(value);
        this.setState({day: value.toString(), prevState: idx < 1, nextState: (idx > this.state.optionsDate.length - 2), selectedDateIndex: parseInt(idx)});

    }
    _dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
        if (rowID == 4) return;
        let key = `spr_${rowID}`;
        return (<View style={styles.dropdown_2_separator}
        key={key}
            />);
    }
    _handlePressDay(to){
        let newIndex = this.state.selectedIndex + to;
        this.state.selectedIndex = newIndex > -1 && newIndex < this.state.optionsDay.length ? newIndex :this.state.selectedIndex ;
        let date = this.state.optionsDay[this.state.selectedIndex];
        this._loadWeather(date);
        this._loadHours(date.day);
        let currentActive = [false,false,false,false,false,false,false,false,false,false];
        this.refs.daysDrop && this.refs.daysDrop.select(this.state.selectedIndex);
        this.setState({activeTime: currentActive, activeHour: false, selectedIndex: this.state.selectedIndex, day: date.toString(), buttonText: date.toString(), prevDayState: this.state.selectedIndex < 1, nextDayState: (this.state.selectedIndex > this.state.optionsDay.length -2 )});
    }
    _handlePress(to){
        let newIndex = this.state.selectedDateIndex + to;
        this.state.selectedDateIndex = newIndex > -1 && newIndex < this.state.optionsDate.length ? newIndex :this.state.selectedDateIndex ;
        let date = this.state.optionsDate[this.state.selectedDateIndex];
        this._loadWeather(date);
        this.setState({selectedDateIndex: this.state.selectedDateIndex, day: date.toString(), valueDate: date.toString(), prevState: this.state.selectedDateIndex < 1, nextState: (this.state.selectedDateIndex > this.state.optionsDate.length -2 )});
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    fetchForecast(beachLocation, beachName, today){
        beachUtils.fetchForecast(beachLocation, beachName, today, (data, days, hoursIndexes, current)=>{
            if (!data || !data.length) return;
            this.hoursIndexes = hoursIndexes;
            currentWeather = current;
            let selectedIndex = 0,
                selectedDay = days[0];
            if (lastSavedDay){
                days.forEach((tempDay, inex)=>{
                    if (tempDay.day == lastSavedDay){
                        selectedDay = tempDay;
                        selectedIndex = inex;
                    }
                })
            }
            this._loadWeather(selectedDay);
            this._loadHours(selectedDay.day);
            let currentActive = [false,false,false,false,false,false,false,false,false,false];
            this.setState({selectedIndex: selectedIndex, selectedDateIndex: 0, day: selectedDay.toString(), optionsDate:data,
                optionsDay:days, valueDate: data[0].toString(), buttonText: selectedDay.toString(), activeTime: currentActive, activeHour: false});
            this.refs.daysDrop && this.refs.daysDrop.select(selectedIndex);
            AsyncStorage.setItem(weatherKey, JSON.stringify({today: today.getTime(), beachName: beachName, data: data, days: days, hoursIndexes: hoursIndexes, current: current}));
        }, (errorMessage, ex)=>{
            this.setState({result:`data didn't loaded because - ${errorMessage}`});
        });
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!');
            if (Date.now() - today < 5*1000*60) return;
            today = new Date();
            this.fetchForecast(beachLocation, beachName, today);
        }
        this.setState({appState: nextAppState});
    };

    _toggleExpanded = ()=>{
        this.setState({ collapsed: !this.state.collapsed });
    };
    _onClick(index){
        let currentActive = [false,false,false,false,false,false,false,false,false,false];
        if (this.state.activeHour && index != this.state.visibleHour){
            currentActive[index] = true;
            this.setState({activeHour: false, visibleHour: index});
            setTimeout(() => {this.setState({activeHour: true, visibleHour: index, activeTime: currentActive})}, 150);
            return
        }

        currentActive[index] = !this.state.activeTime[index];
        this.setState({activeHour: !this.state.activeHour || index != this.state.visibleHour, visibleHour: index, activeTime: currentActive});
    }
    _dropdown_onSelectBeach(beachIndex){
        console.log(`same beach, beachName: ${beachName}, beachIndex: ${beachIndex}`);
        if (this.state.availableBeach.length <= beachIndex) return;
        let beach = this.state.availableBeach[beachIndex];
        if (beachName == beach.name){
            return;
        }
        beachLocation = beach.q;
        beachName = beach.name;
        this.setState({beachText: beachName});
        this.fetchForecast(beachLocation, beachName, today);

        AsyncStorage.setItem(beachKey, JSON.stringify({location: beachLocation, name: beachName}));
    }

    render() {
        let {width, height} = Dimensions.get("window");
        let headerStyle = this.props.headerStyle || {};
        return (<View style={styles.master_container}>
                {this.state.showSplash ?
                    (<View>
                        <Text style={styles.splash_main}>
                            Beach Weather
                        </Text>
                        <View style={styles.splash_bottom}>
                            <Text style={styles.splash_text}>
                                Created by Mufmufim
                            </Text>
                        </View>
                    </View>) :
                    (<View style={styles.container}>
                        <View style={styles.bgImageWrapper}>
                            <Image source={this.state.goodDay ? require('./Charming_sun.png'):require('./Sea_wave.png')}
                                   style={[styles.backgroundImage, {width:width, height: (height + 30) }]}/>
                        </View>
                        <View style={[styles.beachHeader, headerStyle, {width: width}]}>
                        {this.state.availableBeach? (
                            <ModalDropdown ref="beachSelection"
                                       style={styles.beach_dd}
                                       textStyle={styles.location_title}
                                       dropdownStyle={[styles.beach_dd_dd, {height: (this.state.availableBeach.length * 42)}]}
                                       options={this.state.availableBeach}
                                       defaultValue={this.state.beachText}
                                       renderRow={this._render_dropdown_beach.bind(this)}
                                       onSelect={this._dropdown_onSelectBeach.bind(this)}>
                                <View style={styles.beach_view}>
                                <Text style={styles.beach_text}> {this.state.beachText}</Text>
                                    <Image style={styles.beach_image}
                                           source={require('./drop-down-arrow.png')}
                                    />
                                    </View>
                                </ModalDropdown>
                        ) : (<Text style={styles.location_title}>
                            {this.state.beachText}
                        </Text>)
                        }
                            </View>
                        <View style={styles.dateSelection}>
                            <Button containerStyle={[styles.nav_container,styles.nav_left]}
                                    onPress={() => this._handlePressDay(1)}
                                    disabled={this.state.nextDayState}
                                    style={[styles.nav_button, {color: (this.state.nextDayState ? 'rgba(255,255,255,0.2)' : 'white')}]}>
                                &lt;
                            </Button>
                            <ModalDropdown ref="daysDrop"
                                           style={styles.dropdown_2}
                                           textStyle={styles.dropdown_2_text}
                                           dropdownStyle={styles.dropdown_2_dropdown}
                                           options={this.state.optionsDay}
                                           defaultValue={this.state.buttonText}
                                //defaultIndex={this.state.selectedIndex}
                                           renderRow={this._render_dropdown.bind(this)}
                                           renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this._dropdown_renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
                                           onSelect={this._dropdown_onSelectDay.bind(this)}

                            />
                            <Button containerStyle={[styles.nav_container,styles.nav_right]}
                                    onPress={() => this._handlePressDay(-1)}
                                    disabled={this.state.prevDayState}
                                    style={[styles.nav_button, {color: (this.state.prevDayState ? 'rgba(255,255,255,0.2)' : 'white')}]}>
                                &gt;
                            </Button>
                        </View>

                        <View style={styles.data_container}>
                            <TouchableHighlight style={{backgroundColor: 'transparent'}}
                                                onPress={this._toggleExpanded}
                                                activeOpacity={0.5}
                                                underlayColor="transparent">
                                <View style={styles.header}>
                                    <Text
                                        style={[styles.data_text, styles.data_result, this.state.goodDay ? styles.data_goodResult : styles.data_badResult]}>
                                        {this.state.result}
                                    </Text>
                                </View>
                            </TouchableHighlight>

                            <Collapsible collapsed={this.state.collapsed} align="center">
                                <Animatable.View duration={300}
                                                 style={[styles.content, this.state.isActive ? styles.active : styles.inactive]}
                                                 transition="backgroundColor">
                                    <Animatable.Text animation={this.state.isActive ? 'bounceIn' : undefined}
                                                     style={[styles.data_text,styles.content_text]}>
                                        טמפרטורה : &#8451;{this.state.temperature}
                                    </Animatable.Text>
                                    <Animatable.Text animation={this.state.isActive ? 'bounceIn' : undefined}
                                                     style={[styles.data_text,styles.content_text]}>
                                        מהירות הרוח: {this.state.speed} {this.state.direction}
                                    </Animatable.Text>
                                    <Animatable.Text animation={this.state.isActive ? 'bounceIn' : undefined}
                                                     style={[styles.data_text,styles.content_text]}>
                                        עננים: {this.state.cloud}
                                    </Animatable.Text>
                                    <Animatable.Text animation={this.state.isActive ? 'bounceIn' : undefined}
                                                     style={[styles.data_text,styles.content_text]}>
                                        ציון להיום: {this.state.score} {this.state.scoreResult}
                                    </Animatable.Text>
                                </Animatable.View>
                            </Collapsible>

                        </View>

                        {this.state.displayGraph &&
                        <View style={styles.chart_container}>
                            {this.state.chartTime[0] &&
                            <PlayerTrendBarItem
                                key={0}
                                index={0}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[0]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[0]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[0]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[0]}
                                speed={this.state.chartSpeed[0]}
                                direction={this.state.chartDirection[0]}
                                cloud={this.state.chartCloud[0]}
                                score={this.state.chartScore[0]}
                                scoreResult={this.state.chartScoreResult[0]}
                                resultString={this.state.chartResultString[0]}
                                isActive={this.state.activeTime[0]}
                            />
                            }
                            {this.state.chartTime[1] &&
                            <PlayerTrendBarItem
                                key={1}
                                index={1}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[1]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[1]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[1]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[1]}
                                speed={this.state.chartSpeed[1]}
                                direction={this.state.chartDirection[1]}
                                cloud={this.state.chartCloud[1]}
                                score={this.state.chartScore[1]}
                                scoreResult={this.state.chartScoreResult[1]}
                                resultString={this.state.chartResultString[1]}
                                isActive={this.state.activeTime[1]}
                            />
                            }
                            {this.state.chartTime[2] &&
                            <PlayerTrendBarItem
                                key={2}
                                index={2}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[2]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[2]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[2]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[2]}
                                speed={this.state.chartSpeed[2]}
                                direction={this.state.chartDirection[2]}
                                cloud={this.state.chartCloud[2]}
                                score={this.state.chartScore[2]}
                                scoreResult={this.state.chartScoreResult[2]}
                                resultString={this.state.chartResultString[2]}
                                isActive={this.state.activeTime[2]}
                            />
                            }
                            {this.state.chartTime[3] &&
                            <PlayerTrendBarItem
                                index={3}
                                key={3}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[3]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[3]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[3]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[3]}
                                speed={this.state.chartSpeed[3]}
                                direction={this.state.chartDirection[3]}
                                cloud={this.state.chartCloud[3]}
                                score={this.state.chartScore[3]}
                                scoreResult={this.state.chartScoreResult[3]}
                                resultString={this.state.chartResultString[3]}
                                isActive={this.state.activeTime[3]}
                            />
                            }
                            {this.state.chartTime[4] &&
                            <PlayerTrendBarItem
                                key={4}
                                index={4}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[4]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[4]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[4]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[4]}
                                speed={this.state.chartSpeed[4]}
                                direction={this.state.chartDirection[4]}
                                cloud={this.state.chartCloud[4]}
                                score={this.state.chartScore[4]}
                                scoreResult={this.state.chartScoreResult[4]}
                                resultString={this.state.chartResultString[4]}
                                isActive={this.state.activeTime[4]}
                            />
                            }
                            {this.state.chartTime[5] &&
                            <PlayerTrendBarItem
                                key={5}
                                index={5}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[5]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[5]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[5]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[5]}
                                speed={this.state.chartSpeed[5]}
                                direction={this.state.chartDirection[5]}
                                cloud={this.state.chartCloud[5]}
                                score={this.state.chartScore[5]}
                                scoreResult={this.state.chartScoreResult[5]}
                                resultString={this.state.chartResultString[5]}
                                isActive={this.state.activeTime[5]}
                            />
                            }
                            {this.state.chartTime[6] &&
                            <PlayerTrendBarItem
                                onClick={this._onClick.bind(this)}
                                index={6}
                                key={6}
                                value={this.state.chartValue[6]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[6]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[6]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[6]}
                                speed={this.state.chartSpeed[6]}
                                direction={this.state.chartDirection[6]}
                                cloud={this.state.chartCloud[6]}
                                score={this.state.chartScore[6]}
                                scoreResult={this.state.chartScoreResult[6]}
                                resultString={this.state.chartResultString[6]}
                                isActive={this.state.activeTime[6]}
                            />
                            }
                            {this.state.chartTime[7] &&
                            <PlayerTrendBarItem
                                key={7}
                                index={7}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[7]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[7]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[7]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[7]}
                                speed={this.state.chartSpeed[7]}
                                direction={this.state.chartDirection[7]}
                                cloud={this.state.chartCloud[7]}
                                score={this.state.chartScore[7]}
                                scoreResult={this.state.chartScoreResult[7]}
                                resultString={this.state.chartResultString[7]}
                                isActive={this.state.activeTime[7]}
                            />
                            }
                            {this.state.chartTime[8] &&
                            <PlayerTrendBarItem
                                key={8}
                                index={8}
                                onClick={this._onClick.bind(this)}
                                value={this.state.chartValue[8]}
                                high={high}
                                low={low}
                                color={this.state.chartColor[8]}
                                unitHeight={unitHeight}
                                colName={this.state.chartTime[8]}
                                barItemTop={barTop}
                                barInterval={0}
                                day={this.state.day}
                                temperature={this.state.chartTemperature[8]}
                                speed={this.state.chartSpeed[8]}
                                direction={this.state.chartDirection[8]}
                                cloud={this.state.chartCloud[8]}
                                score={this.state.chartScore[8]}
                                scoreResult={this.state.chartScoreResult[8]}
                                resultString={this.state.chartResultString[8]}
                                isActive={this.state.activeTime[8]}
                            />
                            }
                        </View>
                        }
                        {
                            //this.state.activeHour &&
                        <Collapsible collapsed={!this.state.activeHour} align="center">
                        <Animatable.View duration={250}
                                         style={[styles.hourContainer, this.state.activeHour ? styles.active : styles.inactive]}
                                         transition="backgroundColor">
                            <Animatable.Text
                                //animation={this.state.isActive ? 'bounceIn' : undefined}
                                style={[styles.data_text,styles.content_text]}>
                                {this.state.chartResultString[this.state.visibleHour]}
                            </Animatable.Text>
                            <Animatable.Text
                                //animation={this.state.isActive ? 'bounceIn' : undefined}
                                             style={[styles.data_text,styles.content_text]}>טמפרטורה : &#8451;{this.state.chartTemperature[this.state.visibleHour]}
                            </Animatable.Text>
                            <Animatable.Text
                                //animation={this.state.isActive ? 'bounceIn' : undefined}
                                             style={[styles.data_text,styles.content_text]}>מהירות הרוח: {this.state.chartSpeed[this.state.visibleHour]} {this.state.chartDirection[this.state.visibleHour]}
                            </Animatable.Text>
                            <Animatable.Text
                                //animation={this.state.isActive ? 'bounceIn' : undefined}
                                             style={[styles.data_text,styles.content_text]}>עננים: {this.state.chartCloud[this.state.visibleHour]}
                            </Animatable.Text>
                            <Animatable.Text
                                //animation={this.state.isActive ? 'bounceIn' : undefined}
                                             style={[styles.data_text,styles.content_text]}>ציון: {this.state.chartScore[this.state.visibleHour]} {this.state.chartScoreResult[this.state.visibleHour]}
                            </Animatable.Text>
                        </Animatable.View>
                            </Collapsible>

                        }
                        {!this.state.displayGraph &&
                        <View style={styles.no_chart}>
                            <Text>אין תחזית שעתית ל{this.state.day}</Text>
                        </View>
                        }
                        <Text style={styles.dark_sky}
                              onPress={() => Linking.openURL('https://darksky.net/poweredby/')}>
                            Powered by Dark Sky
                        </Text>
                    </View>)
                }
        </View>
    );
    }
}
const styles = StyleSheet.create({
    master_container: {
        flex: 1,
        flexDirection:'row',
        position: 'relative'
    },
    splash_main: {
        top: 178,
        fontSize: 36,
        fontWeight: 'bold',
        textAlignVertical:'center'
    },
    splash_bottom:{
    },
    splash_text: {
        alignSelf: 'center',
        top: 193,
        backgroundColor: 'transparent',
        left: 0,
        right: 0,
        bottom: 0,
        textAlignVertical:'bottom',
        fontSize: 15
    },
    bgImageWrapper: {
        position: 'absolute',
        marginTop:-30
    },
    backgroundImage: {
        resizeMode: "cover"
    },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    dateSelection: {
        flexDirection:  "row",
        justifyContent: "center",
        marginTop: 15,
        alignItems: "center"
    },
    nav_container: {
        height: 41,
        paddingTop: 3,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 5,
        backgroundColor: 'transparent'
    },
    nav_button: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 25,
        width: 40,
        height: 35,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    nav_left: {
    },
    nav_right: {
    },
    data_container: {
        width: 300,
        height: 120
    },
    content: {
        alignSelf: 'flex-end',
        marginRight: 40
    },
    header: {
        alignItems: 'center'
    },
    content_text: {
        textAlign: 'right',
        color: '#333'
    },
    data_text: {
        marginTop: 3,
        backgroundColor: 'transparent',
        textAlign: 'right',
        color: '#333'
    },
    data_result: {
        fontSize: 26
    },
    data_goodResult: {
        color: 'green'
    },
    data_badResult: {
        color: 'red'
    },
    hourContainer: {
        width: 220
    },
    beach_picker: {
        marginTop: -80,
        alignSelf: 'flex-end',
        width: 100,
        borderWidth: 0
    },
    beachHeader: {
        height: 30,
        alignItems: 'flex-end'
    },
    location_title: {
        alignSelf: 'flex-end',
        marginRight: 20,
        marginLeft: 20,
        fontSize: 16,
        backgroundColor: 'transparent',
        color: '#333'
    },
    beach_dd: {
        marginTop: 10,
        backgroundColor: 'transparent',
        borderRadius: 10
    },
    beach_view:{
        width: 97,
        justifyContent: 'space-between',
        flexDirection: 'row-reverse',
    },
    beach_text:{
        marginRight: 10,
        color:'#333'
    },
    beach_image:{
        marginRight: 3,
        width: 8,
        height: 8,
        alignSelf: 'center'
    },
    beach_text_dd: {
        fontSize: 17,
        width: 110,
        textAlign: 'center',
        textAlignVertical: 'center',
        marginHorizontal: 4
    },
    beach_dd_dd:{
        marginLeft: -10
    },
    dropdown_2: {
        width: 250,
        borderWidth: 0,
        borderRadius: 8,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.3)'
    },
    dropdown_2_text: {
        marginVertical: 10,
        marginHorizontal: 6,
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    dropdown_2_dropdown: {
        width: 246,
        height: 300,
        marginLeft: 1,
        marginTop: -1,
        borderColor: 'white',
        borderWidth: 2,
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3
    },
    dropdown_2_row: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center'
    },
    dropdown_2_image: {
        marginLeft: 4,
        width: 30,
        height: 30
    },
    dropdown_2_row_text: {
        marginHorizontal: 4,
        fontSize: 16,
        color: 'navy',
        width:180,
        textAlign: 'right',
        textAlignVertical: 'center'
    },
    dropdown_2_separator: {
        height: 1,
        backgroundColor: 'cornflowerblue'
    },
    chart_container: {
        flexDirection:  "row",
        justifyContent: "center",
        alignItems: "center",
    },
    no_chart:{
        marginTop: 30,
        backgroundColor: 'transparent'
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

