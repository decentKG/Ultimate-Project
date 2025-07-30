const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5001/api/resumes/analyze';
const TEST_PDF_PATH = path.join(__dirname, 'test-resume.pdf'); // Create a test PDF file or use an existing one
const JWT_TOKEN = 'your_jwt_token_here'; // Get this from your localStorage after logging in

async function testResumeUpload() {
  try {
    // Check if test PDF exists
    if (!fs.existsSync(TEST_PDF_PATH)) {
      console.error(`Test PDF not found at: ${TEST_PDF_PATH}`);
      console.log('Please create a test PDF file or update the TEST_PDF_PATH');
      return;
    }

    const formData = new FormData();
    formData.append('resume', fs.createReadStream(TEST_PDF_PATH));

    console.log('Sending resume for analysis...');
    const response = await axios.post(API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Length': formData.getLengthSync(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testResumeUpload();
