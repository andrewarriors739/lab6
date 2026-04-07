import express from 'express';
import mysql from 'mysql2/promise';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
// Trying to push to github
const pool = mysql.createPool({
    host: "kf3k4aywsrp0d2is.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "pi6pecf84m2ipr7q",
    password: "oud4emmakd8vbotb",
    database: "vqht75c5og8l6ekg",
    connectionLimit: 10,
    waitForConnections: true
});

app.get('/', async (req, res) => {
    let sql = `SELECT authorId, firstName, lastName FROM authors ORDER BY lastName`;
    let quoteSql = `SELECT DISTINCT category FROM quotes ORDER BY category ASC`;
    const [authors] = await pool.query(sql);
    const [quotes] = await pool.query(quoteSql);

    res.render('home.ejs', {
        authors,
        quotes,
        keywordError: "",
        keyword: req.query.keyword || ""
    });
});

app.get('/searchByAuthor', async (req, res) => {
    try {
        let authorId = req.query.authorId;
        let sql = `SELECT q.quote, a.firstName, a.lastName, a.authorId FROM quotes q NATURAL JOIN authors a WHERE q.authorId = ?`;
        let sqlParams = [authorId];
        const [rows] = await pool.query(sql, sqlParams);
        res.render('quotes.ejs', { rows });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get('/searchByCategory', async (req, res) => {
    try {
        let category = req.query.category;
        let sql = `SELECT q.quote, a.firstName, a.lastName, a.authorId FROM quotes q NATURAL JOIN authors a WHERE q.category = ?`;
        let sqlParams = [category];
        const [rows] = await pool.query(sql, sqlParams);
        res.render('quotes.ejs', { rows });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get('/searchByLikes', async (req, res) => {
    try {
        let lLikes = req.query.lowerLikes;
        let uLikes = req.query.upperLikes;
        let sql = `SELECT q.quote, a.firstName, a.lastName, q.likes, a.authorId FROM quotes q NATURAL JOIN authors a WHERE q.likes BETWEEN ? AND ?`;
        let sqlParams = [lLikes, uLikes];
        const [rows] = await pool.query(sql, sqlParams);
        res.render('quoteLikes.ejs', { rows });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByKeyword", async (req, res) => {
    try {
        let keyword = (req.query.keyword || "").trim();

        if (keyword.length < 3) {
            let sql = `SELECT authorId, firstName, lastName FROM authors ORDER BY lastName`;
            let quoteSql = `SELECT DISTINCT category FROM quotes ORDER BY category ASC`;
            const [authors] = await pool.query(sql);
            const [quotes] = await pool.query(quoteSql);

            return res.render("home.ejs", {
                authors,
                quotes,
                keywordError: "Please enter at least 3 characters.",
                keyword
            });
        }

        let sql = `SELECT q.quote, a.firstName, a.lastName, a.authorId FROM quotes q NATURAL JOIN authors a WHERE q.quote LIKE ?`;
        let sqlParams = [`%${keyword}%`];
        const [rows] = await pool.query(sql, sqlParams);

        res.render("quotes.ejs", { rows });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/authorInfo", async (req, res) => {
    try {
        const authorId = req.query.authorId;

        let sql = `SELECT firstName, lastName, biography AS bio, portrait AS imagePath FROM authors WHERE authorId = ?`;
        const [rows] = await pool.query(sql, [authorId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Author not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error!" });
    }
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.listen(3000, () => {
    console.log("Express server running");
});