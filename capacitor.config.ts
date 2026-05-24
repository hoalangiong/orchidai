import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orchidfarm.ai',
  appName: 'Orchid AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      google: {
        webClientId: '456597052380-hj9p770bkaut6hsj57ai8upfg3cbikn4.apps.googleusercontent.com'
      }
    }
  }
};

export default config;
