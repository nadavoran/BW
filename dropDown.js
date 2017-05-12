/**
 * Created by nadavoran on 23/04/2017.
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Text,
    Modal,
    View,
    Dimensions
} from 'react-native';

//export default
export default class DropDown extends Component {
    constructor (props) {
        super(props);

        this.state = {
            modalVisible: false,
            selectedValue: props.selectedValue || "Please select...",
            modalTop: 100
        }
    }

    setModalVisible(visible) {
        this.refs.ddView.measure((fx, fy, width, height, px, py) =>{
            console.log(`fx: ${fx}, fy: ${fy}, width: ${width}, height: ${height}, px: ${px}, py: ${py}, fullWidth: ${this.props.fullWidth}`);
            this.setState({modalVisible: visible, modalTop: (height+py), modalWidth: ( width + (this.props.fullWidth? (2*px) : 0))});
        });
    }

    render() {
        const {style, modalStyle, textStyle, dropdownStyle} = this.props;
        console.log(`style ${style}`);
        return (
            <View style={[style, {marginTop: 22}]}>
                <View ref="ddView"
                    >
                    <TouchableOpacity
                        onPress={() => {this.setModalVisible(true)}}>
                        <Text style={textStyle}>{this.state.selectedValue}</Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    transparent={true}
                    animationType={"none"}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {alert("Modal has been closed.")}}
                >
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <View ref="modal"
                              style={[dropdownStyle, {marginTop: 0 ,position: 'absolute', top: this.state.modalTop, width: this.state.modalWidth}]}>
                            <View>
                                <View style={[styles.tooltipMark]} />
                                <Text>Hello World!</Text>
                                <TouchableOpacity onPress={() => {this.setModalVisible(!this.state.modalVisible)}}>
                                    <Text>Hide Modal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    // Tooltip
    modalMark: {
        borderTopColor: 'rgba(0, 0, 0, 0.9)',
        borderTopWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        bottom: -5,
        position: 'absolute',
        height: 10,
        width: 10,
        left: 10,
        marginLeft: -6,
        borderLeftWidth: 6,
        borderRightWidth: 6
    }
});
