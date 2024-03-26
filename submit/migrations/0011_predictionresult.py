# Generated by Django 4.1 on 2024-03-26 07:10

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submit", "0010_rename_predict_batch_size_task_predict_window_size_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PredictionResult",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("index", models.IntegerField()),
                ("true_value", models.FloatField()),
                ("predict_value", models.FloatField()),
            ],
        ),
    ]
