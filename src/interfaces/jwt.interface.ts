export interface DecodedToken {
  payload: any | null;
  expired: boolean | string | Error;
}
