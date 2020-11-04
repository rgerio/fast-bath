import React from 'react';
import {StatusBar} from 'react-native';
import Stopwatch from './pages/Stopwatch';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stopwatch />
    </>
  );
};

export default App;
