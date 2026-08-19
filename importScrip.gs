function importCSVData() {
  const sheetName = "SCRIP";
  const date = new Date();
  const formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // URLs for the CSV files
  const nseUrl = `https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/${formattedDate}/transformed/nse_fo.csv`;
  const bseUrl = `https://lapi.kotaksecurities.com/wso2-scripmaster/v1/prod/${formattedDate}/transformed/bse_fo.csv`;

  // Fetch and process the CSV files
  const nseData = fetchAndProcessCSV(nseUrl, 'nse');
  const bseData = fetchAndProcessCSV(bseUrl, 'bse');

  // Combine both data arrays without duplicating headers
  const combinedData = [...nseData, ...bseData.slice(1)]; // Remove the header from bseData

  // Clear previous data and set new data
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.clear();
  sheet.getRange(1, 1, combinedData.length, combinedData[0].length).setValues(combinedData);
}

function fetchAndProcessCSV(url, type) {
  const response = UrlFetchApp.fetch(url);
  const csvData = response.getContentText();
  const rows = Utilities.parseCsv(csvData);
  
  // Updated header and selected indices
  const header = ["pSymbol", "pSymbolName", "pTrdSymbol", "pOptionType", "lExpiryDate", "dStrikePrice"];
  const selectedIndices = [0, 4, 5, 6, 17, 20]; // Adjusted indices to match new header

  const today = new Date();
  const daysLater = new Date();
  daysLater.setDate(today.getDate() + 6); // Fetch two days data only.

  const filteredData = rows
    .slice(1) // Skip header
    .map(row => {
      const selectedRow = selectedIndices.map(index => {
        if (index === 20) { // Adjust for dStrikePrice
          return parseFloat(row[index]) / 100; // Divide dStrikePrice by 100
        }
        return row[index];
      });

      let lExpiryDate;
      if (type === 'nse') {
        const lExpiryDateEpoch = parseInt(selectedRow[4]); // Now at index 4
        lExpiryDate = new Date((lExpiryDateEpoch + 315513000) * 1000); // Convert to date
      } else if (type === 'bse') {
        const lExpiryDateEpoch = parseInt(selectedRow[4]); // Now at index 4
        lExpiryDate = new Date(lExpiryDateEpoch * 1000); // Convert to date
      }

      return {
        selectedRow: selectedRow,
        lExpiryDate: lExpiryDate, // Keep as Date object
        pSymbolName: selectedRow[1], // pSymbolName is at index 1
        pOptionType: selectedRow[3] // pOptionType is at index 3
      };
    })
    .filter(item => {
      // Filter based on the lExpiryDate, pSymbolName, and pOptionType
      return item.lExpiryDate <= daysLater &&
             item.lExpiryDate >= today && // Ensuring it’s not a past date
             ['NIFTY', 'BANKNIFTY', 'BSXOPT'].includes(item.pSymbolName) &&
             ['PE', 'CE'].includes(item.pOptionType);
    })
    .sort((a, b) => a.lExpiryDate - b.lExpiryDate) // Sort by lExpiryDate in ascending order
    .map(item => {
      // Return only the selected row with lExpiryDate as a Date object
      const selectedRow = item.selectedRow;
      selectedRow[4] = item.lExpiryDate; // Keep lExpiryDate as a Date object
      return selectedRow;
    });
  return [header, ...filteredData];
}
