const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('baileys');
const pino = require('pino');
const readline = require('readline');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
    });

    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your phone number (with country code): ', async (phoneNumber) => {
            const { registration } = await sock.requestPairingCode(phoneNumber);
            console.log(`Pairing code: ${registration.pairingCode}`);
            rl.close();
        });
    }

    sock.ev.on('creds.update', saveCreds);
    console.log('Bot is running...');
}

startBot();
