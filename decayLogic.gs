function rebalanceSell() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
  var today = new Date();
  var dayOfWeek = today.getDay(); 
  var startTime = new Date().getTime(); // Get the start time
  var maxDuration = 75 * 1000; // 75 seconds in milliseconds

  var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
  
  switch (dayOfWeek) {
    case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
    default:
      logMessage("REBALANCE SELL: Today is not a trading day. Bye bye!");
      deleteSpecificTrigger("masterTrigger");
      return;
  }
  var sheetData = sheet.getRange("B14:E24").getValues();
  var lotSize = sheetData[0][0];
  var quantity = quantity * lotSize;

  var securityIdCallOne = sheetData[6][0];
  var securityIdCallTwo = sheetData[7][0];
  var securityIdPutOne = sheetData[9][0];
  var securityIdPutTwo = sheetData[10][0];

  if (securityIdCallOne && securityIdCallTwo && securityIdPutOne && securityIdPutTwo) {
    
    var success = false;  // Initialize the success flag
    
    for (var attempt = 1; attempt <= 4; attempt++) {

      if (success) break;  // Stop the loop if success is achieved

      var elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime > maxDuration) {
        logMessage('⏱ Script execution time exceeded one hundred (100) seconds. Terminating.');
        break; // Terminate the script
      }
      
      var priceCallStoredOne = sheetData[6][3];
      var priceCallStoredTwo = sheetData[7][3];
      var pricePutStoredOne = sheetData[9][3];
      var pricePutStoredTwo = sheetData[10][3];

      var priceData = getMultiLTP([securityIdCallOne, securityIdCallTwo, securityIdPutOne, securityIdPutTwo], optionSegment);

      // Extract prices into separate variables
      var priceCallOne = priceData[securityIdCallOne] || null;
      var priceCallTwo = priceData[securityIdCallTwo] || null;
      var pricePutOne = priceData[securityIdPutOne] || null;
      var pricePutTwo = priceData[securityIdPutTwo] || null;

      var lossPercent = sheetData[1][0];
      var profitPercent = sheetData[2][0]; 

      var openPnL = quantity * ((priceCallStoredOne - priceCallOne) + (priceCallStoredTwo - priceCallTwo) + (pricePutStoredOne - pricePutOne) + (pricePutStoredTwo - pricePutTwo));
      var openMargin = quantity * (priceCallStoredOne + priceCallStoredTwo + pricePutStoredOne + pricePutStoredTwo); 

      var profitMargin = openMargin * profitPercent;
      var lossMargin = openMargin * lossPercent;

      if ((openPnL >= profitMargin || openPnL <= -lossMargin) && priceCallStoredOne && priceCallStoredTwo && pricePutStoredOne && pricePutStoredTwo) {

        var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
        if (!realTimePrice) {
          logMessage("REBALANCE SELL: Error fetching real-time price.");
          sendMessage("REBALANCE SELL: Error fetching real-time price.");
          return;
        }

        var roundedPrice = Math.floor(realTimePrice / strikePriceIncrement) * strikePriceIncrement;
        var strikeCallOne = roundedPrice + (strikePriceIncrement * 3);
        var strikePutOne = roundedPrice - (strikePriceIncrement * 3);

        var strikeCallOneStored = sheetData[6][2];
        var strikePutOneStored = sheetData[9][2];

        if (strikeCallOneStored == strikeCallOne || strikePutOneStored == strikePutOne) {
 
          sheet.getRange("E20:E21").setValues([[priceCallOne], [priceCallTwo]]);

          sheet.getRange("E23:E24").setValues([[pricePutOne], [pricePutTwo]]);

          var storedPnL = sheet.getRange("B26").getValue();
          var currentPnl = openPnL + storedPnL;
          sheet.getRange("B26").setValue(currentPnl);

          var rowData = [today, openPnL, currentPnl, openMargin, "No"];
          sheet.appendRow(rowData);

          logMessage("REBALANCE SELL: ✅ Stored and current strike are the same, updated the PnL only");
        } else {
          
          var exitSellStatus = exitSell();
          var enterSellStatus = enterSell();

          if (exitSellStatus && enterSellStatus) {
            
            var storedPnL = sheet.getRange("B26").getValue();
            var currentPnl = openPnL + storedPnL;
            sheet.getRange("B26").setValue(currentPnl);

            var rowData = [today, openPnL, currentPnl, openMargin, "Yes"];
            sheet.appendRow(rowData);

            logMessage("REBALANCE SELL: Exit & Enter of SELL completed");
          } else {
            logMessage("REBALANCE SELL: Exit & Enter SELL failed");
            sendMessage("REBALANCE SELL: Exit & Enter SELL failed");
          } 
        }

        success = true;  // Set success to true to stop the loop
        break;  // Break out of the loop after success
      }

      Utilities.sleep(10000);
      logMessage("REBALANCE SELL: Attempt " + attempt + ": Open Orders PnL is " + openPnL.toFixed(2) + ", profitMargin is " + profitMargin.toFixed(2) + " & stoplossExit is -" + lossMargin.toFixed(2));
    }

    if (attempt > 4 && !success) {
      logMessage("REBALANCE SELL: Max attempts reached. Profit and Loss condition not met.");
    }

    return;
  }
}

