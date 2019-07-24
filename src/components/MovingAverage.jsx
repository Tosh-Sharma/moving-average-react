import React, { PureComponent } from 'react';
import autobind from 'react-autobind';
import Select from 'react-select';

import { getCurrencySelectionData } from '../services/currencies';
import styles from './MovingAverage.css';       // The aligning and CSS are from this file.

class MovingAverage extends PureComponent {
    constructor(props) {
       super(props);
       this.state = {
           currencyValue: '',
           numberOfTicks: 0,
           pipDifference: 0,
           options: [],
           data: [],
           movingAverage: 0,
           currentValue: 0,
           currentStatus: '',
           isDisabled: true,
       };
       autobind(this);
    };

    wssUrl = 'wss://stocksimulator.intuhire.com';
    ws = new WebSocket(this.wssUrl);

    componentDidMount() {
        this.setOptions(); 
        this.ws.onopen = evt => {
            console.log('onOpen Was triggered');    // Keeping this for debugging purposes.
        }

        this.ws.onmessage = evt => {
            this.setState({ currentValue: parseFloat(evt.data) });
            this.addData(parseFloat(evt.data));
            this.calculateMovingAverage();
        }
    }

    componentDidUpdate() {
        this.isButtonEnabled();
    }
    
    addData = data => this.setState({ data: [...this.state.data, data] })

    setOptions = () =>  getCurrencySelectionData().then(options => this.setState({ options }))

    onCurrencyChange = (currencyValue) => this.setState({ currencyValue: currencyValue, data: [] });

    setNumberOnChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({ [name]: Math.abs(value) });
    }

    onSubmit = () => {
        if(this.state.currencyValue && this.state.currencyValue.value) {
            this.ws.send(JSON.stringify({"currencyPair": this.state.currencyValue.value }));
        }
    }

    calculateMovingAverage = () => {
        let average = 0;
        if (this.state.data.length < this.state.numberOfTicks) {
            this.setState({ movingAverage: "Please wait..." });
        } else {
            if (this.state.data.length === this.state.numberOfTicks) {
                for(let i = 0; i < this.state.numberOfTicks; i++)  {
                    average = average + this.state.data[i];
                }
            } else {
                average = this.state.movingAverage * this.state.numberOfTicks; 
                // Add the additional element and remove the n -1 th element.
                const data = this.state.data;
                const arrayLength = data.length - 1;
                average = average + this.state.data[arrayLength];
                average = average - this.state.data[arrayLength - this.state.numberOfTicks];
            }
            average = average / this.state.numberOfTicks;

            let difference = Math.abs(average - this.state.currentValue);
            difference = difference * 10000;
            console.log('Current Value ', this.state.currentValue);
            console.log('Moving Average ', average);
            if ((this.state.currentValue < average) && (difference >= this.state.pipDifference)) {
                this.setState({ currentStatus: 'BUY' });
            }
            if((this.state.currentValue > average) && (difference >= this.state.pipDifference)) {
                this.setState({ currentStatus: 'SELL' });
            }
            if(difference < this.state.pipDifference) {
                this.setState({ currentStatus: '' });
            }

            this.setState({ movingAverage: average });
        }
    }

    isButtonEnabled = () => {
        const { currencyValue, numberOfTicks, pipDifference } = this.state;
        if (currencyValue.value && numberOfTicks > 0 && pipDifference > 0) {
            this.setState({ isDisabled: false });
        } else {
            this.setState({ isDisabled: true, movingAverage: 0, currentValue: 0, currentStatus: '' });
        }
    }

    render() {

    return (
        <div id="container">
            <h1>Moving Average</h1>
            <h4>Choose Currency pair:  </h4>
            <Select
                placeholder="Select currency..."
                options={this.state.options}
                value={this.state.currencyValue}
                onChange={this.onCurrencyChange}
            />
            <h4>Number of Ticks: </h4>
            <input name="numberOfTicks" type="number" value={this.state.numberOfTicks} onChange={this.setNumberOnChange} min="0" />
            <h4>Pip Difference: </h4>
            <input name="pipDifference" type="number" value={this.state.pipDifference} onChange={this.setNumberOnChange} min="0" />
            <br /> <br />
            <button class={styles.button} disabled={this.state.isDisabled} onClick={this.onSubmit}> Submit </button>
            <br /> <br />
            <div>
                Moving Average: {this.state.movingAverage === 0 ? '': this.state.movingAverage}
                <br /> <br />
                Current Value:
                {(this.state.movingAverage === 'Please wait...' || this.state.movingAverage === 0) ? '': this.state.currentValue}
                <br /> <br />
                Buy/ Sell: {this.state.currentStatus}
            </div>
        </div>
        );
    }
}

export default MovingAverage;
