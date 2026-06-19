const http = require('http');

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting API Verification Tests...');

  try {
    // 1. Auth Test
    console.log('\nTesting: POST /api/auth/login');
    const loginRes = await request('POST', '/api/auth/login', {
      phone: '9876543210',
      name: 'Ramesh Kumar'
    });
    console.log('Status:', loginRes.statusCode);
    console.log('Response:', JSON.stringify(loginRes.body, null, 2));
    
    if (loginRes.statusCode !== 200 || !loginRes.body.success) {
      throw new Error('Auth Login failed!');
    }
    const userId = loginRes.body.user.id;

    // 2. Medicines Test
    console.log('\nTesting: GET /api/medicines');
    const medRes = await request('GET', '/api/medicines');
    console.log('Status:', medRes.statusCode);
    console.log('Count:', medRes.body.length);
    console.log('Sample Medicine:', JSON.stringify(medRes.body[0], null, 2));

    if (medRes.statusCode !== 200 || !Array.isArray(medRes.body)) {
      throw new Error('Get Medicines failed!');
    }

    // 3. Doctors Test
    console.log('\nTesting: GET /api/doctors');
    const docRes = await request('GET', '/api/doctors');
    console.log('Status:', docRes.statusCode);
    console.log('Count:', docRes.body.length);
    console.log('Sample Doctor:', JSON.stringify(docRes.body[0], null, 2));

    if (docRes.statusCode !== 200 || !Array.isArray(docRes.body)) {
      throw new Error('Get Doctors failed!');
    }

    // 4. Family Add Test
    console.log('\nTesting: POST /api/family/add');
    const addFamilyRes = await request('POST', '/api/family/add', {
      userId,
      name: 'Suresh Kumar',
      relation: 'Son / बेटा',
      age: 12,
      gender: 'Male / पुरुष',
      medicalHistory: 'None / कोई नहीं'
    });
    console.log('Status:', addFamilyRes.statusCode);
    console.log('Response:', JSON.stringify(addFamilyRes.body, null, 2));

    if (addFamilyRes.statusCode !== 200 || !addFamilyRes.body.success) {
      throw new Error('Add Family Member failed!');
    }
    const memberId = addFamilyRes.body.member.id;

    // 5. Family List Test
    console.log(`\nTesting: GET /api/family/${userId}`);
    const listFamilyRes = await request('GET', `/api/family/${userId}`);
    console.log('Status:', listFamilyRes.statusCode);
    console.log('Count:', listFamilyRes.body.length);
    console.log('Response:', JSON.stringify(listFamilyRes.body, null, 2));

    if (listFamilyRes.statusCode !== 200 || listFamilyRes.body.length === 0) {
      throw new Error('List Family Members failed!');
    }

    // 6. Family Delete Test
    console.log(`\nTesting: DELETE /api/family/${userId}/${memberId}`);
    const deleteFamilyRes = await request('DELETE', `/api/family/${userId}/${memberId}`);
    console.log('Status:', deleteFamilyRes.statusCode);
    console.log('Response:', JSON.stringify(deleteFamilyRes.body, null, 2));

    if (deleteFamilyRes.statusCode !== 200 || !deleteFamilyRes.body.success) {
      throw new Error('Delete Family Member failed!');
    }

    console.log('\n✅ All API Integration tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runTests();
