import dotenv from "dotenv"

dotenv.config();

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["<rootDir>/test/**/*.(spec|test).[jt]s?(x)"],
};
