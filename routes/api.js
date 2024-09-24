const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
router.get("search",async (req, res) => {
 const {q,departmentId} = req.query;
 const URL = `https://collectionapi.metmuseum.org/public/collection/v1/`;
  





});