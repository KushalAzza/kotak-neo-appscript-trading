function oAuthSession() {
  var getAccessTokenStatus = getAccessToken()
    if (getAccessTokenStatus) {
      logMessage("STEP 1: Access Token Generated")
    } else {
      logMessage("STEP 1: Error Generating Access Token")
      sendMessage("STEP 1: Error Generating Access Token")
      return;
    }
  Utilities.sleep(2000);
  var validateLoginStatus = validateLogin();
    if (validateLoginStatus) {
      logMessage("STEP 2: Login Validation Completed")
    } else {
      logMessage("STEP 2: Error Login Validation")
      sendMessage("STEP 2: Error Login Validation")
      return;
    }
  Utilities.sleep(2000);
  var decodeJWTforUserIdStatus = decodeJWTforUserId()
    if (decodeJWTforUserIdStatus) {
      logMessage("STEP 3: User ID Decoded")
    } else {
      logMessage("STEP 3: Error Decoding User ID")
      sendMessage("STEP 3: Error Decoding User ID")
      return;
    }
  Utilities.sleep(2000);
  var generateOTPStatus = generateOTP();
    if (generateOTPStatus) {
      logMessage("STEP 4: OTP Generated")
    } else {
      logMessage("STEP 4: Error Generating OTP")
      sendMessage("STEP 4: Error Generating OTP")
      return;
    }
  Utilities.sleep(30000);
  var fetchOtpFromEmailsStatus = fetchOtpFromEmails("noreply@nmail.kotaksecurities.com")
    if (fetchOtpFromEmailsStatus) {
      logMessage("STEP 5: OTP Fetched")
    } else {
      logMessage("STEP 5: Error Fetching OTP")
      sendMessage("STEP 5: Error Fetching OTP")
      return;
    }
  Utilities.sleep(10000);
  var validateLoginOTPStatus = validateLoginOTP();
    if (validateLoginOTPStatus) {
       logMessage("STEP 6: OTP Validation Completed")
    } else {
       logMessage("STEP 6: Error OTP Validation")
       sendMessage("STEP 6: Error OTP Validation")
       return;
    }
}

function getAccessToken() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");

  var url = 'https://napi.kotaksecurities.com/oauth2/token';
  var headers = {
    'Authorization': 'Basic kotakOAuthBasic'
  };
  var payload = {
    'grant_type': 'client_credentials'
  };
  
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': payload,
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var status = response.getResponseCode();
    var result = response.getContentText();
    
    // Log and parse the response
    // Logger.log(result);
    result = JSON.parse(result);
    
    if (status == 200 || status == 201) {
      var accessToken = result.access_token;
      sheet.getRange("B4").setValue(accessToken);
      return true;
    } else {
      logMessage('Failed to get access token. Status: ' + status + ', Response: ' + result);
      return false;
    }
  } catch (error) {
    logMessage('Error occurred: ' + error.message);
    sendMessage('An Error occurred while getting access token: ' + error.message);
    return false;
  }
}


function validateLogin() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
  var PAN = sheet.getRange("B2").getValue();
  var PASSWORD = sheet.getRange("B3").getValue();
  var KOTAK_ACCESS_TOKEN = sheet.getRange("B4").getValue();

  var url = 'https://gw-napi.kotaksecurities.com/login/1.0/login/v2/validate';
  
  var headers = {
    'accept': '*/*',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + KOTAK_ACCESS_TOKEN
  };
  
  var payload = {
    "pan": PAN,
    "password": PASSWORD
  };
  
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  
  try {
    var response = UrlFetchApp.fetch(url, options);
    var result = response.getContentText();
    var status = response.getResponseCode();
    result = JSON.parse(result);
    // Logger.log(result);

    var jwToken = result.data.token;
    var sessionId = result.data.sid;
    var serverId = result.data.hsServerId;
    var passwordExpired = result.data.isUserPwdExpired;

    if (passwordExpired) {
      sendMessage("Your password has expired, please change immediately.");
      logMessage("Your password has expired, please change immediately.");
    } else {
      sheet.getRange("B6").setValue(jwToken);
      sheet.getRange("B7").setValue(sessionId);
      sheet.getRange("B8").setValue(serverId);
    }
    
    if (status == 201 || status == 200) {
      return true;
    } else {
      logMessage('Failed to validate login. Status: ' + status);
      return false;
    }
  } catch (error) {
    logMessage('Error occurred: ' + error.message);
    sendMessage('Error occurred while validating login: ' + error.message);
    return false;
  }
}


