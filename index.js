/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import i18n from './src/lang/i18n';
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false);

AppRegistry.registerComponent(appName, () => App);
