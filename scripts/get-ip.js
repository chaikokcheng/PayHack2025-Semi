#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();

    console.log('🌐 Network Interfaces:');
    console.log('=====================');

    for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name];

        for (const interface of networkInterface) {
            // Skip internal (localhost) and non-IPv4 addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                console.log(`📡 ${name}: ${interface.address}`);

                // Check if it's a local network address (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
                const ip = interface.address;
                if (ip.startsWith('192.168.') || ip.startsWith('10.') ||
                    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
                    console.log(`✅ Recommended for physical device: ${ip}`);
                    console.log(`🔗 Update config.js with: http://${ip}:8000`);
                }
            }
        }
    }

    console.log('\n📱 For Physical Device Testing:');
    console.log('================================');
    console.log('1. Make sure your phone and computer are on the same WiFi network');
    console.log('2. Use the IP address shown above (not 127.0.0.1)');
    console.log('3. Update frontend/src/utils/config.js with your IP');
    console.log('4. Start the backend server: python -m flask run --host=0.0.0.0 --port=8000');
    console.log('5. Test the connection from your phone');
}

getLocalIPAddress(); 