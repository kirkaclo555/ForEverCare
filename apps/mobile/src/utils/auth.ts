import { Alert } from 'react-native';

export const promptGuestAuth = (navigation: any, language: string) => {
  Alert.alert(
    language === 'en' ? 'Authentication Required' : 'Kinakailangan ang Pautentikasyon',
    language === 'en'
      ? 'Please log in or sign up to access this feature.'
      : 'Mangyaring mag-log in o mag-sign up upang ma-access ang tampok na ito.',
    [
      {
        text: language === 'en' ? 'Log In' : 'Mag-log In',
        onPress: () => navigation.navigate('Login'),
      },
      {
        text: language === 'en' ? 'Sign Up' : 'Mag-sign Up',
        onPress: () => navigation.navigate('Register'),
      },
      {
        text: language === 'en' ? 'Cancel' : 'Kanselahin',
        style: 'cancel',
      },
    ]
  );
};
