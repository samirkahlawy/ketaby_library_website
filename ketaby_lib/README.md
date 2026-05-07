# Ketaby Library System

Ketaby Library is a fully-featured, Django-based web application designed to manage a modern digital and physical book library. It provides a seamless experience for library members to discover and borrow books, while equipping librarians with powerful tools to manage inventory and oversee library operations.

## ✨ Features

### For Library Members
*   **User Authentication**: Secure sign-up and login system.
*   **Book Discovery**: Browse the full catalog or search for specific books by title, author, or category.
*   **Borrowing System**: Borrow available books with a single click. The system tracks available copies and prevents users from borrowing the same book multiple times simultaneously.
*   **Personal Dashboard**: View active borrows, review reading history, and get dynamic book recommendations based on what you haven't read yet.
*   **Returns**: Easily return books to make them available for other members.

### For Librarians (Admins)
*   **Role-Based Access**: Dedicated admin dashboard protected by custom role checks.
*   **Analytics Dashboard**: Get a birds-eye view of library statistics, including total books, available inventory, active borrows, and total registered members.
*   **Inventory Management**: Full CRUD capabilities to add new books, edit existing details (title, author, cover image, total copies), and delete records from the catalog.
*   **Activity Monitoring**: View recent borrowing activity across the platform.

## 🛠️ Technology Stack

*   **Backend Framework**: Python / Django
*   **Database**: SQLite (Default)
*   **Frontend**: HTML5, Vanilla CSS, JavaScript
*   **Architecture**: Model-View-Template (MVT)

## 🚀 Local Setup & Installation

Follow these instructions to run the Ketaby Library System on your local machine.

### Prerequisites
*   Python 3.8+ installed on your system.

### Installation Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd ketaby_lib
   ```

2. **Create and activate a virtual environment**:
   *   **Windows**:
       ```powershell
       python -m venv venv
       .\venv\Scripts\activate
       ```
   *   **macOS/Linux**:
       ```bash
       python3 -m venv venv
       source venv/bin/activate
       ```

3. **Install Dependencies**:
   This project relies on Django. Install it via pip:
   ```bash
   pip install django
   ```

4. **Set up the Database**:
   Apply the Django migrations to build your local SQLite database schema.
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Run the Development Server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the Application**:
   Open your web browser and navigate to `http://127.0.0.1:8000/`.

## 📂 Project Structure

*   `ketaby_lib/`: The main Django project configuration folder (settings, main URLs).
*   `app_library/`: The core Django application containing the business logic.
    *   `models.py`: Database schema definitions (Book, Category, MemberProfile, BorrowRecord).
    *   `views.py`: Request handlers for user and admin features.
    *   `urls.py`: URL routing for the application.
    *   `templates/`: HTML templates for rendering the front-end.
    *   `static/`: Static assets (CSS, JS, Images).

## 💡 Usage Notes
*   When signing up for a new account, you can check the "Register as Librarian/Admin" box to gain access to the Admin Dashboard and inventory management features.
