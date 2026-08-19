  const accessSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");

  const values = accessSheet.getRange("B1:B10").getValues().flat();
  const dhValues = accessSheet.getRange("B14:B16").getValues().flat();
  const tlValues = accessSheet.getRange("B18:B19").getValues().flat();

  // Destructure the values into constants
  const [
    NEO_FIN_KEY,
    PAN,
    PASSWORD,
    KOTAK_ACCESS_TOKEN,
    USER_ID,
    JWT_TOKEN_VIEW,
    SESSION_ID,
    SERVER_ID,
    OTP,
    JWT_TOKEN_TRADE,
    DHAN_ACCESS_TOKEN,
    DHAN_CLIENT_ID,
    DHAN_BASE_URL,
    TELEGRAM_TOKEN,
    TELEGRAM_CHAT_ID
  ] = [...values, ...dhValues, ...tlValues];


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Trading Terminal')
    .addItem('📈 Buying Terminal', 'openBuyingSidebar')
    .addItem('📉 Selling Terminal', 'openSellingSidebar')
    .addItem('🛠 Setup', 'openSetupSidebar')
    .addToUi();
}

function openBuyingSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('buyingSidebar')
      .setTitle('Options Buying Terminal')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openSellingSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sellingSidebar')
      .setTitle('Options Selling Terminal')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function openSetupSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('setup')
      .setTitle('Options Setup')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function sendMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}

function logMessage(message) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG");
    var timestamp = new Date(); // Get the current date and time
    sheet.appendRow([timestamp, message]); // Append the timestamp and message
}

function clearLog() {
  // Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");

  sheet.getRange("B26").setValue('0');
  sheet.getRange("A29:E200").clearContent();
  
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG");
  
  // Check if the sheet exists
  if (logSheet) {
    // Clear the content of the sheet
    logSheet.clear(); // This clears all the content and formatting
    
    // Set the headers in the first row
    logSheet.appendRow(["Timestamp", "Message Log"]);
    
    // Optional: Set the header row to bold
    var range = logSheet.getRange("A1:B1");
    range.setFontWeight("bold");
    
    // Optional: Set the background color for the header row
    range.setBackground("#eeeeee");
    
  } else {
    Logger.log("Sheet 'LOG' not found.");
  }
}

function clearMaster() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    sheet.getRange("B19:E24").setValues([
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', '']
      ]);
    sheet.getRange("B6:E11").setValues([
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', '']
      ]);
}
