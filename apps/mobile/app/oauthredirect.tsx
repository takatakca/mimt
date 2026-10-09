import { Redirect } from "expo-router";

// Landing route for mimt://oauthredirect (TAKATAK sign-in). expo-auth-session reads the result;
// this screen only exists so the deep link does not hit "unmatched route".
export default function OAuthRedirect() {
  return <Redirect href="/" />;
}