function rebalanceBuy() {

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      default:

        logMessage("REBALANCE BUY: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("D14").getValue();
    var quantity = quantity * lotSize;
    var strikeCallStored = sheet.getRange("D19").getValue();
    var strikePutStored = sheet.getRange("D22").getValue();
    
    if (strikeCallStored && strikePutStored) {
    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {
        logMessage("REBALANCE BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("REBALANCE BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;
    }
 
    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    /// build logic here

    // generating the strike price with the rounded price (at 10 OTM )
    var strikeCallBreach = roundedPrice + (strikePriceIncrement * 10);
    var strikePutBreach = roundedPrice - (strikePriceIncrement * 10);

  if (strikeCallStored <= strikeCallBreach || strikePutStored >= strikePutBreach) {

    // fetching securityId and tradeSymbol with the rounded price (OTM + 15)
    var strikeCall = roundedPrice + (strikePriceIncrement * 15);
    var strikePut = roundedPrice - (strikePriceIncrement * 15);

    var tradeSymbolCall = fetchTradeSymbol(indexNeo, "CE", strikeCall);
    var tradeSymbolPut = fetchTradeSymbol(indexNeo, "PE", strikePut);
    
    // placing order for FAR CALL
    
    var orderStatusCall = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCall, "0");
      
      if (orderStatusCall) { 
        
        var securityIdCall = fetchSecurityId(indexNeo, "CE", strikeCall);
        var priceCall = getLTP(securityIdCall, optionSegment, optionInstrument);

      } else {
          logMessage("REBALANCE BUY: CALL Buy order FAR failed.");
          sendMessage("REBALANCE BUY: CALL Buy order FAR failed.");
          return 'CALL BUY executed FAR failed!';
      }
    // placing order for FAR PUT

    var orderStatusPut = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPut, "0");
      
      if (orderStatusPut) {

        var securityIdPut = fetchSecurityId(indexNeo, "PE", strikePut);
        var pricePut = getLTP(securityIdPut, optionSegment, optionInstrument);

      } else {
          logMessage("REBALANCE BUY: PUT Buy order FAR failed.");
          sendMessage("REBALANCE BUY: PUT Buy order FAR failed.");
          return 'PUT BUY executed FAR failed!';
      }

      // intiating the exit buy 
      
      var exitBuyStatus = exitBuy();

      if (exitBuyStatus) {
        // logMessage("REBALANCE BUY: FAR BUY Orders have been exited.");
      } else {
        logMessage("REBALANCE BUY: FAR BUY Orders exit has failed.");
        sendMessage("REBALANCE BUY: FAR BUY Orders exit has failed.");
        return 'FAR BUY Orders exit has failed!';
      }

      // Storing values in the MASTER SHEET after exit has completed.
    if (orderStatusCall && orderStatusPut) {

      sheet.getRange("B19:E19").setValues([[securityIdCall, tradeSymbolCall, strikeCall, priceCall]]);

      sheet.getRange("B22:E22").setValues([[securityIdPut, tradeSymbolPut, strikePut, pricePut]]);


      logMessage("🅱️ REBALANCE BUY: All FAR Buy order completed.");
      return 'All CALL Far executed successfully!';
    
    } else {
      logMessage("REBALANCE BUY: Something went wrong with FAR Buy order.");
      sendMessage("REBALANCE BUY: Something went wrong with FAR Buy order.");
      return '🚨 Something went wrong with FAR Buy order!';
    }

  } else {
    logMessage("❎ REBALANCE BUY: FAR BUY is within the limits. No rebalancing required")
    return 'FAR BUY is within the limits. No rebalancing required';
  }
  }
}

