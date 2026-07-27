import {
  CognitoUserPool,
  type ICognitoUserPoolData,
} from "amazon-cognito-identity-js";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const awsRegion = import.meta.env.VITE_AWS_REGION;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const logoutUri = import.meta.env.VITE_LOGOUT_URI;

if (!userPoolId) {
  throw new Error(
    "Missing VITE_COGNITO_USER_POOL_ID in the .env file.",
  );
}

if (!clientId) {
  throw new Error(
    "Missing VITE_COGNITO_CLIENT_ID in the .env file.",
  );
}

if (!awsRegion) {
  throw new Error(
    "Missing VITE_AWS_REGION in the .env file.",
  );
}

const userPoolData: ICognitoUserPoolData = {
  UserPoolId: userPoolId,
  ClientId: clientId,
};

export const cognitoUserPool = new CognitoUserPool(userPoolData);

export const cognitoConfig = {
  userPoolId,
  clientId,
  awsRegion,
  cognitoDomain,
  redirectUri,
  logoutUri,
} as const;