import express from "express";
import fetch from "node-fetch";
const router = express.Router();
//Ruta para obtener todos los departamentos

router.get("/departments", async (req, res) => {
  try {
    const response = await fetch(
      "https://collectionapi.metmuseum.org/public/collection/v1/departments"
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
  }
});

//Ruta para hacer busquedas

router.get("/search", async (req, res) => {
  const { q, departmentId } = req.query;
  let URL = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${q}`;

  if (departmentId) {
    URL += `&departmentId=${departmentId}`;
  }

  try {
    const response = await fetch(URL);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
  }
});

export default router;