function enterSell(){

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      default:

        logMessage("ENTER SELL: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("ENTER SELL: Error fetching real-time price, examine the error logs.");
        sendMessage("ENTER SELL: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (OTM)
    var strikeCallOne = roundedPrice + (strikePriceIncrement * 3);
    var strikeCallTwo = roundedPrice + (strikePriceIncrement * 4);

    var strikePutOne = roundedPrice - (strikePriceIncrement * 3);
    var strikePutTwo = roundedPrice - (strikePriceIncrement * 4);

    var tradeSymbolCallOne = fetchTradeSymbol(indexNeo, "CE", strikeCallOne);
    var tradeSymbolCallTwo = fetchTradeSymbol(indexNeo, "CE", strikeCallTwo);

    var tradeSymbolPutOne = fetchTradeSymbol(indexNeo, "PE", strikePutOne);
    var tradeSymbolPutTwo = fetchTradeSymbol(indexNeo, "PE", strikePutTwo);
    
    // placing order for CALL selling
    
    var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
    var orderStatusCallTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");

      // placing order for PUT selling
    
    var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
    var orderStatusPutTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");

    
  if (orderStatusCallOne && orderStatusCallTwo && orderStatusPutOne && orderStatusPutTwo) {
    
    var securityIdCallOne = fetchSecurityId(indexNeo, "CE", strikeCallOne);
    var securityIdCallTwo = fetchSecurityId(indexNeo, "CE", strikeCallTwo);
    var securityIdPutOne = fetchSecurityId(indexNeo, "PE", strikePutOne);
    var securityIdPutTwo = fetchSecurityId(indexNeo, "PE", strikePutTwo);

    var priceData = getMultiLTP([securityIdCallOne, securityIdCallTwo, securityIdPutOne, securityIdPutTwo], optionSegment);
    // Extract prices into separate variables
    var priceCallOne = priceData[securityIdCallOne] || null;
    var priceCallTwo = priceData[securityIdCallTwo] || null;
    var pricePutOne = priceData[securityIdPutOne] || null;
    var pricePutTwo = priceData[securityIdPutTwo] || null;
    
    sheet.getRange("B20:E20").setValues([[
      securityIdCallOne, 
      tradeSymbolCallOne, 
      strikeCallOne, 
      priceCallOne
    ]]);

    sheet.getRange("B21:E21").setValues([[
      securityIdCallTwo, 
      tradeSymbolCallTwo, 
      strikeCallTwo, 
      priceCallTwo
    ]]);
    
    sheet.getRange("B23:E23").setValues([[
      securityIdPutOne, 
      tradeSymbolPutOne, 
      strikePutOne, 
      pricePutOne
    ]]);

    sheet.getRange("B24:E24").setValues([[
      securityIdPutTwo, 
      tradeSymbolPutTwo, 
      strikePutTwo, 
      pricePutTwo
    ]]);


    logMessage("ENTER SELL: Completed");
    return {
        success: true,
        message: 'All NEAR Sell executed successfully!'
    };

  } else {
    logMessage("ENTER SELL: Something went wrong with order");
    sendMessage("ENTER SELL: Something went wrong with order");
    return {
        success: false,
        message: '🚨 Something went wrong with NEAR Sell order!'
    };
  }
}

function exitSell() {
  
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      default:

        logMessage("EXIT SELL: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B14").getValue();
    var quantity = quantity * lotSize;
    
    var tradeSymbols = sheet.getRange("C20:C21").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // Value from C20
    var tradeSymbolCallTwo = tradeSymbols[1][0]; // Value from C21


    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 
          
          sheet.getRange("B20:E20").setValues([['', '', '', '']]);

      } else {
          logMessage("EXIT SELL: CALL order ONE failed.");
          sendMessage("EXIT SELL: CALL order ONE failed.");
          return '🚨 CALL Exit Sell executed ONE failed!';
      }
    }
    if (tradeSymbolCallTwo) {
      
      var orderStatusCallTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");
      
      if (orderStatusCallTwo) { 

            sheet.getRange("B21:E21").setValues([['', '', '', '']]);

      } else {
          logMessage("EXIT SELL: CALL order TWO failed.");
          sendMessage("EXIT SELL: CALL order TWO failed.");
          return '🚨 CALL Exit Sell executed TWO failed!';
      }
      
    }
    // SQUARE OFF and Erase PUT data.

    var tradeSymbols = sheet.getRange("C23:C24").getValues();
    var tradeSymbolPutOne = tradeSymbols[0][0]; // Value from C23
    var tradeSymbolPutTwo = tradeSymbols[1][0]; // Value from C24


    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 

          sheet.getRange("B23:E23").setValues([['', '', '', '']]);


        // logMessage("EXIT SELL: PUT order ONE completed.");

      } else {
          logMessage("EXIT SELL: PUT order ONE failed.");
          sendMessage("EXIT SELL: PUT order ONE failed.");
          return '🚨 PUT Exit Sell executed ONE failed!';
      }
    }
    if (tradeSymbolPutTwo) {
      
      var orderStatusPutTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");
      
      if (orderStatusPutTwo) { 

          sheet.getRange("B24:E24").setValues([['', '', '', '']]);


        // logMessage("EXIT SELL: PUT order TWO completed.");

      } else {
          logMessage("EXIT SELL: PUT order TWO failed.");
          sendMessage("EXIT SELL: PUT order TWO failed.");
          return '🚨 PUT Exit Sell executed TWO failed!';
      }
      
    }
    
    var tradeSymbols = sheet.getRange("C20:C24").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // C20
    var tradeSymbolCallTwo = tradeSymbols[1][0]; // C21
    var tradeSymbolPutOne = tradeSymbols[3][0];  // C23
    var tradeSymbolPutTwo = tradeSymbols[4][0];  // C24


    if (!tradeSymbolCallOne && !tradeSymbolCallTwo && !tradeSymbolPutOne && !tradeSymbolPutTwo) {
        /// integrate the following into existing code.
      logMessage("EXIT SELL: Completed");
      return {
        success: true,
        message: 'Exit Sell executed successfully!'
      };
    } else {
      logMessage("EXIT SELL: Something went wrong with Exit Sell order.");
      sendMessage("EXIT SELL: Something went wrong with Exit Sell order.");
      return {
        success: false,
        message: '🚨 Something went wrong with Exit Sell order!'
      };
    }
}

