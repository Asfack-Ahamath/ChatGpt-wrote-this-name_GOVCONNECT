const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing GOVCONNECT API...\n');
  
  try {
    // Test 1: Basic health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');
    
    // Test 2: API info
    console.log('2. Testing API info...');
    const apiResponse = await axios.get(`${API_BASE_URL}/api`);
    console.log('✅ API info passed:', apiResponse.data);
    console.log('');
    
    // Test 3: Test departments endpoint
    console.log('3. Testing departments endpoint...');
    const deptResponse = await axios.get(`${API_BASE_URL}/api/departments`);
    console.log('✅ Departments endpoint passed. Found', deptResponse.data.data?.length || 0, 'departments');
    console.log('');
    
    // Test 4: Test services endpoint
    console.log('4. Testing services endpoint...');
    const servicesResponse = await axios.get(`${API_BASE_URL}/api/services`);
    console.log('✅ Services endpoint passed. Found', servicesResponse.data.data?.length || 0, 'services');
    console.log('');
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
