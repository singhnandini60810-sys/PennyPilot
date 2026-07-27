import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  type CognitoUserSession,
  type ISignUpResult,
} from "amazon-cognito-identity-js";

import { cognitoUserPool } from "../auth/cognitoConfig";

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  email: string;
  name: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

function createCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email.trim().toLowerCase(),
    Pool: cognitoUserPool,
  });
}

function sessionToUser(
  session: CognitoUserSession,
  email: string,
  name = "",
): AuthenticatedUser {
  return {
    email,
    name,
    accessToken: session.getAccessToken().getJwtToken(),
    idToken: session.getIdToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
  };
}

export function signUp({
  name,
  email,
  password,
}: SignupData): Promise<ISignUpResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const attributes = [
    new CognitoUserAttribute({
      Name: "email",
      Value: normalizedEmail,
    }),
    new CognitoUserAttribute({
      Name: "name",
      Value: name.trim(),
    }),
  ];

  return new Promise((resolve, reject) => {
    cognitoUserPool.signUp(
      normalizedEmail,
      password,
      attributes,
      [],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cognito did not return a sign-up result."));
          return;
        }

        resolve(result);
      },
    );
  });
}

export function confirmSignup(
  email: string,
  verificationCode: string,
): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(
      verificationCode.trim(),
      true,
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });
}

export function resendVerificationCode(
  email: string,
): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function signIn(
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const cognitoUser = createCognitoUser(normalizedEmail);

  const authenticationDetails = new AuthenticationDetails({
    Username: normalizedEmail,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session: CognitoUserSession) => {
        cognitoUser.getUserAttributes((attributeError, attributes) => {
          if (attributeError) {
            reject(attributeError);
            return;
          }

          const name =
            attributes?.find(
              (attribute) => attribute.getName() === "name",
            )?.getValue() ?? "";

          resolve(sessionToUser(session, normalizedEmail, name));
        });
      },

      onFailure: (error) => {
        reject(error);
      },

      newPasswordRequired: () => {
        reject(
          new Error(
            "A new password is required for this account.",
          ),
        );
      },
    });
  });
}

export function getCurrentSession(): Promise<AuthenticatedUser | null> {
  const cognitoUser = cognitoUserPool.getCurrentUser();

  if (!cognitoUser) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession(
      (
        error: Error | null,
        session: CognitoUserSession | null,
      ) => {
        if (error) {
          reject(error);
          return;
        }

        if (!session?.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes(
          (attributeError, attributes) => {
            if (attributeError) {
              reject(attributeError);
              return;
            }

            const email =
              attributes?.find(
                (attribute) => attribute.getName() === "email",
              )?.getValue() ?? cognitoUser.getUsername();

            const name =
              attributes?.find(
                (attribute) => attribute.getName() === "name",
              )?.getValue() ?? "";

            resolve(sessionToUser(session, email, name));
          },
        );
      },
    );
  });
}

export function signOut(): void {
  cognitoUserPool.getCurrentUser()?.signOut();
}

export function requestPasswordReset(
  email: string,
): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve();
      },

      onFailure: (error) => {
        reject(error);
      },

      inputVerificationCode: () => {
        resolve();
      },
    });
  });
}

export function confirmPasswordReset(
  email: string,
  verificationCode: string,
  newPassword: string,
): Promise<void> {
  const cognitoUser = createCognitoUser(email);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(
      verificationCode.trim(),
      newPassword,
      {
        onSuccess: () => {
          resolve();
        },

        onFailure: (error) => {
          reject(error);
        },
      },
    );
  });
}

export function getAccessToken(): Promise<string | null> {
  return getCurrentSession().then(
    (currentUser) => currentUser?.accessToken ?? null,
  );
}