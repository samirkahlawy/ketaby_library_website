from django.db import migrations


def seed_books(apps, schema_editor):
    Category = apps.get_model("app_library", "Category")
    Book = apps.get_model("app_library", "Book")

    if Book.objects.exists():
        return

    catalog = [
        {
            "title": "Atomic Habits",
            "author": "James Clear",
            "category": "Self Development",
            "description": "A practical framework for building good habits and breaking bad ones.",
            "cover_image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
            "total_copies": 6,
            "available_copies": 6,
        },
        {
            "title": "Deep Work",
            "author": "Cal Newport",
            "category": "Productivity",
            "description": "Rules for focused success in a distracted world.",
            "cover_image_url": "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80",
            "total_copies": 5,
            "available_copies": 5,
        },
        {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "category": "Programming",
            "description": "How to write readable and maintainable software professionally.",
            "cover_image_url": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80",
            "total_copies": 8,
            "available_copies": 8,
        },
        {
            "title": "The Psychology of Money",
            "author": "Morgan Housel",
            "category": "Finance",
            "description": "Timeless lessons on wealth, greed, and happiness.",
            "cover_image_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=600&q=80",
            "total_copies": 4,
            "available_copies": 4,
        },
        {
            "title": "The Alchemist",
            "author": "Paulo Coelho",
            "category": "Fiction",
            "description": "A magical story about pursuing your dreams and purpose.",
            "cover_image_url": "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=600&q=80",
            "total_copies": 7,
            "available_copies": 7,
        },
        {
            "title": "Start With Why",
            "author": "Simon Sinek",
            "category": "Leadership",
            "description": "How great leaders inspire everyone to take action.",
            "cover_image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80",
            "total_copies": 3,
            "available_copies": 3,
        },
        {
            "title": "Thinking, Fast and Slow",
            "author": "Daniel Kahneman",
            "category": "Psychology",
            "description": "A deep dive into two systems that drive human thinking.",
            "cover_image_url": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
            "total_copies": 5,
            "available_copies": 5,
        },
        {
            "title": "The Pragmatic Programmer",
            "author": "Andrew Hunt, David Thomas",
            "category": "Programming",
            "description": "Classic principles for becoming a better software engineer.",
            "cover_image_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
            "total_copies": 6,
            "available_copies": 6,
        },
    ]

    for item in catalog:
        category, _ = Category.objects.get_or_create(name=item["category"])
        Book.objects.create(
            title=item["title"],
            author=item["author"],
            category=category,
            description=item["description"],
            cover_image_url=item["cover_image_url"],
            total_copies=item["total_copies"],
            available_copies=item["available_copies"],
        )


def remove_seed_books(apps, schema_editor):
    Book = apps.get_model("app_library", "Book")
    titles = [
        "Atomic Habits",
        "Deep Work",
        "Clean Code",
        "The Psychology of Money",
        "The Alchemist",
        "Start With Why",
        "Thinking, Fast and Slow",
        "The Pragmatic Programmer",
    ]
    Book.objects.filter(title__in=titles).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("app_library", "0003_book_cover_image_url"),
    ]

    operations = [
        migrations.RunPython(seed_books, remove_seed_books),
    ]
