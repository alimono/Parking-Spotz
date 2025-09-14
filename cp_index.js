//Parking Spotz Car Park - Parking Space Booking API
const express = require("express"); //Import express
const app = express(); //Use express via app
require("dotenv").config(); //Import dotenv to process sensitive info from .env file
const mysql = require("mysql2"); //Import mysql2

const PORT = 3000; //localhost:3000 in chrome browser

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); //function to run server

app.use(express.json()); //Parse JSON

console.log("DB_USER:", process.env.DB_USER); //Debugging to ensure .env is working correctly

const pool = mysql.createPool({
  host: "localhost", // MySQL server host
  user: process.env.DB_USER, // MySQL user
  password: process.env.DB_PASSWORD, // MySQL password
  database: process.env.DB_DATABASE, // MySQL database name
  multipleStatements: true, //Enable multiple SQL statements in one query
  waitForConnections: true, //Queue requests when all connections are in use
  connectionLimit: 10, //Maximum connnections allowed in pool
  queueLimit: 0, //Limit on queued connection requests
});

//API Homepage - Initial API connection check
//Check this works in Postman. http://localhost:3000/home in Chrome
app.get("/home", (req, res) => {
  res.send("Welcome to the car park home page!");
});

//Check which parking spaces are available
app.get("/parkingspaces", (req, res) => {
  const sql = `
  SELECT * FROM parking_spaces 
  WHERE availability = 1;
  `;
  pool.query(sql, (err, results) => {
    if (err) {
      console.log(`Error fetching available parking spaces: ${err}`);
      return res.status(500).json({ error: `${err}` });
    }
    return res.status(200).json(results);
  });
});

//Create a booking for a parking space. Update parking availability and special requirements.
//A nested pool query is required to prevent multiple bookings for the same space. 
//Bookings can only be made if a space is available.
app.post("/create-booking", (req, res) => {
  const { full_name, booking_length, parking_space } = req.body;
  //Check if space is available to book first
  const sqlAvail = `
  SELECT availability 
  FROM parking_spaces
  WHERE parking_space = ?;
  `;
  pool.query(sqlAvail, [parking_space], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `${err}` });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "This parking space does not exist" }); //Name of parking space should match existing spaces
    }
    if (result[0].availability === 0) {
      return res
        .status(409)
        .json({ error: `Parking space ${parking_space} is already booked` }); 
    }
    //If available, proceed to book space. Update availability and any special requirements once booked.
    const sqlBook = `
    INSERT INTO parking_booking (full_name, booking_length, booking_start_time, booking_end_time, parking_space)
    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR), ?);

    UPDATE parking_spaces 
    SET availability = 0 
    WHERE parking_space = ? AND availability = 1;
    
    UPDATE parking_booking
    INNER JOIN parking_spaces ON parking_booking.parking_space = parking_spaces.parking_space
    SET parking_booking.special_requirements = parking_spaces.space_type
    WHERE parking_booking.parking_space = ?;
    `; //multiple SQL queries return multiple results stored in an array
    pool.query(
      sqlBook,
      [
        full_name,
        booking_length,
        booking_length,
        parking_space,
        parking_space,
        parking_space,
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: `${err}` });
        }
        if (results[1].affectedRows === 0) {
          return res.status(501).json({
            error: `Availability for ${parking_space} failed to update`,
          });
        }
        if (results[2].affectedRows === 0) {
          return res.status(501).json({
            error: `Special requirements for ${parking_space} failed to update`,
          });
        }
        return res.status(201).json({
          id: results[0].insertId,
          message: `Parking space ${parking_space} for ${full_name} successfully booked`,
        });
      }
    );
  });
});

//Retrieve all bookings
app.get("/bookings", (req, res) => {
  const sql = "SELECT * FROM parking_booking";
  pool.query(sql, (err, results) => {
    if (err) {
      console.error(`Error fetching parking bookings: ${err}`);
      return res.status(500).json({ error: `${err}` });
    }
    return res.status(200).json(results);
  });
});

//Update the booking to extend the booking time.
app.put("/update-booking/:id", (req, res) => {
  const bookingId = req.params.id;
  const {full_name, booking_length, parking_space} = req.body;
  const sql = `
    UPDATE parking_booking
    SET booking_length = ?
    WHERE booking_id = ?;
    `;
  pool.query(sql, [booking_length, bookingId], (err, results) => {
    if (err) {
        return res.status(500).json({error: `${err}`})
    }
    if (results.affectedRows === 0) {
        return res.status(404).json({error: `Parking booking ${bookingId} not found`}) //Booking ID should be valid
    }
    return res.status(200).json({message: `Parking booking length updated to ${booking_length} hours`})
  });
});

//Cancel a booking
app.delete("/delete-booking/:id", (req, res) => {
  const bookingId = req.params.id;
  const sql = `
    DELETE FROM parking_booking 
    WHERE booking_id = ?;
    `;
  pool.query(sql, [bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: `${err}` });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Parking booking ${bookingId} not found` });
    }
    return res
      .status(200)
      .json({ message: `Booking ${bookingId} successfully deleted` });
  });
});
