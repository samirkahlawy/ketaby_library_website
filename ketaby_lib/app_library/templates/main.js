//بيعتمد بالكامل على الـ LocalStorage عشان يخزن البيانات كقاعدة بيانات محلية في المتصفح.
//----------------------------------------------------------------------------
//دي مجرد أسماء الـ Keys اللي هنستخدمها عشان نسجل ونقرا البيانات من الـ LocalStorage.
const BOOKS_STORAGE_KEY = "library_books_v1";
const SELECTED_BOOK_KEY = "library_selected_book_id";
/*  DEFAULT_BOOKS 
    تقوم بتوفير مجموعة من الكتب الافتراضية التي يتم استخدامها لملء المخزن المحلي 
    (localStorage) في حالة عدم وجود بيانات سابقة.
    كل كتاب يحتوي على خصائص مثل: 
    id (معرف فريد)، 
    title (عنوان الكتاب)，
    author (مؤلف الكتاب)，
    category (فئة الكتاب)，
    description (وصف الكتاب)，
    status (حالة الكتاب: متاح أو مستعار)，
    و borrowDate (تاريخ استعارة الكتاب إذا كان مستعارًا).
*/
const DEFAULT_BOOKS = [
    {
        id: 101,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        description: "A practical guide to writing clean, readable, and maintainable code.",
        status: "available",
        borrowDate: null
    },
    {
        id: 102,
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        description: "Powerful strategies to build good habits and break bad ones.",
        status: "borrowed",
        borrowDate: "2026-03-03"
    },
    {
        id: 103,
        title: "Deep Work",
        author: "Cal Newport",
        category: "Productivity",
        description: "Rules for focused success in a distracted world.",
        status: "available",
        borrowDate: null
    },
    {
        id: 104,
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        description: "A timeless novel about dreams and destiny.",
        status: "borrowed",
        borrowDate: "2026-03-05"
    }
    
];
/* showToast 
    تقوم بعرض رسالة مؤقتة (toast)
     على الشاشة لإعلام المستخدم بأحداث معينة، مثل نجاح عملية أو خطأ.
    تأخذ الرسالة ونوعها (مثل "info" أو "success")
     كوسائط，
     وتقوم بإنشاء عنصر HTML لعرض الرسالة， 
    ثم تزيله تلقائيًا بعد فترة قصيرة (2200 مللي ثانية). 
    إذا كان هناك رسالة أخرى معروضة بالفعل，
     فإنها تزيلها قبل عرض الرسالة الجديدة.
*/
function showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast-message");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2200);
}
/* seedBooksIfNeeded
    تقوم بملء المخزن المحلي (localStorage)
     بمجموعة من الكتب الافتراضية
     في حالة عدم وجود بيانات سابقة.
    بحيث تأخذ الكتب الافتراضية من الثابت DEFAULT_BOOKS
     وتخزينها في localStorage
     تحت المفتاح BOOKS_STORAGE_KEY
     إذا لم يكن هناك بيانات مخزنة بالفعل.
*/
function seedBooksIfNeeded() {
    const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKS));
    }
}
/* getBooks
    تقوم بإعادة قائمة الكتب المخزنة في localStorage.
    إذا لم توجد بيانات، فإنها تعيد قائمة فارغة.
    بحيث تستخدم seedBooksIfNeeded
     للتأكد من وجود بيانات افتراضية إذا لزم الأمر，
     ثم تحاول قراءة البيانات من localStorage
      وتحليلها كـ JSON.
    إذا حدث خطأ أثناء التحليل， فإنها تعيد قائمة الكتب الافتراضية وتخزينها في localStorage.
*/
function getBooks() {
    seedBooksIfNeeded();
    try {
        const books = JSON.parse(localStorage.getItem(BOOKS_STORAGE_KEY) || "[]");
        return Array.isArray(books) ? books : [];
    } catch (error) {
        localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKS));
        return [...DEFAULT_BOOKS];
    }
}
/* saveBooks
    تقوم بحفظ قائمة الكتب في localStorage.
*/
function saveBooks(books) {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
}
/* normalizeText
    تقوم بتطبيع النصوص (إزالة المسافات وتحويلها إلى أحرف صغيرة).
*/
function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}
/* formatBorrowDate
    تقوم بتنسيق تاريخ الاستعارة.
*/
function formatBorrowDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
/* getQueryBookId
   مسئولة عن استخراج معرف الكتاب من معلمات URL.
    تقوم بقراءة قيمة "id" من معلمات URL وتحويلها إلى رقم.
    إذا كانت القيمة صالحة (رقم موجب)، فإنها تعيد هذا الرقم.
    وإلا، فإنها تعيد null.
*/
function getQueryBookId() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    return Number.isFinite(id) && id > 0 ? id : null;
}
/* renderStatusBadge
    تقوم بعرض شارة حالة الكتاب (مستعار أو متوفر).
*/
function renderStatusBadge(status) {
    const isBorrowed = normalizeText(status) === "borrowed";
    return `<span class="status ${isBorrowed ? "borrowed" : "available"}">${isBorrowed ? "Borrowed" : "Available"}</span>`;
}
/* setSelectedBook
    تقوم بتعيين الكتاب المحدد في localStorage.
*/
function setSelectedBook(id) {
    localStorage.setItem(SELECTED_BOOK_KEY, String(id));
}
/* getSelectedBookId
    مسئولة عن الحصول على معرف الكتاب المحدد.
    في الأول تحاول الحصول على المعرف من معلمات URL
     باستخدام getQueryBookId.
    إذا لم يكن هناك معرف صالح في URL，
     فإنها تحاول قراءة المعرف من localStorage
     باستخدام المفتاح SELECTED_BOOK_KEY.
    إذا كان المعرف الموجود في localStorage
     صالحًا (رقم موجب)
     ， فإنها تعيد هذا المعرف.
    وإلا， فإنها تعيد null.
*/
function getSelectedBookId() {
    const queryId = getQueryBookId();
    if (queryId) return queryId;

    const savedId = Number(localStorage.getItem(SELECTED_BOOK_KEY));
    return Number.isFinite(savedId) && savedId > 0 ? savedId : null;
}
/* findBookById
    تقوم ببحث عن كتاب باستخدام معرفه.
*/
function findBookById(id) {
    return getBooks().find((book) => Number(book.id) === Number(id));
}
/* initBooksListPage
    تقوم بتهيئة صفحة قائمة الكتب.
*/
function initBooksListPage() {
    const tableBody = document.getElementById("booksListBody");
    if (!tableBody) return;

    const render = () => {
        const books = getBooks();
        tableBody.innerHTML = "";

        if (!books.length) {
            tableBody.innerHTML = `<tr><td colspan="6">No books available yet.</td></tr>`;
            return;
        }

        books.forEach((book) => {
            tableBody.insertAdjacentHTML(
                "beforeend",
                `<tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td>${renderStatusBadge(book.status)}</td>
                    <td><a href="book_details.html?id=${book.id}" data-book-id="${book.id}" class="book-details-link">View</a></td>
                </tr>`
            );
        });
    };

    render();

    tableBody.addEventListener("click", (event) => {
        const link = event.target.closest(".book-details-link");
        if (!link) return;
        const id = Number(link.dataset.bookId);
        if (id) setSelectedBook(id);
    });
}
/* initSearchPage
    تقوم بتهيئة صفحة البحث.
*/
function initSearchPage() {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("bookSearch");
    const tableBody = document.getElementById("searchResultsBody");
    const title = document.getElementById("searchResultsTitle");
    if (!form || !input || !tableBody) return;

    const render = (query = "") => {
        const books = getBooks();
        const searchValue = normalizeText(query);

        const filteredBooks = !searchValue
            ? books
            : books.filter((book) => {
                return [book.title, book.author, book.category, String(book.id)]
                    .some((item) => normalizeText(item).includes(searchValue));
            });

        tableBody.innerHTML = "";

        if (!filteredBooks.length) {
            tableBody.innerHTML = `<tr><td colspan="6">No results found.</td></tr>`;
            if (title) title.textContent = "Search Results (0)";
            return;
        }

        filteredBooks.forEach((book) => {
            tableBody.insertAdjacentHTML(
                "beforeend",
                `<tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td>${renderStatusBadge(book.status)}</td>
                    <td><a href="book_details.html?id=${book.id}" data-book-id="${book.id}" class="book-details-link">View Details</a></td>
                </tr>`
            );
        });

        if (title) title.textContent = `Search Results (${filteredBooks.length})`;
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        render(input.value);
        showToast("Search completed.", "info");
    });

    tableBody.addEventListener("click", (event) => {
        const link = event.target.closest(".book-details-link");
        if (!link) return;
        const id = Number(link.dataset.bookId);
        if (id) setSelectedBook(id);
    });

    render(new URLSearchParams(window.location.search).get("query") || "");
}
/* initBorrowedBooksPage
    تقوم بتهيئة صفحة الكتب المستعارة.
*/
function initBorrowedBooksPage() {
    const tableBody = document.getElementById("borrowedBooksBody");
    if (!tableBody) return;

    const borrowedBooks = getBooks().filter((book) => normalizeText(book.status) === "borrowed");
    tableBody.innerHTML = "";

    if (!borrowedBooks.length) {
        tableBody.innerHTML = `<tr><td colspan="5">You have not borrowed any books yet.</td></tr>`;
        return;
    }

    borrowedBooks.forEach((book) => {
        tableBody.insertAdjacentHTML(
            "beforeend",
            `<tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${formatBorrowDate(book.borrowDate)}</td>
                <td><a href="book_details.html?id=${book.id}" data-book-id="${book.id}" class="book-details-link">Details</a></td>
            </tr>`
        );
    });

    tableBody.addEventListener("click", (event) => {
        const link = event.target.closest(".book-details-link");
        if (!link) return;
        const id = Number(link.dataset.bookId);
        if (id) setSelectedBook(id);
    });
}
/* updateBookDetailsUI
    مسئول عن تحديث واجهة تفاصيل الكتاب بناءً على بيانات الكتاب المحدد.
    تأخذ كائن الكتاب كوسيط وتقوم بتحديث عناصر HTML
     المختلفة لعرض معلومات الكتاب，
     مثل المعرف， العنوان， المؤلف， الفئة， الوصف， الحالة
     ， وتحديث زر الاستعارة بناءً على حالة الكتاب。
*/
function updateBookDetailsUI(book) {
    const idEl = document.getElementById("bookIdValue");
    const titleEl = document.getElementById("bookTitleValue");
    const authorEl = document.getElementById("bookAuthorValue");
    const categoryEl = document.getElementById("bookCategoryValue");
    const descriptionEl = document.getElementById("bookDescriptionValue");
    const statusEl = document.getElementById("status");
    const borrowBtn = document.getElementById("borrowBtn");

    if (!book || !idEl || !titleEl || !authorEl || !categoryEl || !descriptionEl || !statusEl || !borrowBtn) return;

    idEl.textContent = String(book.id);
    titleEl.textContent = book.title;
    authorEl.textContent = book.author;
    categoryEl.textContent = book.category;
    descriptionEl.textContent = book.description;

    const borrowed = normalizeText(book.status) === "borrowed";
    statusEl.textContent = borrowed ? "Borrowed" : "Available";
    statusEl.classList.toggle("borrowed-state", borrowed);

    borrowBtn.disabled = borrowed;
    borrowBtn.textContent = borrowed ? "Already Borrowed" : "Borrow Book";
    borrowBtn.style.opacity = borrowed ? "0.8" : "1";
    borrowBtn.style.cursor = borrowed ? "not-allowed" : "pointer";
}
/* borrowBook
    تقوم باستعارة الكتاب المحدد.
*/
function borrowBook() {
    const selectedId = getSelectedBookId();
    if (!selectedId) return;

    const books = getBooks();
    const bookIndex = books.findIndex((book) => Number(book.id) === Number(selectedId));
    if (bookIndex === -1) return;

    if (normalizeText(books[bookIndex].status) === "borrowed") {
        showToast("This book is already borrowed.", "info");
        return;
    }

    books[bookIndex].status = "borrowed";
    books[bookIndex].borrowDate = new Date().toISOString().slice(0, 10);
    saveBooks(books);

    updateBookDetailsUI(books[bookIndex]);
    showToast("Book borrowed successfully!", "success");
}
/* initBookDetailsPage
    تقوم بتهيئة صفحة تفاصيل الكتاب.
*/
function initBookDetailsPage() {
    const marker = document.getElementById("bookDetailsPage");
    if (!marker) return;

    let selectedId = getSelectedBookId();
    let book = selectedId ? findBookById(selectedId) : null;

    if (!book) {
        const books = getBooks();
        book = books[0] || null;
        selectedId = book ? book.id : null;
    }

    if (!book || !selectedId) return;

    setSelectedBook(selectedId);
    updateBookDetailsUI(book);

    const button = document.getElementById("borrowBtn");
    if (button) {
        button.addEventListener("click", borrowBook);
    }
}
/* initAddBookPage 
    تقوم بتهيئة صفحة إضافة كتاب جديد.
     بحيث تستمع لحدث إرسال النموذج，
     ثم تجمع البيانات من الحقول المختلفة，
*/
function initAddBookPage() {
    const form = document.getElementById("addBookForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const id = Number(document.getElementById("book_id")?.value);
        const title = document.getElementById("book_name")?.value?.trim();
        const author = document.getElementById("author")?.value?.trim();
        const category = document.getElementById("category")?.value?.trim();
        const description = document.getElementById("description")?.value?.trim();

        if (!id || !title || !author || !category || !description) {
            showToast("Please fill in all fields.", "info");
            return;
        }

        const books = getBooks();
        if (books.some((book) => Number(book.id) === id)) {
            showToast("Book ID already exists.", "info");
            return;
        }

        books.push({
            id,
            title,
            author,
            category,
            description,
            status: "available",
            borrowDate: null
        });

        saveBooks(books);
        showToast("Book added successfully.", "success");
        form.reset();

        setTimeout(() => {
            window.location.href = "admin_dashBoard.html";
        }, 700);
    });
}
/* initEditBookPage
    تقوم بتهيئة صفحة تعديل بيانات الكتاب.
*/
function initEditBookPage() {
    const form = document.getElementById("editBookForm");
    const idInput = document.getElementById("edit_book_id");
    if (!form || !idInput) return;

    const queryId = getQueryBookId();
    const targetId = queryId || Number(idInput.value);
    const books = getBooks();
    const book = books.find((item) => Number(item.id) === Number(targetId));

    if (book) {
        idInput.value = String(book.id);
        document.getElementById("edit_book_name").value = book.title;
        document.getElementById("edit_author").value = book.author;
        document.getElementById("edit_category").value = book.category;
        document.getElementById("edit_description").value = book.description;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const id = Number(idInput.value);

        const updatedBooks = getBooks().map((item) => {
            if (Number(item.id) !== id) return item;
            return {
                ...item,
                title: document.getElementById("edit_book_name").value.trim(),
                author: document.getElementById("edit_author").value.trim(),
                category: document.getElementById("edit_category").value.trim(),
                description: document.getElementById("edit_description").value.trim()
            };
        });

        saveBooks(updatedBooks);
        showToast("Book updated successfully.", "success");

        setTimeout(() => {
            window.location.href = "admin_dashBoard.html";
        }, 700);
    });
}
/* initAdminDashboardPage
    تقوم بتهيئة صفحة لوحة تحكم الإدارة.
*/
function initAdminDashboardPage() {
    const tableBody = document.getElementById("adminBooksBody");
    const searchInput = document.getElementById("adminSearchInput");
    if (!tableBody) return;

    const totalBooksCount = document.getElementById("totalBooksCount");
    const borrowedBooksCount = document.getElementById("borrowedBooksCount");
    const categoriesCount = document.getElementById("categoriesCount");

    const renderCards = (books) => {
        const borrowed = books.filter((book) => normalizeText(book.status) === "borrowed").length;
        const categories = new Set(books.map((book) => normalizeText(book.category)).filter(Boolean)).size;

        if (totalBooksCount) totalBooksCount.textContent = String(books.length);
        if (borrowedBooksCount) borrowedBooksCount.textContent = String(borrowed);
        if (categoriesCount) categoriesCount.textContent = String(categories);
    };

    const renderTable = (query = "") => {
        const books = getBooks();
        const searchValue = normalizeText(query);
        const filtered = !searchValue
            ? books
            : books.filter((book) =>
                [String(book.id), book.title, book.author, book.category]
                    .some((item) => normalizeText(item).includes(searchValue))
            );

        tableBody.innerHTML = "";
        renderCards(books);

        if (!filtered.length) {
            tableBody.innerHTML = `<tr><td colspan="5">No books found.</td></tr>`;
            return;
        }

        filtered.forEach((book) => {
            tableBody.insertAdjacentHTML(
                "beforeend",
                `<tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${renderStatusBadge(book.status)}</td>
                    <td>
                        <a href="edit_book.html?id=${book.id}"><button type="button">Edit</button></a>
                        <button type="button" class="delete" data-delete-id="${book.id}">Delete</button>
                    </td>
                </tr>`
            );
        });
    };

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderTable(searchInput.value);
        });
    }

    tableBody.addEventListener("click", (event) => {
        const deleteBtn = event.target.closest("button[data-delete-id]");
        if (!deleteBtn) return;

        const id = Number(deleteBtn.dataset.deleteId);
        const books = getBooks();
        const target = books.find((book) => Number(book.id) === id);
        if (!target) return;

        const confirmed = window.confirm(`Delete "${target.title}"?`);
        if (!confirmed) return;

        const updated = books.filter((book) => Number(book.id) !== id);
        saveBooks(updated);
        showToast("Book deleted successfully.", "success");
        renderTable(searchInput ? searchInput.value : "");
    });

    renderTable();
}
/* init 
    تقوم بتهيئة جميع صفحات التطبيق عند تحميل المستند.
     بحيث تستدعي دوال التهيئة الخاصة بكل صفحة，
     مثل initBooksListPage لصفحة قائمة الكتب，
*/
function init() {
    seedBooksIfNeeded();
    initBooksListPage();
    initSearchPage();
    initBorrowedBooksPage();
    initBookDetailsPage();
    initAddBookPage();
    initEditBookPage();
    initAdminDashboardPage();
}

window.borrowBook = borrowBook;// Expose borrowBook function to global scope for use in HTML onclick handlers
document.addEventListener("DOMContentLoaded", init);// Expose init function to global scope for manual initialization if needed
