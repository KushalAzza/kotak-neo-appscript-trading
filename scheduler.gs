function createDailyTrigger() {
  // Deletes the previous daily trigger if it exists
  deleteSpecificTrigger("createMasterTrigger");

  // Create a new daily time-based trigger that runs at 8:00 AM
  ScriptApp.newTrigger("createMasterTrigger")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();

    logMessage("SCHEDULER: Daily trigger intiated for 8AM daily.");

}

function createMasterTrigger() {
  // Deletes all previous master triggers to avoid duplicates
  deleteSpecificTrigger("masterTrigger");
  clearLog();
  // Create a new time-driven trigger that runs every minute
  ScriptApp.newTrigger("masterTrigger")
    .timeBased()
    .everyMinutes(1)
    .create();

    logMessage("SCHEDULER: Intiated for Master scheduler at 1 minute interval.");

}

function deleteSpecificTrigger(functionName) {
  // Get all triggers
  const triggers = ScriptApp.getProjectTriggers();
  
  // Loop through each trigger and delete only those that match the function name
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function masterTrigger() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Run only on weekdays
  if (day < 1 || day > 5) {
    deleteSpecificTrigger("masterTrigger"); 

    logMessage("SCHEDULER: Today is a weekend, Master scheduler has been exited. Bye! Bye!");

    return;
  }

  // Check if the time is after 4:00 PM
  if (hours >= 16) {
    clearData();
    deleteSpecificTrigger("masterTrigger"); // Delete only the master trigger after 4:00 PM
    logMessage("SCHEDULER: Time is 4:00 PM, cleared data and master scheduler has been exited. Bye! Bye!");
    return;
  }

  // Call specific functions based on the exact time
  const timeString = `${hours}:${minutes}`;
  switch (timeString) {
    case "9:5":
        logMessage("SCHEDULER: Scrip Master Importer & oAuthSession has started.");
        importCSVData();
        oAuthSession();
        // checkKeyExpiry();
        // fetchFunds();
      
        logMessage("SCHEDULER: Scrip Master Importer & oAuthSession has completed for 09:05 AM.");

      break;

    case "10:14":
      
        logMessage("SCHEDULER: Buy & Sell Entry orders has started");

      enterBuy();
      enterSell();

        logMessage("SCHEDULER: Buy & Sell Entry orders has completed for 10:14 AM.");

      break;

    case "15:26":
      
        logMessage("SCHEDULER: Buy & Sell Exit orders has started");

      exitSell();
      exitBuy();

        logMessage("SCHEDULER: Buy & Sell Exit has completed for 03:26 PM.");

      break;
    default:
      if (hours >= 9 && hours <= 15) {

        // intradaySession scheduler has started from 10:20 AM (620) to 15:25 PM (925)
        if (minutes % 5 === 0 && hours * 60 + minutes >= 620 && hours * 60 + minutes <= 925) {
          
          // logMessage("SCHEDULER: FAR Buy Rebalance has started");
          
          rebalanceBuy();

          // logMessage("SCHEDULER: FAR Buy Rebalance completed for 5 minutes interval");

        }

        // intradaySession scheduler has started from 10:16 AM (616) to 15:25 PM (925)
        if (minutes % 1 === 0 && hours * 60 + minutes >= 616 && hours * 60 + minutes <= 925) {
          
          // logMessage("SCHEDULER: NEAR Sell Rebalance has started");
          
          rebalanceSell();

          // logMessage("SCHEDULER: NEAR Sell Rebalance has completed for 1 minutes interval.");

        }

      }
      break;
  }
}
