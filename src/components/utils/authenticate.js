import OAuthInfo from "@arcgis/core/identity/OAuthInfo.js";
import esriId from "@arcgis/core/identity/IdentityManager.js";

const info = new OAuthInfo({
    appId: "7k3tRKvlgWz5AS1B",
    flowType: "auto",
    popup: false,
    portalUrl: "https://ral.maps.arcgis.com",
  });
  
  esriId.registerOAuthInfos([info]);

  export const checkAuthentication = async () => {
    try {
      await esriId.checkSignInauthStatus(info.portalUrl + "/sharing");
    } catch (reason) {
      console.log(reason);  
    } finally {
      const creds = await esriId.getCredential(info.portalUrl + "/sharing");
      return creds.userId;
    }
  };  