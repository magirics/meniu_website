import { Amplify } from "aws-amplify"

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "sa-east-1_42gKu3L93",
      userPoolClientId: "37dns8lt38au5rdbo9pf7n10k3",
    },
  },
})

// DJZbbx7Q-
