module.exports = {
  preset: "ts-jest",
  testMatch: ["**/__test__/*.+(ts|js)"],
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(j|t)s$": "ts-jest",
  },
  transformIgnorePatterns: ["^node_modules/[^@].+\\.(j|t)s$"],
  globals: {
    "ts-jest": {
      tsconfig: "./__test__/tsconfig.jest.json",
    },
  },
};
