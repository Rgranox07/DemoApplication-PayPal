// Importing required packages and modules
const express = require("express"); 
const bodyParser = require("body-parser");
const paypal = require("paypal-rest-sdk"); 
const path = require("path");  

// Creating an Express application
const app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // Setting the view engine to EJS for rendering dynamic content

// Serving static files from the 'public' directory
app.use(express.static("public"));

// Serving scripts from the 'public/scripts' directory
app.use("/scripts", express.static(path.join(__dirname, "public", "scripts")));

// Configuring PayPal with sandbox credentials
paypal.configure({
  mode: "sandbox",
  client_id:
    "Abcr7mxWbP-Cl8Tgp_aFuvUBVr7cMsP3TMi1Zoe8OaWSrVjJvIHCywMikbTExwSqIgeeV2fEbxznTh4a",
  client_secret:
    "ENfF0nj6QcKUn01aSdaNaWppAvz5R_poeZDN8Ke94FZyMrx_TTinrYnCkg2H5xedFriI0peyIxPDzQ1q",
});

// Defining route for the home page
app.get("/", (req, res) => {
  res.render("index");
});

// Handling payment initiation
app.post("/pay", (req, res) => {
  // Extracting amount from the request body
  const amount = req.body.amount;

  // Defining PayPal payment creation JSON
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "MEAN Stack Course",
              sku: "001",
              price: amount,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: amount,
        },
        description: "MEAN Stack Course Description",
      },
    ],
  };

  // Creating a PayPal payment
  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      // Logging and redirecting in case of an error
      console.error("Error creating payment:", error);
      res.redirect("/cancel");
    } else {
      // Redirecting to PayPal approval URL
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

// Defining route for successful payment
app.get("/success", (req, res) => {
  // Extracting PayerID and paymentId from the query parameters
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  // Defining PayPal payment execution JSON
  const execute_payment_json = {
    payer_id: payerId,
  };

  // Executing the PayPal payment
  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      // Logging and redirecting in case of an error
      console.error("Error executing payment:", error.response);
      res.redirect("/cancel");
    } else {
      // Logging payment details and redirecting to success page
      console.log("Payment details:", JSON.stringify(payment));
      res.redirect("/success");
    }
  });
});

// Defining route for canceled payment
app.get("/cancel", (req, res) => {
  // Logging payment cancellation and rendering cancel page
  console.log("Payment cancelled");
  res.render("cancel");
});

// Handling successful payment on the server
app.post("/pay/success", (req, res) => {
  // Logging transaction details and sending a success response
  console.log("Transaction details:", req.body);
  res.sendStatus(200);
});

// Setting the port for the server to listen on
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
