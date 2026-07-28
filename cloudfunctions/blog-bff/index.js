// 极简博客 BFF · 完整版(v2 修复)
const cloudbase = require('@cloudbase/node-sdk');
const https = require('https');

const ENV = 'private-project-d8ficqljdf83631a';
const app = cloudbase.init({ env: ENV });
const models = app.models;

// ---- helpers ----

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const reply = (statusCode, data) => ({
  statusCode,
  headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(data),
});

const parseInt = (s, def) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : def;
};

/** 从 Authorization header 的 JWT 或 x-userid 拿调用者 uid */
const getUid = (headers) => {
  const h = headers || {};
  if (h['x-userid']) return h['x-userid'];
  const auth = h['authorization'] || h['Authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(
      parts[1].replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
    const data = JSON.parse(payload);
    return data.sub || data.user_id || null;
  } catch (_) { return null; }
};

const requireUid = (headers) => {
  const uid = getUid(headers);
  if (!uid) throw { statusCode: 401, message: 'login required' };
  return uid;
};

/** 取单条记录(models.get 语法不稳定,改用已验证的 list) */
const modelGet = async (id) => {
  const { data } = await models.articles.list({
    filter: { where: { _id: { $eq: id } } },
    select: { $master: true },
    pageSize: 1,
  });
  return (data.records && data.records[0]) || null;
};

// ---- POST /auth/refresh 代理 ----

const proxyRefresh = (refreshToken) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({ refresh_token: refreshToken, grant_type: 'refresh_token' });
    const req = https.request(
      {
        hostname: `${ENV}.api.tcloudbasegateway.com`,
        path: '/auth/v1/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': `blog-bff-${Date.now()}`,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject({ statusCode: res.statusCode, message: data.message || 'token refresh failed' });
            } else {
              resolve(data);
            }
          } catch (_) {
            reject({ statusCode: 502, message: 'auth upstream parse error' });
          }
        });
      }
    );
    req.on('error', (e) => reject({ statusCode: 502, message: `auth upstream: ${e.message}` }));
    req.write(body);
    req.end();
  });

const proxyLogin = (username, password) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({ username, password });
    const req = https.request(
      {
        hostname: `${ENV}.api.tcloudbasegateway.com`,
        path: '/auth/v1/signin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': `blog-bff-${Date.now()}`,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject({ statusCode: res.statusCode, message: data.message || 'auth failed' });
            } else {
              resolve(data);
            }
          } catch (_) {
            reject({ statusCode: 502, message: 'auth upstream parse error' });
          }
        });
      }
    );
    req.on('error', (e) => reject({ statusCode: 502, message: `auth upstream: ${e.message}` }));
    req.write(body);
    req.end();
  });

// ---- main ----

