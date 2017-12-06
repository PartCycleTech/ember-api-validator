import _ from 'lodash';

function isValidId(value) {
  return Boolean(value);
}

function paramAsId(param) {
  return `"id#${param}"`;
}

function paramAsAny(param) {
  return `"any#${param}"`;
}

function replacementForId(value) {
  return _.isNumber(value) ? value : `"${value}"`;
}

function removeLinksFromRelationships(record) {
  let relationships = _.get(record, "relationships") || {};
  _.keys(relationships).forEach((key) => {
    if (relationships[key]["links"]) {
      delete relationships[key]["links"];
    }
  });
}

function removeLinks(response) {
  if (_.get(response, "data.links")) {
    delete _.get(response, "data")["links"];
  }
  removeLinksFromRelationships(response["data"]);

  let included_arr = _.get(response, "included") || [];
  included_arr.forEach((included_record) => {
    if (included_record["links"]) {
      delete included_record["links"];
    }
    removeLinksFromRelationships(included_record);
  });
}

function replaceFlexParams({json, flexParams} = {}) {
  let stringified = JSON.stringify(json);
  _.keys(flexParams).forEach((param) => {
    let value = flexParams[param];
    if (_.includes(stringified, paramAsId(param)) && isValidId(value)) {
      stringified = stringified.split(paramAsId(param)).join(replacementForId(value));
    }
    if (_.includes(stringified, paramAsAny(param))) {
      stringified = stringified.split(paramAsAny(param)).join(`"${value}"`);
    }
  });
  return JSON.parse(stringified);
}

function verifyRequest({ flexParams, callback } = {}) {
  flexParams = flexParams || {};
  let expectedBody = _.cloneDeep(this.spec.request.body);
  expectedBody = replaceFlexParams({json: expectedBody, flexParams});
  callback({ expectedBody });
}

function buildResponseBody({ flexParams } = {}) {
  flexParams = flexParams || {};
  let response = _.cloneDeep(this.spec.response.body);
  response = replaceFlexParams({json: response, flexParams});
  removeLinks(response);
  return response;
}

function buildResponseStatus() {
  return this.spec.response.status;
}

function ApiValidator({ fixture }) {
  if (fixture) {
    this.spec = fixture;
  } else {
    throw new Error('ApiValidator: must pass in fixture');
  }
  this.verifyRequest = verifyRequest;
  this.buildResponseBody = buildResponseBody;
  this.buildResponseStatus = buildResponseStatus;
}

export { ApiValidator };
