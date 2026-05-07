from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.sign_up_view, name='sign_up'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('books/', views.books_list, name='books_list'),
    path('books/<int:book_id>/', views.book_details, name='book_details'),
    path('books/<int:book_id>/borrow/', views.borrow_book, name='borrow_book'),
    path('search/', views.search_results, name='search_results'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-dashboard/add-book/', views.add_book, name='add_book'),
    path('admin-dashboard/books/<int:book_id>/edit/', views.edit_book, name='edit_book'),
    path('admin-dashboard/books/<int:book_id>/delete/', views.delete_book, name='delete_book'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('borrow/<int:borrow_id>/return/', views.return_book, name='return_book'),
]
