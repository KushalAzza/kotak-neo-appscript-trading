function placeNeoOrder(tt, es, pc, pt, qt, ts, pr) {
  var url = `https://gw-napi.kotaksecurities.com/Orders/2.0/quick/order/rule/ms/place?sId=${SERVER_ID}`;

  var headers = {
    'accept': 'application/json',
    'Sid': SESSION_ID,
    'Auth': JWT_TOKEN_TRADE,
    'neo-fin-key': NEO_FIN_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Bearer ' + KOTAK_ACCESS_TOKEN
  };

  var payload = {
    'jData': JSON.stringify({
      'dq': '0',
      'es': es,
      'mp': '0',
      'pc': pc,
      'pf': 'N',
      'pr': pr,
      'pt': pt,
      'qt': qt,
      'rt': 'IOC',
      'ts': ts,
      'tt': tt
    })
  };

  var options = {
    'method': 'post',
    'headers': headers,
    'payload': payload
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var result = JSON.parse(response.getContentText());
    // var orderNum = result.nOrdNo;
    // logMessage("Order placed with the order number: " + orderNum);

    return true;

  } catch (error) {
    logMessage('Error occurred: ' + error.message);
    sendMessage('Error occurred while placing order: ' + error.message);
    return false;
    // return true; // testing.
  }
}

      // 'dq': '0',
      // 'es': 'nse_cm',
      // 'mp': '0',
      // 'pc': 'CNC',
      // 'pf': 'N',
      // 'pr': '0',
      // 'pt': 'MKT',
      // 'qt': '1',
      // 'rt': 'IOC',
      // 'ts': 'ITC-EQ',
      // 'tt': 'B'
