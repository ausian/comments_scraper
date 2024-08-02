const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSources = async (req, res) => {
  try {
    const sources = await prisma.source.findMany();
    res.json(sources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSource = async (req, res) => {
  try {
    const { name, text } = req.body;
    const newSource = await prisma.source.create({
      data: { name, text },
    });
    res.status(201).json(newSource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getSources, createSource };
