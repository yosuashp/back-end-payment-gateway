const dotenv = require('dotenv');

dotenv.config();

const baseConfig = {
  authentication: {
    type: 'default',
    options: {
      userName: '',
      password: '',
    },
  },
  options: {
    encrypt: false,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
    },
    connectTimeout: 15000,
    requestTimeout: 30000, 
    pool: {
      max: 10, 
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

const config1 = {
  ...baseConfig,
  server: process.env.TRO_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.TRO_USER,
      password: process.env.TRO_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.TRO_NAME,
  },
};

const config2 = {
  ...baseConfig,
  server: process.env.BRIMPNG2_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.BRIMPNG2_USER,
      password: process.env.BRIMPNG2_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.BRIMPNG2_NAME,
  },
};

const config3 = {
  ...baseConfig,
  server: process.env.SHIFT_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.SHIFT_USER,
      password: process.env.SHIFT_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.SHIFT_NAME,
  },
};

const config4 = {
  ...baseConfig,
  server: process.env.CASHCARD_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.CASHCARD_USER,
      password: process.env.CASHCARD_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.CASHCARD_NAME,
  },
};

const config5 = {
  ...baseConfig,
  server: process.env.SPAN_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.SPAN_USER,
      password: process.env.SPAN_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.SPAN_NAME,
  },
};

const config6 = {
  ...baseConfig,
  server: process.env.NEWTRO_HOST,
  authentication: {
    ...baseConfig.authentication,
    options: {
      userName: process.env.NEWTRO_USER,
      password: process.env.NEWTRO_PASSWORD,
    },
  },
  options: {
    ...baseConfig.options,
    database: process.env.NEWTRO_NAME,
  },
};

const configSeeder = {
  server: "localhost",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "290802",
    },
  },
  options: {
    encrypt: false,
    database: "NEW_TRO",
    connectTimeout: 15000,
    requestTimeout: 30000,
  },
};

module.exports = { config1, config2, config3, config4, config5, config6, configSeeder };
