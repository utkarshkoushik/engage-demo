from django.urls import path

from . import views

urlpatterns = [
    path('create_team',views.create_team,name='create_team'),
    path('join_team', views.join_team, name='join_team'),
    path('get_teams', views.get_teams, name='get_teams'),
    path('check_permissions', views.check_permissions, name='check_permissions'),
    path('invite_member', views.invite_member, name='invite_member'),
    path('get_users', views.get_users, name='get_users'),
    path('add_todos_teams',views.add_todos_teams, name='add_todos_teams'),
    # path('update_todos_teams',views.update_todos_teams, name='update_todos_teams'),
    path('get_todos_teams',views.get_todos_teams, name='get_todos_teams'),
    path('todo_completed',views.todo_completed, name='todo_completed'),
    path('delete_todo',views.delete_todo, name='delete_todo'),
    path('create_assignment',views.create_assignment,name='create_assignment'),
    path('judge_submission',views.judge_submission,name='judge_submission'),
    path('get_assignments',views.get_assignments,name='get_assignments'),
    path('get_assignment',views.get_assignment,name='get_assignment'),
    path('upload_assignment',views.upload_assignment,name='upload_assignment'),
    # path('get_submission',views.get_submission,name='get_submission')
    path('get_submission',views.get_submission,name='get_submission'),
    path('judge_testcase',views.judge_testcase,name='judge_testcase'),
    path('get_user_role',views.get_user_role,name='get_user_role'),
    path('grade_assignment',views.grade_assignment,name='grade_assignment'),
    path('get_email',views.get_email,name='get_email')
]
