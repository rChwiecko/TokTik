const { withNextVideo } = require('next-video/process')

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals = [
          ...(config.externals || []),
          "onnxruntime-node", // Prevents Webpack from bundling this native module
        ];
      }
      return config;
    },
  };
  

module.exports = withNextVideo(nextConfig)
