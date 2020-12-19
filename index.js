const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cyf_hotels',
    password: 'migracode',
    port: 5432
});
// Exercise 1 //


// POST HOTELS AND CUSTOMERS ///

app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

pool
    .query("SELECT * FROM hotels WHERE name=$1;", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((e) => console.error(e));
      }
    });
});
 // post  customers //
 
app.post("/customers", function (req, res) {
  const newCustomersName = req.body.name;
  const newCustomersEmail = req.body.email;
  const newCustomersCity = req.body.city;
  const newCustomersAddress = req.body.address;

pool
    .query("SELECT * FROM customers WHERE name=$1", [newCurtomersName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An customers with the same name already exists!");
      } else {
        const query =
          "INSERT INTO curtomers (name, email, city, address) VALUES ($1, $2, $3, $4)";
        pool
          .query(query, [newCustomersName, newCustomersEmail, newCustomersCity, newCustomersAddress])
          .then(() => res.send("Customers created!"))
          .catch((e) => console.error(e));
      }
    });
});

///Exercise 2 ///

app.get("/hotels", function (req, res) {
  const hotelNameQuery = req.query.name;
  let query = `SELECT * FROM hotels ORDER BY name`;

  if (hotelNameQuery) {
    query = `SELECT * FROM hotels WHERE name LIKE '%${hotelNameQuery}%' ORDER BY name`;
  }

  pool
    .query(query)
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/hotels/:hotelId", function (req, res) {
  const hotelId = req.params.hotelId;

  pool
    .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.get("/customers", function (req, res) {
  pool
    .query("SELECT * FROM customers  ORDER BY name")
    .then((result) => res.json(result.rows))
    .catch((e) => res.status(400).send("Something went wrong"));
});

app.get("/customers/:customersId", function (req, res) {
  const customersId = req.params.customersId;
  console.log('this is my customersId', customersId)
  pool
    .query("SELECT * FROM customers  WHERE id=$1;",[customersId])
    .then((result) => res.json(result.rows))
    .catch((e) => res.status(400).send("Something went wrong"));
});

app.get("/customers/:customersId/bookings", function (req, res) {
  const customersId = req.params.customersID;
  pool
    .query("SELECT * FROM bookings  WHERE customer_id=$1;",[customersId])
    .then((result) => res.json(result.rows))
    .catch((e) => res.status(400).send("Something went wrong"));
});
 
// Exercises 3, put ///
app.patch("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;
  const newEmail = req.body.email;
  const newAddress = req.body.address;
  const newCity = req.body.city;
  const newPostcode = req.body.postcode;
  const newCountry = req.body.country;
  return pool
    .query("SELECT * FROM customers WHERE id=$1;", [customerId])
    .then((result) => {
      const customers = result.rows;
      const customer = customers[0];
      if (newEmail !== "" && newEmail !== undefined) {
        customer.email = newEmail;
      }
      if (newAddress !== "" && newAddress !== undefined) {
        customer.address = newAddress;
      }
      if (newCity !== "" && newCity !== undefined) {
        customer.city = newCity;
      }
      if (newPostcode !== "" && newPostcode !== undefined) {
        customer.postcode = newPostcode;
      }
      if (newCountry !== "" && newCountry !== undefined) {
        customer.country = newCountry;
      }
      pool
        .query(
          `
          UPDATE customers
          SET email=$1, address=$2, city=$3, postcode=$4, country=$5
          WHERE id=$6;
          `,
          [
            customer.email,
            customer.address,
            customer.city,
            customer.postcode,
            customer.country,
            customer.id,
          ]
        )
        .then(() => res.send(`Customer ${customerId} updated!`))
        .catch((e) => {
          console.error(e.stack);
          res.status(500).send("Internal Server Error");
        });
    });
});

/// Delect customersId//

app.delete("/customers/:customerId", function (req, res) {
  const customerId = req.params.customerId;

  pool
    .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
    .then(() => {
      pool
        .query("DELETE FROM customers WHERE id=$1", [customerId])
        .then(() => res.send(`Customer ${customerId} deleted!`))
        .catch((e) => console.error(e));
    })
    .catch((e) => res.status(400).send("Something went wrong"));
});


/// Delect Hotels //

app.delete("/hotels/:hotelId", function (req, res) {
  const hotelId = req.params.hotelId;

  pool
    .query("DELETE FROM bookings WHERE hotelId=$1", [hotelId])
    .then((result) => {
      if (result.rows.length >0){
        return res.status(400),send("The Hotels still has a bookings")
      }
      pool
        .query("DELETE FROM hotels WHERE id=$1", [hotelId])
        .then(() => res.send(`Hotel ${hotelId} deleted!`))
        .catch((e) => res.status(400).send("Something went wrong"));
    })
    .catch((e) => res.status(400).send("Something went wrong"));
});

app.listen(3000, function() {
    console.log("Server is listening on port 3000. Ready to accept requests!");
});

