import dotenv from "dotenv";
import connectDB from "./db/index.js";
import App from "./app.js";

dotenv.config({path: "./.env"});

connectDB()
.then(()=> {
    App.on("error", (err) => {
        console.log("Error!!", err);
        throw err;
    })
    App.listen(process.env.PORT || 8000,()=> {
        console.log(`App is listening on ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log(`MONGODB Connection Failed`, err);
})