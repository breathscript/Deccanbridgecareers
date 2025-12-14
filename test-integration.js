/**
 * Test script for Odoo CRM Integration
 * This script tests the job application submission endpoint
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/submit-application';

// Test data
const testApplication = {
  jobId: 'test-job-001',
  jobTitle: 'Software Engineer',
  personalInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+91-9876543210',
    currentLocation: 'Hyderabad'
  },
  professionalInfo: {
    totalExperience: '3 years',
    currentCompany: 'Test Company',
    currentDesignation: 'Developer',
    coverLetter: 'This is a test application for integration testing.'
  },
  jobQuestions: {
    'question-relevant-experience': '3 years',
    'question-work-mode-preference': 'Yes'
  }
};

async function testIntegration() {
  console.log('🧪 Testing Odoo CRM Integration...\n');
  
  try {
    // Create a test PDF file
    const testPdfPath = path.join(__dirname, 'test-resume.pdf');
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
    
    if (!fs.existsSync(testPdfPath)) {
      fs.writeFileSync(testPdfPath, testPdfContent);
      console.log('✅ Created test PDF file\n');
    }
    
    // Create FormData
    const formData = new FormData();
    formData.append('jobId', testApplication.jobId);
    formData.append('jobTitle', testApplication.jobTitle);
    formData.append('personalInfo', JSON.stringify(testApplication.personalInfo));
    formData.append('professionalInfo', JSON.stringify(testApplication.professionalInfo));
    formData.append('jobQuestions', JSON.stringify(testApplication.jobQuestions));
    formData.append('resume', fs.createReadStream(testPdfPath), {
      filename: 'test-resume.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('📤 Submitting test application...');
    console.log('   Job ID:', testApplication.jobId);
    console.log('   Job Title:', testApplication.jobTitle);
    console.log('   Applicant:', testApplication.personalInfo.fullName);
    console.log('   Email:', testApplication.personalInfo.email);
    console.log('   Resume:', 'test-resume.pdf\n');
    
    // Submit to API
    const response = await axios.post(API_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    console.log('✅ Response received:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ Integration test PASSED!');
      if (response.data.resumeAttached) {
        console.log('✅ Resume attachment: SUCCESS');
      } else {
        console.log('⚠️  Resume attachment: Not confirmed (may still be attached)');
      }
      if (response.data.odooId) {
        console.log('✅ Odoo Lead ID:', response.data.odooId);
      }
    } else {
      console.log('\n❌ Integration test FAILED!');
      console.log('Error:', response.data.error);
    }
    
    // Clean up test file
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
      console.log('\n🧹 Cleaned up test file');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Start the server with: npm start');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run test
testIntegration();

