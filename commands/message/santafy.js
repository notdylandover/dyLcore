const { CommandError } = require('../../utils/logging');
const { WarnEmbed } = require('../../utils/embeds');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

const path = require('path');
const faceapi = require('@vladmandic/face-api');
const canvasModule = require('canvas');

faceapi.env.monkeyPatch({ Canvas: canvasModule.Canvas, Image: canvasModule.Image, ImageData: canvasModule.ImageData });

module.exports = {
    name: 'santafy',
    enabled: false,
    private: true,
    async execute(message) {
        try {
            const attachment = message.attachments.first();

            if (!attachment) {
                const warnEmbed = WarnEmbed('Please attach an image.');
                return message.reply({ embeds: [warnEmbed], allowedMentions: { repliedUser: false } });
            }

            const imageURL = attachment.url;

            const modelsPath = path.resolve(__dirname, '../../models');
            await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
            await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);

            const hatImagePath = path.resolve(__dirname, '../../assets/santa-hat.png');
            const baseImage = await loadImage(imageURL);
            const hatImage = await loadImage(hatImagePath);

            const canvas = createCanvas(baseImage.width, baseImage.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(baseImage, 0, 0);

            const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks();

            if (!detections.length) {
                const warnEmbed = WarnEmbed('No faces detected in the image. Please try with a clearer image.');
                return message.reply({ embeds: [warnEmbed], allowedMentions: { repliedUser: false } });
            }

            detections.forEach(detection => {
                const { landmarks } = detection;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();

                const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
                const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;

                const deltaX = rightEye[3].x - leftEye[0].x;
                const deltaY = rightEye[3].y - leftEye[0].y;
                const angle = Math.atan2(deltaY, deltaX);

                const faceWidth = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const hatWidth = faceWidth * 3;
                const hatHeight = hatWidth;

                const hatX = eyeCenterX - hatWidth / 2 + 10;
                const hatY = eyeCenterY - hatHeight * 0.8;

                ctx.save();
                ctx.translate(eyeCenterX * 1.02, eyeCenterY - hatHeight * 0.1);
                ctx.rotate(angle);
                ctx.drawImage(hatImage, -hatWidth / 2, -hatHeight, hatWidth, hatHeight);
                ctx.restore();
            });

            const buffer = canvas.toBuffer();
            const finalImage = new AttachmentBuilder(buffer, { name: 'santa-hat-image.png' });

            await message.reply({ files: [finalImage], allowedMentions: { repliedUser: false } });

        } catch (error) {
            CommandError(module.exports.name, error.stack);
            return await message.react('❌');
        }
    }
};