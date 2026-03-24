module.exports = {
    testEnvironment: "jsdom",

    setupFiles: ["<rootDir>/src/jest.polyfills.js"], // ✅ VERY IMPORTANT

    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.app.json",
                setupFiles: ["<rootDir>/src/jest.polyfills.js"],
            },
        ],
    },

    moduleFileExtensions: ["ts", "tsx", "js"],

    testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],

    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
    },
};