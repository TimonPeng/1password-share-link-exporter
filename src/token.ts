export interface Token {
  readonly token: string;
  readonly email: string;
  readonly expiresAt: Date | undefined;
}
