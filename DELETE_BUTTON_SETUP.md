# Setting Up Delete Button Functionality

This guide explains how to set up the delete button feature that allows users to delete form submission messages directly from Slack.

## Overview

The delete button uses Slack's interactive components feature, which requires:
1. Setting up interactive components in your Slack app
2. Deploying your Google Apps Script as a web app
3. Configuring the web app URL in Slack
4. Adding your Slack signing secret to the script

**Reference:** [Slack API - Modifying Messages](https://docs.slack.dev/messaging/modifying-messages/)

## Prerequisites

- ✅ Slack app already created (from webhook setup)
- ✅ Google Apps Script with the delete button code
- ✅ Access to deploy Google Apps Script as web app

## Step-by-Step Setup

### Step 1: Get Your Slack Signing Secret

1. **Go to Slack API Apps**
   - Visit: https://api.slack.com/apps
   - Select your app (the one you created for webhooks)

2. **Get Signing Secret**
   - In the left sidebar, click **"Basic Information"**
   - Scroll down to **"App Credentials"**
   - Find **"Signing Secret"**
   - Click **"Show"** and copy the secret
   - ⚠️ **Keep this secret secure** - don't share it publicly

3. **Add to Script**
   - Open `Code.gs` in Google Apps Script
   - Find line ~30: `const SLACK_SIGNING_SECRET = "";`
   - Paste your signing secret:
     ```javascript
     const SLACK_SIGNING_SECRET = "your-signing-secret-here";
     ```
   - Save the script

### Step 2: Enable Interactive Components

1. **Go to Interactive Components**
   - In your Slack app settings (https://api.slack.com/apps)
   - Click **"Interactivity"** in the left sidebar
   - Toggle **"Interactivity"** to **ON**

2. **Set Request URL** (we'll update this after deploying web app)
   - Leave it blank for now, or use a placeholder
   - We'll come back to this in Step 4

### Step 3: Deploy Google Apps Script as Web App

1. **Open Apps Script Editor**
   - In your Google Sheet: Extensions → Apps Script

2. **Deploy as Web App**
   - Click **"Deploy"** → **"New deployment"**
   - Click the gear icon ⚙️ next to "Select type"
   - Choose **"Web app"**

3. **Configure Deployment**
   - **Description**: "Slack Interactive Components Handler"
   - **Execute as**: "Me" (your account)
   - **Who has access**: "Anyone" (Slack needs to access it)
   - Click **"Deploy"**

4. **Authorize if Prompted**
   - Click **"Authorize access"**
   - Choose your Google account
   - Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**

5. **Copy Web App URL**
   - After deployment, you'll see a **"Web app URL"**
   - Copy this URL (looks like: `https://script.google.com/macros/s/.../exec`)
   - ⚠️ **Save this URL** - you'll need it in the next step

### Step 4: Configure Slack Interactive Components

1. **Go Back to Slack App Settings**
   - https://api.slack.com/apps → Select your app
   - Click **"Interactivity"** in left sidebar

2. **Set Request URL**
   - Paste your web app URL from Step 3
   - Click **"Save Changes"**
   - Slack will verify the URL by sending a verification request

3. **Verify Setup**
   - You should see a green checkmark ✅ if the URL is valid
   - If there's an error, check:
     - Web app is deployed with "Anyone" access
     - URL is correct (ends with `/exec`)
     - Script is saved and deployed

### Step 5: Test the Delete Button

1. **Submit a Test Form**
   - Fill out and submit your Google Form
   - Check Slack channel for the notification

2. **Click Delete Button**
   - You should see a **"🗑️ Delete"** button in the message
   - Click it
   - Confirm deletion in the dialog
   - Message should be deleted

3. **Check Execution Log**
   - In Apps Script: View → Logs
   - Look for "Delete button clicked" and "Message deleted successfully"

## Troubleshooting

### Delete Button Not Appearing?

**Check:**
- ✅ `SLACK_SIGNING_SECRET` is set in `Code.gs`
- ✅ Script has been saved
- ✅ Form submission was sent after adding the delete button code

**Solution:** The delete button only appears if `SLACK_SIGNING_SECRET` is configured. Make sure it's not empty.

### Button Click Doesn't Work?

**Check:**
- ✅ Web app is deployed and accessible
- ✅ Request URL is set correctly in Slack app settings
- ✅ Web app has "Anyone" access
- ✅ Execution log shows the request being received

**Solution:** 
1. Check Execution log in Apps Script for errors
2. Verify web app URL is correct in Slack settings
3. Try redeploying the web app

### "Invalid signature" Error?

**Check:**
- ✅ Signing secret is correct (no extra spaces)
- ✅ Signing secret matches your Slack app

**Solution:**
- Google Apps Script may have limitations with signature verification
- For testing, you can temporarily disable signature verification by leaving `SLACK_SIGNING_SECRET` empty
- ⚠️ **Not recommended for production** - use proper signature verification

### Web App URL Not Working?

**Check:**
- ✅ Web app is deployed (not just saved)
- ✅ "Execute as" is set to "Me"
- ✅ "Who has access" is set to "Anyone"
- ✅ URL ends with `/exec` (not `/dev`)

**Solution:**
- Redeploy the web app
- Make sure you're copying the production URL, not the development URL

## How It Works

1. **Message Sent**: When a form is submitted, a message is sent to Slack with a delete button
2. **Button Clicked**: User clicks the delete button in Slack
3. **Slack Sends Request**: Slack sends a POST request to your web app URL
4. **Script Processes**: The `doPost()` function receives the request
5. **Message Deleted**: Script uses `response_url` to delete the original message
6. **Response Sent**: Script sends empty response to acknowledge the interaction

## Security Considerations

### Signature Verification

The script verifies that requests come from Slack using HMAC signature verification. However, Google Apps Script has limitations accessing HTTP headers, so signature verification may need adjustment.

**For Production:**
- Always use signature verification
- Monitor execution logs for invalid signature attempts
- Consider using a more robust hosting solution if signature verification is critical

### Access Control

- Web app is set to "Anyone" access so Slack can call it
- The `doPost()` function validates requests
- Only delete button actions are processed
- Other requests are ignored

## Alternative: Using Bot Token (Advanced)

If you need more control, you can use Slack's Web API with a bot token instead of `response_url`:

1. Get a bot token (OAuth) from your Slack app
2. Use `deleteSlackMessageWithAPI()` function instead
3. Requires storing message `ts` (timestamp) and `channel` ID

This approach is more complex but offers better control and doesn't require web app deployment.

## Reference Links

- [Slack API - Modifying Messages](https://docs.slack.dev/messaging/modifying-messages/)
- [Slack Interactive Components](https://api.slack.com/interactivity)
- [Slack Request Verification](https://api.slack.com/authentication/verifying-requests-from-slack)
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)

## Quick Checklist

- [ ] Slack signing secret added to `Code.gs`
- [ ] Interactive Components enabled in Slack app
- [ ] Google Apps Script deployed as web app
- [ ] Web app URL added to Slack app settings
- [ ] Test form submission sent
- [ ] Delete button appears in Slack message
- [ ] Delete button works when clicked
- [ ] Execution log shows successful deletion




