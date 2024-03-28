# Generated by Django 4.1 on 2024-03-28 14:20

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AnomalyResult",
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
                ("time", models.CharField(max_length=24)),
                ("variable", models.IntegerField()),
                ("true_value", models.FloatField()),
                ("predict_value", models.FloatField()),
                ("analysis", models.CharField(default="", max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="ImputeResult",
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
                ("time", models.CharField(max_length=24)),
                ("variable", models.IntegerField()),
                ("Imputed_value", models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name="Task",
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
                ("impute_model", models.CharField(max_length=20)),
                ("predict_model", models.CharField(max_length=20)),
                ("predict_window_size", models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name="TrainParameters",
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
                ("impute_model", models.TextField()),
                ("predict_model", models.TextField()),
                ("train_data_size", models.FloatField()),
                ("predict_window_size", models.FloatField()),
                ("imputation_size", models.FloatField()),
                (
                    "dataset",
                    models.FileField(
                        max_length=128, upload_to="dataset/", verbose_name="dataset"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="TrainResult",
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
                ("model", models.CharField(max_length=20)),
                ("dataset", models.CharField(max_length=64)),
                ("train_time", models.CharField(max_length=20)),
                ("predict_time", models.CharField(max_length=20)),
                ("time", models.TimeField()),
                ("accuracy", models.FloatField()),
                ("precision", models.FloatField()),
                ("SMAPE", models.FloatField()),
            ],
        ),
    ]
