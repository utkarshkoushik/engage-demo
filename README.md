# Collaboration Classroom
Created by - Utkarsh Koushik

Collaboration classroom is a project built for Microsoft Engage'21 program. This is a platform for university students and professors to make their task easier for online education. For teachers it contains auto grading of assignments. There is an integrated IDE which can be used to run and submit code for coding assignments inside the website itself. The teacher can view and grade the assignments. It also has an collab editor where in multiple students can work on the same ide and the code gets updated real time. It also has a video calling and chat feature to further enhance collaboration among students and teachers.

For working prototype of the product, please visit https://engage21.me/

## Features
1. **Signup and Login feature** - Provides basic authentication
2. **Teams Section** - <br/> 1. Create a team  <br /> 2. Join a Team with Code
3. **Inside a Team** - <br /> 1. Conversation Tab - Group chat for entire team <br /> 2. General Tab - List of all ongoing calls in the team <br /> 3. Call Log Tab - List of all the previous calls of team. <br /> 4. Scheduled Calls Tab - List of all the scheduled meetings <br /> 5. IDE Tab - Online IDE to run and submit code. <br /> 6. Assignment Tab - Teachers can create assignment while students can view and submit assignments. There shaal be auto grading and the teachers will be able to view the submissions <br /> 7. Team Participant Tab - a. List of all team participants, b. Add participant to team (**only for team admin**)<br /> 8. Collab Editor Tab - An real time editor where multiple students can code simultaneously <br />
4. **Video Call Feature** - <br /> 1. Invite option with a link (**only valid for authorized members**) <br /> 2. Mute/Unmute <br /> 3. Video on/off <br /> 4. List of participants in meeting <br /> 5. Chat option <br /> 6. Screen-share option (**single-click zoom in**) <br /> 7. Dominant speaker detection (**Green border for Dominant Speaker - Not valid for peer-to-peer call**) <br /> 8. Leave call option
5. **Chat feature** -<br /> 1. Media sharing using **clipboard pasting**, **drag and drop** and **upload button** <br /> 
6. **Persistent Chatting Feature** - Every chat in the application is persistent
7. **Scheduler** - <br /> 1. End ongoing calls if no user is present for more than 5 minutes <br/> 2. Send email 30 minutes before meeting <br /> 3. Send email 12 hours before tasks deadline <br /> 4. Start scheduled calls on time
8. **Assignment** - 1. Create and grade assignments by teachers. <br /> 2. Submission and viewing of scores by students.
9. **Collab Editor** - 1. Multiple people can code and run the code on the same IDE.
10. **Hosted Website** - Hosted on https port


## Technology Stack
1. Backend - Django, ExpressJS (***only for chat***)
2. Frontend - ReactJS
3. Database - SQLite
4. Redis and Celery
5. Socket.io
6. Twilio Video SDK


## Instructions to Install and Setup
Install redis and run it on it's default port <br />
Install celery

### Setup and run django server - 
1. Navigate to /backend
2. Run the following command to install all the dependencies for django -> ```pip install -r requirements.txt (Python 2), or pip3 install -r requirements.txt (Python 3)```
3. Navigate to /backend/msteams
4. Run -> python3 manage.py makemigrations
5. Run -> python3 manage.py migrate
6. Note steps 5 and 6 needs to be run only once while initial setup
7. Run -> ```python3 manage.py runsslserver --certificate {PWD}/ms-teams-clone/ssl/engage21_me.crt --key {PWD}/ms-teams-clone/ssl/domain.key 0.0.0.0:9000```
8. Where {PWD} shall be replace with present working directory
9. Example -> ```python3 manage.py runsslserver --certificate /home/utkarsh/work/engage21/engage-demo/sslnew/engage21_me.crt --key /home/utkarsh/work/engage21/engage-demo/sslnew/domain.key 0.0.0.0:9000```

### Setup and run celery - 
1. Navigate to /backend/msteams
2. Run -> ```celery -A msteams worker -l info -B```

### Setup and run socket io
1. Navigate to /socket
2. Run -> ```npm insatll```
3. Run -> ```node index.js```

### Setup and run react app - 
1. Navigate to /frontend
2. Run -> ```npm install```
3. Run -> ```REACT_APP_DJANGO_URL={YOUR_DJANGO_URL} REACT_APP_SOCKET_URL={YOUR_SOCKET_URL} npm start```
4. In place of {YOUR_DJANGO_URL} insert your local django url and in place of {YOUR_SOCKET_URL} insert your local socket io url.
5. For example -> ```REACT_APP_DJANGO_URL=https://localhost:9000/ REACT_APP_SOCKET_URL=https://localhost:5000 npm start```
6. This shall run the react server on https://localhost:3000.
7. You can visit https://localhost:3000 on your browser to see the website in action. <br />

















