import React from 'react';
import autobind from 'react-autobind';

import MovingAverage from './components/MovingAverage';

class MainApp extends React.Component {
  constructor(props) {
    super(props);
    autobind(this);
  }

  render() {
    return (
      <MovingAverage />
    );
  }
}

export default MainApp;
