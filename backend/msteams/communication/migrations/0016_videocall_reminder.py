# Generated by Django 3.2.5 on 2021-07-12 20:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('communication', '0015_rename_team_videocallmailbox_video'),
    ]

    operations = [
        migrations.AddField(
            model_name='videocall',
            name='reminder',
            field=models.BooleanField(default=False),
        ),
    ]