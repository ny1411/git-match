const express = require("express");
const app = express();

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from backend!" });
});

app.use(express.json());

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
