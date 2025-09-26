import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astroguru.app',
  appName: 'AstroGuru',
  webDir: 'build',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1039681193782-obmnqsvo8dvct21i1fum6dov74i0iqn2.apps.googleusercontent.com',
      androidClientId: '1039681193782-m2ave3359vb9qu70b3sdars3inq6qc5s.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
