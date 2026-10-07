#!/usr/bin/env python3
"""NYSC Companion: one production deploy to Vercel by REST API (no CLI, no build on Vercel).
Uploads app/dist + api/*.js + vercel.json.
Env (all optional; defaults are Michael's current account):
  VERCEL_TOKEN   (else read from /home/user/tab/files/.vercel-new-account.env)
  VERCEL_TEAM    (default team_Z8w5vQEijLwxTPREwdQDqCe8; set to "" for a personal account)
  VERCEL_PROJECT (default nysc-companion)
  NYSC_SRC       (default: this script's folder)
The project needs env vars GEMINI_API_KEY, SUPABASE_SECRET_KEY, AI_SALT (set in Vercel > Settings > Environment Variables).
Usage: python3 deploy.py [--dry]"""
import os, sys, json, hashlib, time, requests
SRC = os.environ.get('NYSC_SRC') or os.path.dirname(os.path.abspath(__file__))
TEAM = os.environ.get('VERCEL_TEAM', 'team_Z8w5vQEijLwxTPREwdQDqCe8')
PROJECT = os.environ.get('VERCEL_PROJECT', 'nysc-companion')
tok = os.environ.get('VERCEL_TOKEN')
if not tok:
    f = '/home/user/tab/files/.vercel-new-account.env'
    tok = [l.split('=', 1)[1].strip().strip('"') for l in open(f) if l.startswith('VERCEL_TOKEN_NEW=')][0]
H = {'Authorization': 'Bearer ' + tok}
Q = ('?teamId=' + TEAM) if TEAM else ''
files = []
dist = os.path.join(SRC, 'app/dist')
for root, _, fs in os.walk(dist):
    for f in fs:
        p = os.path.join(root, f); files.append((os.path.relpath(p, dist), p))
for f in sorted(os.listdir(os.path.join(SRC, 'api'))):
    if f.endswith('.js') and not f.endswith('.test.js'): files.append(('api/' + f, os.path.join(SRC, 'api', f)))
files.append(('vercel.json', os.path.join(SRC, 'vercel.json')))
print(len(files), 'files', sum(os.path.getsize(p) for _, p in files), 'bytes')
if '--dry' in sys.argv: sys.exit(0)
meta = []
for rel, p in files:
    b = open(p, 'rb').read(); sha = hashlib.sha1(b).hexdigest()
    for a in range(4):
        r = requests.post('https://api.vercel.com/v2/files' + Q, headers={**H, 'x-vercel-digest': sha, 'Content-Type': 'application/octet-stream'}, data=b, timeout=120)
        if r.status_code in (200, 201): break
        print('upload retry', rel, r.status_code, r.text[:200]); time.sleep(3)
    else: sys.exit('upload failed: ' + rel)
    meta.append({'file': rel, 'sha': sha, 'size': len(b)})
body = {'name': PROJECT, 'project': PROJECT, 'target': 'production', 'files': meta,
        'projectSettings': {'framework': None, 'buildCommand': None, 'installCommand': None, 'outputDirectory': None}}
r = requests.post('https://api.vercel.com/v13/deployments' + (Q + '&' if Q else '?') + 'skipAutoDetectionConfirmation=1', headers=H, json=body, timeout=120)
print('deploy', r.status_code, r.text[:600])
if r.status_code not in (200, 201): sys.exit(1)
d = r.json(); did = d['id']; print('id', did, d.get('url'))
st = None
for i in range(60):
    s = requests.get('https://api.vercel.com/v13/deployments/' + did + Q, headers=H, timeout=30).json()
    st = s.get('readyState') or s.get('status'); print(i, st)
    if st in ('READY', 'ERROR', 'CANCELED'): break
    time.sleep(5)
json.dump({'id': did, 'state': st, 'url': d.get('url')}, open('/tmp/nysc-last-deploy.json', 'w'))
