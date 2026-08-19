function getLTP(securityId, exchangeSegment, instrument) {
    var url = `${DHAN_BASE_URL}/v2/charts/intraday`;
    var options = {
        method: 'post',
        headers: {
            'access-token': `${DHAN_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        payload: JSON.stringify({
            securityId: securityId,
            exchangeSegment: exchangeSegment,
            instrument: instrument
        }),
        muteHttpExceptions: true
    };

    try {
        var response = UrlFetchApp.fetch(url, options);
        var responseContent = response.getContentText();
        var data = JSON.parse(responseContent);
        return data.close.pop();
    } catch (error) {
        logMessage("GET LTP: Exception occurred - " + error.message);
        sendMessage("GET LTP: Exception occurred - " + error.message);
        return false;
    }
}


function getMultiLTP(securityIdGroups, optionSegment) {
  var url = `${DHAN_BASE_URL}/v2/marketfeed/ltp`;
  
  // Combine all security IDs into a single array

  var combinedSecurityIds = [];
  for (var group of securityIdGroups) {
    combinedSecurityIds = combinedSecurityIds.concat(group.split(',').map(function(id) { return parseInt(id.trim()); }));
  }

  // Construct the request body
  var payload = {};
  payload[optionSegment] = combinedSecurityIds;

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Accept': 'application/json',
      'access-token': DHAN_ACCESS_TOKEN,
      'client-id': DHAN_CLIENT_ID
    },
    payload: JSON.stringify(payload)
  };

  // Make the API call
  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());

    if (json.status === "success" && json.data[optionSegment]) {
      var lastPrices = json.data[optionSegment];
      var prices = {};
      
      // Store each last_price into the corresponding variable
      for (var securityId of combinedSecurityIds) {
        if (lastPrices[securityId]) {
          prices[securityId] = lastPrices[securityId].last_price;
        } else {
          prices[securityId] = null; // If the security ID is not found
        }
      }
      return prices; // Return an object with security IDs and their last prices
    } else {
      logMessage("Error: " + json.status);
      sendMessage("Error: " + json.status);
      return null;
    }
  } catch (e) {
      logMessage("Error fetching data: " + e);
      sendMessage("Error fetching data: " + e);
      return null;
  }
}
