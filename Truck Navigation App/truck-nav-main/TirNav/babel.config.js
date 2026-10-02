module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@screens': './src/screens',
            '@components': './src/components',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@types': './src/types',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
            '@env': './src/types/env',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
