import express from "express";
import { prisma } from "../lib/prisma";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.post('/api/data', async (req, res) => {
    const { title, author, description, price } = req.body;
    try {
        const data = await prisma.book.create({
            data: {
                title,
                author,
                description,
                price: parseFloat(price),
            },
        });
        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create book" });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await prisma.book.findMany();
        if (data.length === 0) {
            return res.json([]);
        }
        else {
            res.json(data);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch books" });
    }
});

app.put ('/api/data/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, description, price } = req.body;
    try {
        const data = await prisma.book.update({
            where: { bookId: id },
            data: {
                title,
                author,
                description,
                price,
            },
        });
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update book" });
    }
});

app.delete('/api/data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.book.delete({
            where: { bookId: id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete book" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
