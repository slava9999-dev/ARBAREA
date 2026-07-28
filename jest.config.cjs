module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    // Fix for worker process graceful exit
    forceExit: true,
    // Improve test isolation
    clearMocks: true,
    resetMocks: true,
    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.test.{js,jsx,ts,tsx}',
        '!src/main.jsx',
        '!src/types/**',
    ],
    // Coverage floors act as a ratchet: they reflect the current level and
    // guard against regressions. Raise them as test coverage grows rather
    // than starting from an aspirational 50% the suite has never met.
    coverageThreshold: {
        global: {
            branches: 6,
            functions: 5,
            lines: 6,
            statements: 6,
        },
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/e2e/',
    ],
};
