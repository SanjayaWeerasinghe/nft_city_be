const dotenv = require("dotenv");
const { constant } = require("./constants/constant")
const environment = process.env.NODE_ENV || "production";
if (environment !== 'k8s') dotenv.config({ path: `${environment}.env` });
const MONGO_URL = process.env.MONGO_URL
const SESSION_EXPIRES_IN = process.env.SESSION_EXPIRES_IN
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const SERVER_PORT = process.env.SERVER_PORT
const COURSE_API_KEY = process.env.COURSE_API_KEY
const SIGNUP_SUBJECT = "🏙️ Welcome to NFT City BETA - Verify & Start Creating!"
const RESNED_OTP_CODE_SUBJECT = "🔐 Fresh Verification Code - NFT City Account"
const SEND_EMAIL_SUBJECT = "🔑 Username Recovery - NFT City Account"
const CONTACT_US_SUBJECT = "New Contact Us Message - CyberSecurity Academy"
const EMAIL_SENDER = "nftCity@gmail.com"
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_PORT = process.env.EMAIL_PORT
const ADMIN_EMAIL = "admin@gmail.com"
const OTP_EXPIRE_TIME = 90
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
const MAILGUN_API_DOMAIN = process.env.MAILGUN_API_DOMAIN
const USER = "welcome@nucoin.com.au",

    SIGNUP_EMAIL = (token) => {
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to NFT City</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333333;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(60, 223, 213, 0.2);
            }
            
            .header {
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                color: white;
                padding: 50px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(180deg); }
            }
            
            .header-content {
                position: relative;
                z-index: 2;
            }
            
            .header h1 {
                font-size: 36px;
                margin-bottom: 15px;
                font-weight: 800;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                letter-spacing: 1px;
            }
            
            .header .subtitle {
                font-size: 18px;
                opacity: 0.95;
                font-weight: 400;
                margin-bottom: 10px;
            }
            
            .header .beta-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }
            
            .content {
                padding: 50px 40px;
                background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
            }
            
            .greeting {
                font-size: 24px;
                margin-bottom: 25px;
                color: #333333;
                font-weight: 700;
                text-align: center;
            }
            
            .welcome-text {
                font-size: 16px;
                color: #555555;
                margin-bottom: 35px;
                line-height: 1.8;
                text-align: center;
            }
            
            .otp-section {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border: 3px solid #3CDFD5;
                border-radius: 20px;
                padding: 40px 30px;
                margin: 40px 0;
                text-align: center;
                position: relative;
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.15);
            }
            
            .otp-section::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(135deg, #69EFB7, #11CFF3, #3CDFD5);
                border-radius: 20px;
                z-index: -1;
                opacity: 0.3;
            }
            
            .otp-icon {
                font-size: 32px;
                margin-bottom: 20px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(27, 210, 235, 0.3));
            }
            
            .otp-section h3 {
                color: #1BD2EB;
                font-size: 22px;
                margin-bottom: 25px;
                font-weight: 700;
            }
            
            .otp-code {
                font-size: 42px;
                font-weight: 900;
                color: #1BD2EB;
                letter-spacing: 15px;
                margin: 25px 0;
                padding: 25px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fdff 100%);
                border-radius: 15px;
                border: 3px dashed #3CDFD5;
                font-family: 'Courier New', monospace;
                text-shadow: 0 4px 8px rgba(27, 210, 235, 0.2);
                box-shadow: inset 0 4px 8px rgba(60, 223, 213, 0.1);
            }
            
            .instructions {
                background: linear-gradient(135deg, #f0fffe 0%, #e8f9f8 100%);
                border: 2px solid #3CDFD5;
                border-radius: 15px;
                padding: 30px;
                margin: 35px 0;
                box-shadow: 0 6px 20px rgba(60, 223, 213, 0.1);
            }
            
            .instructions h4 {
                color: #1BD2EB;
                margin-bottom: 25px;
                font-size: 20px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .instructions h4::before {
                content: '📋';
                margin-right: 12px;
                font-size: 24px;
            }
            
            .instructions ol {
                padding-left: 25px;
                color: #333333;
            }
            
            .instructions li {
                margin-bottom: 15px;
                font-size: 16px;
                line-height: 1.7;
                font-weight: 500;
            }
            
            .important-note {
                background: linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%);
                border: 2px solid #ffc107;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                color: #856404;
                display: flex;
                align-items: flex-start;
                box-shadow: 0 6px 20px rgba(255, 193, 7, 0.15);
            }
            
            .important-note::before {
                content: '🛡️';
                font-size: 24px;
                margin-right: 15px;
                margin-top: 2px;
            }
            
            .important-note strong {
                color: #856404;
                font-weight: 700;
            }
            
            .nft-features {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border-radius: 15px;
                padding: 30px;
                margin: 35px 0;
                text-align: center;
                border: 1px solid rgba(60, 223, 213, 0.3);
            }
            
            .nft-features h4 {
                color: #1BD2EB;
                font-size: 20px;
                margin-bottom: 20px;
                font-weight: 700;
            }
            
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-top: 25px;
            }
            
            .feature-item {
                padding: 15px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 10px;
                border: 1px solid rgba(60, 223, 213, 0.2);
            }
            
            .feature-item .emoji {
                font-size: 24px;
                display: block;
                margin-bottom: 8px;
            }
            
            .feature-item .text {
                font-size: 14px;
                color: #555;
                font-weight: 600;
            }
            
            .footer {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 50px 40px;
                text-align: center;
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #69EFB7 0%, #11CFF3 50%, #3CDFD5 100%);
            }
            
            .footer h4 {
                margin-bottom: 25px;
                font-size: 28px;
                font-weight: 800;
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .contact-info {
                margin-bottom: 30px;
            }
            
            .contact-info p {
                margin-bottom: 10px;
                font-size: 16px;
                color: #ecf0f1;
                font-weight: 500;
            }
            
            .social-links {
                margin: 30px 0;
                display: flex;
                justify-content: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #3CDFD5 0%, #1BD2EB 100%);
                border-radius: 50%;
                text-decoration: none;
                color: white;
                font-weight: 700;
                font-size: 18px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(60, 223, 213, 0.3);
            }
            
            .social-link:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.4);
                background: linear-gradient(135deg, #1BD2EB 0%, #69EFB7 100%);
            }
            
            .social-text {
                margin-top: 15px;
                font-size: 14px;
                color: #bdc3c7;
            }
            
            .copyright {
                margin-top: 30px;
                font-size: 14px;
                opacity: 0.8;
                color: #bdc3c7;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 20px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .content, .header, .footer {
                    padding: 30px 25px;
                }
                
                .header h1 {
                    font-size: 28px;
                }
                
                .otp-code {
                    font-size: 32px;
                    letter-spacing: 10px;
                    padding: 20px 15px;
                }
                
                .instructions, .otp-section, .nft-features {
                    padding: 25px 20px;
                }
                
                .feature-grid {
                    grid-template-columns: 1fr 1fr;
                }
                
                .social-links {
                    gap: 15px;
                }
                
                .social-link {
                    width: 45px;
                    height: 45px;
                    font-size: 16px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="header-content">
                    <h1>🏙️ NFT City</h1>
                    <div class="subtitle">The Future of Digital Assets</div>
                    <div class="beta-badge">BETA ACCESS</div>
                </div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Welcome to the Digital Revolution! 🚀
                </div>
                
                <div class="welcome-text">
                    Congratulations! You've just joined NFT City BETA - an exclusive marketplace where digital art meets blockchain innovation. You're now part of a pioneering community shaping the future of digital ownership and creativity.
                </div>
                
                <div class="otp-section">
                    <span class="otp-icon">🔐</span>
                    <h3>Email Verification Required</h3>
                    <div class="otp-code">${token}</div>
                    <p style="color: #1BD2EB; font-weight: 600; margin-top: 15px;">Enter this code to unlock your NFT City account</p>
                </div>
                
                <div class="important-note">
                    <div>
                        <strong>Security First:</strong> This verification code is exclusively for you. NFT City will never request your verification code through any communication channel. Keep it secure and never share it with anyone.
                    </div>
                </div>
                
                <div class="instructions">
                    <h4>Complete Your Verification</h4>
                    <ol>
                        <li><strong>Copy</strong> the 6-digit verification code above</li>
                        <li><strong>Return</strong> to your NFT City registration tab</li>
                        <li><strong>Paste</strong> the code in the verification field</li>
                        <li><strong>Press the button below</strong> to verify your OTP</li>
                        <li><strong>Start exploring</strong> the NFT marketplace!</li>
                    </ol>
                </div>
                
                <div class="nft-features">
                    <h4>🎨 What Awaits You in NFT City</h4>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <span class="emoji">🖼️</span>
                            <div class="text">Create & Mint NFTs</div>
                        </div>
                        <div class="feature-item">
                            <span class="emoji">💎</span>
                            <div class="text">Exclusive Collections</div>
                        </div>
                        <div class="feature-item">
                            <span class="emoji">🔄</span>
                            <div class="text">Trade & Exchange</div>
                        </div>
                        <div class="feature-item">
                            <span class="emoji">🏆</span>
                            <div class="text">BETA Rewards</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <h4>NFT City</h4>
                <div class="contact-info">
                    <p>🌐 Platform: www.nftcity.com.au</p>
                    <p>💬 Community Support Available 24/7</p>
                </div>
                
                <div class="social-links">
                    <a href="https://www.facebook.com/nutechcity" class="social-link" title="Follow us on Facebook">
                        📘
                    </a>
                    <a href="https://www.instagram.com/nugenesis.ou" class="social-link" title="Follow us on Instagram">
                        📷
                    </a>
                    <a href="https://x.com/nugenesisou" class="social-link" title="Follow us on X (Twitter)">
                        🐦
                    </a>
                </div>
                <div class="social-text">Follow us for updates, exclusive drops & community events</div>
                
                <div class="copyright">
                    © 2025 NFT City • All Rights Reserved • BETA Version<br>
                    Powered by Nucoin Technology • Built for Creators
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    }

