# Generated by Django 3.2.5 on 2021-11-07 14:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teams', '0007_submissions'),
    ]

    operations = [
        migrations.AddField(
            model_name='teamparticipants',
            name='role',
            field=models.IntegerField(default=0),
        ),
    ]
