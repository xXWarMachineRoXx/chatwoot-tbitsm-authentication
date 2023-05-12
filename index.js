

// Define a GET endpoint at the root path
//const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const { Builder, By, Key, until } = require('selenium-webdriver');
const express = require('express'); // Import Express library
const app = express(); // Create an instance of the Express application
const cors = require('cors'); // Import the cors middleware
const bodyParser = require('body-parser');

const axios = require('axios');




// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

async function example(email, password) {
    //  let options = new chrome.Options();
    //let driver = await new Builder()
    //.forBrowser('chrome')
    // .setChromeOptions(options)
    //.build();

    let options = new firefox.Options();
    let driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();

    try {
        await driver.get('http://192.168.1.80:3000');
        await driver.wait(until.titleContains('Chatwoot'), 12000);

        let statusCode = 0;
        await axios.get('http://192.168.1.80:3000').then(response => {
            statusCode = response.status;
        }).catch(error => {
            console.error(error);
        });

        if (statusCode === 200) {
            let emailInput = await driver.findElement(By.xpath('//*[@id="app"]/main/section[2]/div/div[1]/form/label[1]/input'));
            await emailInput.sendKeys(email);
            console.log('sending email')

            let passwordInput = await driver.findElement(By.xpath('//*[@id="app"]/main/section[2]/div/div[1]/form/label[2]/input'));
            await passwordInput.sendKeys(password);

            console.log('sending password')
            await passwordInput.sendKeys(Key.RETURN);

            await driver.wait(until.elementLocated(By.xpath('//*[@id="app"]/div[1]/section/section/div[1]/div[3]/ul/li[1]')), 12000);

            let cookies = await driver.manage().getCookies();
            console.log(JSON.stringify(cookies, null, 2));
            return cookies;
        } else if (statusCode === 500) {
            console.log(` returned a 500 status code`);
            return 500;
        } else {
            console.log(` returned a status code of ${statusCode}`);
            return "status Code" + statusCode;
        }
    } finally {
        await driver.quit();
    }
};




app.use(cors());
console.log('started ');


// Define a POST  endpoint at the root path
app.post('/', (req, res) => {
    email = req.body.email;
    password = req.body.password;
    example(email, password)
        .then((cookies) => {
            if (cookies == 500) {
                res.sendStatus('500');
            } else {
                console.log(cookies);
                res.send(cookies);
                return cookies;
            }
        })
        .catch((error) => {
            console.error('Error in example function:', error);
        });
});

const port = 3002; // Define the port number for the server to listen on

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Log a message to the console when the server is started
});



