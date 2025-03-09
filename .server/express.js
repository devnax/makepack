// express.ts
var express = (app) => {
  app.get("/api/*", (req, res) => {
    res.json({ message: "Hellow" });
  });
};
var express_default = express;
export {
  express_default as default
};
