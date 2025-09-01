const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Generates a QR code with a logo overlay and saves it to disk.
 * @param {string} url - The URL to encode in the QR code.
 * @param {string} logoPath - Path to the logo image.
 * @param {string} outputPath - Path to save the final QR code image.
 */
async function generateQRCodeWithLogo(url, logoPath, outputPath) {
    try {
        const qrBuffer = await QRCode.toBuffer(url, {
            errorCorrectionLevel: 'H',
            width: 500,
            color: {
                dark: '#083344',
                light: '#ffffff',
            },
        });

        const logoSize = 100;
        const logoBuffer = await sharp(logoPath)
            .resize(logoSize, logoSize)
            .png()
            .toBuffer();

        const qrWithLogo = await sharp(qrBuffer)
            .composite([
                {
                    input: logoBuffer,
                    top: (500 - logoSize) / 2,
                    left: (500 - logoSize) / 2,
                },
            ])
            .png()
            .toBuffer();

        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(outputPath, qrWithLogo);
        console.log(`✅ QR code with logo saved to ${outputPath}`);
    } catch (err) {
        console.error('❌ Failed to generate QR code with logo:', err);
    }
}

// 👉 Links for each platform
const links = {
    ios: 'https://apps.apple.com/app/idXXXXXXXXX',
    android: 'https://play.google.com/store/apps/details?id=com.example',
    web: 'https://limoaffiliatesworldwide.com'
};

// 👉 Redirect endpoint
app.get('/app-store-redirect', (req, res) => {
    const ua = req.headers['user-agent']?.toLowerCase() || '';

    if (/iphone|ipad|ipod/i.test(ua)) {
        return res.redirect(links.ios);
    } else if (/android/i.test(ua)) {
        return res.redirect(links.android);
    } else {
        return res.redirect(links.web);
    }
});

// ✅ Generate QR code on startup
generateQRCodeWithLogo(
    'https://api.limoaffiliatesworldwide.com/app-store-redirect',
    './logo.png',
    './qrcodes/rider_with_logo.png'
);

// ✅ Start redirect server
app.listen(PORT, () => {
    console.log(`🚀 Redirect service running on port ${PORT}`);
});