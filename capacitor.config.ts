import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.therapyapp.app', 
  appName: 'TherapyApp',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: [
      'mindanchor-fkab.onrender.com', // This allows the app to talk to your backend!
      '*.onrender.com'
    ]
  }
};

export default config;
