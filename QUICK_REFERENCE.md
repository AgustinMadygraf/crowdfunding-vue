# ⚡ QUICK REFERENCE: API Issues Diagnosis

## 🚀 Fast Diagnosis (2 min)

```javascript
// Open browser console and run:
window.__apiDiagnostic.test()

// Then check for:
❌ FAIL = address issue immediately
⚠️ WARNING = may cause problems
✅ PASS = good to go
```

---

## 🎯 Common Issues & Fixes

### Issue: GET /contributions/{token} returns HTML

#### Quick Checklist:
```
☐ VITE_API_BASE_URL correct? (check: window.__apiDiagnostic.test())
☐ Is it ngrok URL? Check for intersticial page
☐ Token is valid? (create contribution first)
☐ Authorization header sent? (check DevTools)
☐ Backend responding with JSON? (test /api/health)
```

#### Likely Causes (by probability):
1. **ngrok intersticial** (60% probability)
   - Fix: ✅ Already auto-added header
   - Verify: Look for "ngrok browser warning" in error

2. **HTTP → HTTPS redirect** (20% probability)
   - Fix: Use https:// in VITE_API_BASE_URL
   - Verify: Check "Final URL" in diagnostic

3. **Backend configuration** (15% probability)
   - Fix: Verify backend returns JSON for GET
   - Test: `curl http://localhost:5000/api/health`

4. **CORS policy** (5% probability)
   - Fix: Check backend has proper CORS headers
   - Verify: DevTools Network > see error message

---

## 📋 Step-by-Step Verification

### Step 1: Verify Environment
```bash
# In console:
window.__apiDiagnostic.test()

Expected output:
✅ Environment Configuration: PASS
   apiBaseUrl: http://localhost:5000 (or your ngrok URL)
   debugHttp: true
```

### Step 2: Test Health Endpoint
```bash
# In console:
window.__apiDiagnostic.testEndpoint('/api/health')

Expected:
Status: 200
Content-Type: application/json
Body: JSON response (not HTML)
```

### Step 3: Create a Contribution
1. Go to `/subscribe`
2. Fill form and submit
3. Look in console for token:
   ```
   [Subscribe] 🎫 Token: contrib_xxx
   ```
   Copy this token

### Step 4: Test getByToken
```bash
# Replace TOKEN with actual token from step 3
window.__apiDiagnostic.testEndpoint('/api/contributions/TOKEN')

Expected:
Status: 200
Content-Type: application/json
Body: Contribution details (JSON)

If HTML response:
Content-Type: text/html
Body: Look for <title> to identify source
```

---

## 🔍 Debug Output Interpretation

### Good Request Log
```
[ContributionsRepository] 📤 REQUEST [req_...]
  URL: http://localhost:5000/api/contributions/contrib_xxx
  Method: GET
  Accept: application/json
  Authorization: Bearer ...
  Content-Type: application/json

[ContributionsRepository] 📥 RESPONSE [req_...] (45ms)
  Status: 200 OK
  Final URL: http://localhost:5000/api/contributions/contrib_xxx
  Redirected: false
  Content-Type: application/json

[ContributionsRepository] ✅ getByToken() success
```

### Bad Request Log (HTML Response)
```
[ContributionsRepository] 🚨 CRITICAL - HTML response when JSON expected
[ContributionsRepository] [req_...] HTML Title: ngrok browser warning
[ContributionsRepository] [req_...] ⚠️ REDIRECT: http://... -> https://...
[ContributionsRepository] Full error details: {
  isNgrokHTML: true,
  redirected: true,
  redirectChain: "http://... -> https://..."
}
```

---

## 🛠️ Quick Fixes

### For ngrok intersticial
```
Already fixed automatically!
Header added: ngrok-skip-browser-warning: true

If still fails:
1. Verify VITE_API_BASE_URL includes full ngrok URL
2. Check ngrok is running: `ngrok http 5000`
3. Verify ngrok auth if required
```

### For HTTP→HTTPS redirect
```
In .env.development:
VITE_API_BASE_URL=https://YOUR-NGROK-URL (use https://)

Do NOT use: http://YOUR-NGROK-URL (will redirect)
```

### For CORS error
```
Backend needs (example Express):
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

Or use same-origin: /api (relative path)
```

### For 401 Unauthorized
```
Token expired:
- Relogin to get new token
- authService.refreshTokenIfNeeded() is already called

Token not found in request:
- Check: window.__apiDiagnostic.test()
- Should show: isTokenValid: true
```

---

## 🚨 If Nothing Works

### 1. Capture full diagnostics
```bash
# Console command:
const diag = await window.__apiDiagnostic.test()
console.save(diag) // Try to save console
```

### 2. Use curl to test backend directly
```bash
# Get your token first
# Export header separately to avoid copying sensitive values into command history
AUTH_HEADER="Authorization: Bearer <JWT_DEL_USUARIO>"
curl -H "$AUTH_HEADER" \
     -H "Accept: application/json" \
     http://localhost:5000/api/contributions/TOKEN

# If it works here but not in browser:
→ Problem is browser/frontend, not backend

# If it fails here too:
→ Problem is backend or misconfiguration
```

### 3. Check DevTools Network tab
- Open DevTools > Network tab
- Clear history
- Refresh page or try the action
- Look for request to `/api/contributions/TOKEN`
- Click on it and check:
  - Request Headers (Authorization present?)
  - Response headers (Content-Type: application/json?)
  - Response body (JSON or HTML?)
  - Status code (200? 401? 404?)

### 4. Enable maximum logging
```javascript
// In console (or add to main.ts):
window.VITE_DEBUG_HTTP = 'true'
localStorage.setItem('VITE_DEBUG_HTTP', 'true')
location.reload()
```

---

## 📞 When Reporting Issues

Include:

1. **Output of diagnostic**:
   ```bash
   window.__apiDiagnostic.test()
   # Copy all console output
   ```

2. **DevTools Network screenshot** showing:
   - Request headers
   - Response headers
   - Response body (first 200 chars)

3. **Configuration**:
   ```
   VITE_API_BASE_URL = ???
   Environment = development or production?
   Using ngrok? URL = ???
   ```

4. **Error message** from console:
   ```
   [ContributionsRepository] ...
   ```

---

## 📚 Related Files

- Diagnostics: `src/utils/apiDiagnostic.ts`
- Repository: `src/infrastructure/repositories/ContributionsRepository.ts`
- Main guide: `TROUBLESHOOTING_GETBYTOKEN.md`
- Initial analysis: `DIAGNOSTICO_APIPAYMENT.md`

---

## ✅ Verification Checklist

After implementing fixes, verify:

```
☐ window.__apiDiagnostic.test() shows all PASS
☐ Health endpoint responds with JSON
☐ Can create contribution successfully
☐ getByToken returns contribution details (JSON)
☐ No HTML responses in any API call
☐ Token is sent with every request
☐ Console shows success logs, not errors
☐ redirect: false for all requests
☐ Status: 200 for all successful requests
☐ Content-Type: application/json for all responses
```

**All green?** → You're good to go! 🎉
