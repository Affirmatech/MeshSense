import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
// import commonjs from '/data/proj/node/rollup-plugins/packages/commonjs/dist/es/index.js';
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nativePlugin from 'rollup-plugin-natives'
import terser from '@rollup/plugin-terser'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'rollup'

let externals = [
  '@mikro-orm/sqlite',
  '@mikro-orm/migrations',
  '@mikro-orm/entity-generator',
  '@mikro-orm/mariadb',
  '@mikro-orm/mongodb',
  '@mikro-orm/mysql',
  '@mikro-orm/seeder',
  '@mikro-orm/postgresql',
  '@vscode/sqlite3',
  'pg',
  'sqlite3',
  'mysql',
  'mysql2',
  'oracledb',
  'pg-native',
  'pg-query-stream',
  'tedious',
  'mock-aws-s3',
  'aws-sdk',
  'nock',
  'mariadb/callback',
  'libsql'
]

export default defineConfig({
  input: 'src/index.ts',
  output: {
    // dir: 'dist',
    // sourcemap: true,
    file: 'dist/index.cjs',
    format: 'cjs',
    // file: 'dist/index.mjs',
    // format: 'es',
    plugins: [
      // terser({
      //   keep_classnames: true,
      //   mangle: false
      // })
    ]
  },
  external: externals,
  plugins: [
    nativePlugin({
      copyTo: 'dist',
      map: (modulePath) => console.log(modulePath) || modulePath,
      targetEsm: true // Important
    }),
    nodeResolve({
      // node-resolve has to come before commonjs -- Rich-Harris
      preferBuiltins: true
      // resolveOnly: ['@mikro-orm/better-sqlite', '@mikro-orm/core', 'axios']
    }),
    commonjs({
      ignore: externals,
      ignoreDynamicRequires: true,   // Should be commented   // Uncommented for serialport
      transformMixedEsModules: true, // Not sure about this
      dynamicRequireTargets: [
        // 'node_modules/@serialport/bindings-cpp/prebuilds/win32-x64/node.napi.node'
        // 'node_modules/better-sqlite3/build/Release/better_sqlite3.node'
      ],

      // Possible fix?
      ignoreGlobal: true
    }),
    typescript({
      target: 'esnext'
      // sourceMap: true
    }),
    json()
  ]
})
