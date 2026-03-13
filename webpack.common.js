const path = require('path');

module.exports = {
  entry: {
    app: './js/GameManager.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/GameManager.js',
  },
};
