import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: "paris6", name: "Paris6" },
    { id: "xian", name: "Xian" },
    { id: "stella", name: "Stella" },
    { id: "new-hakata", name: "New Hakata" },
    { id: "jardim-secreto", name: "Jardim Secreto" },
    { id: "mestre-cuca", name: "Mestre Cuca" },
    { id: "food-zone", name: "Food Zone" },
  ]);
});

export default router;
