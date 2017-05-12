/**
 * Created by nadavoran on 19/04/2017.
 */
'use strict'

import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Dimensions
} from 'react-native'

var tooltipWidth = 150;
var itemWidth = 150;
var top = 0;

export default class ToolTipWithView extends Component {

    constructor (props) {
        super(props);
        tooltipWidth = props.tooltipWidth || tooltipWidth;
        itemWidth = props.itemWidth || itemWidth;
        top = props.topAlign || top;
        this.state = {
            isHover: false,
            isHoverCovered: false,
            isHoverCoveredRight: false
        }
    }

    onPressIn (e) {
        const screenWidth = Dimensions.get('window').width;

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
        const {data, hoverData} = this.props;
        const {isHover, isHoverCoveredLeft, isHoverCoveredRight} = this.state;

        /* Prevent tooltip covered by the edge */
        let tooltipPosition = {
            left: -(tooltipWidth / 2),
            marginLeft: itemWidth / 2
        };
        let tooltipMark = {
            left: tooltipWidth / 2,
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
            tooltipMark.right = 5
        }

        return (
            <TouchableHighlight
                onPressIn={this.onPressIn.bind(this)}
                onPressOut={this.onPressOut.bind(this)}
                underlayColor='transparent'>
                <View>
                    {data && data}
                    {isHover &&
                    <View style={[styles.tooltip, tooltipPosition, {top: top, width: tooltipWidth}]}>
                        {hoverData}
                        </View>
                    }
                </View>

            </TouchableHighlight>

        )
    }
}
const styles = StyleSheet.create({
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 5,
        paddingHorizontal: 3,
        paddingVertical: 5,
        position: 'absolute'

        //top: -95,

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
});
