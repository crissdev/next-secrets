import path from 'path';

/**
 * @param {string} file
 * @returns {string}
 */
function relativePath(file) {
  return `"${path.relative(process.cwd(), file)}"`;
}

const buildPrettierCommand = (filenames) => `prettier --check ${filenames.map(relativePath).join(' ')}`;
const buildEslintCommand = (filenames) => `eslint --fix ${filenames.map(relativePath).join(' ')}`;

const config = {
  '*.{js,mjs,jsx,ts,mts,tsx}': [buildPrettierCommand, buildEslintCommand],
  '*.{json,md,css}': [buildPrettierCommand],
};

export default config;
