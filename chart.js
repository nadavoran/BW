/**
 * Created by nadavoran on 17/04/2017.
 */
'use strict'

import React, { Component } from 'react';
import {
    PropTypes,
    View,
    StyleSheet,
    TouchableHighlight,
    Text,
    Dimensions
} from 'react-native'

const tooltipWidth = 150;
var barWidth = 38;

export default class PlayerTrendBarItem extends Component {

    constructor (props) {
        super(props);

        this.state = {
            isHover: false,
            isHoverCovered: false,
            isHoverCoveredRight: false
        }
    }

    onPressIn (e) {
        const screenWidth = Dimensions.get('window').width

        this.props.onClick && this.props.onClick(this.props.index);

        this.setState({
            isHover: true,
            isHoverCoveredLeft: e.nativeEvent.pageX < (tooltipWidth / 2 + 10),
            isHoverCoveredRight: e.nativeEvent.pageX + tooltipWidth / 2 + 20 > screenWidth
        })
    }

    onPressOut (e) {
        this.setState({
            isHover: false,
            isHoverCovered: false,
            isHoverCoveredRight: false
        })
    }

    render () {
        const {color, low, high, value, unitHeight, barInterval, barItemTop, isActive, colName} = this.props;
        const {isHover, isHoverCoveredLeft, isHoverCoveredRight} = this.state;

        let width = Math.round((Dimensions.get("window").width / 8)) - 12;
        if (width < 0){
            width = 30;
        }
        barWidth = Math.min(width, barWidth);
        let entity;
        let emptyTop;
        let emptyBottom;
        let wrapperStyle = {
            right: barInterval,
            height: (high * unitHeight)
        };
        let barStyle = {};
        if (value > 0) {
            entity = value;
            emptyTop = Math.max(0,high/2 - value);
            emptyBottom = (high)/2;
        } else if (value == 0){
            entity = 0;
            emptyTop = (high)/2 - 1;
            emptyBottom = (high)/2 + 1;
        } else{
            entity = Math.abs(value);
            emptyTop = (high)/2 + 3.8;
            emptyBottom = Math.max(0,high/2 - value);
            //emptyTop = Math.abs(low) - entity;
            //emptyBottom = Math.abs(low) - entity;
            barStyle ={
                top: (emptyTop * unitHeight),
                position: "relative",
                //height: (empty * unitHeight),
                //transform: [{
                //    rotate: '180deg'
                //}]
            }
        }

        /* Prevent tooltip covered by the edge */
        let tooltipPosition = {
            left: -(tooltipWidth / 2),
            marginLeft: barWidth / 2
        };
        let tooltipMark = {
            left: tooltipWidth / 2,
            //width: barWidth,
            marginLeft: -6,
            borderLeftWidth: 6,
            borderRightWidth: 6
        };
        if (isHoverCoveredLeft) {
            tooltipPosition.left = 0;
            tooltipPosition.marginLeft = 0;
            tooltipMark.left = 5;
            tooltipMark.marginLeft = 0;

            delete tooltipMark.borderLeftWidth
        } else if (isHoverCoveredRight) {
            delete tooltipPosition.left;
            delete tooltipPosition.marginLeft;
            delete tooltipMark.left;
            delete tooltipMark.marginLeft;

            tooltipPosition.right = 3;
            delete tooltipMark.borderRightWidth;
            tooltipMark.right = 5;
        }

        const baseStyle = {
            borderColor: color,
            borderWidth: 2,
            width: barWidth,
            borderStyle: 'solid',
            //backgroundColor: color,
            marginRight: barInterval
        };
        return (
            <TouchableHighlight
                onPressIn={this.onPressIn.bind(this)}
                onPressOut={this.onPressOut.bind(this)}
                underlayColor='transparent'>
                <View style={[styles.container, {marginTop: barItemTop}]}>
                    <View style={[styles.barWrapper, wrapperStyle]}>
                        <View style={[styles.bar, styles.empty, Object.assign({}, baseStyle, {height: (emptyTop * unitHeight)})]} />
                        <View style={[styles.bar, Object.assign({}, baseStyle, {height: (entity * unitHeight),backgroundColor: color})]} />
                        <View style={[styles.bar, styles.empty, Object.assign({}, baseStyle, {height: (emptyBottom * unitHeight)})]} />
                    </View>
                    <Text style={[styles.text, {fontWeight: isActive? 'bold' : 'normal', top: -((high * unitHeight)/2)}]}>{colName}</Text>
                </View>

            </TouchableHighlight>

        )
    }
}
//
//<View style={[styles.container, {marginTop: barItemTop}]}>
//    <View style={[styles. barWrapper, Object.assign({},wrapperStyle)]}>
//        <View style={[styles.bar, barStyle, styles.empty, baseStyle]} />
//        <View style={[styles.bar, Object.assign({}, baseStyle, {height: (entity * unitHeight)})]} />
//        <Text style={[styles.text, {fontWeight: isActive? 'bold' : 'normal'}]}>{colName}</Text>
//    </View>
//{isHover &&
//<View style={[styles.tooltip, tooltipPosition]}>
//    <Text style={styles.tooltipContent}>תחזית ליום {day} בשעה {colName} </Text>
//    <Text style={styles.tooltipContent}>טמפרטורה : &#8451;{temperature} </Text>
//    <Text style={styles.tooltipContent}>מהירות הרוח: {speed}</Text>
//    <Text style={styles.tooltipContent}>כיוון הרוח: {direction}</Text>
//    <Text style={styles.tooltipContent}>עננים: {cloud}</Text>
//    <Text style={styles.tooltipContent}>ציון: {score}</Text>
//    <Text style={styles.tooltipContent}>{resultString}</Text>
//    <View style={[styles.tooltipMark, tooltipMark]} />
//</View>
//}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        //justifyContent:'space-between',
        //borderWidth: 1,
        //borderStyle: "solid",
        //borderColor: "black"
    },
    // Bar
    barWrapper: {
        position: 'relative',
        marginHorizontal: 2,
        borderTopWidth:1,
        borderBottomWidth:1,
        borderStyle: "solid",
        borderColor: "rgba(100,100,100,0.5)"
        //justifyContent:'space-between',
        //alignItems: 'space-between',
        //borderWidth: 1,
        //borderStyle: "solid",
        //borderColor: "green"
    },
    bar: {
        //marginHorizontal: 2,
        //paddingHorizontal: 2,
        //borderWidth: 1,
        //borderStyle: "solid",
        //borderColor: "purple"
    },
    empty: {
        opacity: 0,
        //color: "grey"
    },
    text: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 1,
        //marginHorizontal: 2,
        //color: 'rgba(0, 0, 0, 0.9)'
        color: '#333'
    },
    // Tooltip
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 5,
        paddingHorizontal: 3,
        paddingVertical: 5,
        position: 'absolute',
        top: -126,
        width: tooltipWidth
    },
    tooltipContent: {
        color: '#fff',
        fontSize: 11,
        textAlign: 'center'
    },
    tooltipMark: {
        borderTopColor: 'rgba(0, 0, 0, 0.9)',
        borderTopWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        bottom: -5,
        position: 'absolute',
        height: 0,
        width: 0
    }
})
//
//PlayerTrendBarItem.propTypes = {
//    value: PropTypes.number,
//    high: PropTypes.number,
//    low: PropTypes.number,
//    color: PropTypes.string,
//    unitHeight: PropTypes.number,
//    date: PropTypes.string,
//    barInterval: PropTypes.number,
//    barItemTop: PropTypes.number
//}
