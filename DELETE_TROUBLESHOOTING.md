# Troubleshooting Delete Button Not Working

If the delete button isn't deleting messages, follow these debugging steps:

## Quick Checks

1. ✅ **Is the delete button visible?**
   - The button only appears if `SLACK_SIGNING_SECRET` is set in `Code.gs`
   - Check that it's not empty: `const SLACK_SIGNING_SECRET = "your-secret-here";`

2. ✅ **Is the web app deployed?**
   - Go to Apps Script → Deploy → Manage deployments
   - Make sure there's an active deployment
   - Web app should have "Anyone" access

3. ✅ **Is Request URL set in Slack?**
   - Go to https://api.slack.com/apps → Your App → Interactivity
   - Request URL should be your web app URL (ends with `/exec`)
   - Should show green checkmark ✅

## Step-by-Step Debugging

### Step 1: Check Execution Logs

1. **Click the delete button** in Slack
2. **Immediately check Apps Script logs**:
   - Apps Script → View → Logs (or Execution log icon)
   - Look for "DELETE BUTTON CLICKED" message
   - If you don't see this, Slack isn't reaching your web app

**If no logs appear:**
- Web app URL might be wrong in Slack settings
- Web app might not be deployed
- Check Slack app's Interactivity settings

### Step 2: Check What Slack Sends

Add this to the beginning of `doPost()` function temporarily:

```javascript
Logger.log('=== RAW REQUEST ===');
Logger.log('Event keys: ' + Object.keys(e).join(', '));
if (e.postData) {
  Logger.log('PostData contents: ' + e.postData.contents);
}
Logger.log('=== END RAW REQUEST ===');
```

Then click delete button and check logs to see what Slack is actually sending.

### Step 3: Test Response Format

The script returns:
```json
{"delete_original": true}
```

Slack should accept this. If it doesn't work, try:

**Option A: Add response_action**
```javascript
const deleteResponse = {
  response_action: "update",
  delete_original: true
};
```

**Option B: Use response_url instead**
If immediate response doesn't work, we can modify the code to use `response_url` after returning.

### Step 4: Check Signature Verification

If signature verification is failing, it might block the request:

1. **Temporarily disable it** for testing:
   - Set `SLACK_SIGNING_SECRET = "";` (empty string)
   - Redeploy web app
   - Test delete button
   - If it works, signature verification is the issue

2. **Fix signature verification**:
   - Google Apps Script has limitations accessing HTTP headers
   - You may need to adjust `verifySlackSignature()` function
   - Or use a different hosting solution for the web app

### Step 5: Verify Web App Deployment

1. **Check deployment settings**:
   - Execute as: "Me" (your account)
   - Who has access: "Anyone" (important!)
   - Version: "New version" (not head)

2. **Get the correct URL**:
   - Should end with `/exec` (production)
   - Not `/dev` (development)
   - Copy from "Web app URL" in deployment

3. **Test web app directly**:
   - Open web app URL in browser
   - Should see "Missing payload" or similar (not an error)
   - This confirms web app is accessible

## Common Issues and Solutions

### Issue: "No logs appear when clicking delete"

**Possible causes:**
- Request URL not set in Slack
- Web app not deployed
- Wrong web app URL

**Solution:**
1. Verify web app is deployed
2. Copy web app URL (ends with `/exec`)
3. Paste into Slack app → Interactivity → Request URL
4. Save and test again

### Issue: "Logs show request but message doesn't delete"

**Possible causes:**
- Response format incorrect
- Slack not accepting the response
- Signature verification blocking

**Solution:**
1. Check logs for "Returning delete response"
2. Verify response is valid JSON: `{"delete_original": true}`
3. Try disabling signature verification temporarily
4. Check if response_url is available and try using that instead

### Issue: "Signature verification fails"

**Possible causes:**
- Google Apps Script can't access HTTP headers properly
- Signing secret is incorrect
- Request format changed

**Solution:**
1. For testing: Disable signature verification (set `SLACK_SIGNING_SECRET = ""`)
2. For production: May need to use different hosting or adjust verification logic
3. Check Slack's signature verification docs for Google Apps Script workarounds

### Issue: "Button doesn't appear"

**Possible causes:**
- `SLACK_SIGNING_SECRET` is empty
- Script not saved/redeployed after adding secret

**Solution:**
1. Set `SLACK_SIGNING_SECRET` in `Code.gs`
2. Save script
3. Submit a new form (button only appears on new messages)

## Alternative: Use response_url Method

If the immediate response method doesn't work, we can modify the code to use `response_url`:

1. Return empty 200 OK immediately
2. Use `response_url` to delete the message asynchronously

This requires modifying `doPost()` to:
1. Return empty response immediately (acknowledge)
2. Use `response_url` to send delete request

Would you like me to implement this alternative approach?

## Testing the Fix

After making changes:

1. **Redeploy web app** (important!)
2. **Update Request URL in Slack** (if URL changed)
3. **Submit a test form**
4. **Click delete button**
5. **Check execution logs** for detailed output
6. **Verify message is deleted** in Slack

## Getting Help

If still not working, check logs for:
- Error messages
- What payload Slack is sending
- What response we're returning
- HTTP status codes

Share the execution log output for further debugging.




