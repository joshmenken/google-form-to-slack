/**
 * Google Apps Script to send Google Form submissions to Slack
 * 
 * Setup Instructions:
 * 1. Replace SLACK_WEBHOOK_URL with your Slack incoming webhook URL
 * 2. Replace SPREADSHEET_URL with your Google Sheets URL (optional, for button link)
 * 3. Customize SLACK_CHANNEL (optional, if not set in webhook)
 * 4. Run initialize() once to set up the form submission trigger
 * 
 * References:
 * - https://blog.petitviolet.net/post/2022-04-15/send-google-form-notification-to-slack-via-googleappscript
 * - https://gist.github.com/ijin/da91b609536d4f27129316bc07b96254
 */

// ==================== CONFIGURATION ====================

// Your Slack incoming webhook URL
// Test Channel
const SLACK_WEBHOOK_URL = "";
// Active Channel
/** const SLACK_WEBHOOK_URL = "";*/

// Optional: Google Sheets URL for the "View Spreadsheet" button
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1BrpJna-IWTjv4lVbImhmLMY9prSkz4Enlc6ef3etmIU/";

// Optional: Slack channel (if not already configured in webhook)
const SLACK_CHANNEL = ""; // Leave empty to use webhook default, or use "#channel-name"

// Optional: Customize the bot appearance
const SLACK_USERNAME = "Google Forms";
const SLACK_ICON_EMOJI = ":clipboard:";

// ==================== INITIALIZATION ====================

/**
 * Run this function once to set up the form submission trigger
 * Go to: Extensions > Apps Script > Run > initialize
 */
function initialize() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger for form submissions
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
  
  Logger.log('Trigger created successfully! Form submissions will now be sent to Slack.');
}

// ==================== MAIN FUNCTION ====================

/**
 * This function is automatically called when a form is submitted
 * @param {Event} e - The form submission event
 */
function onFormSubmit(e) {
  try {
    // Handle case when function is called manually (for testing)
    if (!e) {
      Logger.log('⚠️ Function called without event object. This function should be triggered automatically on form submit.');
      Logger.log('To test, use testSlackIntegration() instead.');
      return;
    }
    
    // Log event structure for debugging
    Logger.log('Event object keys: ' + Object.keys(e).join(', '));
    
    // When triggered from spreadsheet, event has 'values' and 'namedValues'
    // 'values' is array of responses in order
    // 'namedValues' is object with question titles as keys
    
    let values = [];
    let namedValues = {};
    let sheet = null;
    
    // Try to get values from event
    if (e.values && Array.isArray(e.values)) {
      values = e.values;
      namedValues = e.namedValues || {};
    } else if (e.namedValues && typeof e.namedValues === 'object') {
      // Alternative: use namedValues to reconstruct values array
      namedValues = e.namedValues;
      const keys = Object.keys(namedValues);
      values = keys.map(key => {
        const val = namedValues[key];
        return Array.isArray(val) ? val[0] : val;
      });
      // Prepend timestamp if available
      if (e.range) {
        const timestamp = e.range.getSheet().getRange(e.range.getRow(), 1).getValue();
        values.unshift(timestamp);
      }
    } else {
      // Try to get data from range if available
      if (e.range) {
        sheet = e.range.getSheet();
        const row = e.range.getRow();
        const lastCol = sheet.getLastColumn();
        values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
      } else {
        throw new Error('Event object missing required properties. Event keys: ' + Object.keys(e).join(', '));
      }
    }
    
    if (values.length === 0) {
      throw new Error('No form values found in event object.');
    }
    
    Logger.log('Form submission received. Number of values: ' + values.length);
    
    // Get column names (question titles) from the spreadsheet
    if (!sheet) {
      if (e.range) {
        sheet = e.range.getSheet();
      } else {
        // Fallback: get active spreadsheet
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      }
    }
    
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    Logger.log('Header row length: ' + headerRow.length);
    
    // Get timestamp (usually first column)
    const timestamp = values[0]; // First column is usually timestamp
    
    // Get respondent email if available (check if there's an email column)
    let respondentEmail = '';
    const emailColumnIndex = headerRow.findIndex(col => 
      col && col.toString().toLowerCase().includes('email')
    );
    if (emailColumnIndex >= 0 && emailColumnIndex < values.length) {
      respondentEmail = values[emailColumnIndex];
    }
    
    // Build array of question-answer pairs
    const formData = [];
    for (let i = 0; i < headerRow.length && i < values.length; i++) {
      const question = headerRow[i];
      const answer = values[i];
      
      // Skip timestamp column (first column) and empty questions
      if (question && question.toString().trim() !== '' && i !== 0) {
        formData.push({
          question: question.toString(),
          answer: answer ? answer.toString() : ''
        });
      }
    }
    
    Logger.log('Form data items: ' + formData.length);
    
    if (formData.length === 0) {
      throw new Error('No form data found. Check that your form has questions.');
    }
    
    // Build Slack message with all form fields
    const message = buildSlackMessageBlock(formData, respondentEmail, timestamp);
    
    // Send to Slack
    sendToSlack(message);
    
    Logger.log('Form submission sent to Slack successfully');
  } catch (error) {
    const errorMsg = 'Error sending to Slack: ' + error.toString();
    Logger.log(errorMsg);
    Logger.log('Stack trace: ' + error.stack);
    
    // Log event details for debugging
    if (e) {
      Logger.log('Event type: ' + (typeof e));
      Logger.log('Event keys: ' + Object.keys(e).join(', '));
      Logger.log('Event values: ' + (e.values ? 'exists (length: ' + e.values.length + ')' : 'missing'));
      Logger.log('Event namedValues: ' + (e.namedValues ? 'exists (keys: ' + Object.keys(e.namedValues).join(', ') + ')' : 'missing'));
      Logger.log('Event range: ' + (e.range ? 'exists' : 'missing'));
    } else {
      Logger.log('Event object is undefined');
    }
    
    // Re-throw to see error in execution log
    throw error;
  }
}

