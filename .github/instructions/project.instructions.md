---
applyTo: '**'
---
This project is a React Router v7 applicaton. It uses Typescript and Shadcn UI components.
The backend will use an Express server with a Postgres database.
Images will be stored in an AWS S3 bucket.

The purpose of the project is to create a website where users can view art for various books. 
The primary usage involves looking at art by chapter for a book, so the user can be visually guided through a book's story when reading it.

The main features of the project include:
- User authentication (sign up, log in, log out)
- Viewing a list of books
- Viewing chapters for each book
- Viewing characcters, locations, and items associated with each book
- Viewing art associated with each chapter
- Admin interface for adding/editing books, chapters, and art
- Responsive design for mobile and desktop
- Search functionality to find books, chapters, characters, locations, and items

The project will be structured as follows:
- Frontend:
  - client/ folder
  - React Router v7
  - Typescript
  - Shadcn UI components
  
- Backend:
  - server/ folder
  - Express server
  - Postgres database

- Image storage:
  - AWS S3 bucket