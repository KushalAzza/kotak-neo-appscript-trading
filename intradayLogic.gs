function callBuy() {
    logMessage("CALL Buy is Initiated.");
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER");
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("CALL BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("CALL BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (ITM)
    var strikeOne = roundedPrice - (strikePriceIncrement * 2);
    var strikeTwo = roundedPrice - (strikePriceIncrement * 3);
    var strikeThree = roundedPrice - (strikePriceIncrement * 4);

    var tradeSymbolOne = fetchTradeSymbol(indexNeo, "CE", strikeOne);
    var tradeSymbolTwo = fetchTradeSymbol(indexNeo, "CE", strikeTwo);
    var tradeSymbolThree = fetchTradeSymbol(indexNeo, "CE", strikeThree);
    
    // placing order for CALL
    
    var orderStatusOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolOne, "0");
      
      if (orderStatusOne) { 

        logMessage("CALL Buy order ONE completed.");

      } else {
          logMessage("CALL Buy order ONE failed.");
          sendMessage("CALL Buy order ONE failed.");
          return '🚨 CALL BUY executed ONE failed!';
      }

    var orderStatusTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolTwo, "0");
      
      if (orderStatusTwo) {

        logMessage("CALL Buy order TWO completed.");

      } else {
          logMessage("CALL Buy order TWO failed.");
          sendMessage("CALL Buy order TWO failed.");
          return '🚨 CALL BUY executed TWO failed!';
      }
    
    var orderStatusThree = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolThree, "0");
      
      if (orderStatusThree) {

        logMessage("CALL Buy order THREE completed.");

      } else {
          logMessage("CALL Buy order THREE failed.");
          sendMessage("CALL Buy order THREE failed.");
          return '🚨 CALL BUY executed THREE failed!';
      }
  if (orderStatusOne && orderStatusTwo && orderStatusThree) {
    
    var securityIdOne = fetchSecurityId(indexNeo, "CE", strikeOne);
    var securityIdTwo = fetchSecurityId(indexNeo, "CE", strikeTwo);
    var securityIdThree = fetchSecurityId(indexNeo, "CE", strikeThree);

    var priceOne = getLTP(securityIdOne, optionSegment, optionInstrument);
    var priceTwo = getLTP(securityIdTwo, optionSegment, optionInstrument);
    var priceThree = getLTP(securityIdThree, optionSegment, optionInstrument);
    
    var data = [
    [securityIdOne, tradeSymbolOne, strikeOne, priceOne],
    [securityIdTwo, tradeSymbolTwo, strikeTwo, priceTwo],
    [securityIdThree, tradeSymbolThree, strikeThree, priceThree]
    ];
  
  // Set the range from B6 to E8 and set values
    sheet.getRange(6, 2, data.length, data[0].length).setValues(data);

    logMessage("All CALL Buy order completed.");
    return 'All CALL BUY executed successfully!';

  } else {
    logMessage("Something went wrong with CALL Buy order.");
    sendMessage("Something went wrong with CALL Buy order.");
    return '🚨 Something went wrong with CALL Buy order!';
  }
}

