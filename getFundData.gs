function getFundData() {

  var url = `https://gw-napi.kotaksecurities.com/Orders/2.0/quick/user/limits?sId=${SERVER_ID}`;

  // Request headers
  var headers = {
    'accept': 'application/json',
    'Sid': SESSION_ID,
    'Auth': JWT_TOKEN_TRADE,
    'neo-fin-key': NEO_FIN_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer ' + KOTAK_ACCESS_TOKEN
  };

  // URL encoded data
  var formData = {
    'jData': JSON.stringify({
      "seg": "ALL",
      "exch": "ALL",
      "prod": "ALL"
    })
  };

  // Encode the form data into a URL-encoded string
  var encodedData = Object.keys(formData).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(formData[key]);
  }).join('&');

  // Request options
  var options = {
    'method': 'post',
    'headers': headers,
    'payload': encodedData,
    'muteHttpExceptions': true 
  };

  // Make the HTTP POST request
  try {
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText()); // Log the response
  } catch (e) {
    Logger.log('Error: ' + e.message);
    sendMessage('An error occured while getting Limit: ' + e.message);
  }
}
