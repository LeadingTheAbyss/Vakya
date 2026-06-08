const fetch = require('node-fetch');

const run = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/contracts/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '123',
        filename: 'test.pdf',
        risk_score: 50,
        risk_level: 'medium',
        clauses: [],
        summary: {},
        status: 'review'
      })
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
};
run();
