import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import esriId from "@arcgis/core/identity/IdentityManager.js";
import Portal from "@arcgis/core/portal/Portal.js";

const info = new OAuthInfo({
  appId: "7k3tRKvlgWz5AS1B",
  flowType: "auto",
  popup: false,
  portalUrl: "https://ral.maps.arcgis.com",
});

esriId.registerOAuthInfos([info]);

export const checkAuthentication = async () => {
  try {
    await esriId.checkSignInStatus(info.portalUrl + "/sharing");
  } catch (reason) {
    console.log(reason);
  } finally {
    const creds = await esriId.getCredential(info.portalUrl + "/sharing");
    const users = await new Portal(esriId.portalUrl).queryUsers({ query: `username: ${creds.userId}` });
    if (users.results.length) {
      return { user: users.results[0], creds: creds };
    }

  }
};  