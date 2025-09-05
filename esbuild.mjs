import env from 'esbuild-plugin-env'
import eslint from 'esbuild-plugin-eslint'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { build } from 'esbuild'

build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: './dist/index.js',
  sourcemap: true,
  minify: true,
  target: 'es2020',
  plugins: [
    env(),
    nodeExternalsPlugin(),
    eslint({
      fix: true,
    }),
  ],
})
