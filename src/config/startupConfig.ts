import { NotificationLanguage } from '@open-wa/wa-automate';

const startup = {
	licenseKey: process.env.CLIENT_KEY,
	blockCrashLogs: false,
	disableSpins: false,
	hostNotificationLang: NotificationLanguage.PTBR,
	logConsole: false,
	//popup: true,
	viewport: {
		width: 1920,
		height: 1200,
	},
	popup: 3012,
	defaultViewport: null,
	sessionId: 'Gramont-Bot',
	headless: true,
	qrTimeout: 0,
	authTimeout: 60,
	restartOnCrash: true,
	cacheEnabled: true,
	useChrome: true,
	killProcessOnBrowserClose: true,
	throwErrorOnTosBlock: true,
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
