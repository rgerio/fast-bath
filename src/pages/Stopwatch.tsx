import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import {ReanimatedArc, ReanimatedArcBase} from '@callstack/reanimated-arc';
import Reanimated, {call, Easing, useCode} from 'react-native-reanimated';

import backgroundImg from '../assets/images/background.jpg';
import Svg, {Circle} from 'react-native-svg';

const {width, height} = Dimensions.get('window');
const diameter = Math.min(width, height) - 80;

interface Step {
  duration: number;
  label: string;
}

const Stopwatch = () => {
  const [steps, setSteps] = useState<Step[]>([
    {
      duration: 5,
      label: 'Ligar Chuveiro',
    },
    {
      duration: 15,
      label: 'Passar Sabonete',
    },
    {
      duration: 10,
      label: 'Enxaguar',
    },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  const duration = useMemo(() => {
    return steps[currentStep].duration;
  }, [currentStep, steps]);
  const stepLabel = useMemo(() => {
    return steps[currentStep].label;
  }, [currentStep, steps]);

  const [stopWatchActive, setStopWatchActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeText = useMemo(() => {
    return `${Math.round(duration - currentTime)}s`;
  }, [currentTime, duration]);
  const arcAngle = useRef(new Reanimated.Value<number>(360));

  useCode(() => {
    return call([arcAngle.current], ([arcAngleCurrent]) => {
      setCurrentTime(((360 - arcAngleCurrent) * duration) / 360);
    });
  }, [duration]);

  const stopCounting = useCallback(() => {
    setStopWatchActive(false);
    setCurrentStep(0);

    Reanimated.timing(arcAngle.current, {
      toValue: 360,
      easing: Easing.inOut(Easing.quad),
      duration: 200,
    }).start();
  }, []);

  const pauseCounting = useCallback(() => {
    setStopWatchActive(false);
    Reanimated.timing(arcAngle.current, {
      toValue: arcAngle.current,
      easing: Easing.inOut(Easing.linear),
      duration: 1,
    }).start();
  }, []);

  const startCounting = useCallback(() => {
    setStopWatchActive(true);
    console.log(duration);

    Reanimated.timing(arcAngle.current, {
      toValue: 0,
      easing: Easing.inOut(Easing.linear),
      duration: (duration - currentTime) * 1000,
    }).start(({finished}) => {
      if (finished) {
        setStopWatchActive(false);

        console.log('O tempo acabou, executar próxima tarefa');
        Reanimated.timing(arcAngle.current, {
          toValue: 360,
          easing: Easing.inOut(Easing.quad),
          duration: 200,
        }).start(() => {
          setCurrentStep((value) => value + 1);
        });
      }
    });
  }, [currentTime, duration]);

  useEffect(() => {
    console.log('entrei');

    if (currentStep === 0 || currentStep >= steps.length) {
      return;
    }
    // startCounting();
  }, [currentStep, steps.length]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
        <View style={styles.navbarContainer}>
          <Text style={styles.navbarText}>Banho Rápido</Text>
        </View>
        <View style={styles.watchContainer}>
          <Svg style={styles.absolute}>
            <Circle
              cx={width / 2}
              cy={diameter / 2}
              r={diameter / 2 - 16}
              fill={'#fff'}
            />
          </Svg>
          <ReanimatedArc
            color="lightgrey"
            diameter={diameter}
            width={0.08 * diameter}
            arcSweepAngle={360}
            lineCap="square"
            initialAnimation={false}
          />
          <ReanimatedArcBase
            color="rgb(37,138,208)"
            diameter={diameter}
            width={0.08 * diameter}
            arcSweepAngle={arcAngle.current}
            lineCap="butt"
            style={styles.absolute}
            // rotation={Reanimated.divide(arcAngle.current, 2)}
          />
          <View style={[styles.absolute, styles.insideWatchContainer]}>
            <Text style={styles.time}>{currentTimeText}</Text>
            <Text style={styles.timeDescription}>{stepLabel}</Text>
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={stopWatchActive ? pauseCounting : startCounting}>
            <Text style={styles.buttonText}>
              {stopWatchActive ? 'Pausar' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonContainer,
              // {display: stopWatchActive ? 'flex' : 'none'},
            ]}
            // disabled={!stopWatchActive}
            onPress={stopCounting}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    height: 48,
    borderBottomWidth: 1,
    borderColor: 'rgb(119,179,225)',
    backgroundColor: '#fff',
  },
  navbarText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  watchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
  },
  insideWatchContainer: {
    width: diameter - 64,
    alignItems: 'center',
    paddingBottom: 16,
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgb(51,51,51)',
  },
  timeDescription: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
    color: 'rgb(200,200,200)',
    marginTop: 8,
  },
  buttonsContainer: {
    // paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  buttonContainer: {
    flex: 1,
    height: 64,
    marginHorizontal: 0.5,
    backgroundColor: 'rgb(25,135,209)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

export default Stopwatch;