// ==================== SLACK INTEGRATION ====================

/**
 * Sends message to Slack via webhook
 * @param {Object} body - The message payload
 */
function sendToSlack(body) {
  // Check if webhook URL is configured
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
    throw new Error('SLACK_WEBHOOK_URL is not configured. Please update it in the script.');
  }
  
  const payload = JSON.stringify(body);
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };
  
  Logger.log('Sending to Slack webhook: ' + SLACK_WEBHOOK_URL.substring(0, 30) + '...');
  
  const response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  Logger.log('Slack response code: ' + responseCode);
  
  if (responseCode !== 200) {
    throw new Error('Slack API error (code ' + responseCode + '): ' + responseText);
  }
  
  return response;
}

/**
 * Builds a Slack message using Block Kit format
 * Includes all form fields dynamically
 * @param {Array} formData - Array of {question, answer} objects
 * @param {String} respondentEmail - Email of the respondent (if available)
 * @param {String} timestamp - Submission timestamp
 * @returns {Object} Slack message payload
 */
function buildSlackMessageBlock(formData, respondentEmail, timestamp) {
  // Build fields array with all form questions and answers
  // Filter out items with empty answers
  const fields = formData
    .filter(item => {
      let answer = item.answer;
      // Handle different answer types
      if (Array.isArray(answer)) {
        answer = answer.join(', ');
      }
      // Check if answer has a value (not empty, null, undefined, or just whitespace)
      return answer && answer.toString().trim() !== '';
    })
    .map(item => {
      const question = item.question;
      let answer = item.answer;
      
      // Handle different answer types
      if (Array.isArray(answer)) {
        answer = answer.join(', ');
      }
      
      // Escape special characters for Slack markdown
      const escapedAnswer = answer.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return {
        type: 'mrkdwn',
        text: `*${question}*\n${escapedAnswer}`
      };
    });
  
  // Build blocks array
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 New Form Submission',
        emoji: true
      }
    }
  ];
  
  // Add respondent info if available
  if (respondentEmail) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*From:* ${respondentEmail}`
      }
    });
  }
  
  // Add timestamp
  if (timestamp) {
    let timestampText = timestamp.toString();
    // If timestamp is a date string, try to format it nicely
    try {
      const dateObj = new Date(timestamp);
      if (!isNaN(dateObj.getTime())) {
        timestampText = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'MMM dd, yyyy HH:mm:ss');
      }
    } catch (e) {
      // Use timestamp as-is if parsing fails
    }
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Submitted:* ${timestampText}`
      }
    });
  }
  
  // Add divider
  blocks.push({
    type: 'divider'
  });
  
  // Add form fields
  fields.forEach(field => {
    blocks.push({
      type: 'section',
      text: field
    });
  });
  
  // Add button to view spreadsheet if URL is provided
  if (SPREADSHEET_URL && SPREADSHEET_URL.includes('docs.google.com')) {
    blocks.push({
      type: 'divider'
    });
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'View all submissions in the spreadsheet'
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Open Spreadsheet',
          emoji: true
        },
        url: SPREADSHEET_URL,
        action_id: 'view_spreadsheet'
      }
    });
  }
  
  // Build payload
  const payload = {
    text: 'New form submission received', // Fallback text
    blocks: blocks
  };
  
  // Add channel if specified
  if (SLACK_CHANNEL) {
    payload.channel = SLACK_CHANNEL;
  }
  
  // Add username and icon if specified
  if (SLACK_USERNAME) {
    payload.username = SLACK_USERNAME;
  }
  if (SLACK_ICON_EMOJI) {
    payload.icon_emoji = SLACK_ICON_EMOJI;
  }
  
  return payload;
}

