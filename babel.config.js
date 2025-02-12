module.exports = (api) => {
  api.cache(true);

  const presets = [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3
      }
    ]
  ];

  const plugins = [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-styled-components',
    'babel-plugin-idx'
  ];

  const env = {
    test: {
      plugins: [
        'transform-es2015-modules-commonjs'
      ]
    },
    production: {
      plugins: [
        [
          'babel-plugin-styled-components',
          {
            displayName: false
          }
        ]
      ]
    }
  };

  return {
    presets,
    plugins,
    env
  };
};