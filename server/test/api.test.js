const http = require('http');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');

// Self-contained test runner without external heavy test runner dependencies
let server;
let port = 5099;
let token = '';
let createdProjectId = '';
let createdTaskId = '';

const request = (method, path, body = null, authToken = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Starting DevPulse Automated API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    process.env.NODE_ENV = 'test';
    await connectDB();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(port, resolve));
    console.log(`[Test Server] Listening on port ${port}\n`);

    // Test 1: Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/health returns 200 healthy');

    // Test 2: Auth registration with unique email
    const testEmail = `test_${Date.now()}@devpulse.io`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Integration Test User',
      email: testEmail,
      password: 'TestPassword123!',
      role: 'manager',
    });
    assert(regRes.status === 201 && regRes.body.token, 'POST /api/auth/register returns 201 with JWT token');
    token = regRes.body.token;

    // Test 3: Duplicate registration returns 409
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate User',
      email: testEmail,
      password: 'TestPassword123!',
    });
    assert(dupRes.status === 409, 'POST /api/auth/register returns 409 Conflict on existing email');

    // Test 4: Auth login with correct credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'TestPassword123!',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login returns 200 with JWT token');

    // Test 5: Auth login with incorrect password returns 401
    const badLoginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'WrongPassword!',
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login returns 401 Unauthorized on bad credentials');

    // Test 6: Access protected endpoint without token returns 401
    const noTokenRes = await request('GET', '/api/projects');
    assert(noTokenRes.status === 401, 'GET /api/projects without token returns 401 Unauthorized');

    // Test 7: Create Project with valid token returns 201
    const projectRes = await request(
      'POST',
      '/api/projects',
      {
        name: 'Automated Test Project',
        key: 'TST',
        description: 'Project created by automated regression test suite',
        priority: 'high',
      },
      token
    );
    assert(projectRes.status === 201 && projectRes.body.data._id, 'POST /api/projects returns 201 with project object');
    createdProjectId = projectRes.body.data._id;

    // Test 8: Create Task within project returns 201
    const taskRes = await request(
      'POST',
      '/api/tasks',
      {
        title: 'Complete regression testing checklist',
        project: createdProjectId,
        status: 'todo',
        priority: 'urgent',
      },
      token
    );
    assert(taskRes.status === 201 && taskRes.body.data.taskNumber, 'POST /api/tasks returns 201 with task number');
    createdTaskId = taskRes.body.data._id;

    // Test 9: Kanban status transition PATCH returns 200
    const moveRes = await request(
      'PATCH',
      `/api/tasks/${createdTaskId}/status`,
      { status: 'in_progress' },
      token
    );
    assert(moveRes.status === 200 && moveRes.body.data.status === 'in_progress', 'PATCH /api/tasks/:id/status updates state');

    // Test 10: Dashboard telemetry stats endpoint
    const statsRes = await request('GET', '/api/stats/dashboard', null, token);
    assert(statsRes.status === 200 && statsRes.body.data.summary, 'GET /api/stats/dashboard returns live telemetry metrics');

    // Test 11: 404 for unknown route
    const notFoundRes = await request('GET', '/api/unknown_endpoint');
    assert(notFoundRes.status === 404, 'GET /api/unknown_endpoint returns 404 Not Found');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
