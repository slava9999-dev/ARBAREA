module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['react', 'prettier'],
    rules: {
        'prettier/prettier': 'warn',
        'react/prop-types': 'off',
        'no-unused-vars': 'warn',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
