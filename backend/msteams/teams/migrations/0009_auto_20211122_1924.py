# Generated by Django 3.2.5 on 2021-11-22 19:24

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('teams', '0008_teamparticipants_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='assignment_slug',
            field=models.CharField(default='test', max_length=200),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='Scheduler',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode_preferred', models.IntegerField(default=0)),
                ('mode_assigned', models.IntegerField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='teams.teams')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]