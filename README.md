# Google Forms to Slack Integration

This Google Apps Script automatically sends all Google Form submissions to a Slack channel using Slack's incoming webhook.

## Features

- ✅ Sends **all form fields** from submissions to Slack
- ✅ **Automatically filters out empty fields** - only fields with values are displayed
- ✅ Uses modern Slack Block Kit formatting for beautiful messages
- ✅ Includes respondent email (if available)
- ✅ Includes submission timestamp
- ✅ Optional "View Spreadsheet" button
- ✅ Handles different answer types (text, multiple choice, checkboxes, etc.)

## Setup Instructions

### 1. Create a Slack Incoming Webhook

1. Go to [Slack API Apps](https://api.slack.com/apps/)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Google Forms Bot") and select your workspace
4. Go to **Incoming Webhooks** in the left sidebar
5. Toggle **Activate Incoming Webhooks** to ON
6. Click **Add New Webhook to Workspace**
7. Select the channel where you want notifications
8. Copy the **Webhook URL** (looks like: `https://hooks.slack.com/services/XXX/YYY/ZZZ`)

### 2. Set Up Google Apps Script

1. Open your Google Form
2. Click the **Responses** tab
3. Click the **⋮** (three dots) menu → **Select response destination**
4. Choose **Create a new spreadsheet** or select an existing one
5. Open the linked Google Sheet
6. Go to **Extensions** → **Apps Script**
7. Delete any default code and paste the contents of `Code.gs`
8. Update the configuration section at the top:
   ```javascript
   const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL";
   const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/";
   ```
9. Click **Save** (💾 icon) and give your project a name

### 3. Create the Trigger

1. In the Apps Script editor, select the `initialize` function from the dropdown
2. Click **Run** ▶️
3. Authorize the script when prompted:
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"
4. You should see "Trigger created successfully!" in the execution log

### 4. Test It

1. Submit a test response to your Google Form
2. Check your Slack channel - you should see the notification!

## Configuration Options

Edit these constants in `Code.gs` to customize:

```javascript
const SLACK_WEBHOOK_URL = "..." // Required: Your webhook URL
const SPREADSHEET_URL = "..."    // Optional: Link to spreadsheet
const SLACK_CHANNEL = ""         // Optional: Override webhook channel
const SLACK_USERNAME = "Google Forms"  // Bot display name
const SLACK_ICON_EMOJI = ":clipboard:" // Bot icon emoji
```

## Testing

### Test Slack Integration
To test your Slack integration without submitting a form:

1. In Apps Script editor, select `testSlackIntegration` function
2. Click **Run** ▶️
3. Check your Slack channel for the test message

### Debug Setup
To check if everything is configured correctly:

1. In Apps Script editor, select `debugSetup` function
2. Click **Run** ▶️
3. Check the **Execution log** (View → Logs) for debug information

## Troubleshooting

### Script not working at all?
1. **Check webhook URL**: Make sure `SLACK_WEBHOOK_URL` is set (not the placeholder)
2. **Run debugSetup()**: This will show you trigger status and configuration
3. **Check Execution Log**: View → Logs in Apps Script to see error messages
4. **Verify trigger exists**: Go to Triggers (clock icon) and confirm "onFormSubmit" trigger exists

### Trigger not working?
- Make sure you ran `initialize()` successfully
- Check **Triggers** in Apps Script (clock icon) to see if trigger exists
- Verify the trigger is set to "On form submit"
- Make sure you're running `initialize()` on the **spreadsheet**, not the form

### Not receiving messages in Slack?
- Verify your webhook URL is correct and active
- Check the **Execution log** in Apps Script for detailed error messages
- Make sure the webhook is still active in Slack (check Slack app settings)
- Try running `testSlackIntegration()` to verify webhook works independently
- Check if webhook URL includes `YOUR/WEBHOOK/URL` placeholder (needs to be replaced)

### Missing form fields?
- The script automatically includes all fields from the form that have values
- **Empty fields are automatically filtered out** - this prevents cluttering Slack messages
- Check that your form has questions configured
- Verify the form is linked to the spreadsheet
- Check Execution log - it will show how many form data items were found

### Common Errors

**"Invalid event object"**
- Trigger may not be set up correctly
- Run `initialize()` again

**"SLACK_WEBHOOK_URL is not configured"**
- Update the `SLACK_WEBHOOK_URL` constant with your actual webhook URL

**"Slack API error (code 404)"**
- Webhook URL is incorrect or webhook has been deleted
- Create a new webhook in Slack

**"Slack API error (code 400)"**
- Message format issue
- Check Execution log for details

## References

- [petitviolet blog post](https://blog.petitviolet.net/post/2022-04-15/send-google-form-notification-to-slack-via-googleappscript)
- [GitHub Gist example](https://gist.github.com/ijin/da91b609536d4f27129316bc07b96254)
- [Slack Block Kit documentation](https://api.slack.com/block-kit)
- [Google Apps Script documentation](https://developers.google.com/apps-script)

## License

This script is provided as-is for your use.

