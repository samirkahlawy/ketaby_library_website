from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import EmailOrUsernameAuthenticationForm, SignUpForm
from .models import Book, BorrowRecord, Category, MemberProfile


def home(request):
    featured_books = Book.objects.select_related("category").all()[:8]
    return render(request, "home.html", {"featured_books": featured_books})


def sign_up_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    if request.method == "POST":
        form = SignUpForm(request.POST)
        is_librarian = request.POST.get("is_admin") == "true"
        if form.is_valid():
            user = form.save()
            MemberProfile.objects.create(user=user, is_librarian=is_librarian)
            login(request, user)
            messages.success(request, "Account created successfully.")
            return redirect("home")
    else:
        form = SignUpForm()

    return render(request, "sign_up.html", {"form": form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("home")

    form = EmailOrUsernameAuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        messages.success(request, "Logged in successfully.")
        return redirect("home")
    return render(request, "login.html", {"form": form})


@login_required
def logout_view(request):
    logout(request)
    messages.info(request, "Logged out.")
    return redirect("login")


@login_required
def books_list(request):
    books = Book.objects.select_related("category").all()
    return render(request, "books_list.html", {"books": books})


@login_required
def book_details(request, book_id):
    book = get_object_or_404(Book.objects.select_related("category"), id=book_id)
    return render(request, "book_details.html", {"book": book})


@login_required
@require_POST
def borrow_book(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    if book.available_copies <= 0:
        messages.error(request, "This book is not available.")
        return redirect("book_details", book_id=book_id)

    has_active = BorrowRecord.objects.filter(
        member=request.user, book=book, is_returned=False
    ).exists()
    if has_active:
        messages.info(request, "You already borrowed this book.")
        return redirect("book_details", book_id=book_id)

    BorrowRecord.objects.create(member=request.user, book=book)
    book.available_copies -= 1
    book.save(update_fields=["available_copies"])
    messages.success(request, "Book borrowed successfully.")
    return redirect("user_dashboard")


@login_required
def search_results(request):
    query = request.GET.get("query", "").strip()
    books = Book.objects.select_related("category")
    if query:
        books = books.filter(
            Q(title__icontains=query)
            | Q(author__icontains=query)
            | Q(category__name__icontains=query)
        )
    return render(request, "search_results.html", {"books": books, "query": query})


def _require_librarian(user: User):
    return user.is_staff or (
        hasattr(user, "profile") and bool(getattr(user.profile, "is_librarian", False))
    )


@login_required
def admin_dashboard(request):
    if not _require_librarian(request.user):
        return HttpResponseForbidden("Only librarians can access this page.")

    books = Book.objects.select_related("category").all()
    borrowed_count = BorrowRecord.objects.filter(is_returned=False).count()
    total_books = books.count()
    available_count = books.filter(available_copies__gt=0).count()

    # Get recent borrow activity (last 10)
    recent_borrows = BorrowRecord.objects.filter(is_returned=False).select_related('book', 'member').order_by('-borrow_date')[:10]

    context = {
        "books": books,
        "total_books_count": total_books,
        "borrowed_books_count": borrowed_count,
        "available_count": available_count,
        "members_count": User.objects.count(),
        "categories_count": Category.objects.count(),
        "recent_borrows": recent_borrows,
    }
    return render(request, "admin_dashBoard.html", context)


@login_required
def add_book(request):
    if not _require_librarian(request.user):
        return HttpResponseForbidden("Only librarians can access this page.")

    if request.method == "POST":
        title = request.POST.get("book_name", "").strip()
        author = request.POST.get("author", "").strip()
        category_name = request.POST.get("category", "").strip()
        description = request.POST.get("description", "").strip()
        cover_image_url = request.POST.get("cover_image_url", "").strip()
        total_copies = int(request.POST.get("total_copies", "1") or 1)

        if title and author and category_name and description:
            category, _ = Category.objects.get_or_create(name=category_name)
            Book.objects.create(
                title=title,
                author=author,
                category=category,
                description=description,
                cover_image_url=cover_image_url
                or "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
                total_copies=max(total_copies, 1),
                available_copies=max(total_copies, 1),
            )
            messages.success(request, "Book added successfully.")
            return redirect("admin_dashboard")
        messages.error(request, "Please fill all required fields.")

    return render(request, "add_book.html")


@login_required
def edit_book(request, book_id):
    if not _require_librarian(request.user):
        return HttpResponseForbidden("Only librarians can access this page.")

    book = get_object_or_404(Book, id=book_id)
    if request.method == "POST":
        book.title = request.POST.get("edit_book_name", "").strip()
        book.author = request.POST.get("edit_author", "").strip()
        category_name = request.POST.get("edit_category", "").strip()
        book.description = request.POST.get("edit_description", "").strip()
        book.cover_image_url = request.POST.get("edit_cover_image_url", "").strip() or book.cover_image_url
        category, _ = Category.objects.get_or_create(name=category_name or "General")
        book.category = category
        book.save()
        messages.success(request, "Book updated successfully.")
        return redirect("admin_dashboard")

    return render(request, "edit_book.html", {"book": book})


@login_required
@require_POST
def delete_book(request, book_id):
    if not _require_librarian(request.user):
        return HttpResponseForbidden("Only librarians can access this page.")

    book = get_object_or_404(Book, id=book_id)
    book.delete()
    messages.success(request, "Book deleted.")
    return redirect("admin_dashboard")


@login_required
def user_dashboard(request):
    """User dashboard showing borrowed books, history, and recommendations."""
    # Get user's active borrows
    active_borrows = (
        BorrowRecord.objects.select_related("book", "book__category")
        .filter(member=request.user, is_returned=False)
        .order_by("-borrow_date")
    )

    # Get user's borrowing history
    history = (
        BorrowRecord.objects.select_related("book", "book__category")
        .filter(member=request.user, is_returned=True)
        .order_by("-return_date")[:10]
    )

    # Get total borrowed count
    borrowed_count = BorrowRecord.objects.filter(member=request.user).count()

    # Get recommended books (books not borrowed by user, limited to 4)
    borrowed_book_ids = BorrowRecord.objects.filter(member=request.user).values_list('book_id', flat=True)
    recommended_books = Book.objects.select_related("category").exclude(id__in=borrowed_book_ids).filter(available_copies__gt=0)[:4]

    context = {
        "active_borrows": active_borrows,
        "history": history,
        "borrowed_count": borrowed_count,
        "recommended_books": recommended_books,
    }
    return render(request, "user_dashboard.html", context)


@login_required
@require_POST
def return_book(request, borrow_id):
    """Return a borrowed book."""
    borrow_record = get_object_or_404(BorrowRecord, id=borrow_id, member=request.user)

    if borrow_record.is_returned:
        messages.error(request, "This book has already been returned.")
    else:
        borrow_record.is_returned = True
        borrow_record.return_date = timezone.now().date()
        borrow_record.save()

        # Increase available copies
        book = borrow_record.book
        book.available_copies += 1
        book.save(update_fields=["available_copies"])

        messages.success(request, f"'{book.title}' has been returned successfully.")

    return redirect("user_dashboard")
