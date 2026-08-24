import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";

const isMultitenancy = false;

export function initSuperTokensUI() {
	(window as any).supertokensUIInit("supertokensui", {
		appInfo: {
			websiteDomain: window.location.origin,
			apiDomain: import.meta.env.VITE_APP_API_URL,
			appName: "TV Series Hub",
			websiteBasePath: "/auth",
			apiBasePath: "/auth",
		},
		style: `
        [data-supertokens~=container] {
            --palette-background: 51, 51, 51, 0;
            --palette-inputBackground: 41, 41, 41;
            --palette-inputBorder: 41, 41, 41;
            --palette-textTitle: 255, 255, 255;
            --palette-textLabel: 255, 255, 255;
            --palette-textPrimary: 255, 255, 255;
            --palette-error: 173, 46, 46;
            --palette-textInput: 169, 169, 169;
            --palette-textLink: 114,114,114;
            --palette-textGray: 158, 158, 158;
            --palette-superTokensBrandingBackground: 51, 51, 51;
			--font-size-5:48px;         
             font-family: 'Krub', sans-serif;
        }
 

        [data-supertokens~=button]{
            background-color: #f97316;
            color: white;
            border-radius: 10px 10px;
            padding: 10px 10px;
            height:auto;
            width:auto;
        }

          [data-supertokens~=button]:active{
              background-color: #78350f
        }

        [data-supertokens~="superTokensBranding"] {
            display: none;
        }
        [data-supertokens~="link"]{
            color: #f97316;
        }
    `,
		recipeList: [
			(window as any).supertokensUISession.init(),
			(window as any).supertokensUIEmailPassword.init(),
		],
		getRedirectionURL: async (context: any) => {
			if (context.action === "SUCCESS") {
				return "/";
			}
			return undefined;
		},
	});
}

export function initSuperTokensWebJS() {
	SuperTokens.init({
		appInfo: {
			appName: "TV Series Hub",
			apiDomain: import.meta.env.VITE_APP_API_URL,
			apiBasePath: "/auth",
		},
		recipeList: [
			//@ts-ignore
			Session.init({ exposeAccessTokenToFrontendInCookieBasedAuth: true }),
		],
	});

	if (isMultitenancy) {
		initTenantSelectorInterface();
	}
}

export async function initTenantSelectorInterface() {
	/* STUB, to prevent linters complaining */
}
