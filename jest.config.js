module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(ts)x?$",
  watchPathIgnorePatterns: ["mock"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  setupFiles: ["<rootDir>/tests/setup.js"]
};
