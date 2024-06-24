# Card Game API

## Setup Instructions

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with the following content:
    ```
    JWT_SECRET=your_secret_key
    PORT=3000
    ```
4. Start the server: `npm start`

## Endpoints

### Authentication
- `POST /getToken`: Authenticate user and return a JWT token.

### Card Management
- `GET /cards`: Retrieve all cards with optional query parameters for filtering.
- `POST /cards/create`: Create a new card (requires JWT).
- `PUT /cards/:id`: Update an existing card (requires JWT).
- `DELETE /cards/:id`: Delete an existing card (requires JWT).

### Additional Features
- `GET /sets`: Retrieve a list of all card sets.
- `GET /types`: Retrieve a list of all card types.
- `GET /rarities`: Retrieve a list of all card rarities.
- `GET /cards/count`: Retrieve the total number of cards.
- `GET /cards/random`: Retrieve information about a randomly selected card.
