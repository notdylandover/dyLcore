const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { Error, Google } = require('./logging');

const fs = require('fs');
const path = require('path');

const validImageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];

const visionCredentialsPath = path.join(__dirname, '..', 'data/bot/google-cloud-vision/dylcore-990d2a5075af.json');
const visionCredentials = JSON.parse(fs.readFileSync(visionCredentialsPath, 'utf8'));
const visionClient = new ImageAnnotatorClient({ credentials: visionCredentials });

async function analyzeOCR(filePath) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        if (!validImageExtensions.includes(fileExtension)) {
            throw new Error(`File is not a valid image. Supported formats are ${validImageExtensions.join(', ')}.`);
        }

        const [textResult] = await visionClient.textDetection(filePath);
        let ocrText = textResult.fullTextAnnotation ? textResult.fullTextAnnotation.text : 'No text detected';

        Google(`OCR result:\n${ocrText}`);
        return ocrText;
    } catch (error) {
        throw new Error(`Error performing OCR: ${error.message}`);
    }
}

async function analyzeLabels(filePath) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        if (!validImageExtensions.includes(fileExtension)) {
            throw new Error(`File is not a valid image. Supported formats are ${validImageExtensions.join(', ')}.`);
        }

        const [labelResult] = await visionClient.labelDetection(filePath);
        const labels = labelResult.labelAnnotations.map(label => label.description).join(', ');

        Google(`Image analysis: Labels - ${labels}`);
        return labels;
    } catch (error) {
        throw new Error(`Error analyzing labels: ${error.message}`);
    }
}

module.exports = { analyzeOCR, analyzeLabels };