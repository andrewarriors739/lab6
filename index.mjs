import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "kf3k4aywsrp0d2is.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "pi6pecf84m2ipr7q",
    password: "oud4emmakd8vbotb",
    database: "vqht75c5og8l6ekg",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', async (req, res) => {
   let sql = `SELECT authorId, firstName, lastName
              FROM authors
              ORDER BY lastName`;
   const [authors] = await pool.query(sql);              
   res.render('home.ejs', {authors})
});


app.get('/searchByAuthor', async (req, res) => {
   let authorId = req.query.authorId;
   let sql = ``;
   const [rows] = await pool.query(sql);              
   res.render('quotes.ejs', {rows})
});
//Searching quotes by keyword
//NEVER have user input within the SQL statement!!
app.get("/searchByKeyword", async(req, res) => {
   try {
        //console.log(req);
        let keyword = req.query.keyword;
        let sql = `SELECT quote, firstName, lastName
                   FROM quotes
                   NATURAL JOIN authors
                   WHERE quote LIKE ? `;
        let sqlParams = [`%${keyword}%`];
        const [rows] = await pool.query(sql, sqlParams);
        res.render("quotes.ejs", {rows});
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest


app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})