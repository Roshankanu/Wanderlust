const mongoose=require("mongoose");
const Listing = require("../models/listing.js");
const initData=require("./data.js");


const Mongoose_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then(() => {
    console.log("Connecting to server");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(Mongoose_URL);
}

const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>(
      {...obj,owner:"6953dc0c9405298584d2a1ac"}
    ))
    await Listing.insertMany(initData.data);
    console.log("Data was initialised!!!!!");
    
}
const seedDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Database seeded");
};
seedDB().then(() => {
  mongoose.connection.close();
});
initDB();