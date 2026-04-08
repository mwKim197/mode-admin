import fs from 'fs';
import path from 'path';
import process from 'process';

const root = path.resolve(__dirname, '..', '..');
const postmanDir = path.join(root, 'postman');

function loadCollection(name) {
  const p = path.join(postmanDir, name + '.collection.json');
  if (!fs.existsSync(p)) throw new Error('collection not found: ' + p);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadEnvTemplate() {
  const p = path.join(postmanDir, 'env.template.json');
  if (!fs.existsSync(p)) return {};
  const env = JSON.parse(fs.readFileSync(p, 'utf8'));
  const map = {};
  (env.values||[]).forEach(v => map[v.key] = v.value);
  return map;
}

function replaceVars(str, env) {
  return str.replace(/{{([^}]+)}}/g, (_, name) => {
    if (process.env[name] !== undefined) return process.env[name];
    if (env[name] !== undefined) return env[name];
    return '';
  });
}

async function runRequest(collection, reqName, envTemplate, state) {
  const item = collection.item.find(i => i.name === reqName);
  if (!item) throw new Error('request not found: ' + reqName);
  const req = item.request;
  let url = '';
  if (req.url) {
    if (req.url.raw) url = replaceVars(req.url.raw, envTemplate);
    else {
      // build
      url = req.url.protocol + '://' + (req.url.host||[]).join('.') + '/' + (req.url.path||[]).join('/');
    }
  }
  const method = (req.method || 'GET').toUpperCase();
  const headers = {};
  (req.header||[]).forEach(h => { headers[h.key] = replaceVars(h.value||'', envTemplate); });

  // auth: bearer
  if (req.auth && req.auth.type === 'bearer') {
    const tokenVar = (req.auth.bearer && req.auth.bearer[0] && req.auth.bearer[0].value) || '{{token}}';
    const tokenReplaced = replaceVars(tokenVar, envTemplate);
    const token = tokenReplaced || state.token || process.env.token || process.env.API_TOKEN;
    if (token) headers['Authorization'] = 'Bearer ' + token;
  }

  let body = null;
  if (req.body && req.body.mode === 'raw' && req.body.raw) {
    const raw = replaceVars(req.body.raw, envTemplate);
    body = raw;
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  console.log(`> ${method} ${url}`);
  try {
    const res = await fetch(url, { method, headers, body, redirect: 'follow' });
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { /* not json */ }
    console.log('Status:', res.status);
    if (parsed) console.log('Body(JSON):', JSON.stringify(parsed, null, 2));
    else console.log('Body:', text.slice(0, 2000));

    // simple login token extraction: if response has accessToken or token, save to state
    if (parsed) {
      if (parsed.accessToken) { state.token = parsed.accessToken; console.log('Saved token from accessToken'); }
      else if (parsed.token) { state.token = parsed.token; console.log('Saved token from token'); }
    }

    return { status: res.status, body: parsed || text };
  } catch (err) {
    console.error('Request failed:', err.message);
    throw err;
  }
}

function usage() {
  console.log('Usage: node run.js --collection <name> --req "Request Name"');
}

async function main() {
  const argv = process.argv.slice(2);
  const colIdx = argv.indexOf('--collection');
  const reqIdx = argv.indexOf('--req');
  if (colIdx === -1 || reqIdx === -1) { usage(); process.exit(1); }
  const colName = argv[colIdx+1];
  const reqName = argv[reqIdx+1];
  const collection = loadCollection(colName);
  const envTemplate = loadEnvTemplate();
  const state = {};

  // If user provided token via env, set
  if (process.env.token) state.token = process.env.token;
  if (process.env.API_TOKEN) state.token = process.env.API_TOKEN;

  // run single request
  await runRequest(collection, reqName, envTemplate, state);
}

if (require.main === module) main().catch(err => { console.error(err); process.exit(1); });
