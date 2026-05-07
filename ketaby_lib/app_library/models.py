from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class MemberProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_librarian = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=150)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="books")
    description = models.TextField()

    cover_image_url = models.URLField(
        default="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
    )
    available_copies = models.PositiveIntegerField(default=1)
    total_copies = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        return self.available_copies > 0


class BorrowRecord(models.Model):
    member = models.ForeignKey(User, on_delete=models.CASCADE, related_name="borrow_records")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="borrow_records")
    borrow_date = models.DateField(auto_now_add=True)
    return_date = models.DateField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)

    class Meta:
        ordering = ["-borrow_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["member", "book", "is_returned"],
                condition=models.Q(is_returned=False),
                name="unique_active_borrow_per_book_member",
            )
        ]

    def __str__(self):
        return f"{self.member.username} - {self.book.title}"