RESNED_OTP_EMAIL = (token) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Verification Code - NFT City</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333333;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(60, 223, 213, 0.2);
            }
            
            .header {
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                color: white;
                padding: 45px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(180deg); }
            }
            
            .header-content {
                position: relative;
                z-index: 2;
            }
            
            .header h1 {
                font-size: 34px;
                margin-bottom: 12px;
                font-weight: 800;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                letter-spacing: 1px;
            }
            
            .header .subtitle {
                font-size: 18px;
                opacity: 0.95;
                font-weight: 500;
                margin-bottom: 8px;
            }
            
            .header .resend-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.25);
                padding: 8px 18px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }
            
            .content {
                padding: 45px 40px;
                background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
            }
            
            .greeting {
                font-size: 22px;
                margin-bottom: 25px;
                color: #333333;
                font-weight: 700;
                text-align: center;
            }
            
            .intro-text {
                font-size: 16px;
                color: #555555;
                margin-bottom: 30px;
                line-height: 1.8;
                text-align: center;
            }
            
            .otp-section {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border: 3px solid #3CDFD5;
                border-radius: 20px;
                padding: 35px 30px;
                margin: 35px 0;
                text-align: center;
                position: relative;
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.15);
            }
            
            .otp-section::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(135deg, #69EFB7, #11CFF3, #3CDFD5);
                border-radius: 20px;
                z-index: -1;
                opacity: 0.3;
            }
            
            .otp-icon {
                font-size: 30px;
                margin-bottom: 18px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(27, 210, 235, 0.3));
            }
            
            .otp-section h3 {
                color: #1BD2EB;
                font-size: 20px;
                margin-bottom: 22px;
                font-weight: 700;
            }
            
            .otp-code {
                font-size: 40px;
                font-weight: 900;
                color: #1BD2EB;
                letter-spacing: 14px;
                margin: 22px 0;
                padding: 22px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fdff 100%);
                border-radius: 15px;
                border: 3px dashed #3CDFD5;
                font-family: 'Courier New', monospace;
                text-shadow: 0 4px 8px rgba(27, 210, 235, 0.2);
                box-shadow: inset 0 4px 8px rgba(60, 223, 213, 0.1);
            }
            
            .resend-note {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #28a745;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                color: #155724;
                display: flex;
                align-items: flex-start;
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.1);
            }
            
            .resend-note::before {
                content: '🔄';
                font-size: 24px;
                margin-right: 15px;
                margin-top: 2px;
            }
            
            .resend-note strong {
                color: #155724;
                font-weight: 700;
            }
            
            .important-note {
                background: linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%);
                border: 2px solid #ffc107;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                color: #856404;
                box-shadow: 0 6px 20px rgba(255, 193, 7, 0.15);
            }
            
            .important-note::before {
                content: '🛡️';
                font-size: 24px;
                margin-right: 15px;
                float: left;
                margin-top: 2px;
            }
            
            .important-note strong {
                color: #856404;
                font-weight: 700;
                display: block;
                margin-bottom: 12px;
            }
            
            .important-note ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .important-note li {
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .instructions {
                background: linear-gradient(135deg, #f0fffe 0%, #e8f9f8 100%);
                border: 2px solid #3CDFD5;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
                box-shadow: 0 6px 20px rgba(60, 223, 213, 0.1);
            }
            
            .instructions h4 {
                color: #1BD2EB;
                margin-bottom: 22px;
                font-size: 18px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .instructions h4::before {
                content: '📋';
                margin-right: 12px;
                font-size: 22px;
            }
            
            .instructions ol {
                padding-left: 25px;
                color: #333333;
            }
            
            .instructions li {
                margin-bottom: 12px;
                font-size: 15px;
                line-height: 1.7;
                font-weight: 500;
            }
            
            .support-section {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                text-align: center;
                border: 1px solid rgba(60, 223, 213, 0.3);
            }
            
            .support-section p {
                color: #555555;
                font-size: 16px;
                font-weight: 500;
            }
            
            .footer {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 45px 40px;
                text-align: center;
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #69EFB7 0%, #11CFF3 50%, #3CDFD5 100%);
            }
            
            .footer h4 {
                margin-bottom: 25px;
                font-size: 26px;
                font-weight: 800;
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .contact-info {
                margin-bottom: 28px;
            }
            
            .contact-info p {
                margin-bottom: 10px;
                font-size: 15px;
                color: #ecf0f1;
                font-weight: 500;
            }
            
            .social-links {
                margin: 28px 0;
                display: flex;
                justify-content: center;
                gap: 18px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #3CDFD5 0%, #1BD2EB 100%);
                border-radius: 50%;
                text-decoration: none;
                color: white;
                font-weight: 700;
                font-size: 17px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(60, 223, 213, 0.3);
            }
            
            .social-link:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.4);
                background: linear-gradient(135deg, #1BD2EB 0%, #69EFB7 100%);
            }
            
            .social-text {
                margin-top: 15px;
                font-size: 14px;
                color: #bdc3c7;
            }
            
            .copyright {
                margin-top: 28px;
                font-size: 13px;
                opacity: 0.8;
                color: #bdc3c7;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 18px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .content, .header, .footer {
                    padding: 28px 22px;
                }
                
                .header h1 {
                    font-size: 26px;
                }
                
                .otp-code {
                    font-size: 30px;
                    letter-spacing: 10px;
                    padding: 18px 12px;
                }
                
                .instructions, .otp-section, .important-note, .resend-note {
                    padding: 22px 18px;
                }
                
                .social-links {
                    gap: 15px;
                }
                
                .social-link {
                    width: 42px;
                    height: 42px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="header-content">
                    <h1>🏙️ NFT City</h1>
                    <div class="subtitle">New Verification Code Generated</div>
                    <div class="resend-badge">CODE RESENT</div>
                </div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    New Verification Code Ready! 🔄
                </div>
                
                <div class="intro-text">
                    We've generated a fresh verification code for your NFT City account as requested. Use this new code to complete your account verification and unlock the full NFT marketplace experience.
                </div>
                
                <div class="otp-section">
                    <span class="otp-icon">🔐</span>
                    <h3>Your New Verification Code</h3>
                    <div class="otp-code">${token}</div>
                    <p style="color: #1BD2EB; font-weight: 600; margin-top: 12px;">Fresh code - ready to use immediately</p>
                </div>
                
                <div class="resend-note">
                    <div>
                        <strong>Code Successfully Resent:</strong> This is your new verification code. Any previous codes are now invalid and won't work for verification.
                    </div>
                </div>
                
                <div class="important-note">
                    <strong>Security Reminder:</strong>
                    <ul>
                        <li>This code is exclusively for your NFT City account verification</li>
                        <li>Never share this code with anyone - keep it private and secure</li>
                        <li>NFT City support will never ask for your verification code</li>
                        <li>If you didn't request this new code, please contact our security team</li>
                    </ul>
                </div>
                
                <div class="instructions">
                    <h4>Complete Your Verification</h4>
                    <ol>
                        <li><strong>Copy</strong> the new 6-digit verification code above</li>
                       <li><strong>Clear</strong> any old code and enter the new one</li>
                        <li><strong>Press the button below</strong> to verify your OTP</li>
                        <li><strong>Start exploring</strong> NFT City's marketplace!</li>
                    </ol>
                </div>
                
                <div class="support-section">
                    <p>Still experiencing issues? Our NFT City support team is here to help you get started on your digital asset journey. Contact us anytime for personalized assistance.</p>
                </div>
            </div>
            
            <div class="footer">
                <h4>NFT City</h4>
                <div class="contact-info">
                    <p>🌐 Platform: www.nftcity.com.au</p>
                    <p>💬 Community Support Available 24/7</p>
                </div>
                
                <div class="social-links">
                    <a href="https://www.facebook.com/nutechcity" class="social-link" title="Follow us on Facebook">
                        📘
                    </a>
                    <a href="https://www.instagram.com/nugenesis.ou" class="social-link" title="Follow us on Instagram">
                        📷
                    </a>
                    <a href="https://x.com/nugenesisou" class="social-link" title="Follow us on X (Twitter)">
                        🐦
                    </a>
                </div>
                <div class="social-text">Follow us for updates, exclusive drops & community events</div>
                
                <div class="copyright">
                    © 2025 NFT City • All Rights Reserved • BETA Version<br>
                    Powered by Nucoin Technology • Built for Creators
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
},
    CONTACT_US_EMAIL = (name, email, subject, message) => {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Us Message - CyberSecurity Academy</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #00d47a 0%, #00b368 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 28px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .contact-info {
                    background-color: #f8f9fa;
                    border-left: 4px solid #00d47a;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 5px;
                }
                
                .contact-info h3 {
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .contact-detail {
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                }
                
                .contact-detail strong {
                    min-width: 80px;
                    color: #2c3e50;
                }
                
                .message-section {
                    background-color: #e8f4fd;
                    border: 2px solid #00d47a;
                    border-radius: 10px;
                    padding: 25px;
                    margin: 25px 0;
                }
                
                .message-section h3 {
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .message-content {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    white-space: pre-wrap;
                    line-height: 1.8;
                }
                
                .footer {
                    background-color: #2c3e50;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .footer h4 {
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .contact-info-footer {
                    margin-bottom: 20px;
                }
                
                .contact-info-footer p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                
                .social-links {
                    margin-top: 20px;
                }
                
                .social-links a {
                    color: #00d47a;
                    text-decoration: none;
                    margin: 0 10px;
                    font-weight: 500;
                }
                
                .social-links a:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 600px) {
                    .email-container {
                        margin: 10px;
                    }
                    
                    .content {
                        padding: 20px 15px;
                    }
                    
                    .header {
                        padding: 20px 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>📧 CyberSecurity Academy</h1>
                    <p>New Contact Us Message Received</p>
                </div>
                
                <div class="content">
                    <div class="contact-info">
                        <h3>👤 Contact Information</h3>
                        <div class="contact-detail">
                            <strong>Name:</strong> ${name}
                        </div>
                        <div class="contact-detail">
                            <strong>Email:</strong> ${email}
                        </div>
                        <div class="contact-detail">
                            <strong>Subject:</strong> ${subject}
                        </div>
                    </div>
                    
                    <div class="message-section">
                        <h3>💬 Message Content</h3>
                        <div class="message-content">${message}</div>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        This message was sent from the CyberSecurity Academy contact form. 
                        Please respond to the user at their provided email address.
                    </p>
                </div>
                
                <div class="footer">
                    <h4>CyberSecurity Academy</h4>
                    <div class="contact-info-footer">
                        <p>Email: cyber@gmail.com</p>
                        <p>🌐 Website: www.cybersecurity.academy</p>
                        <p>Support: Available 24/7</p>
                    </div>
                    <div class="social-links">
                        <a href="#">Facebook</a> |
                        <a href="#">Twitter</a> |
                        <a href="#">LinkedIn</a> |
                        <a href="#">Instagram</a>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                        © 2024 CyberSecurity Academy. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    },





    SEND_USERNAME_EMAIL = (username) => {
        console.log("username", username)
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Username Recovery - NFT City</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333333;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            }
            
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(60, 223, 213, 0.2);
            }
            
            .header {
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                color: white;
                padding: 45px 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(180deg); }
            }
            
            .header-content {
                position: relative;
                z-index: 2;
            }
            
            .header h1 {
                font-size: 34px;
                margin-bottom: 12px;
                font-weight: 800;
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                letter-spacing: 1px;
            }
            
            .header .subtitle {
                font-size: 18px;
                opacity: 0.95;
                font-weight: 500;
                margin-bottom: 8px;
            }
            
            .header .recovery-badge {
                display: inline-block;
                background: rgba(255, 255, 255, 0.25);
                padding: 8px 18px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
            }
            
            .content {
                padding: 45px 40px;
                background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
            }
            
            .greeting {
                font-size: 22px;
                margin-bottom: 25px;
                color: #333333;
                font-weight: 700;
                text-align: center;
            }
            
            .intro-text {
                font-size: 16px;
                color: #555555;
                margin-bottom: 30px;
                line-height: 1.8;
                text-align: center;
            }
            
            .username-section {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border: 3px solid #3CDFD5;
                border-radius: 20px;
                padding: 35px 30px;
                margin: 35px 0;
                text-align: center;
                position: relative;
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.15);
            }
            
            .username-section::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(135deg, #69EFB7, #11CFF3, #3CDFD5);
                border-radius: 20px;
                z-index: -1;
                opacity: 0.3;
            }
            
            .username-icon {
                font-size: 30px;
                margin-bottom: 18px;
                display: block;
                filter: drop-shadow(0 4px 8px rgba(27, 210, 235, 0.3));
            }
            
            .username-section h3 {
                color: #1BD2EB;
                font-size: 20px;
                margin-bottom: 22px;
                font-weight: 700;
            }
            
            .username-display {
                font-size: 32px;
                font-weight: 900;
                color: #1BD2EB;
                letter-spacing: 2px;
                margin: 22px 0;
                padding: 22px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fdff 100%);
                border-radius: 15px;
                border: 3px dashed #3CDFD5;
                font-family: 'Courier New', monospace;
                text-shadow: 0 4px 8px rgba(27, 210, 235, 0.2);
                box-shadow: inset 0 4px 8px rgba(60, 223, 213, 0.1);
                word-break: break-word;
            }
            
            .recovery-note {
                background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
                border: 2px solid #28a745;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                color: #155724;
                display: flex;
                align-items: flex-start;
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.1);
            }
            
            .recovery-note::before {
                content: '✅';
                font-size: 24px;
                margin-right: 15px;
                margin-top: 2px;
            }
            
            .recovery-note strong {
                color: #155724;
                font-weight: 700;
            }
            
            .important-note {
                background: linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%);
                border: 2px solid #ffc107;
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                color: #856404;
                box-shadow: 0 6px 20px rgba(255, 193, 7, 0.15);
            }
            
            .important-note::before {
                content: '🛡️';
                font-size: 24px;
                margin-right: 15px;
                float: left;
                margin-top: 2px;
            }
            
            .important-note strong {
                color: #856404;
                font-weight: 700;
                display: block;
                margin-bottom: 12px;
            }
            
            .important-note ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .important-note li {
                margin-bottom: 8px;
                font-weight: 500;
            }
            
            .instructions {
                background: linear-gradient(135deg, #f0fffe 0%, #e8f9f8 100%);
                border: 2px solid #3CDFD5;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
                box-shadow: 0 6px 20px rgba(60, 223, 213, 0.1);
            }
            
            .instructions h4 {
                color: #1BD2EB;
                margin-bottom: 22px;
                font-size: 18px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .instructions h4::before {
                content: '📋';
                margin-right: 12px;
                font-size: 22px;
            }
            
            .instructions ol {
                padding-left: 25px;
                color: #333333;
            }
            
            .instructions li {
                margin-bottom: 12px;
                font-size: 15px;
                line-height: 1.7;
                font-weight: 500;
            }
            
            .support-section {
                background: linear-gradient(135deg, #f8fdff 0%, #f0fffe 100%);
                border-radius: 15px;
                padding: 25px;
                margin: 30px 0;
                text-align: center;
                border: 1px solid rgba(60, 223, 213, 0.3);
            }
            
            .support-section p {
                color: #555555;
                font-size: 16px;
                font-weight: 500;
            }
            
            .footer {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: white;
                padding: 45px 40px;
                text-align: center;
                position: relative;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #69EFB7 0%, #11CFF3 50%, #3CDFD5 100%);
            }
            
            .footer h4 {
                margin-bottom: 25px;
                font-size: 26px;
                font-weight: 800;
                background: linear-gradient(135deg, #69EFB7 0%, #11CFF3 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .contact-info {
                margin-bottom: 28px;
            }
            
            .contact-info p {
                margin-bottom: 10px;
                font-size: 15px;
                color: #ecf0f1;
                font-weight: 500;
            }
            
            .social-links {
                margin: 28px 0;
                display: flex;
                justify-content: center;
                gap: 18px;
                flex-wrap: wrap;
            }
            
            .social-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #3CDFD5 0%, #1BD2EB 100%);
                border-radius: 50%;
                text-decoration: none;
                color: white;
                font-weight: 700;
                font-size: 17px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(60, 223, 213, 0.3);
            }
            
            .social-link:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(60, 223, 213, 0.4);
                background: linear-gradient(135deg, #1BD2EB 0%, #69EFB7 100%);
            }
            
            .social-text {
                margin-top: 15px;
                font-size: 14px;
                color: #bdc3c7;
            }
            
            .copyright {
                margin-top: 28px;
                font-size: 13px;
                opacity: 0.8;
                color: #bdc3c7;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 18px;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .content, .header, .footer {
                    padding: 28px 22px;
                }
                
                .header h1 {
                    font-size: 26px;
                }
                
                .username-display {
                    font-size: 24px;
                    letter-spacing: 1px;
                    padding: 18px 12px;
                }
                
                .instructions, .username-section, .important-note, .recovery-note {
                    padding: 22px 18px;
                }
                
                .social-links {
                    gap: 15px;
                }
                
                .social-link {
                    width: 42px;
                    height: 42px;
                    font-size: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="header-content">
                    <h1>🏙️ NFT City</h1>
                    <div class="subtitle">Username Recovery Request</div>
                    <div class="recovery-badge">ACCOUNT RECOVERY</div>
                </div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Your Username Has Been Retrieved! 🔑
                </div>
                
                <div class="intro-text">
                    We received a request to recover your username for your NFT City account. Below is the username associated with this email address. Please keep this information secure for future logins.
                </div>
                
                <div class="username-section">
                    <span class="username-icon">👤</span>
                    <h3>Your NFT City Username</h3>
                    <div class="username-display">${username}</div>
                    <p style="color: #1BD2EB; font-weight: 600; margin-top: 12px;">Use this username to log in to your account</p>
                </div>
                
                <div class="recovery-note">
                    <div>
                        <strong>Username Successfully Retrieved:</strong> This is the username linked to your email address. You can now use it to log in to your NFT City account and access the marketplace.
                    </div>
                </div>
                
                <div class="important-note">
                    <strong>Security Reminder:</strong>
                    <ul>
                        <li>Keep your username safe and secure for future reference</li>
                        <li>Never share your account credentials with anyone</li>
                        <li>NFT City support will never ask for your password</li>
                        <li>If you didn't request this username recovery, please contact our security team immediately</li>
                        <li>Consider saving this username in a secure password manager</li>
                    </ul>
                </div>
                
               
                
              
            </div>
            
            <div class="footer">
                <h4>NFT City</h4>
                <div class="contact-info">
                    <p>🌐 Platform: www.nftcity.com.au</p>
                    <p>💬 Community Support Available 24/7</p>
                </div>
                
                <div class="social-links">
                    <a href="https://www.facebook.com/nutechcity" class="social-link" title="Follow us on Facebook">
                        📘
                    </a>
                    <a href="https://www.instagram.com/nugenesis.ou" class="social-link" title="Follow us on Instagram">
                        📷
                    </a>
                    <a href="https://x.com/nugenesisou" class="social-link" title="Follow us on X (Twitter)">
                        🐦
                    </a>
                </div>
                <div class="social-text">Follow us for updates, exclusive drops & community events</div>
                
                <div class="copyright">
                    © 2025 NFT City • All Rights Reserved • BETA Version<br>
                    Powered by Nucoin Technology • Built for Creators
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    },

    module.exports = {

        MONGO_URL,
        SESSION_EXPIRES_IN,
        JWT_SECRET_KEY,
        SERVER_PORT,
        COURSE_API_KEY,
        SIGNUP_EMAIL,
        SIGNUP_SUBJECT,
        EMAIL_USER,
        EMAIL_PASS,
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_SENDER,
        OTP_EXPIRE_TIME,
        RESNED_OTP_EMAIL,
        RESNED_OTP_CODE_SUBJECT,
        CONTACT_US_EMAIL,
        CONTACT_US_SUBJECT,
        ADMIN_EMAIL,
        SEND_USERNAME_EMAIL,
        SEND_EMAIL_SUBJECT,
        MAILGUN_API_KEY,
        MAILGUN_API_DOMAIN,
        USER


    }