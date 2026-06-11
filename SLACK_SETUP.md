# Slack Setup Guide for Google Forms Integration

This guide walks you through setting up Slack to receive Google Form submissions.

**Note:** The script automatically filters out empty form fields, so only fields with values will appear in your Slack messages. This keeps notifications clean and focused on the actual responses.

## Method 1: Incoming Webhooks (Recommended - Easiest)

Incoming Webhooks are the simplest way to send messages to Slack. This is what the script uses.

### Step 1: Create a Slack App

1. **Go to Slack API Apps**
   - Visit: https://api.slack.com/apps
   - Sign in with your Slack workspace credentials

2. **Create New App**
   - Click **"Create New App"** button (top right)
   - Select **"From scratch"**
   - Enter app name (e.g., "Google Forms Bot")
   - Select your workspace
   - Click **"Create App"**

3. **Add EUS_admin as a Contributor**
   - In your app settings, go to **"Collaborators"** or **"Manage Distribution"** in the left sidebar
   - Click **"Add Collaborators"** or **"Add Contributors"**
   - Add `EUS_admin` as a contributor
   - This allows EUS to manage and maintain the app if needed

### Step 2: Enable Incoming Webhooks

**⚠️ Important:** Before webhooks will work, you may need to request approval from EUS. Send a Samanage ticket to EUS requesting webhook permissions for your Slack app.

1. **Navigate to Incoming Webhooks**
   - In the left sidebar, click **"Incoming Webhooks"**
   - Toggle **"Activate Incoming Webhooks"** to **ON** (green)

2. **Add Webhook to Workspace**
   - Scroll down and click **"Add New Webhook to Workspace"**
   - Select the channel where you want notifications (e.g., `#general`, `#notifications`)
   - Click **"Allow"**
   - **Note:** If webhook creation fails or you receive permission errors, ensure you've submitted a ServiceNow ticket to EUS requesting webhook access for your app

3. **Copy Your Webhook URL**
   - You'll see a webhook URL that looks like:
     ```
     https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
     ```
   - Click **"Copy"** to copy the URL
   - ⚠️ **Keep this URL secret** - anyone with it can post to your Slack channel

### Step 3: Configure Bot Appearance (Optional)

1. **Go to Basic Information**
   - In the left sidebar, click **"Basic Information"**

2. **Set Display Information**
   - Scroll to **"Display Information"**
   - Add:
     - **App Name**: Google Forms Bot (or your choice)
     - **Short Description**: Receives Google Form submissions
     - **Icon**: Upload an icon (optional)

3. **Go to Incoming Webhooks** (if not already there)
   - Scroll down to see your webhook
   - Click **"Edit"** next to your webhook
   - Customize:
     - **Descriptive Label**: Google Forms Integration
     - **Icon**: Upload a custom icon (optional)

### Step 4: Add Webhook URL to Script

1. **Open your Google Apps Script**
   - In your Google Sheet: Extensions → Apps Script

2. **Update the webhook URL**
   - Find line 18 in `Code.gs`:
     ```javascript
     const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL";
     ```
   - Replace `YOUR/WEBHOOK/URL` with your actual webhook URL:
     ```javascript
     const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";
     ```

3. **Save the script**
   - Click **Save** (💾) or press Ctrl+S / Cmd+S

### Step 5: Test Your Webhook

1. **In Apps Script**, select `testSlackIntegration` function
2. Click **Run** ▶️
3. **Check your Slack channel** - you should see a test message!

---

## Method 2: Slack Workflows (Alternative)

If you want more control or need to process messages before posting:

### Step 1: Create a Workflow

1. **In Slack**, click your workspace name (top left)
2. Go to **"Tools"** → **"Workflow Builder"**
3. Click **"Create Workflow"**
4. Choose **"Webhook"** as the trigger
5. Name your workflow (e.g., "Google Forms Notifications")

### Step 2: Configure Webhook Trigger

1. **Copy the webhook URL** provided by Slack
2. Use this URL in your Google Apps Script instead of the Incoming Webhook URL
3. Configure workflow steps as needed

**Note:** This method is more complex and usually unnecessary for simple form notifications. Method 1 (Incoming Webhooks) is recommended.

---

## Channel Setup

### Public Channel
- Use channel name with `#`: `#general`, `#notifications`
- Anyone in your workspace can see messages
- Example: `const SLACK_CHANNEL = "#notifications";`

### Private Channel
- Use channel name without `#`: `general`, `notifications`
- Only members of the channel can see messages
- Example: `const SLACK_CHANNEL = "team-updates";`

