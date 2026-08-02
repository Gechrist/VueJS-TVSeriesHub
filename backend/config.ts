import EmailPassword from "supertokens-node/recipe/emailpassword";
import Session from "supertokens-node/recipe/session";
import Dashboard from "supertokens-node/recipe/dashboard";
import UserRoles from "supertokens-node/recipe/userroles";
import type { TypeInput } from "supertokens-node/types";

export const SuperTokensConfig: TypeInput = {
	supertokens: {
		connectionURI:
			"https://st-dev-1668f300-7138-11f1-8627-7fce5a1f009c.aws.supertokens.io",
		apiKey: process.env.SUPERTOKENS_API_KEY as string,
	},
	appInfo: {
		appName: "SuperTokens Demo App",
		apiDomain: process.env.VITE_APP_API_URL as string,
		websiteDomain: process.env.VITE_APP_WEBSITE_URL,
		apiBasePath: "/auth",
		websiteBasePath: "/auth",
	},
	recipeList: [
		EmailPassword.init(),
		Dashboard.init(),
		UserRoles.init(),
		Session.init(),
	],
};
