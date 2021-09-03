/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const ENV_VARS = {
  TOKEN: process.env.TOKEN
};

module.exports = {
  // assetPrefix: ''
  env                : ENV_VARS,
  publicRuntimeConfig: ENV_VARS,
  poweredByHeader    : false
};