function enterBuy() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      default:

        logMessage("ENTER BUY: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("D14").getValue();
    var quantity = quantity * lotSize;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("ENTER BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("ENTER BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (OTM + 15)
    var strikeCall = roundedPrice + (strikePriceIncrement * 15);
    var strikePut = roundedPrice - (strikePriceIncrement * 15);

    var tradeSymbolCall = fetchTradeSymbol(indexNeo, "CE", strikeCall);
    var tradeSymbolPut = fetchTradeSymbol(indexNeo, "PE", strikePut);
    
    // placing order for FAR CALL
    
    var orderStatusCall = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCall, "0");
      
      if (orderStatusCall) { 

        // logMessage("ENTER BUY: CALL order completed.");

      } else {
          logMessage("ENTER BUY: CALL order failed.");
          sendMessage("ENTER BUY: CALL order failed.");
          return 'CALL BUY executed FAR failed!';
      }
    // placing order for FAR PUT

    var orderStatusPut = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPut, "0");
      
      if (orderStatusPut) {

        // logMessage("ENTER BUY: PUT order completed.");

      } else {
          logMessage("ENTER BUY: PUT order failed.");
          sendMessage("ENTER BUY: PUT order failed.");
          return 'PUT BUY executed FAR failed!';
      }
    
    
  if (orderStatusCall && orderStatusPut) {
    
    var securityIdCall = fetchSecurityId(indexNeo, "CE", strikeCall);
    var securityIdPut = fetchSecurityId(indexNeo, "PE", strikePut);

    var priceCall = getLTP(securityIdCall, optionSegment, optionInstrument);
    var pricePut = getLTP(securityIdPut, optionSegment, optionInstrument);

    sheet.getRange("B19:E19").setValues([[securityIdCall, tradeSymbolCall, strikeCall, priceCall]]);

    sheet.getRange("B22:E22").setValues([[securityIdPut, tradeSymbolPut, strikePut, pricePut]]);


    logMessage("ENTER BUY: All order completed.");
    return {
        success: true,
        message: 'All CALL Far executed successfully!'
    };

  } else {
    logMessage("ENTER BUY: Something went wrong with FAR Buy order.");
    sendMessage("ENTER BUY: Something went wrong with FAR Buy order.");
     return {
        success: false,
        message: '🚨 Something went wrong with FAR Buy order!'
    };
  }
}