// ==================== TESTING ====================

/**
 * Test function to verify Slack integration
 * Run this manually to test your webhook configuration
 */
function testSlackIntegration() {
  // Create a mock form submission data
  const mockFormData = [
    {
      question: 'Name',
      answer: 'John Doe'
    },
    {
      question: 'Email',
      answer: 'john@example.com'
    },
    {
      question: 'Message',
      answer: 'This is a test message'
    },
    {
      question: 'How did you hear about us?',
      answer: 'Social media'
    }
  ];
  
  const message = buildSlackMessageBlock(mockFormData, 'test@example.com', new Date().toString());
  sendToSlack(message);
  Logger.log('Test message sent to Slack');
}

/**
 * Debug function to check trigger setup and view recent form submissions
 * Run this to see if triggers are configured correctly
 */
function debugSetup() {
  Logger.log('=== DEBUG INFO ===');
  
  // Check triggers
  const triggers = ScriptApp.getProjectTriggers();
  Logger.log('Number of triggers: ' + triggers.length);
  if (triggers.length === 0) {
    Logger.log('⚠️ WARNING: No triggers found! Run initialize() to create a trigger.');
  }
  triggers.forEach((trigger, index) => {
    Logger.log(`Trigger ${index + 1}:`);
    Logger.log('  Handler: ' + trigger.getHandlerFunction());
    Logger.log('  Event: ' + trigger.getEventType());
    Logger.log('  Source: ' + trigger.getSource());
  });
  
  // Check spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet: ' + ss.getName());
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
  
  // Check if spreadsheet has form responses
  try {
    const sheet = ss.getActiveSheet();
    const lastRow = sheet.getLastRow();
    Logger.log('Last row with data: ' + lastRow);
    if (lastRow > 1) {
      Logger.log('✓ Spreadsheet has form responses');
    } else {
      Logger.log('⚠️ Spreadsheet appears empty (no form responses yet)');
    }
  } catch (e) {
    Logger.log('⚠️ Error checking spreadsheet: ' + e.toString());
  }
  
  // Check webhook URL
  if (SLACK_WEBHOOK_URL.includes('YOUR/WEBHOOK/URL')) {
    Logger.log('⚠️ WARNING: SLACK_WEBHOOK_URL is not configured!');
  } else {
    Logger.log('✓ Webhook URL is configured');
  }
  
  // Check if form is linked
  try {
    const formUrl = ss.getFormUrl();
    if (formUrl) {
      const form = FormApp.openByUrl(formUrl);
      Logger.log('✓ Form found: ' + form.getTitle());
      Logger.log('  Form URL: ' + formUrl);
    } else {
      Logger.log('⚠️ No form linked to this spreadsheet');
    }
  } catch (e) {
    Logger.log('⚠️ Could not find linked form: ' + e.toString());
  }
  
  Logger.log('=== END DEBUG ===');
}

/**
 * Test function that simulates a form submission event
 * This helps debug the event structure
 */
function testFormSubmitEvent() {
  Logger.log('=== TESTING FORM SUBMIT EVENT ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // Get the last row (most recent submission)
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('⚠️ No form submissions found. Submit a form first.');
      return;
    }
    
    Logger.log('Simulating event from row: ' + lastRow);
    
    // Get header row
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Get last submission row
    const values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Create a mock event object similar to what Google Apps Script provides
    const mockEvent = {
      values: values,
      namedValues: {},
      range: sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
    };
    
    // Build namedValues object
    headerRow.forEach((header, index) => {
      if (header && values[index]) {
        mockEvent.namedValues[header] = [values[index]];
      }
    });
    
    Logger.log('Mock event created with ' + mockEvent.values.length + ' values');
    Logger.log('Calling onFormSubmit with mock event...');
    
    // Call the function with mock event
    onFormSubmit(mockEvent);
    
    Logger.log('✓ Test completed successfully');
  } catch (error) {
    Logger.log('✗ Test failed: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
  }
  
  Logger.log('=== END TEST ===');
}

