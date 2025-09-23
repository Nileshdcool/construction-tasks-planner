/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  var test: jest.It;
  var it: jest.It;
  var expect: jest.Expect;
  var describe: jest.Describe;
  var beforeEach: jest.Lifecycle;
  var afterEach: jest.Lifecycle;
  var beforeAll: jest.Lifecycle;
  var afterAll: jest.Lifecycle;
}

export {};