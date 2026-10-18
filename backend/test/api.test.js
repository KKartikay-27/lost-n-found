import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

let mongo;
let app;
let connectDB;
let disconnectDB;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.JWT_SECRET = 'test-secret';
  process.env.FEATURE_ITEM_SEARCH = 'true';
  ({ default: app } = await import('../src/app.js'));
  ({ connectDB, disconnectDB } = await import('../src/config/db.js'));
});

after(async () => {
  await disconnectDB();
  await mongo.stop();
});

describe('operational endpoints', () => {
  it('reports not ready before the database connects', async () => {
    const res = await request(app).get('/readyz');
    assert.equal(res.status, 503);
  });

  it('is ready once the database connects', async () => {
    await connectDB(mongo.getUri());
    const res = await request(app).get('/readyz');
    assert.equal(res.status, 200);
  });

  it('serves liveness, version and metrics', async () => {
    assert.equal((await request(app).get('/healthz')).status, 200);
    const version = await request(app).get('/version');
    assert.ok(version.body.commit);
    const metrics = await request(app).get('/metrics');
    assert.match(metrics.text, /http_request_duration_seconds/);
    assert.match(metrics.text, /lostnfound_build_info/);
  });
});

describe('user journey', () => {
  let token;
  let itemId;

  it('registers a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'Asha@Example.com', password: 'pw-123456' });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'asha@example.com');
    assert.equal(res.body.user.passwordHash, undefined);
    token = res.body.token;
  });

  it('rejects a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'asha@example.com', password: 'nope' });
    assert.equal(res.status, 401);
  });

  it('requires auth to post an item', async () => {
    const res = await request(app).post('/api/items').send({ title: 'x' });
    assert.equal(res.status, 401);
  });

  it('posts, lists, searches and resolves an item', async () => {
    const created = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Blue umbrella', description: 'Left in library', type: 'lost', location: 'Library L2' });
    assert.equal(created.status, 201);
    itemId = created.body._id;

    const list = await request(app).get('/api/items?type=lost');
    assert.equal(list.body.length, 1);

    const search = await request(app).get('/api/items?q=umbrella');
    assert.equal(search.body.length, 1);
    const miss = await request(app).get('/api/items?q=laptop');
    assert.equal(miss.body.length, 0);

    const resolved = await request(app).patch(`/api/items/${itemId}/resolve`).set('Authorization', `Bearer ${token}`);
    assert.equal(resolved.body.isResolved, true);
    assert.equal((await request(app).get('/api/items')).body.length, 0);
  });

  it('ignores operator injection in the type filter', async () => {
    const res = await request(app).get('/api/items?type[$ne]=x');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 0);
  });

  it('does not let another user delete the item', async () => {
    const other = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ravi', email: 'ravi@example.com', password: 'pw-654321' });
    const res = await request(app).delete(`/api/items/${itemId}`).set('Authorization', `Bearer ${other.body.token}`);
    assert.equal(res.status, 403);
  });
});
