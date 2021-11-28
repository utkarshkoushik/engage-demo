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
import math
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
    # addParticipant(team,user)  
    participant = TeamParticipants()
    participant.user = user
    participant.team = team
    participant.role = 0
    participant.save() 
    return Response({
        'team_name': team.team_name,
        'unique_code': team.unique_code
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    team_slug = request.data.get('team_slug')
    team = Teams.objects.get(team_slug = team_slug)
    user = request.user
    participant = TeamParticipants.objects.get(user = user, team=team)

    return Response({
        'user_role': participant.role,
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
    
    input1 = request.data.get('input1')
    input2 = request.data.get('input2')
    input3 = request.data.get('input3')
    output1 = request.data.get('output1')
    output2 = request.data.get('output2')
    output3 = request.data.get('output3')

    if input1 is not None:
        is_assignment_auto_judge = True
    else:
        is_assignment_auto_judge = False
    

    assignment = Assignment()
    assignment.name = name
    assignment.description = description
    assignment.assignment_slug = assignment_slug
    assignment.attachment = attachment
    assignment.closes_at = closes_at
    assignment.due_at = due_at
    assignment.max_score = max_score
    assignment.team_related = team
    assignment.is_assignment_auto_judge = is_assignment_auto_judge

    if is_assignment_auto_judge:
        assignment.input1 = input1
        assignment.input2 = input2
        assignment.input3 = input3
        assignment.output1 = output1
        assignment.output2 = output2
        assignment.output3 = output3
    
    assignment.save()

    return Response({
        'assignment_slug': assignment_slug,
        # 'attachmet': assignment.attachment
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
        submission = Submissions.objects.filter(assignment = i, user = request.user)
        sub = False
        if submission:
            sub = True
        assign = {
            'name': i.name,
            'attachment': i.attachment.url if i.attachment else '',
            'closes_at': i.closes_at,
            'due_at': i.due_at,
            'description': i.description,
            'max_score': i.max_score,
            'assignment_slug': i.assignment_slug,
            'is_assignment_auto_judge': i.is_assignment_auto_judge,
            'submission': sub
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
            'is_assignment_auto_judge': i.is_assignment_auto_judge,
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
        'is_assignment_auto_judge': i.is_assignment_auto_judge,
        'code': submission.code,
        'language': submission.language,
        'handed_in_time': submission.handed_in_time,
        'points_earned': submission.points_earned,
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
            'code': i.code,
            'language': i.language,
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
    70: 70,
    52: 52,
    62: 62
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
        'x-rapidapi-key': "e3e0e6d476msh6e8edf9a08423c9p17c9ccjsnbc4defd064b5"
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
def get_email(request):
    user = request.user
    return Response({
        'email': user.email
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def judge_testcase(request):
    assignment_slug = request.data.get('assignment_slug')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    path = "/home/utkarsh/work/engage21/engage-demo/backend/msteams/media/"
    f1 = assignment.input1.open(mode='rb').read()
    f2 = assignment.input2.open(mode='rb').read()
    f3 = assignment.input3.open(mode='rb').read()
    f4 = assignment.output1.open(mode='rb').read()
    f5 = assignment.output2.open(mode='rb').read()
    f6 = assignment.output3.open(mode='rb').read()
    a1 = f1.decode("utf-8") 
    a2 = f2.decode("utf-8") 
    a3 = f3.decode("utf-8") 
    a4 = f4.decode("utf-8") 
    a5 = f5.decode("utf-8") 
    a6 = f6.decode("utf-8") 
    s1 = encode(a1)
    s2 = encode(a2)
    s3 = encode(a3)
    s4 = encode(a4)
    s5 = encode(a5)
    s6 = encode(a6)
    source_code = request.data.get('source_code')
    source_code = source_code.encode('ascii')
    source_code = base64.b64encode(source_code)
    source_code = source_code.decode('ascii')
    language = request.data.get('language_id')
    language_id = language_code[language]
    if language_id is not None:
        language_id = int(language_id)
    url = "https://judge0-ce.p.rapidapi.com/submissions/batch"

    querystring = {"base64_encoded":"true","fields":"*"}
    print(s1,s2,s3)
    payload = { 
        "submissions":[
            {
                'language_id': language_id,
                'source_code': source_code,
                'stdin': s1,
                'expected_output': s4,
                'redirect_stderr_to_stdout': "true"
            },
            {
                'language_id': language_id,
                'source_code': source_code,
                'stdin': s2,
                'expected_output': s5,
                "redirect_stderr_to_stdout": "true"
            },
            {
                'language_id': language_id,
                'source_code': source_code,
                'stdin': s3,
                'expected_output': s6,
                "redirect_stderr_to_stdout": "true"
            },
        ]
        
    }
    language_id = ""
    headers = {
        'content-type': "application/json",
        'x-rapidapi-host': "judge0-ce.p.rapidapi.com",
        'x-rapidapi-key': "e3e0e6d476msh6e8edf9a08423c9p17c9ccjsnbc4defd064b5"
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
    # print(response.json()['submissions'][0]['status']['description'])
    final_submission = request.data.get('final_submission')
    if final_submission is not None:
        test1 = response.json()['submissions'][0]['status']['description']
        test2 = response.json()['submissions'][1]['status']['description']
        test3 = response.json()['submissions'][2]['status']['description']
        # print(response.json()['submissions'][2]['source_code'])
        max_score = assignment.max_score
        total_score = 0
        if test1 == 'Accepted':
            total_score +=max_score/3
        if test2 == 'Accepted':
            total_score +=max_score/3
        if test3 == 'Accepted':
            total_score +=max_score/3
        submission = Submissions.objects.filter(user = request.user, assignment = assignment)
        if not submission:
            submission = Submissions()
            submission.assignment = assignment
            submission.user = request.user
            submission.handed_in_time = time.time() * 1000
            submission.points_earned = math.ceil(total_score)
            submission.code = response.json()['submissions'][2]['source_code']
            submission.langauge = response.json()['submissions'][2]['language_id']
            submission.save()


    return Response({
        'output': response.json()
    })

def encode(s):
    s = s.encode('ascii')
    s = base64.b64encode(s)
    s = s.decode('ascii')
    return s

@api_view(["POST"])
@permission_classes([AllowAny])
def grade_assignment(request):
    student_id = request.data.get('student_id')
    assignment_slug = request.data.get('assignment_slug')
    points = request.data.get('points')
    assignment = Assignment.objects.get(assignment_slug = assignment_slug)
    student = User.objects.get(id = student_id)
    submission = Submissions.objects.get(assignment= assignment,user = student)
    submission.points_earned = int(points)
    submission.save()
    return Response({
        'msg': 'Graded Successfully'
    })

# Add participant in a team

def addParticipant(team,user):
    participant = TeamParticipants()
    participant.user = user
    participant.team = team
    participant.role = 2
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

