const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for authenticating JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send({ errorMessage: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ errorMessage: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Function to read cards.json
const readCardsFile = () => {
    const cardsFilePath = './data/cards.json';
    try {
        if (fs.existsSync(cardsFilePath)) {
            const cardsData = fs.readFileSync(cardsFilePath, 'utf-8');
            return JSON.parse(cardsData);
        } else {
            console.error('cards.json file not found.');
            return []; // Return an empty array if file does not exist
        }
    } catch (error) {
        console.error('Error reading cards data:', error);
        throw new Error('Error reading cards data.'); // Throw an error to propagate to caller
    }
};

// Function to write data to cards.json
const writeCardsFile = (data) => {
    const cardsFilePath = './data/cards.json';
    try {
        fs.writeFileSync(cardsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing cards data:', error);
        throw new Error('Error writing cards data.');
    }
};

// Root endpoint redirecting to login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Endpoint to fetch all cards
app.get('/cards', (req, res) => {
    try {
        const cards = readCardsFile();
        res.json(cards);
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Authentication endpoint
app.post('/getToken', (req, res) => {
    const { username, password } = req.body;
    console.log(`Attempting to log in with username: ${username}`);
    
    const users = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'));
    const user = users.find(u => u.username === username);
    
    if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).send({ errorMessage: 'Invalid credentials' });
    }
    
    if (password === user.password) {
        const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        console.log(`Authentication successful for user: ${username}`);
        res.redirect(`/home?token=${accessToken}`);
    } else {
        console.log(`Invalid password for user: ${username}`);
        res.status(401).send({ errorMessage: 'Invalid credentials' });
    }
});

// Home page
app.get('/home', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(401).send({ errorMessage: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ errorMessage: 'Invalid token' });
        }
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    });
});

// CRUD operations for cards
app.post('/cards/create', authenticateToken, (req, res) => {
    try {
        const cards = readCardsFile();
        const newCard = req.body;

        // Check if card ID exists
        const existingCardIndex = cards.findIndex(card => card.cardId === newCard.cardId);
        
        if (existingCardIndex !== -1) {
            // Update existing card
            cards[existingCardIndex] = newCard;
            writeCardsFile(cards);
            res.send({ successMessage: 'Card updated successfully', card: newCard });
        } else {
            // Add new card
            cards.push(newCard);
            writeCardsFile(cards);
            res.send({ successMessage: 'Card created successfully', card: newCard });
        }
    } catch (error) {
        console.error('Error processing card creation:', error);
        res.status(500).send({ errorMessage: 'Internal Server Error' });
    }
});

app.put('/cards/:id', authenticateToken, (req, res) => {
    const cards = readCardsFile();
    const { id } = req.params;
    const updatedCard = req.body;

    const cardIndex = cards.findIndex(card => card.cardId === id);
    if (cardIndex === -1) {
        return res.status(404).send({ errorMessage: 'Card not found' });
    }

    if (cards.some(card => card.cardId === updatedCard.cardId && card.cardId !== id)) {
        return res.status(400).send({ errorMessage: 'Card ID must be unique' });
    }

    cards[cardIndex] = { ...cards[cardIndex], ...updatedCard };
    writeCardsFile(cards);
    res.send({ successMessage: 'Card updated successfully', card: cards[cardIndex] });
});

app.delete('/cards/:id', authenticateToken, (req, res) => {
    const cards = readCardsFile();
    const { id } = req.params;

    const cardIndex = cards.findIndex(card => card.cardId === id);
    if (cardIndex === -1) {
        return res.status(404).send({ errorMessage: 'Card not found' });
    }

    const deletedCard = cards.splice(cardIndex, 1);
    writeCardsFile(cards);
    res.send({ successMessage: 'Card deleted successfully', card: deletedCard });
});

// Optional features
app.get('/sets', (req, res) => {
    const cards = readCardsFile();
    const sets = [...new Set(cards.map(card => card.set))];
    res.json(sets);
});

app.get('/types', (req, res) => {
    const cards = readCardsFile();
    const types = [...new Set(cards.map(card => card.type))];
    res.json(types);
});

app.get('/rarities', (req, res) => {
    const cards = readCardsFile();
    const rarities = [...new Set(cards.map(card => card.rarity))];
    res.json(rarities);
});

app.get('/cards/count', (req, res) => {
    const cards = readCardsFile();
    res.json({ count: cards.length });
});

app.get('/cards/random', (req, res) => {
    const cards = readCardsFile();
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    res.json(randomCard);
});

app.get('/createCard', (req, res) => {
    const token = req.query.token;
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Create Card</title>
        </head>
        <body>
            <h1>Create Card</h1>
            <form id="create-card-form">
                <label for="cardId">Card ID:</label>
                <input type="text" id="cardId" name="cardId" required><br>
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required><br>
                <label for="set">Set:</label>
                <input type="text" id="set" name="set" required><br>
                <label for="type">Type:</label>
                <input type="text" id="type" name="type" required><br>
                <label for="rarity">Rarity:</label>
                <input type="text" id="rarity" name="rarity" required><br>
                <button type="submit">Create Card</button>
            </form>

            <script>
                document.getElementById('create-card-form').addEventListener('submit', async function(event) {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const cardData = Object.fromEntries(formData.entries());

                    const token = new URLSearchParams(window.location.search).get('token');

                    const response = await fetch('/cards/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': \`Bearer \${token}\`
                        },
                        body: JSON.stringify(cardData)
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert(result.successMessage);
                    } else {
                        alert(result.errorMessage);
                    }
                });
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
