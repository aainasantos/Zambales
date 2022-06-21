const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const path = require('path')


const app = express();




mongoose.connect('mongodb+srv://admin-aina:Godisgood26@cluster0.8ctzk.mongodb.net/loginInfo');

app.use(express.static("public"));
app.use('/lakwatsera_:userId', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");


let newName = [];
var existEmail; 


const weatherSchema = {
    city: String,
    temp: String,
    country: String,
    weatherDescription: String,
    icon: String,
}
const userSchema = {
    fName: String, 
    lName: String,
    email: String,
    weatherLocation: weatherSchema

}

const User = mongoose.model("User", userSchema);

const Weather = mongoose.model("Weather", weatherSchema);

let today =new Date();
let year = today.getFullYear();

app.get("/", function (req, res) {
    res.render("SignUp", {
        year : year
    });
});


app.get("/SignIn", function (req, res) {
    res.render("mailregistered", {
        year : year
    })
});
app.get("/SignIn%mail", function (req, res) {
    res.render("signin", {
        year : year
    })
});

app.get("/about", function(req, res){
    res.sendFile(__dirname+"/index.html")
});

app.get("/lakwatsera_:userId", function (req, res) {
    const userId = req.params.userId;
    User.findOne({
        _id: userId
    }, function (err, foundUser) {
        return res.render("index", {
            fName: foundUser.fName,
            userID: userId,
            year : year
        });
    });
});


app.get("/lakwatsera_:userId/weather", function (req, res) {
    const userId = req.params.userId;

    User.findOne({
        _id: userId
    }, function (err, foundUser) {
        return res.render("weather", {
            fName: foundUser.fName,
            userID: userId,
            year : year
        });
    });
});

app.get("/lakwatsera_:userId/weather_q=:location", async function (req, res) {
    const currentCity = req.params.location;
    const userId = req.params.userId;
    const quotes = ["The nicest thing about the RAIN is that it always sStop eventually. Keep on tracking the weather!⛈🌧🌨🌩",
    "SUN is shining, WEATHER is sweet, make you wanna have SUMMER BLAST!🌤⛅🌤"];

    User.findOne({
        _id: userId,
    }, function (err, foundUser) {
        if (foundUser) {

            return res.render("locationweather", {
                fName: foundUser.fName,
                userID: userId,
                cityName: foundUser.weatherLocation.city,
                countryName: foundUser.weatherLocation.country,
                tempNow: foundUser.weatherLocation.temp,
                tempUnit: "°C",
                description: foundUser.weatherLocation.weatherDescription,
                weatherIcon: "http://openweathermap.org/img/wn/" + foundUser.weatherLocation.icon + "@4x.png",
                quote : quotes,
                year : year
            });
        }
    });
});



app.post("/", function (req, res, e) {
    newName = req.body;
    User.findOne({
        email: newName.email
    }, function (err, foundEmail) {
        if (foundEmail) {
            res.redirect('/SignIn');
        } else {
            const user = new User({
                fName: newName.firstName,
                lName: newName.lastName,
                email: newName.email
            });

            user.save();

            if (newName.length != 0) {
                res.redirect('/lakwatsera_' + user._id);
            } else {
                console.log("Error!");
            }
        }
    });
});



app.post("/SignIn", function (req, res) {
    const existEmail = req.body.existedEmail;
    User.findOne({
        email: existEmail
    }, function (err, foundEmail) {
        if (foundEmail) {
            res.redirect("/lakwatsera_" + foundEmail._id);
        } else {
            res.redirect("/");
        }
    });


});

app.post("/SignIn%mail", function (req, res) {
    const existEmail = req.body.existedEmail;
    User.findOne({
        email: existEmail
    }, function (err, foundEmail) {
        if (foundEmail) {
            res.redirect("/lakwatsera_" + foundEmail._id);
        } else {
            res.redirect("/");
        }
    });
});


app.post("/lakwatsera_:userId/weather_q=", function (req, res) {
    const cityNow = req.body.currentCity;
    const userID = (req.params.userId);
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityNow + "&appid=46a6c83ac9a8cfbd41e306337310d4b7&units=metric";
        https.get(url, function (response) {
        response.on("data", function (data) {
            const weatherData = JSON.parse(data);

            const city = weatherData.name;
            const country = weatherData.sys.country;
            const temp = weatherData.main.temp;
            const weatherDescription = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;

            const newWeather = new Weather({
                city: city,
                country: country,
                temp: temp,
                weatherDescription: weatherDescription,
                icon: icon,
            });
            newWeather.save();
            User.findOneAndUpdate({
                _id: userID
            }, {
                weatherLocation: newWeather
            }, function (err, foundId) {
                if (err) {
                    console.log(err);
                }
            });
            res.redirect("/lakwatsera_" + userID + "/weather_q=" + city);
        });
    });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 4001;
}
app.listen(port, function () {
    console.log("Server has started successfully!")
});
