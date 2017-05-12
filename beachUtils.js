/**
 * Created by nadavoran on 22/04/2017.
 */

import moment from 'moment';
const daysOfWeek = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];

let beachUtils = {
    calcWindDirection(fullWeather) {
        if (fullWeather.beachWindBearing){
            return fullWeather.beachWindBearing;
        }
        if (fullWeather.windBearing)
            return fullWeather.windBearing < 28 || fullWeather.windBearing > 339 ? "צפונית" :
                fullWeather.windBearing < 60 ? "צפון מזרית" :
                    fullWeather.windBearing < 112 ? "מזרחית" :
                        fullWeather.windBearing < 158 ? "דרום מזרחית" :
                            fullWeather.windBearing < 198 ? "דרומית" :
                                fullWeather.windBearing < 241 ? "דרום מערבית" :
                                    fullWeather.windBearing < 290 ? "מערבית" : "צפון מערבית";
        if (!fullWeather.wind)return "אין כיוון";
        return fullWeather.wind.direction < 28 || fullWeather.wind.direction > 339 ? "צפונית" :
            fullWeather.wind.direction < 60 ? "צפון מזרית" :
                fullWeather.wind.direction < 112 ? "מזרחית" :
                    fullWeather.wind.direction < 158 ? "דרום מזרחית" :
                        fullWeather.wind.direction < 198 ? "דרומית" :
                            fullWeather.wind.direction < 241 ? "דרום מערבית" :
                                fullWeather.wind.direction < 290 ? "מערבית" : "צפון מערבית";
    },
    getTemperature(fullWeather){
        if (fullWeather.beachTemp){
            return fullWeather.beachTemp;
        }
        return fullWeather.apparentTemperature || fullWeather.apparentTemperatureMax || fullWeather.main.temp;
    },
    getCloud(fullWeather){
        if (fullWeather.beachCloud){
            return fullWeather.beachCloud;
        }
        if (fullWeather.cloudCover != null)
            return Math.round(fullWeather.cloudCover * 100);
        return 0;
    },
    getWindSpeed(fullWeather){
        if (fullWeather.beachWindSpeed){
            return fullWeather.beachWindSpeed;
        }
        if (fullWeather.windSpeed)
            return {knots: Math.round(fullWeather.windSpeed * 1.94384), mps: fullWeather.windSpeed, kph: Math.round(fullWeather.windSpeed * 3.6)};
        return {knots: Math.round(fullWeather.wind.speed * 1.94384), mps: fullWeather.wind.speed, kph: Math.round(fullWeather.wind.speed * 3.6)};
    },
    goodBeachWeather(fullWeather, maxMPS, minTemp, maxCloud){
        maxMPS = maxMPS || 4;
        minTemp = minTemp || 25;
        maxCloud = maxCloud || 0.7;
        let temp = this.getTemperature(fullWeather);
        if (fullWeather.windSpeed)
            return fullWeather.windSpeed < maxMPS && temp > minTemp && fullWeather.cloudCover < maxCloud;
        return fullWeather.wind.speed < minMPS && fullWeather.main.temp > minTemp;
    },
    getWeatherScoreResult(fullWeather){
        return fullWeather.score ? fullWeather.score.result : '';
    },
    getWeatherScore(fullWeather){
        if (fullWeather.score){
            return fullWeather.score.score;
        }
        let temp = this.getTemperature(fullWeather),
            speed = this.getWindSpeed(fullWeather),
            cloud = this.getCloud(fullWeather),
            score = 0;
        if (speed.knots > 14 || temp < 22 || cloud > 80) {
            return score;
        }
        if (temp > 32) {
            if (speed.knots > 8){
                score = Math.max(0, 10 - (temp - 35));
            } else {
                    score = Math.max(0, 10 - (temp - 31));
            }
        } else if (speed.knots < 5 && cloud < 20){
            // if soft wind than the temperature could be little lower
            score = temp - 18;
        } else {
            score = temp - 20;
        }
        return Math.min(10, Math.round(score));
    },
    fetchForecast(beachLocation, beachName, today, successCallback, failureCallback) {
        //fetch(`https://api.darksky.net/forecast/77d1a74f95e7565281f5d59157c898fa/32.146284,%2034.791701?exclude=minutely&units=si`) difference
        fetch(`https://salty-waters-82263.herokuapp.com/weather?q=${beachLocation}&name=${beachName}&hours=${today.getHours()}`)
            .then((response) => {
                return response.json();})
            .then((responseJson) => {
                let allWeather = responseJson;
                if (!allWeather || !allWeather.hourly || !allWeather.hourly.data.length){
                    failureCallback && failureCallback(`Weather forecast was empty ${req.responseText}`);
                    return;
                }
                var hoursIndexes = {};
                let currentWeather = {
                    weather: allWeather.currently,
                    time: moment.unix(allWeather.currently.time)
                };
                let weatherData = allWeather.hourly.data.filter((weather, index, all)=>{
                    let time = moment.unix(weather.time);
                    return time.hours() > 9 && time.hours() < 19;
                }).map((weather, wIndex)=>{
                    let time = moment.unix(weather.time);
                    let displayTime = `${time.hours()}:00`;
                    if (time < currentWeather.time){
                        weather = currentWeather.weather;
                        time = currentWeather.time;
                        let minuteTime = time.minutes();
                        displayTime = `${time.hours()}:${minuteTime < 10 ? (0 + minuteTime) : minuteTime}`
                    }
                    if (weather.apparentTemperature ) {
                        weather.apparentTemperature = Math.round(weather.apparentTemperature);
                    }
                    let displayName = `${daysOfWeek[time.day()]} - ${time.hours()}`;
                    if (!hoursIndexes[time.date()]) {
                        hoursIndexes[time.date()] = [{index: wIndex, weather: weather, time: displayTime}];
                    } else {
                        hoursIndexes[time.date()].push({index: wIndex, weather: weather, time: displayTime});
                    }
                    return {time:time, weather: weather, toString: ()=> displayName};
                });
                //.filter((weather, index, all)=>{
                //    return !skippedDay || index > 0;
                //})
                //var skippedDay = weatherData[0].time.day() != moment.unix(allWeather.hourly.data[0].time).day();
                let weatherDay = allWeather.daily.data.map((weather)=>{
                    let time = moment.unix(weather.time),
                        day = time.date() == today.getDate() ? "היום" : daysOfWeek[time.day()];
                    let displayName = `${day} - ${time.date()}/${time.month()}/${time.year()} `;
                    //if (hoursIndexes[time.date()]){
                    //    weather.apparentTemperatureMax = 0;
                    //    weather.windSpeed = 0;
                    //    hoursIndexes[time.date()].forEach((element)=>{
                    //        weather.apparentTemperatureMax += element.weather.apparentTemperature;
                    //        weather.windSpeed += element.weather.windSpeed;
                    //    });
                    //    weather.apparentTemperatureMax /= hoursIndexes[time.date()].length;
                    //    weather.windSpeed /= hoursIndexes[time.date()].length;
                    //}
                    //if (weather.apparentTemperatureMax ) {
                    //    weather.apparentTemperatureMax = Math.round(weather.apparentTemperatureMax);
                    //}
                    return {time:time, day: time.date(), format: day, weather: weather, toString: ()=> displayName};
                });
                successCallback && successCallback(weatherData,  weatherDay, hoursIndexes, currentWeather);
            }).catch((ex)=>{
            failureCallback && failureCallback("failed to load resource", ex);
        });

    },
    getResultString(score, forDay, time){
        return `${forDay} ${score ? 'לא': '' } ${time} טוב ללכת ליום`;
    }
    //fetchForecast(successCallback, failureCallback){
    //    fetch('http://api.openweathermap.org/data/2.5/forecast?lat=32.150566&lon=34.793101&appid=cd4ac4acb5ff040c07a8cc93f5884ec5&units=metric')
    //        .then((response) => {
    //            return response.json();})
    //        .then((responseJson) => {
    //            let allWeather = responseJson;
    //            if (!allWeather || !allWeather.list || !allWeather.list.length){
    //                failureCallback && failureCallback(`Weather forecast was empty ${req.responseText}`);
    //                return;
    //            }
    //            var daysOfWeek = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
    //            let weatherData = allWeather.list.filter((weather, index, all)=>{
    //                let time = moment(weather.dt_txt);
    //                console.log(`filter is ${weather.dt_txt} hour is ${time.hours()} day is ${time.day()}`);
    //                return time.hours() > 8 && time.hours() < 17;
    //            }).map((weather)=>{
    //                let time = moment(weather.dt_txt);
    //                let displayName = `${daysOfWeek[time.day()]} - ${time.hours()}` ;
    //                return {time:time, weather: weather, toString: ()=> displayName};
    //            });
    //            successCallback && successCallback(weatherData);
    //        }).catch((ex)=>{
    //        failureCallback && failureCallback("failed to load resource", ex);
    //    });
    //
    //},
    //},
};

module.exports = {beachUtils};
