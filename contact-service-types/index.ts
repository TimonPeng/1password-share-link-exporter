import {
  array, constant, dict, intersection, number, object, optional, string, union
} from '@mojotech/json-type-validation';

export const supportRequestMetadataAccountInfoValidator = array(
  object({
    userUuid: string(),
    accountUuid: string(),
    env: string()
  })
);

export const supportRequestMetadataValidator = object({
  path: optional(array(string())),
  extensionBuild: optional(string()),
  accountList: optional(supportRequestMetadataAccountInfoValidator),
  referrer: optional(string()),
  additionalContext: optional(string())
});

export const supportRequestDiagnosticsReportValidator = object({
  version: constant(1),
  platform: string(),
  appVersion: string(),
  build: number(),
  store: optional(string()),
  device: optional(
    object({
      name: string(),
      model: string(),
      os: string(),
      uuid: optional(string())
    })
  ),
  opx: dict(number()),
  accounts: optional(
    array(
      object({
        type: string(),
        domain: string(),
        name: string(),
        email: string(),
        userUuid: string(),
        accountUuid: string(),
        rejectedItems: optional(number()),
        unsynedItems: optional(number())
      })
    )
  ),
  standaloneVaults: optional(
    array(
      object({
        uuid: string(),
        sync: string(),
        path: optional(string()),
        items: number()
      })
    )
  ),
  license: optional(string()),
  additionalInfo: optional(dict(string()))
});

export const supportRequestPayloadValidator = object({
  email: string(),
  name: optional(string()),
  subject: optional(string()),
  bucket: optional(string()),
  message: string(),
  cerbMask: optional(string()),
  metadata: optional(supportRequestMetadataValidator),
  diagnosticsReport: optional(supportRequestDiagnosticsReportValidator)
});

export const supportRequestSignedPayloadValidator = intersection(
  supportRequestPayloadValidator,
  object({
    userUuid: string(),
    accountUuid: string(),
    env: string(),
    timestamp: string()
  })
);

export const jwsValidator = object({
  protected: string(),
  payload: string(),
  signature: string()
});

export const jwsProtectedValidator = object({
  kid: string(),
  alg: string()
});

export const postSupportSendRequestUnsignedValidator = object({
  type: constant('unsigned' /* Unsigned */),
  payload: supportRequestPayloadValidator
});

export const postSupportSendRequestSignedValidator = object({
  type: constant('signed' /* Signed */),
  payload: jwsValidator
});

export const postSupportSendRequestValidator = union(
  postSupportSendRequestUnsignedValidator,
  postSupportSendRequestSignedValidator
);
