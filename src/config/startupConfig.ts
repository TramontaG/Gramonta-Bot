import { NotificationLanguage } from '@open-wa/wa-automate';

const startup = {
	licenseKey: process.env.CLIENT_KEY,
	blockCrashLogs: false,
	disableSpins: false,
	hostNotificationLang: NotificationLanguage.PTBR,
	logConsole: false,
	viewport: {
		width: 1920,
		height: 1200,
	},
	deleteSessionDataOnLogout: false,
	popup: 3012,
	defaultViewport: null,
	sessionId: 'TramontaBot',
	headless: true,
	multiDevice: true,
	qrTimeout: 0,
	authTimeout: 0,
	restartOnCrash: false,
	useChrome: true,
	killProcessOnBrowserClose: true,
	throwErrorOnTosBlock: false,
	chromiumArgs: [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--aggressive-cache-discard',
		'--disable-cache',
		'--disable-application-cache',
		'--disable-offline-load-stale-cache',
		'--disk-cache-size=0',
	],
};

export default startup;
