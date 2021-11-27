from django.http.response import HttpResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib import auth
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
# imports Teams model
from .models import TeamTodo, Teams,TeamParticipants, Assignment, Submissions
import random
import string
import re
import requests
import base64
import json
import time
# Create new team

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_team(request):
    team_name = request.data.get('team_name')
    user = request.user
    team = Teams()
    team.admin = user
    team.team_name = team_name
    team.team_slug = getSlug(team_name)
    team.unique_code = ''.join(random.choices(string.ascii_uppercase +string.digits, k = 8))
    team.save()
    addParticipant(team,user)   
    return Response({
        'team_name': team.team_name,
        'unique_code': team.unique_code
    })


# Join an existing team with unique code

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def join_team(request):
    unique_code = request.data.get('unique_code')

    user = request.user
    is_present = Teams.objects.filter(unique_code = unique_code).exists()
    if(is_present):
        team = Teams.objects.get(unique_code = unique_code)
        alreadyPresent = TeamParticipants.objects.filter(user=user).filter(team=team)
        if(alreadyPresent):
            return HttpResponse("Already in the team")
        else:
            addParticipant(team,user)
            return HttpResponse("Team joined")
    else:
        return HttpResponse("No such team present")



# Get all the teams for a user


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_teams(request):
    user = request.user
    teams = TeamParticipants.objects.filter(user = user)
    my_teams=[]
    for t in teams:
        temp = {
            'team_name': t.team.team_name,
            'admin': t.team.admin.first_name,
            'email':t.team.admin.email,
            'team_slug': t.team.team_slug,
        }
        my_teams.append(temp)
    return Response({
        'my_teams':my_teams,
        'name': user.first_name+" "+user.last_name
    })


# Check authentication of a user to enter a specific team

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_permissions(request):
    user=request.user
    team_slug = request.data.get('team_slug')
    has_perm = False
    team = Teams.objects.get(team_slug=team_slug)
    is_admin=False
    if team.admin == user:
        is_admin=True
    if TeamParticipants.objects.filter(team=team, user=user).exists():
        has_perm=True
    return Response({
        'has_permissions': has_perm,
        'is_admin': is_admin,
        'team_slug': team_slug,
        'user_name': user.get_full_name(),
        'unique_code':team.unique_code
    })

# Add new member in the team

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def invite_member(request):
    user=request.user
    email = request.data.get('email')
    team_slug = request.data.get('team_slug')
    if Teams.objects.filter(team_slug=team_slug, admin=user).exists():
        if User.objects.filter(email=email).exists():
            new_user = User.objects.get(email=email)
            team = Teams.objects.get(team_slug=team_slug)
            if TeamParticipants.objects.filter(user=new_user, team=team).exists():
                return Response({
                    'error': True,
                    'message':"User already added to the team"
                })
            addParticipant(team,new_user)
            return Response({
                'error':False,
                'message':"User added to the team successfully"
            })
        else:
            return Response({
                'error':True,
                'message':"User doesn't exist"
            })
    else:
        return Response({
            'error':True,
            'message':"You do not have the required right to add new User."
        })


# Add tasks

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_todos_teams(request):
    user=request.user
    todo_item = request.data.get('todo_item')
    email_assigned_to = request.data.get('email_assigned_to')
    is_completed = request.data.get('is_completed')
    team_slug = request.data.get('team_slug')
    expected_completion_unix_time = request.data.get('expected_completion_unix_time')
    associated_team = Teams.objects.get(team_slug=team_slug)

    if User.objects.filter(email=email_assigned_to).exists():    
        todo = TeamTodo()
        todo.created_by = user
        todo.todo_item = todo_item
        todo.assigned_to = User.objects.get(email=email_assigned_to)
        todo.expected_completion_unix_time = expected_completion_unix_time
        todo.is_completed = is_completed
        todo.associated_team = associated_team
        todo.save()

        return Response({
            'id':todo.id,
            'created_by':user.email,
            'todo_item': todo_item,
            'is_completed':is_completed,
            'assigned_to':todo.assigned_to.first_name,
            'team_slug': team_slug,
            'expected_time':expected_completion_unix_time
        })
            
    else:
        return Response({
            'error':True,
            'message':"User is not present"
        })



