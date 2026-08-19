function fetchSecurityId(pSymbolName, pOptionType, dStrikePrice) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SCRIP");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Get the indices for the columns
  const pSymbolIndex = headers.indexOf('pSymbol');
  const pSymbolNameIndex = headers.indexOf('pSymbolName');
  const pOptionTypeIndex = headers.indexOf('pOptionType');
  const dStrikePriceIndex = headers.indexOf('dStrikePrice');

  // Loop through the rows to find the match
  for (let i = 1; i < data.length; i++) {
    if (data[i][pSymbolNameIndex] === pSymbolName &&
        data[i][pOptionTypeIndex] === pOptionType &&
        data[i][dStrikePriceIndex] === dStrikePrice) {
      return Math.floor(data[i][pSymbolIndex]).toString(); // Convert to string without decimal points
    }
  }
  logMessage("FETCH CSV: Unable to find the Security ID");
  sendMessage("FETCH CSV: Unable to find the Security ID");
  return;
}


function fetchTradeSymbol(pSymbolName, pOptionType, dStrikePrice) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SCRIP");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Get the indices for the columns
  const pTrdSymbolIndex = headers.indexOf('pTrdSymbol');
  const pSymbolNameIndex = headers.indexOf('pSymbolName');
  const pOptionTypeIndex = headers.indexOf('pOptionType');
  const dStrikePriceIndex = headers.indexOf('dStrikePrice');

  // Loop through the rows to find the match
  for (let i = 1; i < data.length; i++) {
    if (data[i][pSymbolNameIndex] === pSymbolName &&
        data[i][pOptionTypeIndex] === pOptionType &&
        data[i][dStrikePriceIndex] === dStrikePrice) {
      return data[i][pTrdSymbolIndex]; // Return pTrdSymbol
    }
  }
  logMessage("FETCH CSV: Unable to find the Trade Symbol");
  sendMessage("FETCH CSV: Unable to find the the Trade Symbol");
  return;
}

// function logSybmSecurity() {
//   var pSymbolName = "BSXOPT";
//   var pOptionType = "CE";
//   var dStrikePrice = 87700

//   var securityID = fetchSecurityId(pSymbolName, pOptionType, dStrikePrice)
//   Logger.log (securityID);
//   var tradeSymbol = fetchTradeSymbol(pSymbolName, pOptionType, dStrikePrice)
//   Logger.log(tradeSymbol);
// }
