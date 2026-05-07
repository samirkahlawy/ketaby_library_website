from django.contrib import admin
from .models import Book, BorrowRecord, Category, MemberProfile


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "category", "cover_image_url", "available_copies", "total_copies")
    list_filter = ("category",)
    search_fields = ("title", "author")


@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "book", "borrow_date", "is_returned")
    list_filter = ("is_returned", "borrow_date")


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "is_librarian")
