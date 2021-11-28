from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Teams(models.Model):
    unique_code = models.CharField(max_length=50)
    admin = models.ForeignKey(User, on_delete=models.CASCADE)
    team_slug = models.CharField(max_length=100)
    team_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class TeamParticipants(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Teams, on_delete=models.CASCADE)
    role = models.IntegerField(default=0) # 0 - admin, 1 - co-admin, 2 - participant
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class TeamTodo(models.Model):
    todo_item = models.CharField(max_length=500)
    created_by = models.ForeignKey(User,on_delete=models.CASCADE, related_name="created_by")
    expected_completion_unix_time = models.BigIntegerField()
    reminder = models.BooleanField(default=False)
    associated_team = models.ForeignKey(Teams,on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(User,on_delete=models.CASCADE,null=True,related_name="assigned_to")
    completed_by = models.ForeignKey(User,on_delete=models.CASCADE,null=True,related_name="completed_by")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Assignment(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank = True)
    attachment = models.FileField(null=True)
    closes_at = models.BigIntegerField()
    due_at = models.BigIntegerField()
    team_related = models.ForeignKey(Teams, on_delete=models.CASCADE)
    max_score = models.IntegerField()
    assignment_slug = models.CharField(max_length=200)
    is_group_assignment = models.BooleanField(default = False)
    is_assignment_auto_judge = models.BooleanField(default = False)
    input1 = models.FileField(blank=True)
    input2 = models.FileField(blank=True)
    input3 = models.FileField(blank=True)
    output1 = models.FileField(blank=True)
    output2 = models.FileField(blank=True)
    output3 = models.FileField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Submissions(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    handed_in_time = models.BigIntegerField()
    points_earned = models.IntegerField(null=True, blank = True)
    attachment = models.FileField(blank=True)
    code = models.TextField(null=True, blank=True)
    language = models.IntegerField(blank=True,default=52)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Scheduler(models.Model):
    team = models.ForeignKey(Teams, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mode_preferred = models.IntegerField(default=0) # 0 - online, 1 - offline
    mode_assigned = models.IntegerField(null = True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)