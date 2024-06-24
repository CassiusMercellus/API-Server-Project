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
- `GET /cards`: Retrieve all cards with optional query parameters for filtering.
- `POST /cards/create`: Create a new card (requires JWT).
- `PUT /cards/:id`: Update an existing card (requires JWT).
- `DELETE /cards/:id`: Delete an existing card (requires JWT).

### To Add
- Card Management needs to be fixed/implemented
    - Card Edit
    - Card Delete