function putBuy() {
      logMessage("PUT Buy is Initiated.");
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");

        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;

    var realTimePrice = getLTP(exchangeSecurityId, exchangeSegment, exchangeInstrument);
    
    if (realTimePrice == false) {

        logMessage("PUT BUY: Error fetching real-time price, examine the error logs.");
        sendMessage("PUT BUY: Error fetching real-time price, examine the error logs.");
        deleteSpecificTrigger("masterTrigger");
        return;

    }

    // Round the real-time price to the nearest strike price increment
    var roundedPrice = (Math.floor(realTimePrice / strikePriceIncrement)) * strikePriceIncrement;
    
    // fetching securityId and tradeSymbol with the rounded price (ITM)
    var strikeOne = roundedPrice + (strikePriceIncrement * 2);
    var strikeTwo = roundedPrice + (strikePriceIncrement * 3);
    var strikeThree = roundedPrice + (strikePriceIncrement * 4);

    var tradeSymbolOne = fetchTradeSymbol(indexNeo, "PE", strikeOne);
    var tradeSymbolTwo = fetchTradeSymbol(indexNeo, "PE", strikeTwo);
    var tradeSymbolThree = fetchTradeSymbol(indexNeo, "PE", strikeThree);
    
    // placing orders for PUT at different strikes
    
    var orderStatusOne = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolOne, "0");
      
      if (orderStatusOne) { 

        logMessage("PUT Buy order ONE completed.");

      } else {
          logMessage("PUT Buy order ONE failed.");
          sendMessage("PUT Buy order ONE failed.");
          return '🚨 PUT BUY executed ONE failed!';
      }

    var orderStatusTwo = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolTwo, "0");
      
      if (orderStatusTwo) {

        logMessage("PUT Buy order TWO completed.");

      } else {
          logMessage("PUT Buy order TWO failed.");
          sendMessage("PUT Buy order TWO failed.");
          return '🚨 PUT BUY executed TWO failed!';
      }
    
    var orderStatusThree = placeNeoOrder("B", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolThree, "0");
      
      if (orderStatusThree) {

        logMessage("PUT Buy order THREE completed.");

      } else {
          logMessage("PUT Buy order THREE failed.");
          sendMessage("PUT Buy order THREE failed.");
          return '🚨 PUT BUY executed THREE failed!';
      }
  if (orderStatusOne && orderStatusTwo && orderStatusThree) {
    
    var securityIdOne = fetchSecurityId(indexNeo, "PE", strikeOne);
    var securityIdTwo = fetchSecurityId(indexNeo, "PE", strikeTwo);
    var securityIdThree = fetchSecurityId(indexNeo, "PE", strikeThree);

    var priceOne = getLTP(securityIdOne, optionSegment, optionInstrument);
    var priceTwo = getLTP(securityIdTwo, optionSegment, optionInstrument);
    var priceThree = getLTP(securityIdThree, optionSegment, optionInstrument);

    var data = [
    [securityIdOne, tradeSymbolOne, strikeOne, priceOne],
    [securityIdTwo, tradeSymbolTwo, strikeTwo, priceTwo],
    [securityIdThree, tradeSymbolThree, strikeThree, priceThree]
    ];
  
    // Set the range from B9 to E11 and set values
    sheet.getRange(9, 2, data.length, data[0].length).setValues(data);

    logMessage("All PUT Buy order completed.");
    return 'All PUT BUY executed successfully!';

  } else {
    logMessage("Something went wrong with PUT Buy order.");
    sendMessage("Something went wrong with PUT Buy order.");
    return '🚨 Something went wrong with PUT Buy order!';
  }
}

