const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getData = async (req, res) => {
  try {
    const { sourceId } = req.query;
    if (!sourceId) {
      return res.status(400).json({ error: "sourceId is required" });
    }
    const data = await prisma.data.findMany({
      where: { sourceId: parseInt(sourceId, 10) }
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
};

const createData = async (req, res) => {
  try {
    const { sourceId, urlId, author, date, text } = req.body;
    if (!sourceId || !urlId || !author || !date || !text) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newData = await prisma.data.create({
      data: { sourceId, urlId, author, date, text },
    });
    res.status(201).json(newData);
  } catch (error) {
    console.error('Error creating data:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getData, createData };