# Fetch all the tasks of the team


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_todos_teams(request):
    user=request.user
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug=team_slug)
    todoList = TeamTodo.objects.filter(associated_team = team)
    pending_todos = []
    completed_todos =[]
    for todo in todoList:
        if todo.completed_by is None:
            temp = {
                'id':todo.id,
                'todo_item':todo.todo_item,
                'created_by':todo.created_by.first_name+" "+todo.created_by.last_name,
                'is_completed':todo.is_completed,
                'assigned_to':todo.assigned_to.first_name+" "+todo.assigned_to.last_name,
                'expected_time':todo.expected_completion_unix_time
            }
            pending_todos.append(temp)
        else:
            temp = {
                'id':todo.id,
                'todo_item':todo.todo_item,
                'created_by':todo.created_by.first_name+" "+todo.created_by.last_name,
                'is_completed':todo.is_completed,
                'completed_by':todo.completed_by.first_name+" "+todo.completed_by.last_name,
                'assigned_to':todo.assigned_to.first_name+" "+todo.assigned_to.last_name,
                'expected_time':todo.expected_completion_unix_time
            }
            completed_todos.insert(0,temp)
    return Response({
        'pending_todos':pending_todos,
        'completed_todos': completed_todos
    })
    

# Delete a task


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_todo(request):
    user=request.user
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug=team_slug)
    id=request.data.get('id')
    todo = TeamTodo.objects.get(id=id)
    if team.admin==user:
        todo.delete()
        return Response({
            'error':False,
            'message':"Todo deleted successfully."
        })
    else:
        return Response({
            'error':True,
            'message':"You are not authorized to delete the task"
        })


# Mark a task as completed


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def todo_completed(request):
    user=request.user
    id= request.data.get('id')
    if TeamTodo.objects.filter(id=id).exists():
        todo = TeamTodo.objects.get(id=id)
        todo.completed_by = user
        todo.is_completed = True
        todo.save()
        return Response({
            'completed_by':user.first_name+" "+user.last_name,
            'is_completed':todo.is_completed,
            'todo_item':todo.todo_item
        })
    else:
        return Response({
            'error':True,
            'message':"Task has been deleted already."
        })


# Get all users of the team


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_users(request):
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug=team_slug)
    participant= TeamParticipants.objects.filter(team=team)
    all_users=[]
    for t in participant:
        temp = {
            'name':t.user.first_name+ " "+t.user.last_name,
            'email':t.user.email
        }
        all_users.append(temp)
    return Response({
        'all_users': all_users
    })

