'use strict';

// const r = require('rollup');
const path = require('path');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');

const dist = process.env.dist;
let entry = process.env.entry.replace('.js', '').split('src/');
entry = entry[entry.length - 1];

const moduleId = path.basename(entry);

// Now the export
export default {
    entry: `${process.env.entry}`,
    dest: `${dist}/${entry}.js`,
    moduleName: `bedrockComp${moduleId}`,
    format: 'iife',
    plugins: [
        commonjs(),
        nodeResolve({
            skip: ['jquery', 'jQuery'],
            browser: true,
            extensions: ['.js', '.json']
        }),
        babel({
            babelrc: false,
            presets: [
                ['es2015', { modules: false }]
            ],
            plugins: ['external-helpers', 'transform-es2015-classes'],
            externalHelpers: true
        }),
        uglify()
    ]
};
