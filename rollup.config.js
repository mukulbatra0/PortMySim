import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'JS/vendor/bundle-entry.js',
  output: {
    file: 'JS/vendor/truecallerjs-bundle.js',
    format: 'iife',
    name: 'truecallerBundle',
    globals: {
      'string_decoder': 'StringDecoder',
      'events': 'EventEmitter',
      'timers': 'Timers'
    }
  },
  plugins: [
    nodePolyfills(),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs()
  ]
}; 