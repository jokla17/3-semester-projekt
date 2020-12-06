const { jsPDF } = require("jspdf");

const doc = new jsPDF();

exports.saveAsPdf = (callback) => {
  let prodProcessedCount = callback.Logs.ProdProcessedCount[callback.Logs.ProdProcessedCount.length - 1];
  let prodDefectiveCount = callback.Logs.ProdDefectiveCount[callback.Logs.ProdDefectiveCount.length - 1];

  let productType = null;
  switch (callback.ProductType) {
      case 0: productType = "Pilsner"; break;
      case 1: productType = "Wheat"; break;
      case 2: productType = "IPA"; break;
      case 3: productType = "Stout"; break;
      case 4: productType = "Ale"; break;
      case 5: productType = "Alchohol-free"; break;
  }

  doc.setFontSize(16);
  doc.text("Batch report (" + callback.BatchId + ")\n\n", 15, 30);
  doc.text("Date and time: " + callback.DateTime + 
  "\n\nProduct type: " + productType + 
  "\n\nProcessed products: " + prodProcessedCount +
  "\n\nAcceptable products: " + (prodProcessedCount - prodDefectiveCount) +
  "\n\nDefective products: " + prodDefectiveCount + 
  "\n\nSpeed (Products pr. minute): " + callback.Speed +
  "\n\nAmount of time used: " + (callback.TimeSpent / 1000).toFixed(0) + " sec" +
  "\n\nOverall Equipment Effectiveness: " + callback.OEE.toFixed(0) + "%" +
  "\n\nError: " + callback.Error + 
  "\n\nResources used: " + 
  "\n\nBarley: " + (35000 - callback.Inventory.Barley) + "g" +
  "\n\nYeast: " + (35000 - callback.Inventory.Yeast)  + "g" +
  "\n\nHops: " + (35000 - callback.Inventory.Hops)  + "g" +
  "\n\nMalt: " + (35000 - callback.Inventory.Malt)  + "g" +
  "\n\nWheat: " + (35000 - callback.Inventory.Wheat) + "g" 
  , 15, 50);

  doc.save("../../../batchreport" + callback.BatchId + ".pdf");
}
