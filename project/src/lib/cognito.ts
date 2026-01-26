import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import env from "./env";

export const cognito = new CognitoIdentityProviderClient({
  region: env.NEXT_PUBLIC_AWS_REGION,
})