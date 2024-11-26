// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      // Alias 'react-konva' to use the core version
      config.resolve.alias['react-konva'] = 'react-konva/lib/ReactKonvaCore';
  
      if (isServer) {
        // Exclude 'konva' and 'canvas' from the server build
        config.externals.push({
          'konva': 'konva',
          'canvas': 'canvas',
        });
      }
  
      return config;
    },
  };
  
  module.exports = nextConfig;
  