function exitBuy() {

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
    // Get today's date
    var today = new Date();
    var dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday

    var indexName, indexNeo, strikePriceIncrement, exchangeSecurityId, exchangeSegment, exchangeSegmentNeo, productType, exchangeInstrument, optionSegment, optionInstrument, quantity;
    
    switch (dayOfWeek) {
      case 1: // Monday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 2: // Tuesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 3: // Wednesday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      case 4: // Thursday
        indexName = "SENSEX";
        indexNeo = "BSXOPT";
        strikePriceIncrement = "100";
        exchangeSecurityId = "51";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "bse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "BSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "10";
        break;
      case 5: // Friday
        indexName = "NIFTY";
        indexNeo = "NIFTY";
        strikePriceIncrement = "50";
        exchangeSecurityId = "13";
        exchangeSegment = "IDX_I";
        exchangeSegmentNeo = "nse_fo";
        productType = "MARGIN";
        exchangeInstrument = "INDEX";
        optionSegment = "NSE_FNO";
        optionInstrument = "OPTIDX";
        quantity = "25";
        break;
      default:

        logMessage("Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("D14").getValue();
    var quantity = quantity * lotSize;
    
    // SQUARE OFF and Erase CALL data.
    var tradeSymbolCallOne = sheet.getRange("C19").getValue();

    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 

          sheet.getRange("B19:E19").setValues([['', '', '', '']]);


        // logMessage("EXIT BUY: CALL order completed.");

      } else {
          logMessage("EXIT BUY: CALL order failed.");
          sendMessage("EXIT BUY: CALL order failed.");
          return '🚨 CALL Exit Buy executed failed!';
      }
    }      

    // SQUARE OFF and Erase PUT data.
    var tradeSymbolPutOne = sheet.getRange("C22").getValue();  

    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 

        sheet.getRange("B22:E22").setValues([['', '', '', '']]);


        // logMessage("EXIT BUY: PUT order completed.");

      } else {
          logMessage("EXIT BUY: PUT order failed.");
          sendMessage("EXIT BUY: PUT order failed.");
          return '🚨 PUT Exit Buy executed failed!';
      }
    }

    var tradeSymbols = sheet.getRange("C19:C22").getValues();
    var tradeSymbolCallOne = tradeSymbols[0][0]; // Value from C19
    var tradeSymbolPutOne = tradeSymbols[3][0]; // Value from C22


    if (!tradeSymbolCallOne &&!tradeSymbolPutOne) {
      logMessage("EXIT BUY: Exit Buy Completed");
      return {
        success: true,
        message: 'Exit Buy executed successfully!'
      };

    } else {
      logMessage("EXIT BUY: Something went wrong with Exit Buy order.");
      sendMessage("EXIT BUY: Something went wrong with Exit Buy order.");
      return {
        success: false,
        message: '🚨 Something went wrong with Exit Buy order!'
      };
    }
}
