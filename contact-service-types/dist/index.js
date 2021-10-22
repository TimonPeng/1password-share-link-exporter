'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jsonTypeValidation = require('@mojotech/json-type-validation');

const supportRequestMetadataAccountInfoValidator = jsonTypeValidation.array(
  jsonTypeValidation.object({
    userUuid: jsonTypeValidation.string(),
    accountUuid: jsonTypeValidation.string(),
    env: jsonTypeValidation.string()
  })
);
const supportRequestMetadataValidator = jsonTypeValidation.object({
  path: jsonTypeValidation.optional(jsonTypeValidation.array(jsonTypeValidation.string())),
  extensionBuild: jsonTypeValidation.optional(jsonTypeValidation.string()),
  accountList: jsonTypeValidation.optional(supportRequestMetadataAccountInfoValidator),
  referrer: jsonTypeValidation.optional(jsonTypeValidation.string()),
  additionalContext: jsonTypeValidation.optional(jsonTypeValidation.string())
});
const supportRequestDiagnosticsReportValidator = jsonTypeValidation.object({
  version: jsonTypeValidation.constant(1),
  platform: jsonTypeValidation.string(),
  appVersion: jsonTypeValidation.string(),
  build: jsonTypeValidation.number(),
  store: jsonTypeValidation.optional(jsonTypeValidation.string()),
  device: jsonTypeValidation.optional(
    jsonTypeValidation.object({
      name: jsonTypeValidation.string(),
      model: jsonTypeValidation.string(),
      os: jsonTypeValidation.string(),
      uuid: jsonTypeValidation.optional(jsonTypeValidation.string())
    })
  ),
  opx: jsonTypeValidation.dict(jsonTypeValidation.number()),
  accounts: jsonTypeValidation.optional(
    jsonTypeValidation.array(
      jsonTypeValidation.object({
        type: jsonTypeValidation.string(),
        domain: jsonTypeValidation.string(),
        name: jsonTypeValidation.string(),
        email: jsonTypeValidation.string(),
        userUuid: jsonTypeValidation.string(),
        accountUuid: jsonTypeValidation.string(),
        rejectedItems: jsonTypeValidation.optional(jsonTypeValidation.number()),
        unsynedItems: jsonTypeValidation.optional(jsonTypeValidation.number())
      })
    )
  ),
  standaloneVaults: jsonTypeValidation.optional(
    jsonTypeValidation.array(
      jsonTypeValidation.object({
        uuid: jsonTypeValidation.string(),
        sync: jsonTypeValidation.string(),
        path: jsonTypeValidation.optional(jsonTypeValidation.string()),
        items: jsonTypeValidation.number()
      })
    )
  ),
  license: jsonTypeValidation.optional(jsonTypeValidation.string()),
  additionalInfo: jsonTypeValidation.optional(jsonTypeValidation.dict(jsonTypeValidation.string()))
});
const supportRequestPayloadValidator = jsonTypeValidation.object({
  email: jsonTypeValidation.string(),
  name: jsonTypeValidation.optional(jsonTypeValidation.string()),
  subject: jsonTypeValidation.optional(jsonTypeValidation.string()),
  bucket: jsonTypeValidation.optional(jsonTypeValidation.string()),
  message: jsonTypeValidation.string(),
  cerbMask: jsonTypeValidation.optional(jsonTypeValidation.string()),
  metadata: jsonTypeValidation.optional(supportRequestMetadataValidator),
  diagnosticsReport: jsonTypeValidation.optional(supportRequestDiagnosticsReportValidator)
});
const supportRequestSignedPayloadValidator = jsonTypeValidation.intersection(
  supportRequestPayloadValidator,
  jsonTypeValidation.object({
    userUuid: jsonTypeValidation.string(),
    accountUuid: jsonTypeValidation.string(),
    env: jsonTypeValidation.string(),
    timestamp: jsonTypeValidation.string()
  })
);
const jwsValidator = jsonTypeValidation.object({
  protected: jsonTypeValidation.string(),
  payload: jsonTypeValidation.string(),
  signature: jsonTypeValidation.string()
});
const jwsProtectedValidator = jsonTypeValidation.object({
  kid: jsonTypeValidation.string(),
  alg: jsonTypeValidation.string()
});
const postSupportSendRequestUnsignedValidator = jsonTypeValidation.object({
  type: jsonTypeValidation.constant('unsigned' /* Unsigned */),
  payload: supportRequestPayloadValidator
});
const postSupportSendRequestSignedValidator = jsonTypeValidation.object({
  type: jsonTypeValidation.constant('signed' /* Signed */),
  payload: jwsValidator
});
const postSupportSendRequestValidator = jsonTypeValidation.union(
  postSupportSendRequestUnsignedValidator,
  postSupportSendRequestSignedValidator
);

exports.jwsProtectedValidator = jwsProtectedValidator;
exports.jwsValidator = jwsValidator;
exports.postSupportSendRequestSignedValidator = postSupportSendRequestSignedValidator;
exports.postSupportSendRequestUnsignedValidator = postSupportSendRequestUnsignedValidator;
exports.postSupportSendRequestValidator = postSupportSendRequestValidator;
exports.supportRequestDiagnosticsReportValidator = supportRequestDiagnosticsReportValidator;
exports.supportRequestMetadataAccountInfoValidator = supportRequestMetadataAccountInfoValidator;
exports.supportRequestMetadataValidator = supportRequestMetadataValidator;
exports.supportRequestPayloadValidator = supportRequestPayloadValidator;
exports.supportRequestSignedPayloadValidator = supportRequestSignedPayloadValidator;