function decodeJWTforUserId() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
  var JWT_TOKEN = sheet.getRange("B6").getValue();
  var token = JWT_TOKEN;

  if (!token || typeof token !== 'string') {
    logMessage("Error: Invalid token. Please provide a valid JWT string.");
    return null; // Return null if the token is invalid
  }

  var parts = token.split('.'); // Split the JWT into its parts: header, payload, and signature

  if (parts.length !== 3) {
    logMessage("Error: Invalid JWT format. A JWT should have three parts separated by dots.");
    return null; // Return null if the token does not have three parts
  }

  try {
    // Decode and parse the payload
    var payload = JSON.parse(Utilities.newBlob(Utilities.base64Decode(parts[1])).getDataAsString());
    // Logger.log(payload)
    // Retrieve the 'sub' value and store it in a variable
    var userId = payload.sub;
    
    if (userId) {
      sheet.getRange("B5").setValue(userId);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logMessage("Error decoding JWT: " + e.message);
    sendMessage("An Error occured while decoding JWT: " + e.message);
    return null; // Return null if there's an error decoding the JWT
  }
}


function generateOTP() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
  var KOTAK_ACCESS_TOKEN = sheet.getRange("B4").getValue();
  var USER_ID = sheet.getRange("B5").getValue();
  
  var url = 'https://gw-napi.kotaksecurities.com/login/1.0/login/otp/generate';

  // Request headers
  var headers = {
    'accept': '*/*',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + KOTAK_ACCESS_TOKEN
  };

  // Request payload
  var payload = {
    "userId": USER_ID,
    "sendEmail": true,
    "isWhitelisted": true
  };

  // Request options
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true // Optional: Allows you to see the full response in case of errors
  };

  // Make the HTTP POST request
  try {
    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response);
    var status = response.getResponseCode();
    if (status == 200 || status == 201) {
      logMessage("OTP has been generated.")
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logMessage('Error: ' + e.message);
    sendMessage('An error occured while generating OTP: ' + e.message);
  }
}

function validateLoginOTP() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
  
  var KOTAK_ACCESS_TOKEN = sheet.getRange("B4").getValue();
  var USER_ID = sheet.getRange("B5").getValue();
  var JWT_TOKEN = sheet.getRange("B6").getValue();
  var SESSION_ID = sheet.getRange("B7").getValue();
  var OTP = sheet.getRange("B9").getValue();
  
  var url = 'https://gw-napi.kotaksecurities.com/login/1.0/login/v2/validate';

  // Request headers
  var headers = {
    'accept': '*/*',
    'sid': SESSION_ID,
    'Auth': JWT_TOKEN,
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + KOTAK_ACCESS_TOKEN
  };

  // Request payload
  var payload = {
    "userId": USER_ID,
    "otp": `${OTP}`
  };

  // Request options
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true // Optional: Allows you to see the full response in case of errors
  };

  // Make the HTTP POST request
  try {
    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response);
    // Logger.log(result);
    var jwtTrade = result.data.token;
    sheet.getRange("B10").setValue(jwtTrade);
    var status = response.getResponseCode();
    if (status == 200 || status == 201) {
      logMessage("Login completed successfully.")
      return true;
    } else {
      return false;
    }
  } catch (e) {
    logMessage('Error: ' + e.message);
    sendMessage('An error occured while validating OTP: ' + e.message);
  }
}

function fetchOtpFromEmails(senderEmail) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
  // Get the user's inbox
  try {
    const threads = GmailApp.search(`from:${senderEmail}`);
    const otpRegex = /OTP for logging into your Kotak Securities Neo account is (\d{4})/; // Adjusted regex

    // Loop through each thread and get messages
    for (const thread of threads) {
      const messages = thread.getMessages();

      for (let i = messages.length - 1; i >= 0; i--) { // Start from the most recent message
        const message = messages[i];
        const body = message.getBody();
        const match = body.match(otpRegex);

        if (match) {
          const otp = match[1]; // Extract the OTP from the capturing group
          // Logger.log(`The OTP is: ${otp}`);
          sheet.getRange("B9").setValue(otp);
          return true; // Return the first found OTP
        }
      }
    }

    logMessage('No OTP found for the specified sender.');
    sendMessage("No OTP found for request.");
    return null; // Return null if no OTP is found

  } catch (error) {
    logMessage('Error occurred: ' + error.message);
    sendMessage("An error occurred while fetching the OTP: " + error.message);
    return null; // Return null in case of an error
  }
}

// // Example usage
// function fetchOTP() {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ACCESS");
//   const senderEmail = "noreply@nmail.kotaksecurities.com"; // Replace with the sender's email
//   const otp = fetchOtpFromEmails(senderEmail);
  
//   if (otp) {
//     logMessage(`The OTP is: ${otp}`);
//     // store the OTP in the spreadsheet.
//     sheet.getRange("B9").setValue(otp);
//   } else {
//     logMessage('No OTP found for the specified sender.');
//     // send email if the OTP is not found.
    // sendMessage("No OTP found for request.");
//   }
// }
