import { action, model, util } from '@1password/web-api';

import { ServerError } from './errors';
import { Token } from './token';

export interface ItemShareResponse {
  readonly uuid: string;
  readonly templateUuid: string;
  readonly encOverview: util.crypto.JweB;
  readonly encDetails: util.crypto.JweB;
  readonly maxViews?: number;
  readonly expiresAt: string;
  readonly canJoinTeam: boolean;
  readonly template?: model.VaultItemTemplate;
  readonly accountName?: string;
  readonly accountType?: string;
}

export interface ItemShareMetadata {
  readonly maxViews?: number;
  readonly expiresAt?: Date;
  readonly accountName?: string;
  readonly accountType: string;
  readonly canJoinTeam: boolean;
  readonly template?: model.VaultItemTemplate;
}

export interface GetSharedItemResponseSuccess {
  readonly type: 'success';
  readonly uuid: string;
  readonly item: model.VaultItem;
  readonly metadata: ItemShareMetadata;
}

export interface GetSharedItemResponseError {
  readonly type: 'unauthorized' | 'max_views' | 'expired' | 'not_found';
  readonly uuid: string;
}

type GetSharedItemResponse = GetSharedItemResponseSuccess | GetSharedItemResponseError;

/**
 * Gets the shared item, including encrypted overview/details and metadata.
 */
async function getSharedItem(shareSecret: string, tokens?: Token[]): Promise<GetSharedItemResponse> {
  const derivedParts = action.derivePartsFromShareSecret(shareSecret);

  if (tokens && tokens.length > 0) {
    for (const [i, token] of tokens.entries()) {
      console.log(`Requesting item with token ${i + 1}/${tokens.length}`);
      const isLast = i + 1 === tokens.length;

      try {
        const response = await getSharedItemAndParse(derivedParts, token);

        if (isLast || response.type !== 'unauthorized') {
          console.log(`Returning response from token ${i + 1}`);
          return response;
        }
      } catch (error) {
        if (isLast) {
          throw error;
        }
      }
    }
  }

  console.log('Requesting item without token');
  return getSharedItemAndParse(derivedParts);
}

async function getSharedItemAndParse(
  derivedParts: {
    readonly uuid: string;
    readonly token: string;
    readonly rawKey: Uint8Array;
  },
  token?: Token
): Promise<GetSharedItemResponse> {
  const { uuid } = derivedParts;

  const headers = new Headers();
  // This token proves access to the share secret
  headers.set('OP-Share-Token', derivedParts.token);

  if (token) {
    // This token proves access to an email address
    headers.set('Authorization', token.token);
  }

  let itemShare: ItemShareResponse;
  try {
    const response = await fetch(`/api/v1/share/${uuid}`, { headers });
    if (response.ok) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      itemShare = await response.json();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const serverError: ServerError = await response.json();
      console.error('Failed to getSharedItem', response.status, serverError);
      if (
        serverError.reason === 'unauthorized' ||
        serverError.reason === 'max_views' ||
        serverError.reason === 'expired' ||
        serverError.reason === 'not_found'
      ) {
        return { type: serverError.reason, uuid };
      }
      throw new Error('Unknown error');
    }
  } catch (error) {
    console.error('Failed to getSharedItem', error);
    throw error;
  }

  const item = await action.decryptItemShare(itemShare, derivedParts.rawKey);

  // if (itemShare.canJoinTeam) {
  //   setPsstCookie();
  // }

  return {
    type: 'success',
    uuid,
    item,
    metadata: {
      accountName: itemShare.accountName,
      accountType: itemShare.accountType || '',
      maxViews: itemShare.maxViews,
      expiresAt: util.dateFromGolang(itemShare.expiresAt),
      canJoinTeam: itemShare.canJoinTeam,
      template: itemShare.template
    }
  };
}

(async function () {
  const result = await getSharedItem('');

  console.log(result);
})();
