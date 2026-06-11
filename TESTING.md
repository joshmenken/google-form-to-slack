# How to Test the Google Forms to Slack Script

## Prerequisites

Before testing, make sure:
1. ✅ Your Slack webhook URL is configured in `Code.gs` (line 18)
2. ✅ You've run `initialize()` at least once to set up the trigger
3. ✅ Your Google Form is linked to a Google Sheet

## Testing Methods

### Method 1: Test Slack Webhook (Quick Test)

This tests if your Slack webhook is working correctly:

1. **Open Google Apps Script Editor**
   - In your Google Sheet: Extensions → Apps Script

2. **Select the test function**
   - In the function dropdown (top toolbar), select `testSlackIntegration`

3. **Run the function**
   - Click the **Run** button (▶️ play icon)
   - Authorize if prompted (first time only)

4. **Check results**
   - Check your Slack channel - you should see a test message
   - Check Execution log (View → Logs) for any errors

**What this does:** Sends a mock form submission to Slack to verify your webhook works.

---

### Method 2: Test with Real Form Data

This simulates a form submission using your actual spreadsheet data:

1. **Make sure you have at least one form submission**
   - Submit a test response to your Google Form
   - Or use existing data in your spreadsheet

2. **Open Google Apps Script Editor**
   - In your Google Sheet: Extensions → Apps Script

3. **Select the test function**
   - In the function dropdown, select `testFormSubmitEvent`

4. **Run the function**
   - Click the **Run** button (▶️)
   - Check Execution log for details

5. **Check results**
   - Check your Slack channel for the message
   - Review Execution log for any errors

**What this does:** Uses the last form submission from your spreadsheet to test the full flow.

---

### Method 3: Test with Actual Form Submission

This is the real test - submit an actual form:

1. **Open your Google Form**
   - Go to your form URL

2. **Fill out and submit the form**
   - Fill in all fields
   - Click Submit

3. **Check results**
   - Check your Slack channel immediately
   - Check Execution log in Apps Script (View → Logs)
   - Look for "Form submission sent to Slack successfully"

**What this does:** Tests the complete integration end-to-end.

---

### Method 4: Debug Setup (Check Configuration)

Use this to verify everything is configured correctly:

1. **Open Google Apps Script Editor**
   - In your Google Sheet: Extensions → Apps Script

2. **Select the debug function**
   - In the function dropdown, select `debugSetup`

3. **Run the function**
   - Click the **Run** button (▶️)

4. **View the results**
   - Go to View → Logs (or Execution log)
   - Review all the debug information

**What this checks:**
- ✅ Triggers are set up correctly
- ✅ Webhook URL is configured
- ✅ Form is linked to spreadsheet
- ✅ Spreadsheet has data

---

## Step-by-Step Testing Workflow

### First Time Setup:

1. **Configure webhook URL**
   ```
   Edit Code.gs line 18:
   const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/ACTUAL/URL";
   ```

2. **Set up trigger**
   - Run `initialize()` function
   - Authorize permissions when prompted

3. **Verify setup**
   - Run `debugSetup()` function
   - Check logs to ensure everything is configured

4. **Test webhook**
   - Run `testSlackIntegration()` function
   - Check Slack channel for test message

5. **Test with real data**
   - Submit a test form response
   - Or run `testFormSubmitEvent()` function
   - Check Slack channel

### Regular Testing:

- Just submit a form and check Slack!
- If issues occur, run `debugSetup()` to troubleshoot

---

## Viewing Execution Logs

To see what's happening:

1. In Apps Script editor, click **View** → **Logs** (or **Execution log**)
2. Or click the **Execution log** icon (📋) in the toolbar
3. Logs show:
   - Success messages
   - Error messages
   - Debug information
   - Event object details

---

## Troubleshooting Tests

### Test function doesn't appear in dropdown?
- Make sure you saved the script (Ctrl+S or Cmd+S)
- Refresh the page

### "Authorization required" error?
- Click "Review Permissions"
- Select your Google account
- Click "Advanced" → "Go to [Project Name] (unsafe)"
- Click "Allow"

### No message in Slack?
- Check Execution log for errors
- Verify webhook URL is correct
- Make sure webhook is still active in Slack
- Run `debugSetup()` to check configuration

### Function runs but nothing happens?
- Check Execution log for error messages
- Verify webhook URL doesn't contain "YOUR/WEBHOOK/URL"
- Check that Slack webhook is still active

---

## Quick Reference

| Function | Purpose | When to Use |
|----------|---------|-------------|
| `initialize()` | Set up trigger | First time setup only |
| `debugSetup()` | Check configuration | Troubleshooting |
| `testSlackIntegration()` | Test webhook | Quick webhook test |
| `testFormSubmitEvent()` | Test with real data | Test before going live |
| `onFormSubmit()` | Main function | Runs automatically on form submit |

---

## Need Help?

Check the Execution log for detailed error messages. The script logs:
- Event object structure
- Number of form fields found
- Webhook response codes
- Detailed error messages


