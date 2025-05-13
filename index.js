const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
    });

    // Only request pairing code if not already authenticated
    if (!sock.authState.creds.registered) {
        const phoneNumber = '2348054671458'; // CHANGE THIS to your number with country code (no +)
        const { registration } = await sock.requestPairingCode(phoneNumber);
        console.log(`\n>>> Pair this device in WhatsApp: ${registration.pairingCode} <<<\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    console.log('Queen Dani v2 bot is running...');
}

startBot();
