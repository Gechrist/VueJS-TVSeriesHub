import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import type { TypeInput } from "supertokens-node/types";

export const SuperTokensConfig: TypeInput = {
	debug: true,
	supertokens: {
		connectionURI: process.env.SUPERTOKENS_CONNECTION_URI as string,
		apiKey: process.env.SUPERTOKENS_API_KEY as string,
	},
	appInfo: {
		appName: "TV Series Hub",
		apiDomain: process.env.VITE_APP_API_URL as string,
		websiteDomain: process.env.VITE_APP_WEBSITE_URL,
		apiBasePath: "/auth",
		websiteBasePath: "/auth",
	},
	recipeList: [EmailPassword.init(), Session.init()],
};
