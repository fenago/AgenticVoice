import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Viewport } from "next";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";


const font = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={font.className}
		>
			<head>
				{/* Google tag (gtag.js) */}
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-WDGLK8F7C2"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-WDGLK8F7C2');
						`,
					}}
				/>
				{/* Performance testing script - only loads in development mode */}
				{process.env.NODE_ENV === 'development' && (
					<script src="/scripts/perf-test.js" async defer />
				)}
			</head>
			<body>
				{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
				<ClientLayout>{children}</ClientLayout>
				
				{/* Start of HubSpot Embed Code */}
				<script type="text/javascript" id="hs-script-loader" async defer src="//js-na2.hs-scripts.com/242953242.js"></script>
				{/* End of HubSpot Embed Code */}
			</body>
		</html>
	);
}
