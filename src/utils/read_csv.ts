import csvParser from "csv-parser";
import fs from "fs";
import { createData, getAllData } from "../controllers/dataController";

export type Unlabeled_Data = {
  label: string;
  text: string;
};


export async function populateMongoDB() {
  
  const filePath = "src/data/id_unlabeled_data.csv";
  //check if mongodb is empty
  const data = await getAllData();
  if (data && data.length > 0) {
    console.log(`\nDatabase is not empty, ${data.length} records found !`);
    return;
  } else {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const { text,id } = row;
        await createData(text,id);
      })
      .on("end", () => {
        console.log("\nDatabase populated successfully 🚀");
      })
      .on("error", (error) => {
        console.error("\n😪Error populating database", error);
      });
  }
}
