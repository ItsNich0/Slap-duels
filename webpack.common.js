const path = require('path');

module.exports = {
  entry: {
    app: './js/MenuManager.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/MenuManager.js',
  },
};
