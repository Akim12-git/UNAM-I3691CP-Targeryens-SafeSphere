import { Image, StyleSheet } from 'react-native';

const logo = require('../../../assets/Copilot_20260608_111229 (1).png');

export default function BrandLogo({ style }) {
  return <Image source={logo} style={[styles.logo, style]} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  logo: {
    width: 72,
    height: 72,
  },
});
