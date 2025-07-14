import path from 'path';

/**
 * @param {string} file
 * @returns {string}
 */
function relativePath(file) {
  return `"${path.relative(process.cwd(), file)}"`;
}

const buildEslintCommand = (filenames) => `next lint --fix --file ${filenames.map(relativePath).join(' --file ')}`;

const config = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
};

export default config;