function squareOff() {

    logMessage("Square off is Initiated.");
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

        logMessage("SHORT ORDER: Today is not a trading day. Bye bye!");
        deleteSpecificTrigger("masterTrigger");
        return;
    }
    
    // multiplying with lot size
    var lotSize = sheet.getRange("B1").getValue();
    var quantity = quantity * lotSize;
    
    var tradeSymbolsCall = sheet.getRange("C6:C8").getValues();
    // Extract individual trade symbols
    var tradeSymbolCallOne = tradeSymbolsCall[0][0];
    var tradeSymbolCallTwo = tradeSymbolsCall[1][0];
    var tradeSymbolCallThree = tradeSymbolsCall[2][0];


    if (tradeSymbolCallOne) {

      var orderStatusCallOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallOne, "0");
      
      if (orderStatusCallOne) { 

          sheet.getRange("B6:E6").clearContent();

        logMessage("CALL Square-off order ONE completed.");

      } else {
          logMessage("CALL Square-off order ONE failed.");
          sendMessage("CALL Square-off order ONE failed.");
          return '🚨 CALL Square-off executed ONE failed!';
      }
    }
    if (tradeSymbolCallTwo) {
      
      var orderStatusCallTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallTwo, "0");
      
      if (orderStatusCallTwo) { 

            sheet.getRange("B7:E7").clearContent();
        logMessage("CALL Square-off order TWO completed.");

      } else {
          logMessage("CALL Square-off order TWO failed.");
          sendMessage("CALL Square-off order TWO failed.");
          return '🚨 CALL Square-off executed TWO failed!';
      }
      
    }
    if (tradeSymbolCallThree) {
      
      var orderStatusCallThree = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolCallThree, "0");
      
      if (orderStatusCallThree) { 
          sheet.getRange("B8:E8").clearContent();
        logMessage("CALL Square-off order THREE completed.");

      } else {
          logMessage("CALL Square-off order THREE failed.");
          sendMessage("CALL Square-off order THREE failed.");
          return '🚨 CALL Square-off executed THREE failed!';
      }
      
    }
  
    var tradeSymbolsPut = sheet.getRange("C9:C11").getValues();

    // Extract individual trade symbols
    var tradeSymbolPutOne = tradeSymbolsPut[0][0];
    var tradeSymbolPutTwo = tradeSymbolsPut[1][0];
    var tradeSymbolPutThree = tradeSymbolsPut[2][0];
  
    if (tradeSymbolPutOne) {

      var orderStatusPutOne = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutOne, "0");
      
      if (orderStatusPutOne) { 
          sheet.getRange("B9:E9").clearContent();
        logMessage("PUT Square-off order ONE completed.");

      } else {
          logMessage("PUT Square-off order ONE failed.");
          sendMessage("PUT Square-off order ONE failed.");
          return '🚨 PUT Square-off executed ONE failed!';
      }
    }
    if (tradeSymbolPutTwo) {
      
      var orderStatusPutTwo = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutTwo, "0");
      
      if (orderStatusPutTwo) { 
          sheet.getRange("B10:E10").clearContent();
        logMessage("PUT Square-off order TWO completed.");

      } else {
          logMessage("PUT Square-off order TWO failed.");
          sendMessage("PUT Square-off order TWO failed.");
          return '🚨 PUT Square-off executed TWO failed!';
      }
      
    }
    if (tradeSymbolPutThree) {
      
      var orderStatusPutThree = placeNeoOrder("S", exchangeSegmentNeo, "NRML", "MKT", quantity, tradeSymbolPutThree, "0");
      
      if (orderStatusPutThree) { 
          sheet.getRange("B11:E11").clearContent();
        logMessage("PUT Square-off order THREE completed.");

      } else {
          logMessage("PUT Square-off order THREE failed.");
          sendMessage("PUT Square-off order THREE failed.");
          return '🚨 PUT Square-off executed THREE failed!';
      }
      
    }

      var tradeSymbols = sheet.getRange("C6:C11").getValues();

      // Extract individual trade symbols for calls and puts
      var tradeSymbolCallOne = tradeSymbols[0][0];
      var tradeSymbolCallTwo = tradeSymbols[1][0];
      var tradeSymbolCallThree = tradeSymbols[2][0];
      var tradeSymbolPutOne = tradeSymbols[3][0];
      var tradeSymbolPutTwo = tradeSymbols[4][0];
      var tradeSymbolPutThree = tradeSymbols[5][0];


    if (!tradeSymbolCallOne && !tradeSymbolCallTwo && !tradeSymbolCallThree && !tradeSymbolPutOne && !tradeSymbolPutTwo && !tradeSymbolPutThree) {
      
      logMessage("Square Off Completed");
      return 'SQUARE OFF executed successfully!';
    } else {
      logMessage("Something went wrong with Square-off order.");
      sendMessage("Something went wrong with Square-off order.");
      return '🚨 Something went wrong with Square-off order!';
    }

}
