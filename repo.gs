// // Example usage
// function fetchPrices() {
//   var optionSegment = 'NSE_FNO';
//   var optionInstrument = 'OPTIDX';

//   var securityIdCallOne = '58568';
//   var securityIdCallTwo = '58581';
//   var securityIdPutOne = '58555';
//   var securityIdPutTwo = '58580';

//   // Fetch price data
//   var priceData = getMultiLTP([securityIdCallOne, securityIdCallTwo, securityIdPutOne, securityIdPutTwo], optionSegment);

//       // var priceCallOneL = getLTP(securityIdCallOne, optionSegment, optionInstrument);

//       // var priceCallTwoL = getLTP(securityIdCallTwo, optionSegment, optionInstrument);


//       // var pricePutOneL = getLTP(securityIdPutOne, optionSegment, optionInstrument); 
 
//       // var pricePutTwoL = getLTP(securityIdPutTwo, optionSegment, optionInstrument); 

//   // Extract prices into separate variables
//   var priceCallOne = priceData[securityIdCallOne] || null;
//   var priceCallTwo = priceData[securityIdCallTwo] || null;
//   var pricePutOne = priceData[securityIdPutOne] || null;
//   var pricePutTwo = priceData[securityIdPutTwo] || null;

//   Logger.log("Price Call One: " + priceCallOne);
//   Logger.log("Price Call Two: " + priceCallTwo);
//   Logger.log("Price Put One: " + pricePutOne);
//   Logger.log("Price Put Two: " + pricePutTwo);
//   // Logger.log("Price Call One Limit: " + priceCallOneL);
//   // Logger.log("Price Call Two Limit: " + priceCallTwoL);
//   // Logger.log("Price Put One Limit: " + pricePutOneL);
//   // Logger.log("Price Put Two Limit: " + pricePutTwoL);
// }
