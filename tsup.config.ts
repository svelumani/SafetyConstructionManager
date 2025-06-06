// tsup.config.ts
export default {
  entry: ['server/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  target: 'node18',
  noExternal: ['dotenv'], // <---- this is important
  esbuildOptions(options) {
    options.platform = 'node';
  }
};
