const {
    default: makeWASocket,
    useMultiFileAuthState,
    useMobilePairingCode,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('baileys');

const { Boom } = require('@hapi/boom');
const P = require('pino');
const moment = require('moment');

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false,
        browser: ['Queen Dani v2', 'Chrome', '1.0.0']
    });

    // Generate pairing code if not yet registered
    if (!sock.authState.creds.registered) {
        const phoneNumber = '234XXXXXXXXXX'; // <--- PUT YOUR NUMBER HERE
        const code = await useMobilePairingCode(sock, phoneNumber);
        console.log(`\n𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘: ${code}\nPaste this on WhatsApp Linked Devices > "Link with phone number"\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Queen Dani v2 is connected!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        const sender = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (!text) return;

        // Owner Menu Command
        if (text === '.owner') {
            await sock.sendMessage(sender, {
                text: `👑 𝒪𝒲𝒩𝐸𝑅: 𝒟𝒶𝓃𝒾𝑒𝓁𝓁𝒶\n⏳ Uptime: ${process.uptime().toFixed(0)}s\n📆 Date: ${moment().format('LL')}`
            });
        }

        // Bug Menu Example
        if (text === '.Dani') {
            await sock.sendMessage(sender, {
                text: '💥 WhatsApp crashed! (simulated bug)'
            });
        }
    });
};

startBot();
