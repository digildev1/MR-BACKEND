const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const apicache = require("apicache")



dotenv.config();

app.use(cors());

let cache = apicache.middleware
app.use(cache('5 minutes'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: false }));
app.use(express.json())
// testing
app.get('/', (req, res) => res.send("hello World"))

try {
    mongoose.connect(process.env.DATABASE, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true
    }).then(() => {
        console.log("Database connected To ATLAS");
    });
} catch (e) {
    console.error(e);
}


const mrRouter = require('./routes/mr');
const doctorRouter = require('./routes/doctor');
const patientRouter = require("./routes/patient");

app.use('/api', mrRouter);
app.use('/api', doctorRouter);
app.use("/api", patientRouter);




app.listen(3333, () => {
    console.log("server is running at ", 3333)
})