exports.main = async (event) => {
  const method = (event.httpMethod || '').toUpperCase();
  const path = event.path || '/';
  const headers = event.headers || {};
  const q = event.queryStringParameters || {};

  console.log('BFF', method, path);

  // CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  try {
    // ────────────────────────────────────────
    //  Auth
    // ────────────────────────────────────────
    if (method === 'POST' && path === '/auth/login') {
      let creds;
      try { creds = JSON.parse(event.body || '{}'); } catch (_) {
        return reply(400, { error: 'invalid JSON body' });
      }
      if (!creds.username || !creds.password) {
        return reply(400, { error: 'username and password required' });
      }
      const token = await proxyLogin(creds.username, creds.password);
      return reply(200, token);
    }

    if (method === 'POST' && path === '/auth/refresh') {
      let body;
      try { body = JSON.parse(event.body || '{}'); } catch (_) {
        return reply(400, { error: 'invalid JSON body' });
      }
      if (!body.refresh_token) {
        return reply(400, { error: 'refresh_token required' });
      }
      const token = await proxyRefresh(body.refresh_token);
      return reply(200, token);
    }

    // ────────────────────────────────────────
    //  Public read
    // ────────────────────────────────────────

    // GET /articles —— 列表(?mine=true 只看自己的)
    if (method === 'GET' && /^\/articles\/?$/.test(path)) {
      const pageSize = Math.min(parseInt(q.pageSize, 10), 200);
      const pageNumber = parseInt(q.page, 1);
      const where = {};
      if (q.mine === 'true') {
        const uid = requireUid(headers);
        where.ownerUid = { $eq: uid };
      }
      if (q.category) {
        where.category = { $eq: q.category };
      }
      const { data } = await models.articles.list({
        filter: { where },
        select: { $master: true },
        orderBy: [{ createdAt: 'desc' }],
        pageSize, pageNumber, getCount: true,
      });
      // 关键词搜索:取全部再过滤,避免分页错位(博客规模小)
      let records = data.records;
      let total = data.total;
      let resultPage = pageNumber;
      if (q.q) {
        // 重新取全部(不翻页),过滤后再切片
        const { data: all } = await models.articles.list({
          filter: { where },
          select: { $master: true },
          orderBy: [{ createdAt: 'desc' }],
          pageSize: 200, pageNumber: 1, getCount: true,
        });
        const kw = q.q.toLowerCase();
        const filtered = all.records.filter((r) =>
          (r.title && r.title.toLowerCase().includes(kw)) ||
          (r.content && r.content.toLowerCase().includes(kw))
        );
        total = filtered.length;
        resultPage = Math.min(pageNumber, Math.ceil(total / pageSize) || 1);
        const start = (resultPage - 1) * pageSize;
        records = filtered.slice(start, start + pageSize);
      }
      return reply(200, { records, total, page: resultPage, pageSize });
    }

    // GET /articles/:id —— 详情
    const mDetailGet = method === 'GET' && path.match(/^\/articles\/([^/]+)$/);
    if (mDetailGet) {
      const record = await modelGet(mDetailGet[1]);
      if (!record) return reply(404, { error: 'not found' });
      return reply(200, record);
    }

    // GET /categories —— 已有分类列表
    if (method === 'GET' && path === '/categories') {
      const { data } = await models.articles.list({
        filter: { where: {} },
        select: { $master: true },
        pageSize: 200,
      });
      const cats = [...new Set(
        (data.records || []).map((r) => r.category).filter(Boolean)
      )].sort();
      return reply(200, cats);
    }

    // ────────────────────────────────────────
    //  Write (authenticated)
    // ────────────────────────────────────────

    // POST /articles —— 新建
    if (method === 'POST' && /^\/articles\/?$/.test(path)) {
      const uid = requireUid(headers);
      let input;
      try { input = JSON.parse(event.body || '{}'); } catch (_) {
        return reply(400, { error: 'invalid JSON' });
      }
      if (!input.title || !input.content) {
        return reply(400, { error: 'title and content required' });
      }
      const createData = { title: input.title, content: input.content, ownerUid: uid };
      if (input.category) createData.category = input.category;
      const { data } = await models.articles.create({ data: createData });
      return reply(201, data);
    }

    // PATCH /articles/:id —— 更新(仅作者)
    const mPatch = method === 'PATCH' && path.match(/^\/articles\/([^/]+)$/);
    if (mPatch) {
      const uid = requireUid(headers);
      const existing = await modelGet(mPatch[1]);
      if (!existing) return reply(404, { error: 'not found' });
      if (existing.ownerUid !== uid) return reply(403, { error: 'forbidden: not your article' });

      let patch;
      try { patch = JSON.parse(event.body || '{}'); } catch (_) {
        return reply(400, { error: 'invalid JSON' });
      }
      const updates = {};
      if (patch.title !== undefined) updates.title = patch.title;
      if (patch.content !== undefined) updates.content = patch.content;
      if (patch.category !== undefined) updates.category = patch.category || null;
      if (!Object.keys(updates).length) return reply(400, { error: 'no fields to update' });

      const { data } = await models.articles.update({
        filter: { where: { _id: { $eq: mPatch[1] } } },
        data: updates,
      });
      return reply(200, data);
    }

    // DELETE /articles/:id —— 删除(仅作者)
    const mDelete = method === 'DELETE' && path.match(/^\/articles\/([^/]+)$/);
    if (mDelete) {
      const uid = requireUid(headers);
      const existing = await modelGet(mDelete[1]);
      if (!existing) return reply(404, { error: 'not found' });
      if (existing.ownerUid !== uid) return reply(403, { error: 'forbidden: not your article' });

      await models.articles.delete({
        filter: { where: { _id: { $eq: mDelete[1] } } },
      });
      return reply(200, { ok: true });
    }

    // ────────────────────────────────────────
    return reply(404, { error: 'route not found', method, path });
  } catch (e) {
    if (e && e.statusCode) return reply(e.statusCode, { error: e.message });
    console.error('BFF ERROR', e);
    return reply(500, { error: (e && e.message) || String(e) });
  }
};
