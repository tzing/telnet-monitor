# Generated by Django 2.2.1 on 2019-05-22 03:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('port_monitor', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='monitortarget',
            name='order',
            field=models.IntegerField(default=-1, help_text='It will be shown in the upper position if the number is higher.', verbose_name='Order'),
        ),
        migrations.AlterField(
            model_name='monitortarget',
            name='hostname',
            field=models.CharField(max_length=256, verbose_name='Hostname'),
        ),
        migrations.AlterField(
            model_name='monitortarget',
            name='port',
            field=models.IntegerField(default=80, verbose_name='Port'),
        ),
    ]
