# api-validator

Ember addon for testing against [partcycle-api-fixtures](https://github.com/PartCycleTech/partcycle-api-fixtures)

## Installation

* Add `"api-validator": "PartCycleTech/ember-api-validator` to your package.json:
* `npm install`

## Usage

1. Instatiate:

```javascript
import { ApiValidator } from 'api-validator/utils/api-validator';

let validator = new ApiValidator({ fixture }); // initialize with your JSON fixture
```

2. Verify request

```javascript
let myFlexParamsArray = ['path.to.flex.param'];

validator.verifyRequest({
  requestBody: myRequestBody,
  flexParams: myFlexParamsArray
  callback: ({ expectedBody }) => {
    // compare myRequestBody to expectedBody here
    // good place to make test assertions
  }
});
```

3. Build response status and response body

```javascript
let flexParamsHash = {'path.to.flex.param': 'value to substitute'};

let responseStatus = validator.buildResponseStatus();
let responseBody = alidator.buildResponseBody({ flexParams: myFlexParamsHash });

// now you can return this response to your application, as if it had come from an API endpoint
```
