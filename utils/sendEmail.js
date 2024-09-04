const { Error, Done } = require('./logging');
const { TEXT, LINKS } = require('./constants');

const nodemailer = require('nodemailer');

require('dotenv').config();

let transporter = nodemailer.createTransport({
    host: process.env.SendGrid_Server,
    port: process.env.SendGrid_Port,
    auth: {
        user: process.env.SendGrid_Username,
        pass: process.env.SendGrid_Password
    }
});

function getHtmlContent(subject, message) {
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>dyLcore</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: black;
                    color: black;
                }

                .main {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #232428;
                    padding: 20px 20px 0 20px;
                    border-radius: 20px;
                }

                .container {
                    background-color: #999;
                    border-radius: 20px;
                }

                .header {
                    padding: 20px 0;
                    background-color: #FEE75C;
                    text-align: center;
                    border-radius: 20px;
                }

                .content {
                    font-family: monospace;
                    text-align: center;
                }

                .message {
                    margin: 20px 0 0 0;
                    padding: 20px 0;
                    background-color: #777;
                }

                .content img {
                    padding: 20px 0;
                }

                .footer {
                    padding: 20px 0;
                    font-size: 12px;
                    color: white;
                    text-align: center;
                    border-radius: 20px;
                }
            </style>
        </head>
        <body>
            <div class="main">
                <div class="container">
                    <div class="header">
                        <h1>${subject}</h1>
                    </div>
                    <div class="content">
                        <div class="message">
                            <p>${message}</p>
                        </div>
                        <img
                            src='https://cdn.discordapp.com/avatars/1263625778071863317/a_ce916b3ff5ea4089df7d093f25764612.gif?size=128'
                            alt="Brand"
                            width="128px"
                        />
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 dyLcore Enterprises • All rights reserved.</p>
                </div>
            </div>
        </body>
    </html>
    `;
}

function sendEmail(subject, message) {
    const htmlContent = getHtmlContent(subject, message);

    let mailOptions = {
        from: 'core@dylandover.dev',
        to: 'dylan@dylandover.dev',
        subject: `${TEXT.brand} - ${subject}`,
        text: message,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return Error('Error sending email:\n' + error.stack);
        }

        Done(`Email sent to ${mailOptions.to}:` + `${info.response}.grey`);
    });
}

module.exports = { sendEmail };