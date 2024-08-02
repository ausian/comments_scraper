const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWebUrls = async (req, res) => {
  try {
    const { sourceId } = req.query;
    if (!sourceId) {
      return res.status(400).json({ error: "sourceId is required" });
    }
    const webUrls = await prisma.webURL.findMany({
      where: { sourceId: parseInt(sourceId, 10) }
    });
    res.json(webUrls);
  } catch (error) {
    console.error('Error fetching Web URLs:', error);
    res.status(500).json({ error: error.message });
  }
};

const createWebUrl = async (req, res) => {
  try {
    const { sourceId, url } = req.body;
    if (!sourceId || !url) {
      return res.status(400).json({ error: "sourceId and url are required" });
    }
    const newWebUrl = await prisma.webURL.create({
      data: { sourceId, url },
    });
    res.status(201).json(newWebUrl);
  } catch (error) {
    console.error('Error creating Web URL:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteWebUrl = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    await prisma.webURL.delete({
      where: { id: parseInt(id, 10) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting Web URL:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getWebUrls, createWebUrl, deleteWebUrl };