# create an assignment

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_assignment(request):
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug=team_slug)
    name = request.data.get('name')
    assignment_slug = getSlugAssignment(name)
    description = request.data.get('description')
    attachment = request.data.get('attachment')
    closes_at = request.data.get('closes_at')
    due_at = request.data.get('due_at')
    max_score = request.data.get('max_score')

    assignment = Assignment()
    assignment.name = name
    assignment.description = description
    assignment.assignment_slug = assignment_slug
    assignment.attachment = attachment
    assignment.closes_at = closes_at
    assignment.due_at = due_at
    assignment.max_score = max_score
    assignment.team_related = team
    
    assignment.save()

    return Response({
        'assignment_slug': assignment_slug,
        'attachmet': assignment.attachment
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_assignments(request):
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug=team_slug)
    assignments = Assignment.objects.filter(team_related = team)
    
    past_assign = []
    active_assign = []

    currTime = int(time.time()) * 1000
    # print(currTime) 
    for i in assignments:
        # if i.attachment.name !='':
        assign = {
            'name': i.name,
            'attachment': i.attachment.url if i.attachment else '',
            'closes_at': i.closes_at,
            'due_at': i.due_at,
            'description': i.description,
            'max_score': i.max_score,
            'assignment_slug': i.assignment_slug
        }
        if i.due_at >currTime:
            active_assign.append(assign)
        else:
            past_assign.append(assign)

    return Response({
        'past_assign': past_assign,
        'active_assign': active_assign
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_assignment(request):
    assignment_slug = request.data.get('assignment_slug')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    user = request.user
    submission = Submissions.objects.filter(assignment = assignment, user = user)
    # print(submission)
    # return Response({
    #     'msg': 'SUCCESS'
    # })
    i=assignment
    if not submission:
        return Response({
            'name': i.name,
            'attachment': i.attachment.url if i.attachment else '',
            'closes_at': i.closes_at,
            'due_at': i.due_at,
            'description': i.description,
            'max_score': i.max_score,
            'assignment_slug': i.assignment_slug,
            'msg': 'Not handed in'
        })
    submission = submission.get()
    return Response({
        'name': i.name,
        'attachment': i.attachment.url if i.attachment else '',
        'closes_at': i.closes_at,
        'due_at': i.due_at,
        'description': i.description,
        'max_score': i.max_score,
        'assignment_slug': i.assignment_slug,
        'msg': 'Already submitted',
        'submission_attachment': submission.attachment.url if submission.attachment else '',
        'handed_in_time': submission.handed_in_time
    })
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_assignment(request):
    assignment_slug = request.data.get('assignment_slug')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    attachment = request.data.get('attachment')
    # print(attachment)
    user = request.user
    handed_in_time = int(time.time()) * 1000

    submission = Submissions()
    submission.assignment = assignment
    submission.user = user
    submission.handed_in_time = handed_in_time
    submission.attachment = attachment
    submission.save()

    return Response({
        'msg': 'Submission Successful',
        'time': handed_in_time
    })

     
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_submission(request):
    assignment_slug = request.data.get('assignment_slug')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    submission = Submissions.objects.filter(assignment = assignment)
    
    
    all_submission = []
    i = assignment

    x = {
        'name': i.name,
        'attachment': i.attachment.url if i.attachment else '',
        'closes_at': i.closes_at,
        'due_at': i.due_at,
        'description': i.description,
        'max_score': i.max_score,
        'assignment_slug': i.assignment_slug,
    }

    if not submission:
        return Response({
            'msg': 'No submissions made',
            'assignment': x,
            'submissions': []
        })

    for i in submission:
        s = {
            'submission_attachment': i.attachment.url if i.attachment else '',
            'user_id': i.user.id,
            'user_name': i.user.get_full_name(),
            'submission_time': i.handed_in_time,
            'points_earned': i.points_earned,
        }
        all_submission.append(s)

    return Response({
        'submissions': all_submission,
        'assignment': x,
    })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_submission(request):
    assignment_slug = request.data.get('assignment_slug')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    handed_in_time = request.data.get('handed_in_time')
    closing_time = assignment.closes_at

    if closing_time < handed_in_time:
        return Response({
            'error': 'Assignment already closed',
        })

    submission = Submissions()
    submission.assignment = assignment
    submission.user = user
    submission.handed_in_time = handed_in_time
    submission.save()

    return Response({
        'error': 'SUCCESS'
    })

language_code = {
    'PYTHON': 70,
    "C++": 52,
    "JAVA": 62,
}

@api_view(["POST"])
@permission_classes([AllowAny])
def judge_submission(request):
    source_code = request.data.get('source_code')
    source_code = source_code.encode('ascii')
    source_code = base64.b64encode(source_code)
    source_code = source_code.decode('ascii')
    language = request.data.get('language_id')
    language_id = language_code[language]
    if language_id is not None:
        language_id = int(language_id)
    stdin = request.data.get('stdin')
    stdin = stdin.encode('ascii')
    stdin = base64.b64encode(stdin)
    stdin = stdin.decode('ascii')
    url = "https://judge0-ce.p.rapidapi.com/submissions"

    querystring = {"base64_encoded":"true","fields":"*"}

    payload = {
        'language_id': language_id,
        'source_code': source_code,
        'stdin': stdin
    }
    language_id = ""
    headers = {
        'content-type': "application/json",
        'x-rapidapi-host': "judge0-ce.p.rapidapi.com",
        'x-rapidapi-key': "ea353caa41mshc63e90bf38f8ff8p17b707jsn8d093a6be47e"
    }

    response = requests.request("POST", url, data=json.dumps(payload), headers=headers, params=querystring)
    print(response.text)
    url = "https://judge0-ce.p.rapidapi.com/submissions/"+response.json().get('token')
    response = requests.request("GET", url, headers=headers, params=querystring)
    # print(base64.b64decode(response.json().get('stdout')))
    # print(response.json())
    return Response({
        'output': response.json()
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def judge_testcase(request):
    source_code = request.data.get('source_code')
    source_code = source_code.encode('ascii')
    source_code = base64.b64encode(source_code)
    source_code = source_code.decode('ascii')
    print(source_code)
    language = request.data.get('language_id')
    language_id = language_code[language]
    if language_id is not None:
        language_id = int(language_id)
    expected_output = "Hello world"
    expected_output = expected_output.encode('ascii')
    expected_output = base64.b64encode(expected_output)
    expected_output = expected_output.decode('ascii')
    stdin = request.data.get('stdin')
    stdin = stdin.encode('ascii')
    stdin = base64.b64encode(stdin)
    stdin = stdin.decode('ascii')
    url = "https://judge0-ce.p.rapidapi.com/submissions/batch"

    querystring = {"base64_encoded":"true","fields":"*"}

    payload = { 
        "submissions":[
            {
                'language_id': language_id,
                'source_code': source_code,
                'stdin': stdin,
                'expected_output': expected_output,
                'redirect_stderr_to_stdout': "true"
            },
            {
                'language_id': language_id,
                'source_code': source_code,
                'stdin': stdin,
                'expected_output': expected_output,
                "redirect_stderr_to_stdout": "true"
            },
        ]
        
    }
    language_id = ""
    headers = {
        'content-type': "application/json",
        'x-rapidapi-host': "judge0-ce.p.rapidapi.com",
        'x-rapidapi-key': "ea353caa41mshc63e90bf38f8ff8p17b707jsn8d093a6be47e"
    }

    response = requests.request("POST", url, data=json.dumps(payload), headers=headers, params=querystring)
    print(response.json()[0])
    tokens = ""
    for t in response.json():
        tokens +=t.get('token') + ","
    url = "https://judge0-ce.p.rapidapi.com/submissions/batch"
    querystring = {
        "tokens": tokens,
        'base_encoded': "true",
        "fields":"*"
    }
    time.sleep(5)
    response = requests.request("GET", url, headers=headers, params=querystring)
    # if response.json().submissions[0].
    # print(base64.b64decode(response.json().get('stdout')))
    # print(response.json())
    return Response({
        'output': response.json()
    })


# Add participant in a team

def addParticipant(team,user):
    participant = TeamParticipants()
    participant.user = user
    participant.team = team
    participant.save()


# Get team slug

def getSlug(title):
    title = title.lower()
    title = re.sub('\s+', ' ', title).strip()
    title = title.replace(" ", "-")
    if Teams.objects.filter(team_slug=title).exists():    
        c = Teams.objects.all().last()
        title = title+'-'+str(c.id+1)
    return title

def getSlugAssignment(title):
    title = title.lower()
    title = re.sub('\s+', ' ', title).strip()
    title = title.replace(" ", "-")
    if Assignment.objects.filter(assignment_slug=title).exists():    
        c = Assignment.objects.all().last()
        title = title+'-'+str(c.id+1)
    return title

