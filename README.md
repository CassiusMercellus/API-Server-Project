# Card Game API

## Setup Instructions

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create a `.env` file with the following content:
    ```
    JWT_SECRET=your_secret_key
    PORT=3000
    ```
4. Start the server 

## Endpoints

### Authentication
- `POST /getToken`: Authenticate user and return a JWT token.

### Card Management
- To Create a card create a new card with a unique ID
- To edit a card create a new card with a matching ID the old data will be replaced with the new.
