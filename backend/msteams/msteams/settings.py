"""
Django settings for msteams project.

Generated by 'django-admin startproject' using Django 3.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""
# python3 manage.py runsslserver --certificate /home/utkarsh/engage-demo/sslnew/engage21_me.crt --key /home/utkarsh/engage-demo/sslnew/domain.key 0.0.0.0:9000
from pathlib import Path
from datetime import timedelta
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
import os

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-yd87)d*r$5^hv=0he308@!1$d=u^&fytzjd9k%*!ecfygj=qlo'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['45.77.47.226','localhost','*']
MEDIA_ROOT =  os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'sslserver',
    'rest_framework',
    'rest_framework.authtoken',
    'fcm_django',
    'twilio',
    'authentication',
    'teams',
    'communication'
]


ACCOUNT_SID = 'AC71fb26d592137ddcb0d55fc1c04c2d99'
API_KEY = 'SK34445aa24592538f2616d33216bb05e6'
API_SECRET = 'wlbmck1NXNQgNA1AoBFzNVCiSu2vUfpk'
ORIGINAL_AUTH_TOKEN = "e50f0db5a55d4519c644140a988ff42d"


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAdminUser'
    ),
}

CORS_ALLOW_ALL_ORIGINS = True

FCM_DJANGO_SETTINGS = {
        "FCM_SERVER_KEY": "AAAA0zZUqb4:APA91bEoRb_aBs0dfcKdqITepu2KW5widtNnnL-dM89FTZEBMSw7zm3gX41jtf0OCAbDa4XtElxGdFJgE9Xyld8mojBvH0LkMmH2huVuk9x7GaM4goYh97a2cuH_VXhm60tsBd5Bpuv3"
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'msteams.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'msteams.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



CELERY_RESULT_BACKEND = 'redis://localhost:6379'
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60

CELERY_BEAT_SCHEDULE = {
    # 'test': {
    #     'task': 'teams.tasks.test',
    #     'schedule' : timedelta(seconds=20),
    #     'args': ()
    # },
    
    'clear_video_calls': {
        'task': 'teams.tasks.clear_video_calls',
        'schedule' : timedelta(seconds=300),
        'args': ()
    },

    'meeting_reminder':{
        'task':'teams.tasks.meeting_reminder',
        'schedule': timedelta(seconds=300),
        'args' : ()
    },

    'start_meeting':{
        'task':'teams.tasks.start_meeting',
        'schedule':timedelta(seconds=120),
        'args':()
    },

    'task_reminder':{
        'task':'teams.tasks.task_reminder',
        'schedule':timedelta(seconds=21600),
        'args':()
    }
}

# celery -A msteams worker -l info
# celery -A msteams beat -l info
# celery -A msteams worker -l info -B --> both beat and worker run at once
# python manage.py runsslserver --certificate /home/kaushiki/ms-teams-clone/ssl/mydomain.crt --key /home/kaushiki/ms-teams-clone/ssl/server.key 0.0.0.0:9000


EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'msteamsclone@gmail.com'
EMAIL_HOST_PASSWORD = 'ruchi2992'
EMAIL_PORT = 587
EMAIL_USE_TLS = True