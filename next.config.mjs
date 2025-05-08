// next.config.mjs
export default {
  webpack(config, { isServer }) {
    // Fix for native module errors (e.g., .node files)
    if (!isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: 'node-loader',
      });
    }

    return config;
  },
};
