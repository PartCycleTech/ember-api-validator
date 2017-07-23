import _ from 'lodash';

function isValidId(value) {
  return !_.isEmpty(value);
}

function verifyRequest({ requestBody, flexParams, callback } = {}) {
  flexParams = flexParams || [];
  let expectedBody = _.cloneDeep(this.spec.request.body);
  flexParams.forEach((path) => {
    let expectedValue = _.get(expectedBody, path);
    let actualValue = _.get(requestBody, path);
    if (expectedValue === '@id') {
      if (isValidId(actualValue)) {
        _.set(expectedBody, path, actualValue);
      }
    }
  });
  callback({ expectedBody });
}

function buildResponse({ flexParams, callback } = {}) {
  flexParams = flexParams || {};
  let response = _.cloneDeep(this.spec.response.body);
  let status = this.spec.response.status;
  _.keys(flexParams).forEach((path) => {
    let responseValue = _.get(response, path);
    let customValue = flexParams[path];
    if (responseValue === '@id') {
      if (isValidId(customValue)) {
        _.set(response, path, customValue);
      }
    }
  });
  callback({ response, status });
}

function ApiValidator({ fixture }) {
  if (fixture) {
    this.spec = fixture;
  } else {
    throw new Error('ApiValidator: must pass in fixture');
  }
  this.verifyRequest = verifyRequest;
  this.buildResponse = buildResponse;
}

export { ApiValidator };