### Direct Message
- Use `@username` format
- Messages go directly to a user
- Example: `const SLACK_CHANNEL = "@john.doe";`

**Note:** If you configured the channel when creating the webhook, you can leave `SLACK_CHANNEL` empty in the script - it will use the webhook's default channel.

---

## Security Best Practices

### 1. Keep Webhook URL Secret
- ⚠️ **Never share your webhook URL publicly**
- ⚠️ **Don't commit it to public repositories**
- ✅ Store it only in your Google Apps Script
- ✅ Use environment variables if possible (advanced)

### 2. Restrict Channel Access
- Use private channels for sensitive form data
- Only add necessary team members to the channel

### 3. Monitor Usage
- Check Slack app settings regularly
- Review who has access to the channel
- Rotate webhook URL if compromised

### 4. Validate Form Data (Optional)
- Add validation in your script before sending to Slack
- Filter out sensitive information if needed

---

## Troubleshooting

### Webhook URL Not Working?

1. **Verify URL is correct**
   - Should start with `https://hooks.slack.com/services/`
   - Should have three parts separated by `/`
   - No extra spaces or characters

2. **Check webhook is active**
   - Go to https://api.slack.com/apps
   - Select your app
   - Go to Incoming Webhooks
   - Verify webhook shows as "Active"

3. **Test webhook directly**
   - Use curl or Postman to test:
     ```bash
     curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message"}' \
     YOUR_WEBHOOK_URL
     ```

### Messages Not Appearing?

1. **Check channel permissions**
   - Make sure the app has permission to post
   - Verify you're looking at the correct channel

2. **Check webhook channel**
   - Go to Incoming Webhooks settings
   - Verify which channel the webhook posts to
   - Make sure it matches where you're looking

3. **Check Execution log**
   - In Apps Script: View → Logs
   - Look for error messages
   - Check HTTP response codes

### "Invalid webhook URL" Error?

- Verify URL format is correct
- Make sure URL doesn't have extra spaces
- Check that webhook hasn't been revoked
- Try creating a new webhook

### "Channel not found" Error?

- Verify channel name is correct
- Check if channel is public (`#channel`) or private (`channel`)
- Make sure the app/bot has access to the channel
- Try using the webhook's default channel (leave `SLACK_CHANNEL` empty)

### Webhook Permissions Issues?

If you're unable to create webhooks or receive permission errors:

1. **Verify EUS_admin is added as contributor**
   - Go to your app → Collaborators/Manage Distribution
   - Ensure `EUS_admin` is listed as a contributor

2. **Submit ServiceNow ticket to EUS**
   - Request webhook permissions for your Slack app
   - Include your app name and the specific webhook functionality needed
   - Wait for approval before proceeding with webhook setup

3. **Check app status**
   - Ensure your app is not restricted or pending approval
   - Verify all required permissions have been granted

---

## Advanced Configuration

### Multiple Channels

To send to different channels, you can:

1. **Create multiple webhooks** (one per channel)
2. **Use channel parameter** in script (if webhook allows it)
3. **Create separate scripts** for different forms/channels

### Custom Bot Name and Icon

Edit in `Code.gs`:
```javascript
const SLACK_USERNAME = "My Custom Bot Name";
const SLACK_ICON_EMOJI = ":robot_face:"; // or ":clipboard:", ":email:", etc.
```

Or set in Slack app settings:
- Go to your app → Basic Information → Display Information
- Upload custom icon
- Set app name

### Rate Limiting

Slack webhooks have rate limits:
- **Tier 1**: 1 message per second
- **Tier 2**: Up to 20 messages per minute (for approved apps)

For most form submissions, this won't be an issue. If you expect high volume, consider:
- Batching messages
- Using Slack API instead of webhooks
- Requesting higher tier access

---

## Quick Reference

### Webhook URL Format
```
https://hooks.slack.com/services/TEAM_ID/BOT_ID/WEBHOOK_TOKEN
```

### Where to Find Your Webhook
1. https://api.slack.com/apps
2. Select your app
3. Incoming Webhooks (left sidebar)
4. Copy webhook URL

### Where to Update in Script
- File: `Code.gs`
- Line: ~18
- Variable: `SLACK_WEBHOOK_URL`

---

## Next Steps

After setting up Slack:

1. ✅ Copy webhook URL to `Code.gs`
2. ✅ Run `initialize()` in Apps Script
3. ✅ Run `testSlackIntegration()` to test
4. ✅ Submit a test form response
5. ✅ Check Slack channel for notification

For testing instructions, see `TESTING.md`.


